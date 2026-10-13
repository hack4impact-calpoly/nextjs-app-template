import { randomUUID } from "node:crypto";
import { isOffering } from "@/lib/offering-response";
import type { Offering } from "@/types/offering";

type Options = {
  baseUrl: string;
  username?: string;
  password?: string;
  allowWrites?: boolean;
  allOperations?: boolean;
  fetcher?: typeof fetch;
};

function assertPublicOffering(value: unknown): asserts value is Offering {
  if (!isOffering(value) || Object.keys(value).sort().join(",") !== "ID,category,description,name,price,specialOffer") {
    throw new Error("The server returned an invalid public offering.");
  }
}

export async function verifyLive({
  baseUrl,
  username,
  password,
  allowWrites = false,
  allOperations = false,
  fetcher = fetch,
}: Options) {
  const target = new URL(baseUrl);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
  if (
    (target.protocol !== "https:" && !(loopback && target.protocol === "http:")) ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    target.pathname !== "/"
  ) {
    throw new Error("Use an HTTPS origin, or a loopback HTTP origin, without paths or credentials.");
  }
  const request = (path: string, init: RequestInit = {}) =>
    fetcher(new URL(path, target), {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  async function read(): Promise<Offering[]> {
    const response = await request("/api/offerings");
    if (response.status !== 200) throw new Error("GET offerings did not return 200.");
    const records: unknown = await response.json();
    if (!Array.isArray(records)) throw new Error("GET offerings did not return an array.");
    records.forEach(assertPublicOffering);
    if (new Set(records.map((item) => item.ID)).size !== records.length)
      throw new Error("GET returned duplicate identities.");
    return records;
  }
  const baseline = await read();
  if (!allowWrites) return { readCount: baseline.length, writes: false };
  if (!username || !password || password.length < 16)
    throw new Error("Configure private management credentials before write verification.");
  const authorization = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
  const headers = { Authorization: authorization, "Content-Type": "application/json" };
  const marker = randomUUID();
  const input = {
    name: `Verification ${marker}`,
    description: `Disposable milestone verification ${marker}`,
    price: 3.75,
    category: "Coffee",
    specialOffer: true,
  };
  const updatedInput = { ...input, name: `${input.name} edited`, specialOffer: false };
  const baselineIds = new Set(baseline.map((item) => item.ID));
  let creationAttempted = false;
  let createdId: string | undefined;
  try {
    creationAttempted = true;
    const denied = await request("/api/offerings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (denied.status !== 401) throw new Error("Unauthenticated writes were not rejected with 401.");
    const created = await request("/api/offerings", { method: "POST", headers, body: JSON.stringify(input) });
    if (created.status !== 201) throw new Error("Authorized creation did not return 201.");
    const body: unknown = await created.json();
    assertPublicOffering(body);
    if (
      baselineIds.has(body.ID) ||
      Object.entries(input).some(([key, value]) => body[key as keyof Offering] !== value)
    ) {
      throw new Error("Creation did not return the new offering details.");
    }
    createdId = body.ID;
    const reread = (await read()).find((item) => item.ID === createdId);
    if (!reread || Object.entries(body).some(([key, value]) => reread[key as keyof Offering] !== value)) {
      throw new Error("Created offering was missing or changed on read-back.");
    }
    if (allOperations) {
      const updated = await request(`/api/offerings/${encodeURIComponent(createdId)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedInput),
      });
      if (updated.status !== 200) throw new Error("Updating the disposable offering did not return 200.");
      const updatedBody: unknown = await updated.json();
      assertPublicOffering(updatedBody);
      if (
        updatedBody.ID !== createdId ||
        Object.entries(updatedInput).some(([key, value]) => updatedBody[key as keyof Offering] !== value)
      )
        throw new Error("Update returned incorrect offering details.");
      const edited = (await read()).find((item) => item.ID === createdId);
      if (!edited || Object.entries(updatedInput).some(([key, value]) => edited[key as keyof Offering] !== value))
        throw new Error("Updated offering did not persist on read-back.");
    }
  } finally {
    if (creationAttempted) {
      // Recover uncertain POST outcomes by marker; never delete pre-existing IDs.
      const ownRecords = (await read()).filter(
        (item) =>
          !baselineIds.has(item.ID) &&
          item.description === input.description &&
          [input.name, updatedInput.name].includes(item.name),
      );
      for (const item of ownRecords) {
        const removed = await request(`/api/offerings/${encodeURIComponent(item.ID)}`, { method: "DELETE", headers });
        if (removed.status !== 204) throw new Error(`Disposable cleanup failed. Check verification marker ${marker}.`);
      }
      if ((await read()).some((item) => ownRecords.some((own) => own.ID === item.ID)))
        throw new Error(`Disposable cleanup did not persist. Check verification marker ${marker}.`);
    }
  }
  return { readCount: baseline.length, writes: true, updated: allOperations };
}
