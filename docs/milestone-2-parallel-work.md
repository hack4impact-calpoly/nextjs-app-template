# Milestone 2: independent developer assignments

Coordination updated October 2, 2026 at Brian's request. This replaces the sequential assignment plan. Product requirements in [parent #12](https://github.com/BrianLiDesign/coffee-shop/issues/12) remain mandatory. The shared string-identity contract and HTTP foundation in #14 are complete.

Everyone builds from current main. Each assigned deliverable is independently testable and can be reviewed, merged, and closed without another open issue completing. No assigned issue has a native blocked-by relationship. This changes completion boundaries; it does not merely hide dependencies on unfinished implementation.

## Start here

1. Find your issue in the table below and read its live acceptance criteria. Those criteria define your assignment's completion.
2. Read the [API contract](./offering-api-contract.md) and the internal agreements below. Use the existing shared types rather than redefining them.
3. Follow [Contributing](./contributing.md) to create one issue branch. Build and demonstrate your deliverable with its own isolated tests or controlled responses.
4. Open a PR explaining the changed files, served URLs, mechanisms, and verification. State whether evidence uses a real database or simulated responses. Personal completion requires the reviewed PR to merge; final milestone evidence is recorded separately.

Use the [glossary](../CONTEXT.md) for shop terminology and the [developer guide](./milestone-2-developer-guide.md) when configuring live Atlas access. Atlas is not a prerequisite for independent assignment completion.

| Developer | Issue                                                         | Deliverable                                                        | Other issue required for personal completion |
| --------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| Brian     | [#13](https://github.com/BrianLiDesign/coffee-shop/issues/13) | Build developer database verification and onboarding tooling       | None                                         |
| Naomi     | [#15](https://github.com/BrianLiDesign/coffee-shop/issues/15) | Build independently tested offering storage and repeatable seeding | None                                         |
| Jean      | [#16](https://github.com/BrianLiDesign/coffee-shop/issues/16) | Build independently tested GET and POST offering handlers          | None                                         |
| Vedika    | [#17](https://github.com/BrianLiDesign/coffee-shop/issues/17) | Build the special-offering control and customer display checks     | None                                         |
| Sofie     | [#18](https://github.com/BrianLiDesign/coffee-shop/issues/18) | Build a standalone acceptance runner and demonstration checklist   | None                                         |
| Aditi     | [#20](https://github.com/BrianLiDesign/coffee-shop/issues/20) | Build the independently demonstrated offering-management form      | None                                         |

## How independent work fits together

Naomi supplies real storage and seeding, verified with an isolated local database. Jean supplies request handlers using his own storage double. Aditi supplies the management page/form using controlled HTTP responses. Vedika supplies the standalone special checkbox and customer display behavior using controlled responses. Sofie supplies independently self-tested acceptance tooling and a disposable database lifecycle check. Brian supplies database checker/onboarding tooling and coordinates access and final integration.

Each developer owns their deliverable's tests and setup. Nobody waits for Sofie's runner to test their module, Brian's checker to use a local database, or another developer's component to demonstrate their own. Installation/network/account failures can still happen; report them accurately. No planning change can promise that obstacles will never occur.

## Frozen internal agreements

These are implementation agreements, not claims that the modules already exist.

- Storage: list(): Promise<Offering[]>; create(input: CreateOfferingInput): Promise<Offering>. Reuse the browser-safe types in src/types/offering.ts. List sorts by name then ID and create resolves only after acknowledged persistence. Storage failure rejects; handlers convert it to the agreed sanitized 503.
- API: Jean's handler construction takes the storage boundary explicitly. His HTTP tests host those handlers with his own store double. Brian later composes the real route with Naomi's storage.
- Form: Aditi's reusable form accepts optional specialOffer: boolean, default false. It submits that value and handles GET/POST feedback through the published HTTP contract.
- Special control: Vedika's component accepts checked: boolean and onChange(next: boolean). Brian composes the control and form with shared boolean state. Neither contributor imports the other's unmerged module.
- Verification: Sofie's acceptance runner targets an explicit loopback server. Its own stub-server self-tests establish runner correctness, not real app persistence. Her disposable database lifecycle checks are independent of Naomi's model. Commands, deliberate failure setup, and the meeting checklist are in the [issue #18 acceptance guide](./issue-18-acceptance.md).

The public API agreement remains [offering-api-contract.md](./offering-api-contract.md): no new HTTP operations, fields, identity conventions, or product scope.

## File ownership and merge discipline

- Brian: connection checker, environment protection, onboarding, and eventual composition edits.
- Naomi: new storage/model and seed modules and their isolated tests; leave the live route unchanged.
- Jean: new request-handler/validation modules and independent HTTP tests; leave the live route unchanged.
- Aditi: new management page/form and its CSS/tests; leave the customer navbar unchanged.
- Vedika: new special control, customer OfferingsPage behavior, and its tests; leave the management form unchanged.
- Sofie: acceptance runner, disposable database lifecycle tools, and demonstration checklist; preserve the currently working fixture GET regression command.

New commands can require coordinated edits to package.json, lockfiles, or CI. List these edits in each PR, keep them additive, and rebase/reconcile on merge; this is shared-file coordination, not a prerequisite on another feature. Keep existing checks green. Do not stage unrelated planning files into feature commits.

Test doubles are explicitly selected for tests/previews only. Keep the current public fixture GET route operational until the real composition is ready. No production fixture fallback or mock mode may remain in the integrated app.

## Milestone integration and evidence: Brian coordinates

Independent deliverables do not make the full milestone complete. Start preparing this record now; final results require the actual combined app. These are milestone acceptance gates, not blockers on developers completing the assignments above.

- [ ] Compose the real storage with GET/POST handlers at /api/offerings.
- [ ] Compose the special control with the form on /manage-offerings and confirm management stays out of customer navigation.
- [ ] Run real HTTP regressions with an isolated disposable database. Stub-server passes are not persistence evidence.
- [ ] Verify the non-destructive 16-item seed and rerun preservation of IDs, edits, and unrelated records.
- [ ] Create ordinary and special offerings; read them back with identical IDs; refresh and restart; inspect them in Atlas and confirm Menu/Specials filtering.
- [ ] Verify invalid input, unavailable database, and successful save followed by failed reload without disrupting integration data.
- [ ] Provision scoped individual access and record each of Brian, Naomi, Jean, Sofie, Vedika, and Aditi's own Atlas inspection and read/write/cleanup evidence. External access problems remain visible here.
- [ ] Run lint, typecheck, build, and real automated regressions; record Atlas evidence separately.
- [ ] Remove test/preview stubs from integrated runtime and publish exact setup/checker/seed/test commands.
- [ ] Verify actual board membership/status/access and requirement-by-requirement meeting evidence.

Only close parent #12 and complete Milestone 2 after these gates pass. Public deployment of management/write routes remains outside scope.

## Current capabilities

The existing API still serves fixtures. String IDs and the HTTP GET regression tests shipped in #14. #13 supplies the database checker and onboarding commands, verified against disposable local MongoDB. Storage, POST, management, seed, and acceptance tooling remain separate assignments. Individual Atlas access has not been established by the checker tests. The older handoff is a historical snapshot and must not be used as current readiness evidence.
