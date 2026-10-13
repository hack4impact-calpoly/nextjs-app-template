import { expect, it, vi } from "vitest";
import { verifyLive } from "../../scripts/live-acceptance";

it("fails acceptance for an incorrect GET status", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 }));
  await expect(verifyLive({ baseUrl: "https://shop.example", fetcher })).rejects.toThrow(/GET/);
});

it("fails acceptance for a malformed public offering", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ ID: "broken", price: "4.25" }])));
  await expect(verifyLive({ baseUrl: "https://shop.example", fetcher })).rejects.toThrow(/invalid public offering/);
});

it("fails when an acknowledged creation is missing from subsequent GET", async () => {
  const fetcher = vi.fn(async (_url: unknown, init?: RequestInit) => {
    if (init?.method === "POST" && !(init.headers as Record<string, string>)?.Authorization)
      return new Response(null, { status: 401 });
    if (init?.method === "POST")
      return new Response(JSON.stringify({ ID: "new-id", ...JSON.parse(String(init.body)) }), { status: 201 });
    return new Response("[]");
  });
  await expect(
    verifyLive({
      baseUrl: "https://shop.example",
      fetcher,
      allowWrites: true,
      username: "team",
      password: "test-only-password",
    }),
  ).rejects.toThrow(/missing or changed/);
});

it("refuses credential-bearing URLs and remote plain HTTP before making requests", async () => {
  const fetcher = vi.fn();
  for (const baseUrl of [
    "http://shop.example",
    "https://team:password@shop.example",
    "https://shop.example/?token=secret",
  ]) {
    await expect(verifyLive({ baseUrl, fetcher })).rejects.toThrow(/HTTPS origin/);
  }
  expect(fetcher).not.toHaveBeenCalled();
});

it("read-only verification performs no writes", async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

  const result = await verifyLive({
    baseUrl: "https://shop.example",
    fetcher,
  });

  expect(result).toEqual({ readCount: 0, writes: false });
  expect(fetcher).toHaveBeenCalledTimes(1);

  // The only request is the initial GET.
  expect(fetcher.mock.calls[0][1]?.method).toBeUndefined();
});

it("fails acceptance when GET returns duplicate offering IDs", async () => {
  const offering = {
    ID: "same-id",
    name: "Americano",
    description: "Espresso and water",
    price: 3.5,
    category: "Coffee",
    specialOffer: false,
  };

  const fetcher = vi.fn().mockResolvedValue(
    new Response(JSON.stringify([offering, { ...offering, name: "Latte" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

  await expect(
    verifyLive({
      baseUrl: "https://shop.example",
      fetcher,
    }),
  ).rejects.toThrow(/duplicate identities/i);

  // Verification must stop before attempting any writes.
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("fails verification on cleanup failure without deleting pre-existing offerings", async () => {
  const existingOffering = {
    ID: "existing-id",
    name: "Existing Americano",
    description: "Pre-existing record",
    price: 3,
    category: "Coffee",
    specialOffer: false,
  };

  let createdOffering: Record<string, unknown> | undefined;

  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";

    if (method === "GET") {
      const offerings = [existingOffering, ...(createdOffering ? [createdOffering] : [])];

      return new Response(JSON.stringify(offerings), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
      const headers = init?.headers as Record<string, string> | undefined;

      // First, the runner should confirm unauthenticated writes are denied.
      if (!headers?.Authorization) {
        return new Response(null, { status: 401 });
      }

      const postedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;

      createdOffering = {
        ID: "created-id",
        ...postedBody,
      };

      return new Response(JSON.stringify(createdOffering), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "DELETE") {
      // Simulate cleanup failing on the disposable record.
      return new Response("Cleanup unavailable", { status: 503 });
    }

    throw new Error(`Unexpected request: ${method} ${url.pathname}`);
  });

  await expect(
    verifyLive({
      baseUrl: "https://shop.example",
      allowWrites: true,
      username: "team",
      password: "test-only-password",
      fetcher,
    }),
  ).rejects.toThrow(/Disposable cleanup failed/i);

  const deletedPaths = fetcher.mock.calls
    .filter(([, init]) => init?.method === "DELETE")
    .map(([input]) => new URL(String(input)).pathname);

  // Only the newly created record may be targeted for cleanup.
  expect(deletedPaths).toEqual(["/api/offerings/created-id"]);
  expect(deletedPaths).not.toContain("/api/offerings/existing-id");

  // The pre-existing record must still be present and unchanged.
  const finalGet = await fetcher(new URL("/api/offerings", "https://shop.example"));
  const finalOfferings = await finalGet.json();

  expect(finalGet.status).toBe(200);
  expect(finalOfferings).toContainEqual(existingOffering);
});
