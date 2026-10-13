import { expect, it } from "vitest";
import { seedOffering, startControlledServer } from "../controlled-server";
import { runAcceptance } from "../../scripts/acceptance";

it("runner rejects 201 with an invalid Offering even when GET succeeds", async () => {
  const server = await startControlledServer("bad-post-body");
  try {
    await expect(
      runAcceptance({ baseUrl: server.baseUrl, scenario: "empty", username: "team", password: "test-only-password" }),
    ).rejects.toThrow(/Invalid public fields/);
  } finally {
    await server.stop();
  }
});

const credentials = { username: "team", password: "test-only-password" };
it.each(["empty", "seeded"] as const)("runner verifies the %s scenario and cleans up its records", async (scenario) => {
  const server = await startControlledServer("correct", scenario === "seeded");
  try {
    const stages = await runAcceptance({
      baseUrl: server.baseUrl,
      scenario,
      ...credentials,
      expectedSeed: [seedOffering],
    });
    expect(stages).toHaveLength(4);
    expect(server.records).toEqual(scenario === "seeded" ? [seedOffering] : []);
  } finally {
    await server.stop();
  }
});

it.each([
  "wrong-status",
  "private-get",
  "wrong-shape",
  "missing-read-back",
  "wrong-default",
  "wrong-special",
  "invalid-id",
  "duplicate-id",
  "internal-fields",
  "wrong-order",
  "malformed-json",
  "accept-invalid",
  "cleanup-failure",
  "cleanup-not-persisted",
  "timeout",
])("runner fails for controlled %s behavior", async (mode) => {
  const server = await startControlledServer(mode);
  try {
    await expect(
      runAcceptance({ baseUrl: server.baseUrl, scenario: "empty", ...credentials, timeoutMs: 300 }),
    ).rejects.toThrow();
  } finally {
    await server.stop();
  }
});

it("requires an explicit seeded expectation and actual empty state", async () => {
  const server = await startControlledServer("correct", true);
  try {
    await expect(runAcceptance({ baseUrl: server.baseUrl, scenario: "empty", ...credentials })).rejects.toThrow(
      /empty database/,
    );
    await expect(runAcceptance({ baseUrl: server.baseUrl, scenario: "seeded", ...credentials })).rejects.toThrow(
      /expected seed/,
    );
    await expect(
      runAcceptance({
        baseUrl: server.baseUrl,
        scenario: "seeded",
        ...credentials,
        expectedSeed: [{ ...seedOffering, price: 9 }],
      }),
    ).rejects.toThrow(/details changed/);
  } finally {
    await server.stop();
  }
});

it("checks deliberate GET and POST database failure without inferring it from ordinary mode", async () => {
  const server = await startControlledServer("database-failure");
  try {
    expect(await runAcceptance({ baseUrl: server.baseUrl, scenario: "database-failure", ...credentials })).toHaveLength(
      1,
    );
    await expect(runAcceptance({ baseUrl: server.baseUrl, scenario: "empty", ...credentials })).rejects.toThrow(/GET/);
  } finally {
    await server.stop();
  }
});

it("rejects raw connection details in deliberately failed database responses", async () => {
  const server = await startControlledServer("leaked-failure");
  try {
    await expect(
      runAcceptance({ baseUrl: server.baseUrl, scenario: "database-failure", ...credentials }),
    ).rejects.toThrow(/leaked/);
  } finally {
    await server.stop();
  }
});

it.each([
  "https://shop.example",
  "http://localhost:3000",
  "http://team:secret@127.0.0.1:3000",
  "http://127.0.0.1:3000/path",
  "http://127.0.0.1:3000?secret=x",
  "invalid",
])("refuses unsafe or ambiguous target %s before requests", async (baseUrl) => {
  await expect(runAcceptance({ baseUrl, scenario: "empty", ...credentials })).rejects.toThrow(/loopback/);
});
