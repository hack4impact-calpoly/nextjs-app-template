# Offering storage and repeatable seeding

[Issue #15](https://github.com/BrianLiDesign/coffee-shop/issues/15) supplied real MongoDB storage independently of the live API and customer pages. Its original deliverable left the fixture-backed route unchanged. The Milestone 3 release now composes that storage with the handlers and adds update/remove operations. The independent storage and seed regressions remain enabled.

## Storage boundary

Import `offeringStore` from `@/database/offeringStore`:

- `list(): Promise<Offering[]>` returns only the six public fields, sorted by name then string ID using the shared sort rule. An empty collection returns `[]`.
- `create(input: CreateOfferingInput): Promise<Offering>` resolves after MongoDB acknowledges persistence. MongoDB generates identity, serialized through public `ID`. Internal `_id`, `__v`, and `seedKey` never appear in public results.
- Both operations use the existing `connectDB` helper. Connection selection is bounded to five seconds. Failures reject; handlers own the sanitized 503 error envelope. There is no fixture fallback or automatic seeding.

`src/database/offeringModel.ts` is separate from the starter User model. It enforces trimmed required name/description, their 100/500-character limits, Coffee/Tea/Smoothie categories, finite nonnegative price with at most two decimal places, and required boolean `specialOffer` defaulting to false. Mongoose's casting is not raw JSON validation; #16 must reject invalid raw request types before calling storage.

An illustrative public result (MongoDB-generated IDs vary):

```json
{
  "ID": "507f1f77bcf86cd799439011",
  "name": "Vanilla Latte",
  "description": "Espresso with vanilla and milk",
  "price": 5.75,
  "category": "Coffee",
  "specialOffer": false
}
```

## Independent verification

```bash
npm ci
npm run test:storage
npm test
npm run typecheck
npm run lint
npm run build
```

The tests launch and stop their own disposable local MongoDB 7.0.24 instances using the already installed `mongodb-memory-server-core`. They override inherited `MONGO_URI` with their own isolated target and do not use Atlas. The first run may download a platform-specific MongoDB binary; a blocked download or unsupported operating system is a setup failure, not a passing persistence check.

Evidence covers real creation/read-back, public serialization, empty reads, duplicate-name ordering, model constraints/defaults, all 16 starting names and three specials, rerun preservation of IDs/count/edits/unrelated records, and command reruns across separate processes. Raw collection writes are used only to arrange duplicate-ID ordering and operator edits; assertions read the public storage boundary.

Connection evidence deliberately targets an unavailable loopback port with test-only credentials. List/create/seed reject, the test caller emits the shared safe envelope, and a retry against disposable MongoDB succeeds. Expected safe output includes:

```text
{"error":{"code":"DATABASE_UNAVAILABLE","message":"Database is unavailable."}}
PASS recovery: failed connections do not poison subsequent persistence.
FAIL seed: database operation failed; check configuration, permissions, and connectivity. Reruns preserve existing records.
```

No connection string, password, or raw database exception is printed by the command.

## Deliberate seed command

Set `MONGO_URI` in private `.env.local` or the environment with an explicit non-system database name. Environment configuration takes precedence. Use an isolated local development database for practice. Then deliberately apply the starting dataset:

```bash
npm run db:seed -- --apply
```

The command inserts the 16 starting offerings from the existing menu dataset, including Pumpkin Spice Latte, Golden Hour Cold Brew, and Hojicha Latte as specials. The fixture IDs supply stable internal seed keys (`coffee-shop-v1-1` through `coffee-shop-v1-16`); they never become database/public IDs. A unique partial index permits multiple unrelated offerings without seed keys. Insert-only upserts preserve existing seeded records even after they are renamed or edited. No collection clearing, deletion, or update of existing menu details occurs. A failed partial run can be rerun safely.

```text
PASS seed: inserted=16; existing offerings preserved.
PASS seed: inserted=0; existing offerings preserved.
```

Missing `--apply`, placeholders, missing/implicit database names, or system databases fail configuration with exit code 1. Connection/write failures produce a sanitized message and exit code 1. The command has a 20-second overall deadline and closes its connection on ordinary completion/failure.

## Remaining parent evidence

Live Atlas verification is **pending under #12**. This independently verified storage deliverable does not prove integrated GET/POST, browser refresh/restart persistence, developer Atlas permissions, or completion of Milestone 2. Those checks remain mandatory in the parent integration assignment.

Implementation references: [Mongoose 8 validation](https://mongoosejs.com/docs/8.x/docs/validation.html) and [bulk writes](<https://mongoosejs.com/docs/8.x/docs/api/model.html#Model.bulkWrite()>). Context7 lookup failed with `fetch failed`; the official version-matched documentation was checked directly.
