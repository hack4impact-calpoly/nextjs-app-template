# Milestone 3 release evidence

## Verification boundary

### Issue audit: October 13, 2026

All implementation assignments under Milestone 2 and the submitted Milestone 3
follow-ups #32, #34, #35, and #36 are closed after their reviewed merges. No open
implementation issue can be closed solely from the existing evidence. The three
remaining issues track the following work:

| Issue                                                                           | Remaining evidence required for closure                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#12: Milestone 2](https://github.com/BrianLiDesign/coffee-shop/issues/12)      | Each developer's Atlas inspection/read/write/cleanup record; integrated normal/special creation with refresh/restart and Atlas identity checks; board and meeting/demo outcomes. See the [onboarding matrix](./milestone-2-developer-guide.md#team-evidence-matrix) and [demonstration checklist](./issue-18-acceptance.md#manual-browser-demonstration-checklist). |
| [#30: Milestone 3](https://github.com/BrianLiDesign/coffee-shop/issues/30)      | Private management and separate preview configuration verification; public/access-denied checks; live create/read and additional update/delete with targeted cleanup; remaining personal test explanations and release/submission evidence. Production reads and seeding are verified below.                                                                        |
| [#33: Jean's API tests](https://github.com/BrianLiDesign/coffee-shop/issues/33) | Three personally contributed Vitest cases, explanations, and a reviewed PR. #16 is already reconciled and closed through [PR #37](https://github.com/BrianLiDesign/coffee-shop/pull/37); its 54 handler checks are agent-written remediation, not Jean's personal contribution.                                                                                     |

Existing submitted contributions remain recorded below. Naomi's personal
explanation is still pending; Jean and Brian have no personal test record here.
Neither controlled responses nor disposable-database checks establish live writes.

### Public offering reads restored: October 13, 2026

Production deployment [4B3zBNxrn](https://vercel.com/brianlidesign/coffee-shop/4B3zBNxrn3B7ZVvHdAZV3z9NjJZM)
serves main commit `1aaec6dfe08149578b8fdc42e685029333e3cfa8` at
[the public site](https://coffee-shop-sigma-rouge.vercel.app/).
The missing Production `MONGO_URI` was entered privately by Brian and the project
was redeployed. Brian created a separate application database user with `readWrite`
limited to `coffee_shop` on the `students` cluster; the deployment uses that user,
not an existing Atlas administrator credential. Brian explicitly approved the
`0.0.0.0/0` Atlas network rule for this student project because Vercel Hobby uses
dynamic outbound addresses. This allows connection attempts from any IPv4 address;
TLS and database authentication remain required. Existing IP rules were retained.

Local diagnosis also found an outdated cluster hostname, a missing database name,
and certificate-chain verification failures. The private `.env.local` hostname and
database were corrected. Running Node with `--use-system-ca` resolved the local
certificate failure without disabling TLS verification. For a fresh PowerShell
terminal on this machine, set `$env:NODE_OPTIONS='--use-system-ca'` before running
the database checker or starting the app. This machine-specific launch setting is
not a production requirement or a global system change.

The selected Atlas collection was read and confirmed empty before the deliberate
insert-only `npm run db:seed -- --apply` run, which inserted 16 offerings with three
specials. Read-only `npm run test:live` passed against both localhost and the public
HTTPS origin. The live API returned 200, 16 valid public offerings with unique IDs,
and three specials. Local and production offering IDs match.

Live browser verification at 1280×900 and 390×844 confirmed Menu shows 16 offerings,
Specials shows only Golden Hour Cold Brew, Hojicha Latte, and Pumpkin Spice Latte,
both survive refresh, no error alert appears, and neither page overflows horizontally.
Evidence: [API checks](./evidence/offerings-restoration/api-check.json),
[browser checks](./evidence/offerings-restoration/browser-checks.json),
[Menu desktop](./evidence/offerings-restoration/menu-desktop.png),
[Menu mobile](./evidence/offerings-restoration/menu-mobile.png),
[Specials desktop](./evidence/offerings-restoration/specials-desktop.png), and
[Specials mobile](./evidence/offerings-restoration/specials-mobile.png).

This verifies public live reads and the deliberate Atlas seed, not live create,
update, delete, or targeted cleanup through the application. Private management
configuration, live write acceptance, and unrecorded personal contributions remain
pending under issue #30. Historical foundation and preview observations below are
retained for provenance.

PR #31 integrates the release foundation so developers can extend it from `main`. Public production reads are now verified above. Live write acceptance and each developer's unrecorded contributions remain pending. Issue #30 stays open to track the remaining release requirements. Agent-written reference tests do not count as evidence that another developer completed their assignment.

| Requirement                       | Evidence to record                                                                   | Status                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Public Vercel release             | Verified production URL and deployed Git commit                                      | Verified main `1aaec6d`; see October 13 evidence above               |
| Live create/read persistence      | Live acceptance output; browser refresh and Atlas inspection of the same offering ID | Live reads verified; live creation remains pending                   |
| Additional update/delete          | Live all-operations acceptance and targeted cleanup                                  | Pending live write acceptance                                        |
| README                            | Description, setup, tech stack, tests, accurate verified live link                   | Implemented; existing live link recorded                             |
| Loading, empty, responsive states | Controlled state checks and desktop/mobile screenshots                               | Automated coverage and local desktop/mobile evidence recorded        |
| Frontend API errors               | Failed fetch/save and successful save with failed reload                             | Automated coverage implemented                                       |
| Vitest contribution per developer | At least three personally authored cases and reviewed PR per person                  | Four submissions recorded below; remaining personal evidence pending |

## Developer evidence

The foundation on `main` includes agent-written reference coverage and controlled
test helpers. Vedika submitted her three assigned cases in PR #39. See the
[test handoff](../tests/unit/README.md).
Preserve this contribution record and submitted cases during release integration.
For each contributed test, explain what it protects. Record browser evidence with
route, viewport, commit, result, and screenshot link.

| Developer | PR                                                          | Three test case names | Explained and reviewed                                       |
| --------- | ----------------------------------------------------------- | --------------------- | ------------------------------------------------------------ |
| Brian     | Pending                                                     | Pending               | Pending                                                      |
| Jean      | Pending                                                     | Pending               | Pending                                                      |
| Naomi     | [#41](https://github.com/BrianLiDesign/coffee-shop/pull/41) | See below             | Explanations below; agent standards/spec review before merge |
| Vedika    | [#39](https://github.com/BrianLiDesign/coffee-shop/pull/39) | See below             | Explanations below; agent standards/spec review before merge |
| Aditi     | [#38](https://github.com/BrianLiDesign/coffee-shop/pull/38) | See below             | Explanations below; agent standards/spec review before merge |
| Sofie     | [#40](https://github.com/BrianLiDesign/coffee-shop/pull/40) | See below             | Explanations below; agent standards/spec review before merge |

### Naomi: issue #32 / PR #41

Naomi submitted three storage cases in `89f90c8`. She disclosed AI assistance
in the PR description. Agent reconciliation preserves the submitted assertions,
moves the file to `tests/unit/coffeeshop.test.ts` so Vitest and lint discover it,
and clarifies its comments. The original `tests/coffeeshop-test.ts` was outside
the configured test pattern; its passing CI did not execute these three cases.
This records submitted coverage and agent verification, not independent proof
of personal authorship or understanding. Naomi's own explanation remains pending.

| Submitted test name                                    | What it protects                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `returns only public offering fields with a string ID` | Converts the stored identity to the expected public string ID and excludes internal `_id` and `seedKey` fields. |
| `sorts offerings with identical names by ID`           | Orders equal-name records by ID even when the database returns them in reverse order.                           |
| `throws an error when the database is unavailable`     | Propagates a connection failure without querying the model or substituting sample data.                         |

Agent validation on October 13, 2026, after reconciling submitted head `89f90c8`
with main `456532b`: `npm ci` completed on Node 24.19.0, and
`npm run test:unit -- tests/unit/coffeeshop.test.ts` executed all three cases
successfully. `npm run preflight` passed lint, typecheck, 125 Vitest cases,
51 Node regression cases, five acceptance CLI cases, three disposable lifecycle
cases, one real-application acceptance case, and the production build. The
disposable seed checks passed both separate-process reruns (16 inserts then zero)
and preservation of IDs, edited records, and unrelated records. Separate
standards and spec reviews found no remaining blockers.
The Vitest cases mock the database boundary. Existing disposable-MongoDB
storage and seed-command regressions separately verify seed reruns, preserved
IDs and operator edits, and unrelated records. These checks do not establish
live Atlas/Vercel acceptance or Naomi's personal database verification.

### Vedika: issue #35 / PR #39

Submitted in Vedika's original commit `e4f7fc3`; agent reconciliation retains all
three cases and updates the Specials case to use the route's actual title and
empty feedback.

| Personally authored test name                         | What it protects                                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Specials shows empty feedback when none are special` | A nonempty response containing only ordinary offerings shows the Specials empty message and hides the ordinary Latte. |
| `network failure shows error instead of empty menu`   | A rejected fetch shows useful fallback feedback rather than pretending the menu is empty.                             |
| `unreadable API errors show useful fallback feedback` | An unsuccessful response with a non-JSON body shows useful fallback feedback without empty-menu feedback.             |

Agent-added coverage `clears a previous error and announces loading when the title
changes` does not count as Vedika's contribution. The original retry regression
and this new case failed before restoring per-request state resets and passed
afterward. Main's response validation and retry behavior are preserved.

Agent-performed browser checks against reconciled implementation `533d7e1` cover
all five customer routes and navigation at 1280×900, 390×844, and 320×780. All 27
checks passed, including visible keyboard focus, keyboard navigation/retry,
maximum-length unbroken offering text, and no horizontal overflow. See the
[browser evidence and screenshots](./evidence/pr39-browser.md).
These checks use controlled API responses; they do not establish Vedika's
personal browser verification or live Atlas/deployment acceptance.

Final local validation on October 13, 2026: `npm run preflight` passed with
116 Vitest cases, 51 Node regression cases, 5 acceptance CLI cases, 3 disposable
lifecycle cases, and 1 real-application acceptance case, followed by the
production build. Standards and spec reviews found no remaining blockers.
The older Node network-error assertion now expects the same readable fallback
as the contributed Vitest case and confirms no empty-menu feedback.

### Aditi: issue #34 / PR #38

Aditi submitted three cases in `19d5b94`. Agent reconciliation in `760f1be`
targets the current `ManageOfferings` component and extends the reset case to
change category to Tea and verify restoration to Coffee. These additions retain
Aditi's cases; agent repairs and browser checks are not personal contribution proof.

| Personally authored test name                                        | What it protects                                                                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rejects invalid submission before sending a write request`          | Empty required fields show errors and send no POST.                                                                                                     |
| `clears only the corrected field error after a user fixes one input` | Correcting name clears its error while description remains invalid.                                                                                     |
| `resets the form and special-offer checkbox after a successful save` | Successful creation clears name, description and price, restores Coffee, and unchecks the special control. Category coverage was extended by the agent. |

Agent-performed browser checks on October 13, 2026, against `760f1be` passed at
1280x900 and 390x844 on `/manage-offerings`. Keyboard traversal reached checkbox,
name, description, price, category, and Save with visible focus. Empty submission
sent no write; correcting name retained the description error; successful creation
reset every field and checkbox. No horizontal overflow or JavaScript exceptions
were observed. See [browser evidence and screenshots](./evidence/pr38-browser.md).
Controlled responses do not establish live Atlas or deployment persistence.

### Sofie: issue #36 / PR #40

Sofie submitted the three cases in `fc036de`; `94b96e1` moved them into the
existing `tests/unit/live-acceptance.test.ts` suite. Agent reconciliation retains
all three cases and the four earlier regressions. Agent documentation repairs
and verification do not establish Sofie's personal browser or live checks.

| Personally authored test name                                                   | What it protects                                                                                     |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `read-only verification performs no writes`                                     | Default read-only verification makes one GET and sends no create, update, or delete requests.        |
| `fails acceptance when GET returns duplicate offering IDs`                      | Duplicate public identities fail verification before any further requests.                           |
| `fails verification on cleanup failure without deleting pre-existing offerings` | A failed cleanup rejects verification; DELETE targets only the created ID and never the baseline ID. |

#### Issue #18 reconciliation

[PR #28](https://github.com/BrianLiDesign/coffee-shop/pull/28), merged as
`e06b7c9`, supplies the independently proven issue #18 tooling. Its
[acceptance guide](./issue-18-acceptance.md#acceptance-criteria-and-handoff)
maps every criterion to implementation and evidence. The comparison below
separates that existing work from this PR's live-runner safeguards.

| Issue #18 requirement                                                                                              | Existing tooling and remaining work                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retain fixture regressions; explicit loopback runner and safe configuration                                        | `test:regression`, `acceptance`, and `tests/acceptance-cli.test.ts` are retained. No runner implementation gap identified.                                                                                                                  |
| Empty/seeded GET, ordinary/special/default POST, read-back, validation, JSON/content type, IDs, sanitized failures | `scripts/acceptance.ts` and controlled HTTP self-tests cover these scenarios. PR #40 adds separate default read-only and duplicate-ID checks for `verifyLive`.                                                                              |
| Explicit database-failure setup                                                                                    | The guide describes deliberately stopping the owned database; `test:acceptance:app` exercises actual local application 503 responses. Ordinary failures are not database-failure proof.                                                     |
| Isolated lifecycle, cleanup refusal, finite teardown, incorrect-response self-tests                                | `disposable-database.ts`, lifecycle tests, controlled-server cases, and CLI tests cover these requirements. PR #40 adds live-runner cleanup-failure and baseline-ID protection coverage. No related runner defect was found in this review. |
| Manual browser checklist, six-person matrix, commands, integration handoff                                         | Supplied in the guide. Individual browser, refresh/restart, Atlas read/write/cleanup, board, and meeting outcomes remain pending wherever no evidence is recorded.                                                                          |
| No application persistence claims from stubs                                                                       | Controlled responses prove runner behavior only. Owned-local application checks are separate from live Atlas/Vercel acceptance, which remains pending.                                                                                      |

Issue #18 is already closed following its reviewed tooling merge. This PR does
not establish the remaining integrated/live evidence under #12 or the production
release under #30. After Brian prepares the deployment and authorizes live
writes, record environment alias, deployed commit, date, command, result, and
evidence link here. Read-only `test:live` and explicitly authorized write checks
must be recorded separately; any failed cleanup remains a failure.

Agent validation on October 13, 2026, reconciled submitted head `45e3d01`
with main `9f06594`: `npm run preflight` passed on Node 24.19.0, including
lint, typecheck, 122 Vitest cases (all seven live-runner cases), 51 Node
regression cases, five acceptance CLI cases, three disposable lifecycle cases,
one real-application acceptance case, and the production build. Separate
standards and spec reviews found no remaining blockers. This evidence uses
controlled responses and owned local databases; live Atlas/Vercel verification
and Sofie's personal browser checks remain pending.

## Local release checks

Record the command, result, and commit after the final branch checks. Local disposable MongoDB and controlled HTTP responses verify application behavior; they do not establish the deployment database's connectivity.

- Lint: passed.
- Typecheck: passed.
- Vitest: 31 passed, including same-origin and malformed error-envelope regressions.
- HTTP/database/UI regression suite: 51 passed after reconciling main; includes retained storage/seed checks, restart persistence, and live-runner cleanup.
- Production build: passed; routes do not query Atlas during build.
- Production dependency audit: zero findings after the approved Next.js/React upgrade and Mongoose patch update; rerun before deployment.
- Standards/spec review: no blocking defects; documented follow-ups resolved. See [review report](./milestone-3-review.md).

Foundation merge check on October 12, 2026: `npm ci` and `npm run preflight`
passed on Node 24.19.0 against implementation `3d90071` with the handoff/documentation
corrections in this PR. All 31 Vitest and 51 Node regression cases passed, followed
by the production build. `npm audit --omit=dev` reported zero vulnerabilities.
These checks used disposable databases and do not establish live Atlas evidence.

Local browser evidence: seeded Menu at desktop and 390px mobile widths, no horizontal overflow; created a special through management, edited it, and verified it on Specials after navigation. These checks used disposable local MongoDB. Browser evidence is in `docs/evidence/milestone-3-*.jpg`.

At the original preview inspection, the Vercel project environment panel showed no project variables. Preview deployed commit `693cc0c` successfully at https://coffee-shop-git-feat-milestone-3-release-brianlidesign.vercel.app/. Vercel Authentication protected it from anonymous requests (302). The authenticated browser showed a clear API-unavailable alert and retry button (`docs/evidence/milestone-3-preview-error.jpg`). These observations are historical. Merging PR #31 can trigger a production deployment; a passing deployment check does not verify private environment configuration or live create/read persistence. Record fresh production acceptance separately.

Do not record credentials, populated environment files, or raw database exceptions in evidence.
