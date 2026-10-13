import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createOfferingCollectionHandlers } from "@/server/offering-handlers";
import { startHandlerHttpServer, TestOfferingStore } from "./helpers/handler-http";
import type { CreateOfferingInput, Offering } from "@/types/offering";

const input = { name: "  Independent Tea  ", description: "  Brewed for testing  ", price: 2.5, category: "Tea" };
const authorization = `Basic ${Buffer.from("handler-team:independent-test-password").toString("base64")}`;
let host: Awaited<ReturnType<typeof startHandlerHttpServer>> | undefined;

beforeEach(() => {
  vi.stubEnv("MANAGEMENT_USERNAME", "handler-team");
  vi.stubEnv("MANAGEMENT_PASSWORD", "independent-test-password");
});
afterEach(async () => {
  await host?.stop();
  host = undefined;
  vi.unstubAllEnvs();
});

async function start(store = new TestOfferingStore()) {
  host = await startHandlerHttpServer(createOfferingCollectionHandlers(store));
  return host.url;
}

function post(url: string, body: unknown = input, headers: Record<string, string> = {}) {
  return fetch(url, {
    method: "POST",
    headers: { authorization, "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function expectError(response: Response, status: number, code: string) {
  expect(response.status).toBe(status);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(response.headers.get("cache-control")).toBe("no-store");
  const body = await response.json();
  expect(body).toEqual({
    error: { code, message: expect.any(String), ...(body.error.fields ? { fields: body.error.fields } : {}) },
  });
  expect(body.error.message.length).toBeGreaterThan(0);
  return body;
}

test("supplied list/create storage accepts a normalized offering and GET returns the same ID", async () => {
  host = await startHandlerHttpServer(createOfferingCollectionHandlers(new TestOfferingStore()));
  const response = await fetch(host.url, {
    method: "POST",
    headers: { authorization, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  expect(response.status).toBe(201);
  const created = await response.json();
  expect(created).toEqual({
    ID: expect.any(String),
    name: "Independent Tea",
    description: "Brewed for testing",
    price: 2.5,
    category: "Tea",
    specialOffer: false,
  });
  expect(created.ID).not.toBe("");
  expect(await (await fetch(host.url)).json()).toEqual([created]);
});

test("GET returns an empty public array", async () => {
  const response = await fetch(await start());
  expect(response.status).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toEqual([]);
});

test("GET preserves the supplied name-then-ID ordering and public records", async () => {
  const seed: Offering[] = [
    { ID: "tea-b", name: "Tea", description: "Second tea", price: 3, category: "Tea", specialOffer: true },
    { ID: "coffee-a", name: "Coffee", description: "First coffee", price: 2, category: "Coffee", specialOffer: false },
    { ID: "tea-a", name: "Tea", description: "First tea", price: 2, category: "Tea", specialOffer: false },
  ];
  const response = await fetch(await start(new TestOfferingStore(seed)));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([seed[1], seed[2], seed[0]]);
});

test.each([
  { label: "ordinary", details: { ...input, specialOffer: false }, special: false },
  { label: "special", details: { ...input, specialOffer: true }, special: true },
  { label: "default", details: input, special: false },
])("POST creates a $label offering visible through GET", async ({ details, special }) => {
  const url = await start();
  const response = await post(url, details);
  expect(response.status).toBe(201);
  const created = await response.json();
  expect(created.specialOffer).toBe(special);
  expect(typeof created.ID).toBe("string");
  expect(created.ID).not.toBe("");
  expect(await (await fetch(url)).json()).toEqual([created]);
});

test.each([
  {
    label: "trimmed maximum lengths",
    details: { ...input, name: ` ${"n".repeat(100)} `, description: ` ${"d".repeat(500)} ` },
  },
  { label: "zero price", details: { ...input, price: 0 } },
  { label: "floating-point cents", details: { ...input, price: 0.1 + 0.2 } },
  { label: "Coffee category", details: { ...input, category: "Coffee" } },
  { label: "Smoothie category", details: { ...input, category: "Smoothie" } },
])("POST accepts $label", async ({ details }) => {
  const url = await start();
  const response = await post(url, details);
  expect(response.status).toBe(201);
  const created = await response.json();
  expect(created.name).toBe(details.name.trim());
  expect(created.description).toBe(details.description.trim());
  expect(created.price).toBe(details.price);
  expect(await (await fetch(url)).json()).toEqual([created]);
});

const invalidInputs = [
  { label: "missing name", body: { ...input, name: undefined } },
  { label: "blank name", body: { ...input, name: " \t " } },
  { label: "numeric name", body: { ...input, name: 42 } },
  { label: "overlong name", body: { ...input, name: "n".repeat(101) } },
  { label: "missing description", body: { ...input, description: undefined } },
  { label: "empty description", body: { ...input, description: "" } },
  { label: "blank description", body: { ...input, description: " \t " } },
  { label: "null description", body: { ...input, description: null } },
  { label: "numeric description", body: { ...input, description: 42 } },
  { label: "overlong description", body: { ...input, description: "d".repeat(501) } },
  { label: "missing price", body: { ...input, price: undefined } },
  { label: "numeric-string price", body: { ...input, price: "2.5" } },
  { label: "null price", body: { ...input, price: null } },
  { label: "boolean price", body: { ...input, price: true } },
  { label: "negative price", body: { ...input, price: -0.01 } },
  { label: "fractional cents", body: { ...input, price: 2.501 } },
  { label: "wrong-case category", body: { ...input, category: "tea" } },
  { label: "padded category", body: { ...input, category: " Tea " } },
  { label: "unknown category", body: { ...input, category: "Food" } },
  { label: "missing category", body: { ...input, category: undefined } },
  { label: "numeric category", body: { ...input, category: 1 } },
  { label: "null special flag", body: { ...input, specialOffer: null } },
  { label: "string special flag", body: { ...input, specialOffer: "false" } },
  { label: "numeric special flag", body: { ...input, specialOffer: 0 } },
  { label: "client ID", body: { ...input, ID: "client-id" } },
  { label: "database identity", body: { ...input, _id: "client-id" } },
  { label: "unknown field", body: { ...input, extra: true } },
  { label: "null body", body: null },
  { label: "array body", body: [] },
  { label: "string body", body: "offering" },
  { label: "numeric body", body: 1 },
];

test.each(invalidInputs)("POST rejects $label and leaves stored offerings unchanged", async ({ body }) => {
  const url = await start();
  const saved = await (await post(url)).json();
  await expectError(await post(url, body), 400, "INVALID_INPUT");
  expect(await (await fetch(url)).json()).toEqual([saved]);
});

test.each(["1e400", "-1e400"])("POST rejects nonfinite JSON price %s", async (price) => {
  const url = await start();
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization, "Content-Type": "application/json" },
    body: `{"name":"Tea","description":"Brewed tea","price":${price},"category":"Tea"}`,
  });
  await expectError(response, 400, "INVALID_INPUT");
  expect(await (await fetch(url)).json()).toEqual([]);
});

test.each(["text/plain", "application/jsonp", "text/application/json"])(
  "POST rejects content type %s",
  async (contentType) => {
    const url = await start();
    await expectError(await post(url, input, { "Content-Type": contentType }), 415, "INVALID_CONTENT_TYPE");
    expect(await (await fetch(url)).json()).toEqual([]);
  },
);

test("POST accepts a JSON media type with parameters and ignores case", async () => {
  const response = await post(await start(), input, { "Content-Type": "Application/JSON; charset=utf-8" });
  expect(response.status).toBe(201);
});

test("POST rejects a missing content type", async () => {
  const url = await start();
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization },
    body: new TextEncoder().encode(JSON.stringify(input)),
  });
  await expectError(response, 415, "INVALID_CONTENT_TYPE");
  expect(await (await fetch(url)).json()).toEqual([]);
});

test.each(["{ bad json }", ""])("POST rejects malformed or empty JSON %j", async (body) => {
  const url = await start();
  const response = await fetch(url, {
    method: "POST",
    headers: { authorization, "Content-Type": "application/json" },
    body,
  });
  await expectError(response, 400, "INVALID_JSON");
  expect(await (await fetch(url)).json()).toEqual([]);
});

test("collection POST retains management authorization and origin checks", async () => {
  const url = await start();
  await expectError(await post(url, input, { authorization: "" }), 401, "UNAUTHORIZED");
  await expectError(await post(url, input, { Origin: "https://other.example" }), 403, "FORBIDDEN");
  expect(await (await fetch(url)).json()).toEqual([]);
});

test("storage failures are sanitized and failed creation leaves the list unchanged", async () => {
  const store = new TestOfferingStore();
  let failList = true;
  host = await startHandlerHttpServer(
    createOfferingCollectionHandlers({
      list: () => (failList ? Promise.reject(new Error("private-storage-failure")) : store.list()),
      create: async () => {
        throw new Error("private-storage-failure");
      },
    }),
  );
  const getError = await expectError(await fetch(host.url), 503, "DATABASE_UNAVAILABLE");
  expect(JSON.stringify(getError)).not.toContain("private-storage-failure");
  failList = false;
  const postError = await expectError(await post(host.url), 503, "DATABASE_UNAVAILABLE");
  expect(JSON.stringify(postError)).not.toContain("private-storage-failure");
  expect(await (await fetch(host.url)).json()).toEqual([]);
});

test("POST responds only after creation resolves and GET cannot see a pending offering", async () => {
  const store = new TestOfferingStore();
  let release!: () => void;
  let entered!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  host = await startHandlerHttpServer(
    createOfferingCollectionHandlers({
      list: () => store.list(),
      create: async (details: CreateOfferingInput) => {
        entered();
        await gate;
        return store.create(details);
      },
    }),
  );
  let responded = false;
  const pending = post(host.url).then((response) => {
    responded = true;
    return response;
  });
  try {
    await started;
    expect(await (await fetch(host.url)).json()).toEqual([]);
    expect(responded).toBe(false);
  } finally {
    release();
  }
  const response = await pending;
  expect(response.status).toBe(201);
  expect(await (await fetch(host.url)).json()).toEqual([await response.json()]);
});
