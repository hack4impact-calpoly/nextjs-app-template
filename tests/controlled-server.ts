import { createServer } from "node:http";
import type { Offering } from "@/types/offering";

export const seedOffering: Offering = {
  ID: "seed-id",
  name: "Seed Tea",
  description: "Independent seed",
  price: 2.5,
  category: "Tea",
  specialOffer: true,
};

/** Runner self-test only: not the application or persistence evidence. */
export async function startControlledServer(mode = "correct", seeded = false) {
  const records: Offering[] = seeded ? [{ ...seedOffering }] : [];
  let nextId = 0;
  const server = createServer(async (request, response) => {
    const send = (status: number, body?: unknown) => {
      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(body === undefined ? undefined : JSON.stringify(body));
    };
    const error = (status: number, code: string) =>
      send(status, { error: { code, message: "Request failed safely." } });
    if (mode === "timeout") return;
    if (mode === "database-failure" || mode === "leaked-failure") {
      send(503, {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: mode === "leaked-failure" ? "mongodb://user:secret@host/db" : "Please retry later.",
        },
      });
      return;
    }
    if (request.method === "GET") {
      if (mode === "private-get" && !request.headers.authorization) return error(401, "UNAUTHORIZED");
      const ordered = [...records].sort((a, b) => a.name.localeCompare(b.name) || a.ID.localeCompare(b.ID));
      send(
        mode === "wrong-status" ? 500 : 200,
        mode === "wrong-shape" ? {} : mode === "wrong-order" ? ordered.reverse() : ordered,
      );
      return;
    }
    if (request.headers.authorization !== "Basic dGVhbTp0ZXN0LW9ubHktcGFzc3dvcmQ=") return error(401, "UNAUTHORIZED");
    if (request.method === "DELETE") {
      if (mode === "cleanup-failure") return error(503, "DATABASE_UNAVAILABLE");
      const id = decodeURIComponent(request.url!.split("/").at(-1)!);
      const index = records.findIndex((record) => record.ID === id);
      if (index >= 0 && mode !== "cleanup-not-persisted") records.splice(index, 1);
      send(204);
      return;
    }
    if (request.headers["content-type"] !== "application/json") return error(415, "INVALID_CONTENT_TYPE");
    let body: Record<string, unknown>;
    try {
      let text = "";
      for await (const chunk of request) text += chunk;
      body = JSON.parse(text);
    } catch {
      return error(400, "INVALID_JSON");
    }
    const valid =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof body.name === "string" &&
      body.name.trim().length > 0 &&
      body.name.trim().length <= 100 &&
      typeof body.description === "string" &&
      body.description.trim().length > 0 &&
      body.description.trim().length <= 500 &&
      typeof body.price === "number" &&
      Number.isFinite(body.price) &&
      body.price >= 0 &&
      Math.abs(body.price * 100 - Math.round(body.price * 100)) < 0.000001 &&
      typeof body.category === "string" &&
      ["Coffee", "Tea", "Smoothie"].includes(body.category) &&
      (body.specialOffer === undefined || typeof body.specialOffer === "boolean") &&
      Object.keys(body).every((key) => ["name", "description", "price", "category", "specialOffer"].includes(key));
    if (!valid) return mode === "accept-invalid" ? send(201, {}) : error(400, "INVALID_INPUT");
    const offering = {
      ...body,
      name: (body.name as string).trim(),
      description: (body.description as string).trim(),
      specialOffer: body.specialOffer ?? false,
      ID: `created-${++nextId}`,
    } as Offering;
    if (mode === "wrong-default" && body.specialOffer === undefined) offering.specialOffer = true;
    if (mode === "wrong-special" && body.specialOffer === true) offering.specialOffer = false;
    if (mode === "invalid-id") offering.ID = "";
    if (mode === "duplicate-id") offering.ID = "reused-id";
    if (mode !== "missing-read-back") records.push(offering);
    if (mode === "bad-post-body") return send(201, {});
    if (mode === "internal-fields") return send(201, { ...offering, _id: "internal-id" });
    if (mode === "malformed-json") {
      response.writeHead(201, { "Content-Type": "application/json" });
      response.end("broken");
      return;
    }
    send(201, offering);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test listener unavailable");
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    records,
    async stop() {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}
