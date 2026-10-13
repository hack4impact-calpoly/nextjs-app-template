import assert from "node:assert/strict";
import { test } from "node:test";
import { startHttpServer } from "./helpers/http-server.mjs";
import { runAcceptance } from "../scripts/acceptance";

test(
  "acceptance observes real HTTP POST/read-back in an owned empty local database and deliberate failure",
  { timeout: 180000 },
  async () => {
    const server = await startHttpServer({ seed: false });
    const options = { baseUrl: server.baseUrl, username: "team", password: "test-only-password" };
    try {
      assert.equal((await runAcceptance({ ...options, scenario: "empty" })).length, 4);
      await server.stopDatabase();
      assert.equal((await runAcceptance({ ...options, scenario: "database-failure" })).length, 1);
    } finally {
      await server.stop();
    }
  },
);
