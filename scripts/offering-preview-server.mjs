import { randomUUID } from "node:crypto";
import http from "node:http";

const port = Number(process.env.OFFERING_PREVIEW_PORT ?? 3001);
const upstream = new URL(process.env.OFFERING_PREVIEW_UPSTREAM ?? "http://127.0.0.1:3000");
const validScenarios = new Set(["normal", "empty", "list-error", "field-errors", "save-failure", "reload-failure"]);
const sessions = new Map();

const initialOfferings = [
  {
    ID: "preview-1",
    name: "Apple Tea",
    description: "A bright and refreshing tea blend.",
    price: 4.5,
    category: "Tea",
    specialOffer: true,
  },
  {
    ID: "preview-2",
    name: "Cinnamon Latte",
    description: "Warm coffee with cinnamon sweetness.",
    price: 5.5,
    category: "Coffee",
    specialOffer: false,
  },
];

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Offering-Preview": "controlled-response",
  });
  response.end(JSON.stringify(body));
}

function cookieValue(request, name) {
  const cookies = request.headers.cookie?.split(";") ?? [];
  const entry = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
  return entry?.trim().slice(name.length + 1);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

async function handleOfferingsApi(request, response, session) {
  if (request.method === "GET") {
    session.getCount += 1;

    if (session.scenario === "list-error") {
      sendJson(response, 503, {
        error: {
          code: "PREVIEW_UNAVAILABLE",
          message: "The preview list is unavailable.",
        },
      });
      return;
    }

    if (session.scenario === "reload-failure" && session.getCount > 1) {
      sendJson(response, 503, {
        error: {
          code: "PREVIEW_UNAVAILABLE",
          message: "The preview list could not refresh.",
        },
      });
      return;
    }

    const offerings = session.scenario === "empty" ? [] : [...initialOfferings, ...session.createdOfferings];
    sendJson(response, 200, offerings);
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, {
      error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." },
    });
    return;
  }

  let input;
  try {
    input = await readJson(request);
  } catch {
    sendJson(response, 400, {
      error: { code: "INVALID_JSON", message: "Request body must be valid JSON." },
    });
    return;
  }

  if (session.scenario === "save-failure") {
    sendJson(response, 503, {
      error: {
        code: "PREVIEW_SAVE_REJECTED",
        message: "The preview save was rejected.",
      },
    });
    return;
  }

  if (session.scenario === "field-errors") {
    sendJson(response, 400, {
      error: {
        code: "INVALID_INPUT",
        message: "The preview rejected this offering.",
        fields: {
          name: "The preview server rejected this name.",
        },
      },
    });
    return;
  }

  if (session.scenario === "normal") {
    await new Promise((resolve) => setTimeout(resolve, 1400));
  }

  const offering = {
    ID: `preview-${randomUUID()}`,
    name: input.name,
    description: input.description,
    price: Number(input.price),
    category: input.category,
    specialOffer: input.specialOffer === true,
  };
  session.createdOfferings.push(offering);
  sendJson(response, 201, offering);
}

function proxyToNext(request, response, cookieHeader) {
  const proxyRequest = http.request(
    {
      hostname: upstream.hostname,
      port: upstream.port,
      method: request.method,
      path: request.url,
      headers: {
        ...request.headers,
        host: upstream.host,
      },
    },
    (proxyResponse) => {
      const headers = { ...proxyResponse.headers };
      if (cookieHeader) {
        const existing = headers["set-cookie"];
        headers["set-cookie"] = [...(Array.isArray(existing) ? existing : existing ? [existing] : []), cookieHeader];
      }
      response.writeHead(proxyResponse.statusCode ?? 502, headers);
      proxyResponse.pipe(response);
    },
  );

  proxyRequest.on("error", (error) => {
    console.error(`Could not reach Next.js at ${upstream.origin}: ${error.message}`);
    sendJson(response, 502, {
      error: {
        code: "PREVIEW_UPSTREAM_UNAVAILABLE",
        message: "Start the Next.js development server on port 3000 first.",
      },
    });
  });
  request.pipe(proxyRequest);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (url.pathname === "/__preview/status") {
    sendJson(response, 200, {
      mode: "test-only controlled HTTP responses",
      sessions: [...sessions.values()].map((session) => ({
        scenario: session.scenario,
        getCount: session.getCount,
        createdCount: session.createdOfferings.length,
        lastSpecialOffer: session.createdOfferings.at(-1)?.specialOffer ?? null,
      })),
    });
    return;
  }

  let sessionId = cookieValue(request, "offering_preview_session");
  let session = sessions.get(sessionId);
  let cookieHeader;

  if (url.searchParams.has("scenario")) {
    const scenario = url.searchParams.get("scenario");
    if (!validScenarios.has(scenario)) {
      sendJson(response, 400, {
        error: {
          code: "UNKNOWN_PREVIEW_SCENARIO",
          message: `Choose one of: ${[...validScenarios].join(", ")}.`,
        },
      });
      return;
    }

    sessionId = randomUUID();
    session = {
      scenario,
      getCount: 0,
      createdOfferings: [],
    };
    sessions.set(sessionId, session);
    cookieHeader = `offering_preview_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax`;
  }

  if (url.pathname === "/api/offerings") {
    if (!session) {
      sendJson(response, 400, {
        error: {
          code: "PREVIEW_SESSION_REQUIRED",
          message: "Open this page with ?scenario=normal to start a preview session.",
        },
      });
      return;
    }

    try {
      await handleOfferingsApi(request, response, session);
      console.log(`Preview ${request.method} ${url.pathname} scenario=${session.scenario}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected preview server error.";
      console.error(message);
      if (!response.headersSent) {
        sendJson(response, 500, {
          error: {
            code: "PREVIEW_RESPONSE_FAILED",
            message: "The preview response failed.",
          },
        });
      }
    }
    return;
  }

  proxyToNext(request, response, cookieHeader);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Test-only offering preview: http://localhost:${port}/manage-offerings?scenario=normal`);
  console.log(`Proxying page and assets from Next.js at ${upstream.origin}`);
  console.log("Scenarios: normal, empty, list-error, field-errors, save-failure, reload-failure");
});

server.on("error", (error) => {
  console.error(`Offering preview server failed: ${error.message}`);
  process.exitCode = 1;
});
