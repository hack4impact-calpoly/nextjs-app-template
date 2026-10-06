const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const mongoose = require("mongoose");
const { NextResponse } = require("next/server");

// Execute the real TypeScript modules while replacing only external IO.
function loadModule(file, imports, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const loadedModule = { exports: {} };
  const requireImport = (name) => {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
    return imports[name];
  };
  new Function("require", "module", "exports", ...Object.keys(globals), outputText)(
    requireImport,
    loadedModule,
    loadedModule.exports,
    ...Object.values(globals),
  );
  return loadedModule.exports;
}

const movieModule = loadModule("src/database/movieSchema.ts", { mongoose });
const upcomingModule = loadModule("src/database/upcomingMovieSchema.ts", {
  mongoose,
  "./movieSchema": movieModule,
});
const menuModule = loadModule("src/database/menuItemSchema.ts", { mongoose });
const movieQueries = loadModule("src/database/movieQueries.ts", {
  mongoose,
  "./db": async () => {},
  "./movieSchema": movieModule,
});

const movieFields = {
  title: "Test Movie",
  director: "Test Director",
  year: 2026,
  runtimeMinutes: 100,
  rating: "PG",
  description: "A movie from the database.",
};

const cases = [
  {
    name: "movies",
    file: "src/app/api/movies/route.ts",
    modelImport: "@/database/movieSchema",
    makeDocument: () => new movieModule.default({ ...movieFields, id: "test-movie" }),
  },
  {
    name: "upcoming movies",
    file: "src/app/api/upcomingMovies/route.ts",
    modelImport: "@/database/upcomingMovieSchema",
    makeDocument: () => new upcomingModule.default(movieFields),
  },
  {
    name: "menu items",
    file: "src/app/api/menuItems/route.ts",
    modelImport: "@/database/menuItemSchema",
    makeDocument: () => new menuModule.default({ name: "Popcorn", price: 5.99, description: "Fresh popcorn" }),
  },
];

function loadRoute(config, documents, { connectionError = false, queryError = false } = {}) {
  let connected = false;
  return loadModule(config.file, {
    "next/server": { NextResponse },
    "@/database/db": async () => {
      if (connectionError) throw new Error("Private database connection details");
      connected = true;
    },
    "@/database/movieQueries": movieQueries,
    [config.modelImport]: {
      find(filter) {
        assert.equal(connected, true, "Connect before querying MongoDB");
        assert.deepEqual(filter, {});
        return {
          sort() {
            return {
              async exec() {
                if (queryError) throw new Error("Private database query details");
                return documents;
              },
            };
          },
        };
      },
    },
  });
}

for (const config of cases) {
  test(`${config.name}: GET returns database documents with stable string IDs`, async () => {
    const document = config.makeDocument();
    const route = loadRoute(config, [document]);
    const response = await route.GET();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const items = await response.json();
    assert.equal(items.length, 1);
    assert.equal(items[0].id, document.get("id") || document._id.toString());
    assert.equal(items[0]._id, undefined);
    if (config.name === "menu items") {
      assert.equal(items[0].price, 5.99);
      assert.equal(items[0].name, "Popcorn");
    } else {
      assert.equal(items[0].title, movieFields.title);
      assert.deepEqual(items[0].showtimes, []);
      assert.deepEqual(items[0].genres, []);
      assert.equal(items[0].posterLabel, config.name === "movies" ? "NOW PLAYING" : "COMING SOON");
    }
  });

  test(`${config.name}: empty collection returns []`, async () => {
    const response = await loadRoute(config, []).GET();
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  });

  for (const errorKind of ["connectionError", "queryError"]) {
    test(`${config.name}: ${errorKind} returns a safe 500 response`, async () => {
      const response = await loadRoute(config, [], { [errorKind]: true }).GET();
      assert.equal(response.status, 500);
      const body = await response.json();
      assert.equal(typeof body.error, "string");
      assert.doesNotMatch(body.error, /Private|MONGO_URI/);
    });
  }
}

test("API helpers GET the correct endpoints without caching and forward abort signals", async () => {
  const calls = [];
  const api = loadModule(
    "src/lib/api.ts",
    {},
    {
      fetch: async (url, options) => {
        calls.push({ url, options });
        return Response.json([{ id: "database-id" }]);
      },
    },
  );
  const signal = new AbortController().signal;
  for (const get of [api.getMovies, api.getUpcomingMovies, api.getMenuItem]) {
    assert.deepEqual(await get(signal), [{ id: "database-id" }]);
  }
  assert.deepEqual(
    calls.map((call) => call.url),
    ["/api/movies", "/api/upcomingMovies", "/api/menuItems"],
  );
  for (const call of calls) {
    assert.equal(call.options.cache, "no-store");
    assert.equal(call.options.signal, signal);
  }
});

test("API helpers reject failed or malformed responses", async () => {
  for (const response of [Response.json({ error: "Database unavailable" }, { status: 500 }), Response.json({})]) {
    const api = loadModule("src/lib/api.ts", {}, { fetch: async () => response });
    await assert.rejects(api.getMovies());
  }
});

test("Movie details support slugs and MongoDB IDs and return null for missing movies", async () => {
  const document = new movieModule.default(movieFields);
  const filters = [];
  let result = document;
  const queries = loadModule("src/database/movieQueries.ts", {
    mongoose,
    "./db": async () => {},
    "./movieSchema": {
      findOne(filter) {
        filters.push(filter);
        return { exec: async () => result };
      },
    },
  });
  assert.equal((await queries.getMovieById("example-movie")).id, document._id.toString());
  assert.deepEqual(filters[0], { id: "example-movie" });
  const id = document._id.toString();
  assert.equal((await queries.getMovieById(id)).id, id);
  assert.deepEqual(filters[1], { $or: [{ id }, { _id: id }] });
  result = null;
  assert.equal(await queries.getMovieById("missing-movie"), null);
});

test("MongoDB connection shares concurrent attempts and retries after failure", async () => {
  const previousUri = process.env.MONGO_URI;
  const previousConnection = globalThis.mongoConnection;
  process.env.MONGO_URI = "mongodb://example.invalid/test";
  delete globalThis.mongoConnection;
  let calls = 0;
  let resolveConnection;
  const connection = new Promise((resolve) => {
    resolveConnection = resolve;
  });
  try {
    const { default: connectDB } = loadModule("src/database/db.ts", {
      mongoose: {
        connect: () => {
          calls += 1;
          return calls === 1 ? Promise.reject(new Error("Temporary failure")) : connection;
        },
      },
    });
    await assert.rejects(connectDB(), /Temporary failure/);
    const first = connectDB();
    const second = connectDB();
    assert.equal(calls, 2);
    const expected = { connected: true };
    resolveConnection(expected);
    assert.equal(await first, expected);
    assert.equal(await second, expected);
    assert.equal(await connectDB(), expected);
    assert.equal(calls, 2);
    delete process.env.MONGO_URI;
    await assert.rejects(connectDB(), /MONGO_URI is not configured/);
  } finally {
    if (previousUri === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = previousUri;
    if (previousConnection === undefined) delete globalThis.mongoConnection;
    else globalThis.mongoConnection = previousConnection;
  }
});
