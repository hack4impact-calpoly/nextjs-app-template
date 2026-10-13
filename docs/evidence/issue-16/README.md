# Independent offering-handler HTTP checks

Issue [#16](https://github.com/BrianLiDesign/coffee-shop/issues/16) accepts a supplied
`list(): Promise<Offering[]>` / `create(input): Promise<Offering>` storage boundary.
`createOfferingCollectionHandlers` in `src/server/offering-handlers.ts` exposes
GET/POST for that boundary. The existing production factory composes the same
handlers with PUT/DELETE; the public route and its access controls are preserved.

Run `npm run test:unit -- tests/unit/offerings-handlers-http.test.ts` after `npm ci`.
The suite hosts the real handlers at `/api/offerings` on an ephemeral loopback port
and observes responses through HTTP. Its helper and store double live only under
`tests/unit/helpers/handler-http.ts`. Every test gets fresh records; the double
sorts by name then string ID, generates IDs, and supplies no production fixtures.
Management credentials are test-only environment stubs, restored after each test.

The 54 tests cover empty/sorted GET, ordinary/special/default creation and same-ID
read-back, trimming and maximum string lengths, raw JSON types and shape, numeric
price boundaries, exact categories, boolean flags, identity/unknown fields,
content types, malformed JSON, sanitized failures, and pending creation. They
also retain POST authorization and cross-origin protection. `npm test` includes
this suite through the existing Vitest file discovery.

These are agent-written remediation checks. They do not establish Jean's personal
test contribution or any other developer's assigned contribution. In-memory
read-back proves handler behavior, not MongoDB persistence or live Atlas/Vercel
acceptance. The existing database/application regression suites and the milestone
release-evidence requirements remain separate.
