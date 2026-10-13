# Milestone 3: live offerings and release quality

## Approved scope

Brian requested a new branch implementing the release features and this plan. Create/read are the required Milestone 2 operations. Update/delete are Brian's additional assignment. Brian subsequently approved a supported Next.js upgrade after the deployment audit found critical vulnerabilities in the old runtime. Customer ordering, payments, and a redesign remain outside this release.

The implementation branch is `feat/milestone-3-release`, based on main at `4db8d6f`. It integrates the outstanding persistence work without merging or closing other developers' existing assignments. This release supersedes Milestone 2's restriction against public deployment of the management interface: customer routes stay public, but management and all writes require server-enforced team credentials.

## Acceptance criteria

- GET `/api/offerings` reads MongoDB at request time, returns only public offering fields with string IDs, sorts by name then ID, and never falls back to sample data.
- Authorized POST creates a validated offering. Refresh reads the same persisted ID. Special offerings appear on Specials.
- Brian's additional PUT `/api/offerings/[id]` replaces offering details and DELETE removes the selected offering. Missing records return 404. Invalid IDs/input return 400.
- `/manage-offerings` requires HTTP Basic team credentials over HTTPS in deployment. Every write handler independently checks credentials and rejects cross-origin browser writes. Missing access configuration denies access. Secrets are server-only environment variables; there is no client-side credential storage.
- Management supports create, edit, cancel, explicit delete confirmation, pending locks, retained input on failure, and accurate save-success/reload-failure feedback.
- Menu, Specials, and management show loading, empty, readable error, and retry states and work on narrow screens and with a keyboard.
- Vitest unit/component checks run alongside existing regression checks in CI. Ordinary checks use disposable local MongoDB, never shared Atlas credentials.
- Repeatable insert-only seeding adds the 16 starting offerings and preserves edits and unrelated records on rerun.
- A live acceptance command checks authorized create/read (and optionally update/delete) against an explicit target using uniquely marked test records and cleans up only records it created.
- README explains the actual app, tech stack, local setup, environment variables, tests, deployment, and the verified public URL. Until deployed, the live link is explicitly pending.
- Release evidence records the deployment URL and commit, live persistence, desktop/mobile screenshots, failure/empty/loading checks, and each developer's own three Vitest contributions. Agent-written tests do not establish personal developer completion.

## Brian's work order

1. Establish Vitest, a supported Node runtime, and CI quality gates.
2. Implement and connect validated database-backed handlers and insert-only seeding.
3. Protect management and all writes, then complete create/edit/delete UI composition.
4. Verify real HTTP persistence against disposable MongoDB and controlled frontend states.
5. Configure Vercel Production and Preview with separate database targets, deploy, and run live acceptance.
6. Finalize README and collect submission evidence. Review and commit the branch; merge requires separate authorization.

## Developer ownership and personal evidence

These are follow-up contribution assignments, not claims that a developer authored this branch's tests. Each developer owns at least three relevant Vitest cases, explains what failure they prevent, and supplies a reviewed PR. Existing Milestone 2 issues remain independently owned.

| Developer | Area                                                          | Minimum personal Vitest behaviors                                                                                                                  |
| --------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Naomi     | Storage and seeding                                           | Public serialization excludes metadata; omitted special flag defaults false; seed rerun preserves edits and unrelated records                      |
| Jean      | API validation and errors                                     | Valid creation returns 201; invalid input leaves data unchanged; database failure returns sanitized 503                                            |
| Aditi     | Management form                                               | Pending submission prevents duplicates; failed save preserves fields; confirmed save followed by failed reload reports both outcomes               |
| Vedika    | Customer pages and responsive checks                          | No-special-offerings feedback; rejected network request shows an error without empty feedback; unreadable API errors show useful fallback feedback |
| Sofie     | Acceptance tooling and evidence                               | Wrong response status fails acceptance; malformed offering fails; missing read-back fails; maintain browser/live checklist                         |
| Brian     | Integration, access, deployment, documentation, update/delete | Unauthenticated write denied; authorized write works; missing configuration fails closed; add update/delete regressions                            |

## Test boundaries

Use the agreed HTTP request/response boundary and rendered UI interactions. Unit tests may supply controlled external storage/HTTP responses; integration tests exercise real routes backed by a disposable database. Passing controlled tests is not Atlas or live Vercel evidence. Do not count snapshots, constants, or assertions against private implementation as useful integrity cases.

## Release checklist

- [ ] Choose submission date and integration checkpoint with the team.
- [ ] Confirm all automated quality gates and code review pass.
- [ ] Configure private `MONGO_URI`, `MANAGEMENT_USERNAME`, and `MANAGEMENT_PASSWORD` in each Vercel environment; use different preview data and credentials.
- [ ] Confirm Atlas network access and scoped read/write permissions for the deployment database.
- [ ] Deliberately seed the selected deployment database, preserving existing records.
- [ ] Public customer pages open without login; unauthorized management/writes are denied.
- [ ] Live create/read and optional update/delete acceptance pass; disposable records are cleaned up.
- [ ] Capture desktop and narrow mobile views, keyboard use, empty/loading/error states, and persistence after refresh.
- [ ] Record verified live URL and deployed commit in README and release evidence.
- [ ] Record three personally contributed Vitest cases and merged PR per developer.

The existing Vercel project is `brianlidesign/coffee-shop`, with public URL https://coffee-shop-sigma-rouge.vercel.app/. No deadline has been supplied. Deployment, team contributions, and live evidence must remain pending until verified.

## Foundation integration

Brian authorized pushing and merging PR #31 into `main` on October 12, 2026 to
unblock follow-up contributions, including Sofie's issue #36. This integrates the
implementation after automated checks and review. It does not complete the
release checklist. Keep parent issue #30 and individual assignments open until
their remaining acceptance criteria have verified evidence.
