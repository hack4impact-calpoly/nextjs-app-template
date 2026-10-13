import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import net from "node:net";
import { MongoMemoryServer } from "mongodb-memory-server-core";

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const loader = pathToFileURL(require.resolve("tsx")).href;
const seedScript = path.join(projectRoot, "scripts/seed-offerings.ts");

async function seed({ uri = "", args = ["--apply"], envFile, script = seedScript, recoveryUri } = {}) {
  const cwd = await mkdtemp(path.join(tmpdir(), "coffee-seed-command-"));
  try {
    if (envFile) await writeFile(path.join(cwd, ".env.local"), envFile);
    const env = { ...process.env, NODE_ENV: "development", TSX_TSCONFIG_PATH: path.join(projectRoot, "tsconfig.json") };
    delete env.__NEXT_PROCESSED_ENV;
    if (recoveryUri) env.COFFEE_STORAGE_RECOVERY_URI = recoveryUri;
    if (uri === undefined) delete env.MONGO_URI;
    else env.MONGO_URI = uri;
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["--import", loader, script, ...args], { cwd, env, windowsHide: true });
      let output = "";
      for (const stream of [child.stdout, child.stderr]) stream.on("data", (chunk) => (output += chunk));
      let timedOut = false;
      const deadline = setTimeout(() => {
        timedOut = true;
        child.kill();
      }, 40_000);
      child.on("error", (error) => {
        clearTimeout(deadline);
        reject(error);
      });
      child.on("close", (code) => {
        clearTimeout(deadline);
        if (timedOut) reject(new Error("Database command exceeded 40 seconds"));
        else resolve({ code, output });
      });
    });
  } finally {
    assert.equal(path.dirname(cwd), tmpdir());
    assert.ok(path.basename(cwd).startsWith("coffee-seed-command-"));
    await rm(cwd, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

test("seed command requires deliberate application and valid configuration without leaking credentials", async () => {
  for (const options of [
    { args: [] },
    { args: ["--typo"] },
    {},
    { uri: "mongodb://user:private-password@127.0.0.1/admin" },
    { uri: "mongodb://user:private-password@127.0.0.1/" },
    { uri: "{mongo-uri-here}" },
  ]) {
    const result = await seed(options);
    assert.equal(result.code, 1, result.output);
    assert.match(result.output, /FAIL configuration/);
    assert.doesNotMatch(result.output, /private-password|mongodb:\/\//);
  }
});

test("seed command creates 16 items then reports zero inserts on a separate-process rerun", async () => {
  const server = await MongoMemoryServer.create({ binary: { version: "7.0.24" } });
  try {
    const uri = server.getUri("coffee_seed_command_test");
    const first = await seed({ uri, envFile: "MONGO_URI={mongo-uri-here}\n" });
    assert.equal(first.code, 0, first.output);
    assert.match(first.output, /PASS seed: inserted=16/);
    const second = await seed({ uri });
    assert.equal(second.code, 0, second.output);
    assert.match(second.output, /PASS seed: inserted=0/);
  } finally {
    await server.stop();
  }
});

test("unreachable storage rejects list/create/seed, reports safe failure, and recovers on retry", async () => {
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, "127.0.0.1", resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const server = await MongoMemoryServer.create({ binary: { version: "7.0.24" } });
  try {
    const result = await seed({
      uri: `mongodb://user:private-password@127.0.0.1:${port}/coffee_unreachable_test`,
      recoveryUri: server.getUri("coffee_recovery_test"),
      script: path.join(projectRoot, "tests/helpers/offering-storage-connection.ts"),
      args: [],
    });
    assert.equal(result.code, 0, result.output);
    assert.match(result.output, /DATABASE_UNAVAILABLE/);
    assert.match(result.output, /PASS recovery/);
    assert.doesNotMatch(result.output, /private-password|mongodb:\/\/|MongoServer/);
    const command = await seed({ uri: `mongodb://user:private-password@127.0.0.1:${port}/coffee_unreachable_test` });
    assert.equal(command.code, 1, command.output);
    assert.match(command.output, /FAIL seed: database operation failed/);
    assert.doesNotMatch(command.output, /private-password|mongodb:\/\/|MongoServer/);
  } finally {
    await server.stop();
  }
});
