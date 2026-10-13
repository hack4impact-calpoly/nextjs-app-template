# Milestone 2: persistent offerings

> Coordination update, October 2, 2026: [independent assignments](./milestone-2-parallel-work.md) supersede earlier owner/dependency and completion sequencing. Each assignment can finish independently; full-team Atlas and integrated persistence evidence still gate parent #12. #14 shipped string IDs and real HTTP GET tests. Checker/seed commands remain planned until implemented.

Status: product scope is published in [parent #12](https://github.com/BrianLiDesign/coffee-shop/issues/12). The [independent assignments](./milestone-2-parallel-work.md) define the revised delivery plan; live issues define personal acceptance criteria. The requirements below describe the finished milestone, not currently implemented capabilities.

## Problem Statement

Customers can browse offerings, but those offerings come from a fixed mock list. The team cannot create offerings through the app or demonstrate that changes survive a page refresh. Developers also lack a verified, repeatable Atlas onboarding process.

Milestone 2 must connect the core Offering data to MongoDB Atlas, implement at least two CRUD operations, use database-backed API data in React, provide meaningful interaction and feedback, and validate input before persistence. Every developer must be able to connect from their own machine and inspect data in Atlas.

## Solution

Deliver a locally demonstrated offering-management flow alongside the existing customer pages. Menu and Specials read persisted offerings. A team member creates an offering through a form, receives feedback, and sees that offering after refresh. Use GET and POST as the milestone's two operations.

Give each developer an individual Atlas login and scoped database credentials. Use separate developer databases with a shared integration database. Supply an onboarding guide and executable verification tooling during implementation, and migrate all 16 existing mock offerings through a repeatable seed process.

## User Stories

1. As a customer, I want Menu to load stored offerings so that I see the team's current data.
2. As a customer, I want Specials to show only featured offerings so that I can find current specials.
3. As a customer, I want names, descriptions, and prices displayed so that I can compare offerings.
4. As a customer, I want an empty-state message so that I understand when no offerings exist.
5. As a customer, I want a loading state so that I know data is being retrieved.
6. As a customer, I want an error message when loading fails so that failure is not mistaken for an empty menu.
7. As a team member, I want to create an offering through a form so that I can add menu data without editing source code.
8. As a team member, I want a category selector so that I use a supported category.
9. As a team member, I want to mark an offering as special so that it appears on Specials.
10. As a team member, I want field-level validation before submission so that I can correct mistakes.
11. As a team member, I want server validation so that bypassing browser checks cannot persist invalid data.
12. As a team member, I want pending feedback and a disabled submit button so that I do not accidentally submit twice while a request is pending.
13. As a team member, I want success feedback only after the database acknowledges creation so that I can trust the result.
14. As a team member, I want form values preserved on failure so that I can correct or retry without retyping.
15. As a team member, I want saved offerings to survive refresh and an app restart so that persistence is demonstrable.
16. As a developer, I want individual Atlas access so that I can inspect data and debug without sharing a dashboard account.
17. As a developer, I want scoped credentials and a named development database so that my experiments do not disrupt teammates.
18. As a developer, I want a documented connection check so that I know my local environment actually works.
19. As a developer, I want a documented write-permission check so that a successful connection is not mistaken for working POST access.
20. As a developer, I want stable API examples so that I can build frontend and backend work concurrently.
21. As a developer, I want a repeatable seed so that I can load the starting menu without duplicates or data loss.
22. As a tech lead, I want an onboarding status record for every team member so that foundational blockers are visible.
23. As a tech lead, I want board items and explicit dependencies so that work can continue across milestone boundaries.
24. As a reviewer, I want reproducible behavior checks and a meeting demo so that completion has observable evidence.

## Implementation Decisions

- Core scope is Offering persistence and creation. No customer ordering or full administration system is included.
- Reuse the existing server-side connection helper and the shared offerings API endpoint. Retain starter examples as references.
- Create a separate Offering Mongoose model rather than repurposing the starter User model. Keep server-only model code separate from browser-safe contracts and fixtures.
- Database identity is MongoDB-generated. Public responses preserve the existing field name `ID`, but its value becomes the string serialization of the document identifier. No client-supplied ID or numeric counter is accepted.
- Public Offering fields are `ID`, `name`, `description`, `price`, `category`, and `specialOffer`. Internal database metadata is not exposed.
- Creation input contains only `name`, `description`, `price`, `category`, and optional `specialOffer`. Reject unknown fields, including identity fields. Names need not be unique.
- Names are trimmed, required, and limited to 100 characters; descriptions are trimmed, required, and limited to 500 characters. Whitespace-only values are invalid. Limits apply after trimming.
- Price is a JSON number, finite and nonnegative, with at most two decimal places. Browser text is explicitly parsed; the API rejects strings and does not rely on Mongoose coercion. Decimal validation must tolerate floating-point representation without accepting meaningful fractional cents.
- Category is exactly Coffee, Tea, or Smoothie. `specialOffer` is a boolean when supplied and defaults to false when omitted; strings such as `"false"` are invalid.
- GET `/api/offerings` returns status 200 with an array of public Offerings, including an empty array when the collection has no data. Use a deterministic name-then-ID order. Read MongoDB at request time; do not silently fall back to fixtures.
- POST `/api/offerings` accepts a JSON object and returns status 201 with the saved public Offering. Return 415 for unsupported content type and 400 for malformed JSON or invalid input.
- Errors share the shape `{ error: { code, message, fields? } }`. Field errors map field names to readable messages. Database unavailability returns 503 with a generic message and no credentials or raw database details.
- Client validation improves feedback; API validation is authoritative; model validation provides an additional persistence boundary. Apply the same agreed rules at each relevant boundary.
- Add a client form on `/manage-offerings`, showing current offerings through GET and creating through POST. It uses the shared layout. Keep it out of the customer navbar for this local milestone.
- Submit once per pending request. Announce success and errors accessibly, keep entered values on failure, and clear the form after confirmed success. Refresh the management list after creation; if that refresh fails, report that saving succeeded but reloading failed.
- Menu and Specials continue to fetch the existing endpoint. Update their identity contract and fixtures together to string IDs. Specials uses the persisted boolean flag, not a name or category heuristic.
- Temporary frontend fixtures may simulate the agreed response during parallel development. They must not be a runtime fallback in the integrated demonstration.
- Use individual Atlas project invites, scoped database users, separate developer databases, and a shared integration database. Assign integration writes only to team members who need them.
- Standardize local configuration on `.env.local` with `MONGO_URI` and an explicit database name in the URI. Keep credentials server-side and out of version control, issue bodies, screenshots, and browser bundles.
- Expand environment-file ignore coverage while retaining the tracked example. Never distribute populated environment files in the repository.
- Provide a read-only database checker by default and an explicit write-check mode using an isolated verification collection and a uniquely marked disposable document. It must report sanitized results, clean up only its own document, and fail if cleanup fails.
- Seed all 16 fixture offerings, including the three specials. Use stable seed identity separate from public document identity, enforce its uniqueness for seeded records, and use insert-only behavior on rerun. Preserve existing and team-created data; do not clear the collection or overwrite edits.
- Ordinary build and automated regression jobs must not require shared Atlas access. Run deliberate Atlas smoke checks separately against a designated database. A successful build alone is not database-access evidence.
- Issue owners are recorded in the independent assignment plan and live GitHub issues. Assignment does not establish that a contributor has started or accepted the work. No calendar deadline was supplied; independent deliverables can finish in any order, with final integration evidence required separately.

## Testing Decisions

- Prefer the existing HTTP API boundary as the main automated regression seam. Test public requests and responses rather than Mongoose calls or React implementation details.
- Cover empty and seeded GET results; valid POST and read-back; malformed JSON; wrong content type; each validation boundary; forbidden identity/unknown fields; boolean defaults; and database-failure responses.
- A rejected POST must leave persisted data unchanged. A successful POST must be returned by a subsequent GET. Public results must have string IDs and exclude internal metadata.
- Use an isolated disposable database for persistence tests. Never mutate the shared integration database as part of routine CI. Select a small real test runner and a reproducible disposable database harness during implementation.
- Exercise the rendered management flow in a browser: create a normal offering and a special, refresh, inspect Menu and Specials, and check loading, empty, error, and accessible feedback behavior. Check narrow-screen use and keyboard submission.
- Verify persistence after stopping and restarting the local app. Re-read the same record and confirm it in Atlas.
- Verify seed reruns preserve count, seeded identities, and unrelated records.
- Verify every developer independently with connection and disposable write/read/cleanup evidence. One person's working environment is insufficient.
- Prior art is the existing API-consuming client and connection helper. #14 now provides real HTTP GET regression coverage; later implementation must add isolated persistence and POST coverage.
- The HTTP regression boundary plus browser persistence demonstration were confirmed in the required to-spec seam check.

## Out of Scope

- PATCH, DELETE, editing controls, customer orders, cart, payments, delivery integration, authentication, and public deployment of the management/write interface.
- Production database migration, a framework upgrade, pricing arithmetic, and a full visual redesign.
- Removing starter reference routes or introducing silent database-to-mock fallback.
- Creating populated secret files, validating other developers' machines from the tech lead's machine, or asserting Atlas access without individual evidence.

## Further Notes

- The local-demo decision is an access boundary: the write API and management page must not be publicly deployed by this milestone. Public deployment requires a separate access-control decision and task.
- GitHub board discovery is currently limited by missing `read:project` scope. Reuse the existing board after inspecting its actual fields and statuses; do not claim board changes have occurred.
- The spec is published as #12. Use the current independent assignments and developer-facing labels; do not restore ready-for-agent or the superseded sequential blockers.
- The companion handoff points to current assignments, onboarding steps, and final acceptance evidence. These are coordination aids rather than additional feature scope.
- Official references: [Atlas connections](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/), [database users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/), [network access](https://www.mongodb.com/docs/atlas/security/ip-access-list/), and [Mongoose 8 validation](https://mongoosejs.com/docs/8.x/docs/validation.html).
