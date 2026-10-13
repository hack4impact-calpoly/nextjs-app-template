import http from "node:http";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  absWorkingDir: root,
  entryPoints: ["tests/previews/special-offerings.tsx"],
  bundle: true,
  write: false,
  outfile: "preview.js",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' },
});
const assets = new Map(
  result.outputFiles.map((file) => [file.path.endsWith(".css") ? "/preview.css" : "/preview.js", file.contents]),
);
const item = (ID, name, specialOffer) => ({
  ID,
  name,
  description: `${name} description`,
  price: 4.5,
  category: "Coffee",
  specialOffer,
});
const starting = [
  item("preview-ordinary", "Cappuccino", false),
  item("preview-pumpkin", "Pumpkin Spice Latte", true),
  item("preview-cold", "Golden Hour Cold Brew", true),
  { ...item("preview-hojicha", "Hojicha Latte", true), category: "Tea" },
];
const scenarios = new Set(["starting", "new-special", "empty", "failure", "loading"]);
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Offering-Preview", "controlled-response");
  if (assets.has(url.pathname)) {
    response.setHeader("Content-Type", url.pathname.endsWith(".css") ? "text/css" : "text/javascript");
    response.end(assets.get(url.pathname));
    return;
  }
  const scenario = url.searchParams.get("scenario") ?? "starting";
  if (!scenarios.has(scenario)) {
    response.writeHead(400);
    response.end("Unknown preview scenario");
    return;
  }
  if (url.pathname === "/api/offerings") {
    response.setHeader("Content-Type", "application/json");
    if (scenario === "loading") await new Promise((resolve) => setTimeout(resolve, 5000));
    if (scenario === "failure") {
      response.writeHead(503);
      response.end(
        JSON.stringify({ error: { code: "DATABASE_UNAVAILABLE", message: "Controlled preview unavailable." } }),
      );
    } else {
      const items =
        scenario === "empty"
          ? []
          : scenario === "new-special"
            ? [...starting, item("preview-new", "Cardamom Latte", true)]
            : starting;
      response.end(JSON.stringify(items));
    }
    return;
  }
  if (url.pathname !== "/") {
    response.writeHead(404);
    response.end();
    return;
  }
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Controlled-response special offering preview</title><link rel="stylesheet" href="/preview.css"><style>body{margin:0;background:#faf7f2;color:#302a25;font-family:Arial,sans-serif}a{color:#8a4b2a}*{box-sizing:border-box}</style></head><body><div id="root"></div><script src="/preview.js"></script></body></html>',
  );
});
server.listen(Number(process.env.SPECIAL_OFFERING_PREVIEW_PORT ?? 3002), "127.0.0.1", () => {
  console.log(`Test-only controlled-response preview: http://127.0.0.1:${server.address().port}`);
});
