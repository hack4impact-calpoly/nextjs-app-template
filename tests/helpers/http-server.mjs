import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { MongoMemoryServer } from "mongodb-memory-server-core";

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

/** Start the real HTTP interface with separate output and no Atlas credentials. */
export async function startHttpServer({ seed = true } = {}) {
  const database = await MongoMemoryServer.create({
    binary: { version: "7.0.24" },
    instance: { dbName: "coffee_http_test" },
  });
  const databaseUri = database.getUri("coffee_http_test");
  const environment = {
    ...process.env,
    MONGO_URI: databaseUri,
    MANAGEMENT_USERNAME: "team",
    MANAGEMENT_PASSWORD: "test-only-password",
    __NEXT_PROCESSED_ENV: "",
  };
  try {
    if (seed) {
      const seeder = spawn(process.execPath, ["--import", "tsx", "scripts/seed-offerings.ts", "--apply"], {
        cwd: projectRoot,
        env: environment,
        windowsHide: true,
        timeout: 30000,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let diagnostics = "";
      for (const stream of [seeder.stdout, seeder.stderr])
        stream.on("data", (data) => {
          diagnostics += data.toString();
        });
      const [exitCode] = await once(seeder, "close");
      if (exitCode !== 0) throw new Error(`Disposable seed failed. ${diagnostics}`);
    }
  } catch (error) {
    await database.stop();
    throw error;
  }
  const portReservation = createServer();
  portReservation.listen(0, "127.0.0.1");
  await once(portReservation, "listening");
  const { port } = portReservation.address();
  await new Promise((resolve, reject) => portReservation.close((error) => (error ? reject(error) : resolve())));

  let server;
  let output = "";
  let startupError;
  function launch() {
    startupError = undefined;
    server = spawn(
      process.execPath,
      [require.resolve("next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", String(port)],
      {
        cwd: projectRoot,
        env: {
          ...environment,
          NODE_ENV: "development",
          COFFEE_SHOP_HTTP_TEST: "1",
          NEXT_TELEMETRY_DISABLED: "1",
        },
        windowsHide: true,
        detached: process.platform !== "win32",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    server.on("error", (error) => {
      startupError = error;
    });
    for (const stream of [server.stdout, server.stderr]) {
      stream.on("data", (chunk) => {
        output = (output + chunk.toString()).slice(-4000);
      });
    }
  }

  async function stop() {
    try {
      await stopApp();
    } finally {
      await database.stop();
    }
  }

  async function stopApp() {
    if (server.exitCode !== null || server.signalCode !== null || !server.pid) return;
    const exited = once(server, "exit");
    if (process.platform === "win32") {
      // Next dev has a worker process; stop only this harness's process tree.
      const killer = spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
      await once(killer, "close");
    } else {
      process.kill(-server.pid, "SIGTERM");
    }
    await exited;
  }

  const baseUrl = `http://127.0.0.1:${port}`;
  async function ready() {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      if (startupError) throw startupError;
      if (server.exitCode !== null || server.signalCode !== null) {
        throw new Error(`HTTP test server exited before becoming ready.\n${output}`);
      }
      try {
        const response = await fetch(`${baseUrl}/api/offerings`, { signal: AbortSignal.timeout(3000) });
        await response.arrayBuffer();
        if (response.ok) return;
      } catch {
        // The listener and first route compilation may still be starting.
      }
      await delay(250);
    }
    throw new Error(`HTTP test server did not become ready within 90 seconds.\n${output}`);
  }
  try {
    launch();
    await ready();
    return {
      baseUrl,
      stop,
      stopDatabase: () => database.stop(),
      diagnostics: () => output,
      authorization: `Basic ${Buffer.from("team:test-only-password").toString("base64")}`,
      async restart() {
        await stopApp();
        launch();
        await ready();
      },
    };
  } catch (error) {
    await stop();
    throw error;
  }
}
