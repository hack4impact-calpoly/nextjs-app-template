# Offering API contract

## Milestone 3 implementation

The historical Milestone 2 planning text below describes the original assignment boundaries. The Milestone 3 branch now reads MongoDB through GET and accepts authorized POST creation. IDs are MongoDB-generated strings; seed data is inserted deliberately rather than served as a fallback. GET returns sorted public data, `[]` when empty, and a sanitized 503 on database failure.

Brian's additional PUT `/api/offerings/[id]` replaces all offering details using the same input rules; omitted special flag defaults false. DELETE removes that offering and returns 204. Invalid identities return 400, missing records 404, missing/invalid management access 401, and cross-origin browser writes 403. PUT/DELETE and POST enforce access independently inside each handler. The [Milestone 3 plan](milestone-3-plan.md) and [deployment guide](milestone-3-deployment.md) supersede the old local-only restriction.

Use Node 24. `npm test` now runs Vitest and the retained Node regression suite. The HTTP harness starts real Next.js routes against a disposable MongoDB database, seeds the starting menu, verifies persisted writes, and checks database failure without a fixture fallback. Ordinary checks never use shared Atlas credentials.

## Historical Milestone 2 contract and assignment notes

Issue [#14](https://github.com/BrianLiDesign/coffee-shop/issues/14) establishes this contract for [Milestone 2](https://github.com/BrianLiDesign/coffee-shop/issues/12). GET is implemented using fixtures today. In the [independent assignment plan](./milestone-2-parallel-work.md), #15 supplies storage and seeding, #16 supplies independently tested GET/POST handlers and runtime validation, #17 supplies the special control/customer display checks, #20 supplies the management form, and #18 supplies acceptance tooling. Brian composes the real routes and UI during final milestone integration. This guide defines later integrated behavior without claiming it is already implemented.

## Shared types

Import browser-safe types and constants from `@/types/offering`. The fixture module uses the same Offering type. Client code must not import a Mongoose model or the fixture array.

- `Offering`: public response with string `ID`, name, description, numeric price, category, and boolean `specialOffer`.
- `CreateOfferingInput`: the same details without identity; `specialOffer` is optional.
- `OfferingCategory` and `OFFERING_CATEGORIES`: Coffee, Tea, or Smoothie.
- `OFFERING_INPUT_LIMITS`: name 100 characters, description 500 characters, price two decimal places.
- `DEFAULT_SPECIAL_OFFER`: false.
- `OfferingErrorResponse`: the shared error envelope with a code, readable message, and optional field messages.

TypeScript checks application code; it cannot validate incoming JSON. #16 must validate raw values before Mongoose can coerce them and apply the same rules in the form and model.

## Identity

GET remains a JSON array. `ID` is always a nonempty string, and React keys use it directly. Current fixture IDs are strings such as `"1"`; they are temporary identities, not MongoDB document IDs. The database slice will return the string serialization of MongoDB-generated identity through the same `ID` field.

Do not send `ID`, `_id`, or internal metadata when creating an offering. No numeric-ID counter is planned. Names need not be unique.

## GET /api/offerings

Current response: 200 with all 16 fixtures, including three specials. A shortened example:

```json
[
  {
    "ID": "1",
    "name": "Cappuccino",
    "description": "A delicious cappuccino with steamed milk and foam",
    "price": 5.9,
    "category": "Coffee",
    "specialOffer": false
  }
]
```

Menu displays every item. Specials displays only items with `specialOffer: true`: Pumpkin Spice Latte, Golden Hour Cold Brew, and Hojicha Latte in the starting fixtures.

After Brian composes #15's storage and #16's handlers, GET will read the selected database at request time, return `[]` for an empty collection, order by name then ID, and return a sanitized 503 on database failure. It will never silently fall back to fixtures. The existing fixture route stays functional while those modules are developed independently.

## POST /api/offerings (planned in #16)

Send `Content-Type: application/json` and a JSON object:

```json
{
  "name": "Vanilla Latte",
  "description": "Espresso with steamed milk and vanilla",
  "price": 5.75,
  "category": "Coffee",
  "specialOffer": false
}
```

The successful response is 201 with the saved Offering, including a server-generated string `ID`. A subsequent GET must return the same record. Omit `specialOffer` to use false; true marks it as a special. The standalone checkbox is supplied in #17 and composed with #20's form during final integration.

| Field        | Authoritative validation required in #16                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| name         | String; trim; required and nonempty after trimming; at most 100 characters           |
| description  | String; trim; required and nonempty after trimming; at most 500 characters           |
| price        | JSON number; finite; nonnegative; at most two decimal places; reject numeric strings |
| category     | Exactly Coffee, Tea, or Smoothie                                                     |
| specialOffer | Boolean when supplied; omission defaults to false; reject null and strings           |
| Other fields | Reject, including ID and \_id                                                        |

Decimal validation must tolerate ordinary floating-point representation without accepting meaningful fractional cents. The form parses its price text explicitly before submission. Mongoose validation is an additional guard, not a replacement for checking raw request input.

## Planned error responses

| Status | Code                 | Trigger                                    |
| ------ | -------------------- | ------------------------------------------ |
| 415    | INVALID_CONTENT_TYPE | POST body is not sent as JSON              |
| 400    | INVALID_JSON         | Body cannot be parsed as JSON              |
| 400    | INVALID_INPUT        | Wrong shape, type, fields, or field values |
| 503    | DATABASE_UNAVAILABLE | Database cannot complete the request       |

Example validation response:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Please correct the offering details.",
    "fields": {
      "name": "Enter a name.",
      "price": "Enter a nonnegative price with at most two decimal places."
    }
  }
}
```

Clients use the readable message and field messages, retain input on failure, and announce feedback accessibly. Errors must not include credentials, connection strings, raw database exceptions, or internal document fields.

## Running the HTTP regression checks

After installing dependencies, run `npm test`. Node's built-in test runner starts a real Next.js development server on an available loopback port and exercises GET over HTTP. It requires no separately running app and no database credentials. Output goes into ignored `.next-http-test`, leaving the normal `.next` build alone. The harness clears `MONGO_URI` for its child process and stops its process tree at teardown.

These checks cover string identity, the 16-item starting menu and public fields, and the three specials flags. They do not claim database persistence or POST coverage. Check types with `npm run typecheck`; run lint and build separately.

Use Node 18 or newer, matching the current CI matrix. The harness uses Node's [test runner](https://nodejs.org/api/test.html) and Next.js's [custom output directory](https://nextjs.org/docs/14/app/api-reference/next-config-js/distDir).

## Independent checks and integrated persistence checks

#15 proves its storage and seed behavior against a self-contained disposable local database. #16 proves HTTP handler behavior using its own explicitly test-only store. #18 independently proves its acceptance runner and disposable database lifecycle tooling. These assignments do not wait for each other; a store double or runner self-test is not evidence of real application persistence.

Keep HTTP requests and responses as the regression surface. Replace fixture-specific expectations with independently defined seed expectations when GET becomes database-backed. Extend the harness to start a disposable local MongoDB instance or use an explicitly designated isolated test database, setting the child app's test URI to that database.

Setup and cleanup may manage isolated data, but assertions observe persistence through POST followed by GET. Do not assert private model calls. Refuse developer/integration database targets for automated destructive cleanup. Ordinary CI must not use shared Atlas credentials; a separate deliberate Atlas smoke check supplies live-access evidence.

No disposable database launcher is added in #14 because the current route does not use MongoDB. Each assignment supplies the setup needed for its own tests. During final integration, Brian connects the real route and isolated database to the acceptance runner and records actual POST/GET persistence results under #12. Routine checks continue to exclude shared Atlas credentials.
