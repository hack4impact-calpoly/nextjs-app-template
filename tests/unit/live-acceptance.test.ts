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
