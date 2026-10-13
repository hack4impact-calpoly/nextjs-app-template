import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import net from "node:net";

const script = fileURLToPath(new URL("../scripts/check-database.mjs", import.meta.url));

async function check({ uri, args = [], file } = {}) {
  const cwd = await mkdtemp(path.join(tmpdir(), "coffee-checker-"));
  try {
    if (file) await writeFile(path.join(cwd, ".env.local"), file);
    const env = { ...process.env, NODE_ENV: "development" };
    delete env.MONGO_URI;
    delete env.__NEXT_PROCESSED_ENV;
    if (uri !== undefined) env.MONGO_URI = uri;
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [script, ...args], { cwd, env });
      let output = "";
      child.stdout.on("data", (data) => (output += data));
      child.stderr.on("data", (data) => (output += data));
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error("Checker did not terminate within 35 seconds"));
      }, 35000);
      child.on("error", reject);
      child.on("close", (code) => {
        clearTimeout(timeout);
        resolve({ code, output });
      });
    });
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

test("missing configuration fails with a safe configuration stage", async () => {
  const result = await check();
  assert.equal(result.code, 1);
  assert.match(result.output, /FAIL configuration/);
  assert.match(result.output, /MONGO_URI/);
});

test("rejects placeholders, implicit/system databases, and unsupported arguments without leaking secrets", async () => {
  for (const uri of [
    "{mongo-uri-here}",
    "mongodb://user:private-password@127.0.0.1/",
    "mongodb://user:private-password@127.0.0.1/admin",
    "mongodb://user:private-password@127.0.0.1/coffee_shop_YOUR_NAME",
    "mongodb://user:private-password@127.0.0.1/unsafe%0Aname",
  ]) {
    const result = await check({ uri });
    assert.equal(result.code, 1);
    assert.match(result.output, /FAIL configuration/);
    assert.doesNotMatch(result.output, /private-password|mongodb:\/\//);
  }
  assert.equal((await check({ args: ["--typo"] })).code, 1);
});

test("unreachable server terminates with sanitized connection failure", async () => {
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const result = await check({ uri: `mongodb://user:private-password@127.0.0.1:${port}/coffee_checker_test` });
  assert.equal(result.code, 1);
  assert.match(result.output, /FAIL connect/);
  assert.match(result.output, /PASS close/);
  assert.doesNotMatch(result.output, /private-password|mongodb:\/\//);
});

test("real database permissions, write/read-back, and targeted cleanup", async (t) => {
  const { MongoMemoryServer } = await import("mongodb-memory-server-core");
  const mongoose = (await import("mongoose")).default;
  const server = await MongoMemoryServer.create({
    binary: { version: "7.0.24" },
    auth: { enable: true, customRootName: "checker-root", customRootPwd: "test-only-password" },
  });
  const address = server.getUri("coffee_checker_test");
  const userUri = (user) =>
    address.replace("mongodb://", `mongodb://${user}:test-only-password@`) + "?authSource=admin";
  const uri = userUri("checker-root");
  const client = new mongoose.mongo.MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db().collection("_coffee_shop_verification");
    await collection.insertOne({ _id: "unrelated", value: "preserve me" });
    const admin = client.db("admin");
    await admin.command({
      createUser: "checker-reader",
      pwd: "test-only-password",
      roles: [{ role: "read", db: "coffee_checker_test" }],
    });
    await admin.command({ createUser: "checker-no-read", pwd: "test-only-password", roles: [] });
    await admin.command({
      createRole: "checker-no-cleanup",
      privileges: [
        {
          resource: { db: "coffee_checker_test", collection: "_coffee_shop_verification" },
          actions: ["find", "insert"],
        },
      ],
      roles: [],
    });
    await admin.command({
      createUser: "checker-writer-no-cleanup",
      pwd: "test-only-password",
      roles: ["checker-no-cleanup"],
    });

    await t.test("default mode reads .env.local without changing records", async () => {
      const result = await check({ file: `MONGO_URI=${uri}\n` });
      assert.equal(result.code, 0, result.output);
      assert.match(result.output, /PASS read/);
      assert.match(result.output, /coffee_checker_test/);
      assert.doesNotMatch(result.output, /PASS write/);
      assert.equal(await collection.countDocuments(), 1);
    });
    await t.test("environment URI takes precedence over .env.local", async () => {
      const result = await check({ uri, file: "MONGO_URI={mongo-uri-here}\n" });
      assert.equal(result.code, 0, result.output);
    });
    await t.test("explicit write acknowledges, reads back, and removes only its marker", async () => {
      const result = await check({ uri, args: ["--write"] });
      assert.equal(result.code, 0, result.output);
      assert.match(result.output, /PASS write/);
      assert.match(result.output, /PASS read-back/);
      assert.match(result.output, /PASS cleanup/);
      assert.equal(await collection.countDocuments(), 1);
      assert.equal((await collection.findOne({ _id: "unrelated" })).value, "preserve me");
    });
    await t.test("connected user without read permission fails at actual read", async () => {
      const result = await check({ uri: userUri("checker-no-read") });
      assert.equal(result.code, 1);
      assert.match(result.output, /PASS connect/);
      assert.match(result.output, /FAIL read/);
      assert.doesNotMatch(result.output, /test-only-password|MongoServerError/);
    });
    await t.test("read-only user passes default mode but fails explicit write", async () => {
      const read = await check({ uri: userUri("checker-reader") });
      assert.equal(read.code, 0, read.output);
      const write = await check({ uri: userUri("checker-reader"), args: ["--write"] });
      assert.equal(write.code, 1);
      assert.match(write.output, /PASS read/);
      assert.match(write.output, /FAIL write/);
      assert.equal(await collection.countDocuments(), 1);
    });
    await t.test("cleanup failure exits nonzero and reports exact disposable marker", async () => {
      const result = await check({ uri: userUri("checker-writer-no-cleanup"), args: ["--write"] });
      assert.equal(result.code, 1);
      assert.match(result.output, /PASS read-back/);
      assert.match(result.output, /FAIL cleanup/);
      const marker = /INFO disposable marker=([a-f0-9-]+)/.exec(result.output)[1];
      assert.equal((await collection.findOne({ _id: marker })).purpose, "coffee-shop-access-check");
      assert.equal((await collection.findOne({ _id: "unrelated" })).value, "preserve me");
      await collection.deleteOne({ _id: marker });
      assert.equal(await collection.countDocuments(), 1);
    });
  } finally {
    await client.close();
    await server.stop();
  }
});
