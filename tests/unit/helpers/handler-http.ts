import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import type { CreateOfferingInput, Offering } from "@/types/offering";

/** Independent handler test double. Never selected by the application. */
export class TestOfferingStore {
  private records: Offering[];

  constructor(records: Offering[] = []) {
    this.records = records.map((record) => ({ ...record }));
  }

  async list(): Promise<Offering[]> {
    return this.records
      .map((record) => ({ ...record }))
      .sort((left, right) => left.name.localeCompare(right.name) || left.ID.localeCompare(right.ID));
  }

  async create(input: CreateOfferingInput): Promise<Offering> {
    const record = { ...input, ID: randomUUID(), specialOffer: input.specialOffer ?? false };
    this.records.push(record);
    return { ...record };
  }
}

/** Hosts real request handlers without Next.js, MongoDB, or production fixtures. */
export async function startHandlerHttpServer(handlers: {
  GET(): Promise<Response>;
  POST(request: Request): Promise<Response>;
}) {
  const server = createServer(async (incoming, outgoing) => {
    try {
      if (incoming.url !== "/api/offerings" || !["GET", "POST"].includes(incoming.method ?? "")) {
        outgoing.writeHead(404).end();
        return;
      }
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const request = new Request(`http://${incoming.headers.host}${incoming.url}`, {
        method: incoming.method,
        headers: new Headers(
          Object.entries(incoming.headers).flatMap(([key, value]) =>
            value === undefined ? [] : [[key, Array.isArray(value) ? value.join(", ") : value]],
          ),
        ),
        ...(incoming.method === "POST" ? { body: Buffer.concat(chunks).toString("utf8") } : {}),
      });
      const response = incoming.method === "POST" ? await handlers.POST(request) : await handlers.GET();
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      outgoing.writeHead(500).end();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Expected a loopback port.");
  return {
    url: `http://127.0.0.1:${address.port}/api/offerings`,
    async stop() {
      server.closeIdleConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}
