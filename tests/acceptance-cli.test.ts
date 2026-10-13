import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";
import { startControlledServer } from "./controlled-server";

async function cli(script: string, args: string[], variables: Record<string, string> = {}) {
  return new Promise<{ code: number | null; output: string }>((resolve, reject) => {
    const child = spawn(process.execPath, ["--import", "tsx", script, ...args], {
      env: {
        ...process.env,
        MONGO_URI: "",
        ACCEPTANCE_BASE_URL: "",
        ACCEPTANCE_SEED_FILE: "",
        ACCEPTANCE_CONFIRM_WRITES: "disposable",
        MANAGEMENT_USERNAME: "team",
        MANAGEMENT_PASSWORD: "test-only-password",
        ...variables,
      },
      windowsHide: true,
    });
    let output = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("CLI did not terminate."));
    }, 20000);
    child.stdout.on("data", (data) => {
      output = (output + data).slice(-8000);
    });
    child.stderr.on("data", (data) => {
      output = (output + data).slice(-8000);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, output });
    });
  });
}

test("acceptance CLI reports success for independently controlled expected HTTP responses", async () => {
  const server = await startControlledServer();
  try {
    const result = await cli("scripts/acceptance-runner.ts", ["--scenario", "empty"], {
      ACCEPTANCE_BASE_URL: server.baseUrl,
    });
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /PASS acceptance: targeted cleanup/);
    assert.doesNotMatch(result.output, /test-only-password|dGVhbTp|127\.0\.0\.1/);
  } finally {
    await server.stop();
  }
});

test("acceptance CLI exits nonzero for wrong status, shape, missing read-back and failed teardown", async () => {
  for (const mode of ["wrong-status", "bad-post-body", "missing-read-back", "cleanup-failure"]) {
    const server = await startControlledServer(mode);
    try {
      const result = await cli("scripts/acceptance-runner.ts", ["--scenario", "empty"], {
        ACCEPTANCE_BASE_URL: server.baseUrl,
      });
      assert.equal(result.code, 1, `${mode}: ${result.output}`);
      assert.match(result.output, /FAIL acceptance/);
      assert.doesNotMatch(result.output, /test-only-password|dGVhbTp/);
    } finally {
      await server.stop();
    }
  }
});

test("seeded CLI uses independent expectations and failure CLI requires deliberate unavailable responses", async () => {
  for (const scenario of ["seeded", "database-failure"]) {
    const server = await startControlledServer(
      scenario === "seeded" ? "correct" : "database-failure",
      scenario === "seeded",
    );
    try {
      const result = await cli("scripts/acceptance-runner.ts", ["--scenario", scenario], {
        ACCEPTANCE_BASE_URL: server.baseUrl,
        ACCEPTANCE_SEED_FILE: "tests/fixtures/acceptance-seed.json",
      });
      assert.equal(result.code, 0, result.output);
      assert.match(result.output, /PASS acceptance/);
    } finally {
      await server.stop();
    }
  }
});

test("acceptance CLI rejects ambiguous scenario, missing acknowledgement and unsafe configuration safely", async () => {
  for (const [args, variables] of [
    [[], {}],
    [["--scenario", "empty"], { ACCEPTANCE_BASE_URL: "http://user:private-secret@127.0.0.1:3000" }],
    [["--scenario", "empty"], { ACCEPTANCE_CONFIRM_WRITES: "" }],
    [["--scenario", "seeded"], { ACCEPTANCE_SEED_FILE: "missing-private-file" }],
  ] as [string[], Record<string, string>][]) {
    const result = await cli("scripts/acceptance-runner.ts", args, variables);
    assert.equal(result.code, 1);
    assert.doesNotMatch(result.output, /private-secret|missing-private-file|test-only-password/);
  }
});

test("disposable lifecycle CLI refuses developer/integration URI and external cleanup arguments", async () => {
  for (const [args, variables] of [
    [[], { MONGO_URI: "mongodb://user:private-secret@127.0.0.1/coffee_shop" }],
    [["--uri", "mongodb://user:private-secret@127.0.0.1/coffee_integration"], {}],
  ] as [string[], Record<string, string>][]) {
    const result = await cli("scripts/database-smoke.ts", args, variables);
    assert.equal(result.code, 1);
    assert.match(result.output, /No connection details printed/);
    assert.doesNotMatch(result.output, /private-secret|coffee_shop|coffee_integration/);
  }
});
