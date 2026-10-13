import { describe, expect, it, vi } from "vitest";
import { createOfferingHandlers } from "@/server/offering-handlers";
import type { Offering } from "@/types/offering";

const input = { name: "Latte", description: "Espresso and milk", price: 4.25, category: "Coffee" };
const saved: Offering = { ...input, category: "Coffee", ID: "0123456789abcdef01234567", specialOffer: false };
const authorization = `Basic ${Buffer.from("team:test-only-password").toString("base64")}`;

function setup() {
  vi.stubEnv("MANAGEMENT_USERNAME", "team");
  vi.stubEnv("MANAGEMENT_PASSWORD", "test-only-password");
  const records: Offering[] = [];
  const store = {
    async list() {
      return [...records];
    },
    async create() {
      records.push(saved);
      return saved;
    },
    async update() {
      return null;
    },
    async remove() {
      return false;
    },
  };
  return { handlers: createOfferingHandlers(store), store };
}

function request(body: unknown = input, headers: Record<string, string> = {}) {
  return new Request("https://shop.example/api/offerings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authorization, ...headers },
    body: JSON.stringify(body),
  });
}

describe("offering HTTP handlers", () => {
  it("accepts the browser Host when Next.js normalizes the internal hostname", async () => {
    const { handlers } = setup();
    const response = await handlers.POST(request(input, { Host: "127.0.0.1:3000", Origin: "https://127.0.0.1:3000" }));
    expect(response.status).toBe(201);
    expect(
      (await handlers.POST(request(input, { Host: "127.0.0.1:3000", Origin: "https://attacker.example" }))).status,
    ).toBe(403);
  });
  it("creates an offering and exposes the same public ID through GET", async () => {
    const { handlers } = setup();
    const response = await handlers.POST(request());
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(saved);
    expect(await (await handlers.GET()).json()).toEqual([saved]);
  });
  it.each(
    [
      { ...input, price: "4.25" },
      { ...input, price: null },
      { ...input, name: " " },
      { ...input, price: -1 },
      { ...input, price: 4.251 },
      { ...input, category: " coffee " },
      { ...input, ID: "client-id" },
      { ...input, specialOffer: "false" },
      [],
      null,
    ].map((body) => ({ body })),
  )("rejects invalid raw input without changing the list: %j", async ({ body }) => {
    const { handlers } = setup();
    expect((await handlers.POST(request(body))).status).toBe(400);
    expect(await (await handlers.GET()).json()).toEqual([]);
  });
  it("sanitizes database failures on both reads and writes", async () => {
    const { store } = setup();
    store.list = async () => {
      throw new Error("mongodb://private-password@host");
    };
    store.create = async () => {
      throw new Error("secret credentials");
    };
    const handlers = createOfferingHandlers(store);
    for (const response of [await handlers.GET(), await handlers.POST(request())]) {
      expect(response.status).toBe(503);
      expect(await response.text()).not.toMatch(/private-password|secret credentials|mongodb/);
    }
  });
  it("denies missing credentials, missing configuration, and cross-origin writes", async () => {
    const { handlers } = setup();
    expect((await handlers.POST(request(input, { Authorization: "" }))).status).toBe(401);
    expect((await handlers.POST(request(input, { Origin: "https://attacker.example" }))).status).toBe(403);
    vi.stubEnv("MANAGEMENT_PASSWORD", "");
    expect((await handlers.POST(request())).status).toBe(401);
    expect(await (await handlers.GET()).json()).toEqual([]);
  });
  it("reports invalid content type and malformed JSON", async () => {
    const { handlers } = setup();
    expect((await handlers.POST(request(input, { "Content-Type": "text/plain" }))).status).toBe(415);
    const malformed = new Request("https://shop.example/api/offerings", {
      method: "POST",
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      body: "{",
    });
    expect((await handlers.POST(malformed)).status).toBe(400);
  });
  it("returns 404 for missing records and 400 for invalid identities", async () => {
    const { handlers } = setup();
    expect((await handlers.PUT(request(), saved.ID)).status).toBe(404);
    expect((await handlers.DELETE(request(), "bad-id")).status).toBe(400);
    expect((await handlers.DELETE(request(), saved.ID)).status).toBe(404);
  });
  it("enforces access and sanitizes database failures on update and delete", async () => {
    const { store } = setup();
    store.update = async () => {
      throw new Error("private database details");
    };
    store.remove = async () => {
      throw new Error("private database details");
    };
    const handlers = createOfferingHandlers(store);
    for (const operation of [handlers.PUT, handlers.DELETE]) {
      expect((await operation(request(input, { Authorization: "" }), saved.ID)).status).toBe(401);
      expect((await operation(request(input, { Origin: "https://attacker.example" }), saved.ID)).status).toBe(403);
      const unavailable = await operation(request(), saved.ID);
      expect(unavailable.status).toBe(503);
      expect(await unavailable.text()).not.toContain("private database details");
    }
  });
});
