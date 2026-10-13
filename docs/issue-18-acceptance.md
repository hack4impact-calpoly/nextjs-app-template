# Issue 18: acceptance runner and demonstration checklist

Owner: Sofie. Assignment: [#18](https://github.com/BrianLiDesign/coffee-shop/issues/18). Brian owns actual integrated, Atlas, deployment, board, and meeting evidence under [#12](https://github.com/BrianLiDesign/coffee-shop/issues/12).

This tooling verifies the public Offering HTTP contract independently. Controlled-server passes prove the runner; they do not prove application persistence. The separate application check uses real HTTP and an owned local database. Neither establishes shared Atlas or deployment readiness.

## Commands and prerequisites

Use the repository's Node 24 runtime and `npm ci`.

| Command                                             | Evidence supplied                                                                                                                                     |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:acceptance`                           | Runner self-tests over controlled HTTP, CLI success/failure exits, and independent disposable database lifecycle                                      |
| `npm run acceptance:db`                             | Creates its own MongoDB, writes/reads, removes its own marker, preserves another record, closes/stops and removes its temporary database              |
| `npm run test:acceptance:app`                       | Runs real application HTTP against an owned empty local database; verifies POST/read-back/cleanup and deliberately stops that database for 503 checks |
| `npm run acceptance -- --scenario empty`            | Targets an explicitly configured isolated server whose collection must initially be empty                                                             |
| `npm run acceptance -- --scenario seeded`           | Targets an explicitly configured isolated server and checks independently prepared seed expectations                                                  |
| `npm run acceptance -- --scenario database-failure` | Checks deliberately unavailable database GET and authorized POST, requiring sanitized 503 envelopes                                                   |
| `npm test`                                          | Keeps current unit/regression checks and adds CLI, lifecycle, and real application acceptance checks                                                  |
| `npm run preflight`                                 | Lint, typecheck, full tests, and production build                                                                                                     |

MongoDB 7.0.24 may download on first use. A download/start failure is a failed check, not a skip. The standalone lifecycle refuses any `MONGO_URI` or command-line arguments; it cannot drop a developer or integration database. It does not load `.env.local`. Clear inherited `MONGO_URI` in a dedicated terminal before using `acceptance:db`, or use `test:acceptance:db`, which owns its database regardless of inherited configuration.

The lifecycle limits startup to 60 seconds (MongoDB launch itself to 20 seconds), individual operations and teardown to 15 seconds, and its CLI to 90 seconds overall. The HTTP CLI has 15-second requests and a 120-second overall deadline. A failed or timed-out cleanup is a failed run; inspect the disposable target before reusing it. Binary download interruption or an operating-system failure may leave local temporary files; never respond by deleting shared data.

## Configured HTTP runner

Only literal loopback origins such as `http://127.0.0.1:<port>` or `http://[::1]:<port>` are accepted. No remote hosts, `localhost` aliases, embedded credentials, paths, query strings, fragments, or redirects. The target must be dedicated disposable acceptance data, separate from developer/shared integration data. Loopback alone does not establish database isolation: verify the server's private database configuration first.

In a dedicated PowerShell terminal, supply these environment values:

```powershell
$env:ACCEPTANCE_BASE_URL = 'http://127.0.0.1:<actual-port>'
$env:ACCEPTANCE_CONFIRM_WRITES = 'disposable'
# Set MANAGEMENT_USERNAME and MANAGEMENT_PASSWORD privately to match this test server.
npm run acceptance -- --scenario empty
```

`ACCEPTANCE_CONFIRM_WRITES=disposable` acknowledges writes only to that isolated target. No default server is selected. The runner retains the current management authentication; every POST/DELETE carries those private credentials, while GET must work without authentication. It emits safe scenario/deadline information and named PASS/FAIL results, without printing URLs, paths, credentials, authorization, or raw server exceptions. Exit 0 means every selected scenario and cleanup passed; exit 1 means failure.

For seeded mode, set `ACCEPTANCE_SEED_FILE` to a JSON array of complete expected public Offerings, in name-then-ID order. Prepare values and IDs from the independent seed setup record, not by copying the GET response being tested. A fixture example appears in `tests/fixtures/acceptance-seed.json`; its `seed-id` is only for controlled-server self-tests and is not a MongoDB identity. Missing expectations, changed details, extra records, wrong ordering, empty IDs, and duplicate IDs fail.

Empty/seeded mode checks ordinary, special, and omitted-default creation; trimming, zero price, maximum text lengths, floating-point cents, categories, and persisted read-back. It rejects invalid shapes, field types, missing values, overlong text, negative/fractional-cent prices, nonfinite JSON numbers, categories, flags, unknown/public/internal identity fields, invalid content type, and malformed JSON. Error envelopes and field messages must follow the shared contract. Afterward it deletes only non-baseline records matching attempted create details, then verifies the original records remain unchanged. Use an exclusively owned target: concurrent changes intentionally fail baseline preservation checks.

## Deliberate database failure setup

Never select failure mode merely because a normal run failed. A 401, listener failure, timeout, or malformed response is not a sanitized database 503.

Reproducible local setup: `npm run test:acceptance:app` first starts the real server with an owned disposable database and validates normal behavior. It then explicitly stops that database while keeping the HTTP server alive, runs the database-failure scenario, and tears down the app. Both GET and authenticated valid POST must return `503` with `DATABASE_UNAVAILABLE`, a readable message, and no connection strings, stack traces, raw database errors, or internal fields.

For a separately configured local server, deliberately stop its owned disposable database while retaining valid application management credentials and its configured URI. Record that action, server commit, time, and isolated database alias, then run `--scenario database-failure`. Restore/recreate the disposable setup afterward and verify normal mode again. Never interrupt shared Atlas or another person's server for this check.

Controlled `database-failure` responses in self-tests are labeled runner evidence only. The correct failure response passes only the explicitly selected failure scenario; it fails ordinary empty/seeded mode. Deliberately leaked database responses fail the failure scenario.

## Manual browser demonstration checklist

Record the commit, server/database alias, date, tester, outcome, and artifact for every checked item. Keep failures and pending evidence visible.

- [ ] At desktop width and approximately 390px width, Menu, Specials, and management have readable content with no horizontal overflow.
- [ ] Use only keyboard navigation to reach fields, category selection, special checkbox, submit, and retry controls. Check visible focus, labels, and announced feedback.
- [ ] Starting Menu contains all independently seeded offerings; Specials contains only featured offerings. Confirm empty states in a separate empty setup.
- [ ] Create an ordinary offering, a special offering, and one with the default flag. Confirm the returned IDs and Menu/Specials filtering.
- [ ] Submit invalid/blank/overlong input and an invalid price. Confirm useful feedback, retained values, and no saved record.
- [ ] Save successfully, then deliberately fail the subsequent list reload in the controlled management preview. Confirm the save is acknowledged, the reload error is clear, and retry does not create a duplicate. Record this as controlled UI evidence, not Atlas persistence.
- [ ] Refresh the browser and restart the real local app using the same isolated database. Confirm the same IDs and details remain.
- [ ] For authorized live evidence, inspect those exact IDs in Atlas and compare details/flags. Record each developer's own read/write/cleanup results using the existing onboarding guide.
- [ ] Exercise a deliberately unavailable database and confirm readable failure/retry feedback without stale fixture fallback.
- [ ] Remove only demonstration records owned by the tester and verify cleanup. Any failed cleanup remains an open failure.

Existing [management preview](./offering-preview.md) and [special-offerings evidence](./evidence/issue-17/README.md) provide controlled UI scenarios. Review their instructions and label their evidence accordingly.

## Six-person evidence matrix

This is an unpopulated demonstration record. Each person supplies their own evidence; agent-written runner tests do not count as their personal tests. The existing [Atlas onboarding matrix](./milestone-2-developer-guide.md#team-evidence-matrix) remains the source for individual Atlas inspection/read/write/cleanup outcomes.

| Developer | Keyboard/narrow screen | Normal/special/invalid/save-reload | Refresh/restart | Atlas inspection/read/write/cleanup | Commit/date/artifact | Blocker      |
| --------- | ---------------------- | ---------------------------------- | --------------- | ----------------------------------- | -------------------- | ------------ |
| Brian     | Pending                | Pending                            | Pending         | Pending                             | Not recorded         | Not assessed |
| Naomi     | Pending                | Pending                            | Pending         | Pending                             | Not recorded         | Not assessed |
| Jean      | Pending                | Pending                            | Pending         | Pending                             | Not recorded         | Not assessed |
| Sofie     | Pending                | Pending                            | Pending         | Pending                             | Not recorded         | Not assessed |
| Vedika    | Pending                | Pending                            | Pending         | Pending                             | Not recorded         | Not assessed |
| Aditi     | Pending                | Pending                            | Pending         | Pending                             | Not recorded         | Not assessed |

## Acceptance criteria and handoff

| Issue #18 criterion                                              | Implementation/evidence                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Retained regressions, separately named explicit loopback tooling | Existing `test:regression`; `acceptance`; safe CLI configuration/exit tests     |
| Empty/seeded GET, POST/read-back, validation, IDs, errors        | `scripts/acceptance.ts`; controlled HTTP positive/negative cases                |
| Explicit failure setup                                           | Deliberate database failure section and `test:acceptance:app`                   |
| Owned database lifecycle and cleanup refusal                     | `disposable-database.ts`; lifecycle, refusal, and finite teardown tests         |
| Self-tests fail incorrect status/shape/read-back/teardown        | Unit HTTP self-tests and separate subprocess CLI checks                         |
| Browser checklist                                                | Checklist above; outcomes remain pending until demonstrated                     |
| Six-person matrix, commands, handoff                             | Matrix and commands above; Brian records integrated/live evidence under #12     |
| No persistence claims from stubs                                 | Separate labels and commands for controlled HTTP, real local DB, and live Atlas |

Brian can reproduce the standalone checks with `npm run test:acceptance`, the local application check with `npm run test:acceptance:app`, and full validation with `npm run preflight`. Record actual command output and commit in the PR. Independently reviewing the complete checklist and matrix satisfies the documentation deliverable; populated team rows and meeting results remain #12 work. Issue #18 may close once its independently tested tooling and complete checklist are reviewed and merged. Do not mark #12 or any pending team row complete from those results.
