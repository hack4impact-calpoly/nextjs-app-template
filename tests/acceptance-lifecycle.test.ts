import assert from "node:assert/strict";
import { test } from "node:test";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { bounded, verifyDisposableDatabase } from "../scripts/disposable-database";

test(
  "owned disposable lifecycle starts, writes, reads, cleans and stops without Atlas",
  { timeout: 90000 },
  async () => {
    const stages = await verifyDisposableDatabase();
    assert.equal(stages.length, 4);
    assert.match(stages[1], /write and read-back/);
    assert.match(stages[2], /cleanup and unrelated-record preservation/);
    assert.match(stages[3], /stopped/);
  },
);

test("lifecycle fails when owned server refuses teardown", { timeout: 90000 }, async (context) => {
  const stop = MongoMemoryServer.prototype.stop;
  context.mock.method(
    MongoMemoryServer.prototype,
    "stop",
    async function (this: MongoMemoryServer, ...args: Parameters<typeof stop>) {
      await stop.apply(this, args);
      return false;
    },
  );
  await assert.rejects(verifyDisposableDatabase(), /teardown failed/);
});

test("teardown deadlines fail instead of hanging", async () => {
  await assert.rejects(bounded(new Promise(() => {}), "teardown", 20), /teardown deadline/);
});
