import { randomUUID } from "node:crypto";
import type { CreateOfferingInput, Offering } from "@/types/offering";

export type AcceptanceOptions = {
  baseUrl: string;
  scenario: "empty" | "seeded" | "database-failure";
  username: string;
  password: string;
  expectedSeed?: Offering[];
  timeoutMs?: number;
};

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Validate independently of application response guards and input normalization. */
function publicOffering(value: unknown): asserts value is Offering {
  check(value && typeof value === "object" && !Array.isArray(value), "Invalid public Offering.");
  const item = value as Record<string, unknown>;
  check(
    Object.keys(item).sort().join(",") === "ID,category,description,name,price,specialOffer",
    "Invalid public fields.",
  );
  check(typeof item.ID === "string" && item.ID.trim().length > 0, "Invalid public ID.");
  for (const [field, limit] of [
    ["name", 100],
    ["description", 500],
  ] as const) {
    const text = item[field];
    check(
      typeof text === "string" && text === text.trim() && text.length > 0 && text.length <= limit,
      "Invalid public text.",
    );
  }
  check(
    typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      Math.abs(item.price * 100 - Math.round(item.price * 100)) < 0.000001,
    "Invalid public price.",
  );
  check(
    typeof item.category === "string" &&
      ["Coffee", "Tea", "Smoothie"].includes(item.category) &&
      typeof item.specialOffer === "boolean",
    "Invalid category or special flag.",
  );
}

function sameOffering(actual: Offering, expected: Offering) {
  check(
    Object.entries(expected).every(([key, value]) => actual[key as keyof Offering] === value),
    "Offering details changed on read-back.",
  );
}

export async function runAcceptance(options: AcceptanceOptions) {
  let target: URL;
  try {
    target = new URL(options.baseUrl);
  } catch {
    throw new Error("Configure an explicit loopback origin.");
  }
  check(
    ["127.0.0.1", "[::1]"].includes(target.hostname) &&
      ["http:", "https:"].includes(target.protocol) &&
      target.pathname === "/" &&
      !target.username &&
      !target.password &&
      !target.search &&
      !target.hash,
    "Configure a literal loopback origin without credentials, paths, or query parameters.",
  );
  check(["empty", "seeded", "database-failure"].includes(options.scenario), "Select an explicit scenario.");
  check(options.username && options.password, "Configure private management credentials.");
  const timeout = options.timeoutMs ?? 15000;
  check(Number.isFinite(timeout) && timeout > 0 && timeout <= 15000, "Invalid request deadline.");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`${options.username}:${options.password}`).toString("base64")}`,
  };
  const stages: string[] = [];
  async function request(method = "GET", body?: string, contentType = "application/json", path = "/api/offerings") {
    try {
      const response = await fetch(new URL(path, target), {
        method,
        headers: method === "GET" ? {} : { ...headers, "Content-Type": contentType },
        body,
        redirect: "error",
        signal: AbortSignal.timeout(timeout),
      });
      if (response.status === 204) return { status: response.status, body: undefined };
      check(response.headers.get("content-type")?.split(";")[0].trim() === "application/json", "Response is not JSON.");
      const value: unknown = await response.json();
      return { status: response.status, body: value };
    } catch {
      throw new Error("HTTP request, deadline, or JSON response failed.");
    }
  }
  async function read() {
    const result = await request();
    check(result.status === 200 && Array.isArray(result.body), "GET must return 200 and an array.");
    result.body.forEach(publicOffering);
    const records = result.body as Offering[];
    check(new Set(records.map((item) => item.ID)).size === records.length, "Duplicate public IDs.");
    for (let index = 1; index < records.length; index++) {
      const previous = records[index - 1],
        current = records[index];
      check(
        previous.name.localeCompare(current.name) < 0 ||
          (previous.name.localeCompare(current.name) === 0 && previous.ID.localeCompare(current.ID) <= 0),
        "GET must sort by name then ID.",
      );
    }
    return records;
  }
  async function expectError(
    method: string,
    body: string | undefined,
    status: number,
    code: string,
    contentType = "application/json",
  ) {
    const result = await request(method, body, contentType);
    check(result.status === status, `Expected ${status} for ${code}.`);
    check(result.body && typeof result.body === "object" && !Array.isArray(result.body), "Invalid error envelope.");
    const envelope = result.body as { error?: Record<string, unknown> };
    check(
      Object.keys(envelope).join() === "error" &&
        envelope.error &&
        typeof envelope.error === "object" &&
        !Array.isArray(envelope.error),
      "Invalid error envelope.",
    );
    check(
      envelope.error.code === code && typeof envelope.error.message === "string" && envelope.error.message.trim(),
      "Invalid error code or message.",
    );
    check(
      Object.keys(envelope.error).every((key) => ["code", "message", "fields"].includes(key)),
      "Internal error fields leaked.",
    );
    if (envelope.error.fields !== undefined) {
      const fields = envelope.error.fields;
      check(fields && typeof fields === "object" && !Array.isArray(fields), "Invalid field messages.");
      check(
        Object.entries(fields).every(
          ([key, value]) =>
            ["name", "description", "price", "category", "specialOffer"].includes(key) &&
            typeof value === "string" &&
            value.trim(),
        ),
        "Invalid field messages.",
      );
    }
    check(
      !/mongodb(?:\+srv)?:\/\/|password|credential|ECONNREFUSED|MongoServer|\bat .+\(.+:\d+/i.test(
        JSON.stringify(envelope),
      ),
      "Database details leaked.",
    );
  }
  const input: CreateOfferingInput = {
    name: `Verification ${randomUUID()}`,
    description: `Runner ${randomUUID()}`,
    price: 5.75,
    category: "Coffee",
  };
  if (options.scenario === "database-failure") {
    await expectError("GET", undefined, 503, "DATABASE_UNAVAILABLE");
    await expectError("POST", JSON.stringify(input), 503, "DATABASE_UNAVAILABLE");
    return ["deliberate database failure: GET/POST sanitized 503"];
  }
  const baseline = await read();
  if (options.scenario === "empty") check(baseline.length === 0, "Empty scenario requires an empty database.");
  else {
    check(
      options.expectedSeed && options.expectedSeed.length > 0,
      "Seeded scenario requires independent expected seed JSON.",
    );
    check(baseline.length === options.expectedSeed.length, "Seed count differs.");
    options.expectedSeed.forEach((item, index) => {
      publicOffering(item);
      sameOffering(baseline[index], item);
    });
  }
  stages.push(`${options.scenario} GET and public contract`);
  const baselineIds = new Set(baseline.map((item) => item.ID));
  const createdIds = new Set<string>();
  const attempted: CreateOfferingInput[] = [];
  try {
    const variants: CreateOfferingInput[] = [
      { ...input, specialOffer: false },
      { ...input, name: `${input.name} special`, specialOffer: true },
      { ...input, name: `${input.name} default` },
      { ...input, name: " n ", description: " d ", price: 0, category: "Tea" },
      { ...input, name: "n".repeat(100), description: "d".repeat(500), price: 0.29, category: "Smoothie" },
    ];
    for (const value of variants) {
      attempted.push(value);
      const result = await request("POST", JSON.stringify(value));
      check(result.status === 201, "POST must return 201.");
      publicOffering(result.body);
      const saved = result.body;
      check(!baselineIds.has(saved.ID) && !createdIds.has(saved.ID), "POST reused an ID.");
      createdIds.add(saved.ID);
      sameOffering(saved, {
        ...value,
        name: value.name.trim(),
        description: value.description.trim(),
        specialOffer: value.specialOffer ?? false,
        ID: saved.ID,
      });
      const persisted = (await read()).find((item) => item.ID === saved.ID);
      check(persisted, "Created Offering is missing on read-back.");
      sameOffering(persisted, saved);
    }
    stages.push("ordinary/special/default POST, trimming, boundaries and read-back");
    const invalid: unknown[] = [
      null,
      [],
      "text",
      {},
      ...["", " ", "n".repeat(101), 3, null].map((name) => ({ ...input, name })),
      ...["", " ", "d".repeat(501), 3, null].map((description) => ({ ...input, description })),
      ...[-1, 1.001, "5.75", null, true].map((price) => ({ ...input, price })),
      ...["coffee", "Other", null, 1, ["Coffee"]].map((category) => ({ ...input, category })),
      ...["true", null, 1].map((specialOffer) => ({ ...input, specialOffer })),
      ...["ID", "_id", "unknown"].map((field) => ({ ...input, [field]: "forbidden" })),
    ];
    for (const value of invalid) await expectError("POST", JSON.stringify(value), 400, "INVALID_INPUT");
    await expectError(
      "POST",
      JSON.stringify({ ...input, price: 1 }).replace('"price":1', '"price":1e999'),
      400,
      "INVALID_INPUT",
    );
    await expectError("POST", "{broken", 400, "INVALID_JSON");
    await expectError("POST", JSON.stringify(input), 415, "INVALID_CONTENT_TYPE", "text/plain");
    const finalRecords = await read();
    check(finalRecords.length === baseline.length + createdIds.size, "Invalid input changed the collection.");
    stages.push("validation boundaries, content type and JSON errors");
  } finally {
    // Recover uncertain POST outcomes only by this run's details and non-baseline identity.
    const records = await read();
    const own = records.filter(
      (item) =>
        !baselineIds.has(item.ID) &&
        attempted.some((value) => item.name === value.name.trim() && item.description === value.description.trim()),
    );
    for (const item of own) {
      const result = await request(
        "DELETE",
        undefined,
        "application/json",
        `/api/offerings/${encodeURIComponent(item.ID)}`,
      );
      check(result.status === 204, "Targeted cleanup failed.");
    }
    const remaining = await read();
    check(!remaining.some((item) => own.some((removed) => removed.ID === item.ID)), "Cleanup did not persist.");
    check(remaining.length === baseline.length, "Cleanup changed the baseline.");
    baseline.forEach((item) => {
      const preserved = remaining.find((record) => record.ID === item.ID);
      check(preserved, "Cleanup removed baseline data.");
      sameOffering(preserved, item);
    });
  }
  return [...stages, "targeted cleanup and baseline preservation"];
}
