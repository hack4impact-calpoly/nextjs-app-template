# Milestone 2 developer setup and verification

> Coordination update: [independent assignments](./milestone-2-parallel-work.md) define personal completion. #13 now supplies the database checker below. Full-team Atlas access and integrated persistence evidence still gate parent #12. Seed tooling remains separate work in #15.

The database checker is implemented and tested against an isolated local MongoDB server. Atlas provisioning, each developer's access, and real application persistence are not established by those tests. Do not assume access is working until your own verification passes.

You can complete your independent assignment using its specified local database or controlled-response tests before Atlas access is available. The procedure below supplies live evidence for final milestone acceptance; it is not a prerequisite on another developer's assignment.

## What you need

- Your own Atlas dashboard account and accepted project invitation.
- A database user with the permissions Brian assigns for your named developer database. Dashboard access and database credentials are different.
- Your network's public IP permitted by the Atlas project's Network Access settings.
- The repository installed locally and a private `.env.local` containing `MONGO_URI`.

[Atlas's connection guide](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/) describes these connection prerequisites. [Database users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/) are separate from Atlas application users.

## Brian and Naomi: provision access

1. Identify the Atlas project and cluster; record their non-secret names in the integration evidence under [parent #12](https://github.com/BrianLiDesign/coffee-shop/issues/12).
2. Invite each teammate individually. Choose the least-privileged Atlas role that allows the intended data inspection. Verify that each person can inspect their collection, rather than assuming an invitation grants it.
3. Create a named database for each developer and one integration database. Proposed names are `coffee_shop_<developer>` and `coffee_shop_integration`; confirm the exact names in the issue.
4. Create individual database users scoped to the appropriate databases. Grant read/write access where development requires it. Limit integration writes to the contributors performing integration.
5. Add required developer network addresses to the project IP access list. Recheck when a teammate changes network or VPN. Avoid broad public access as the default. See [Atlas network access](https://www.mongodb.com/docs/atlas/security/ip-access-list/).
6. Deliver each teammate's credentials through the team's private credential channel, not GitHub comments, commits, screenshots, or the project board.
7. Confirm the URI explicitly selects the intended database. Do not use an accidental default database.
8. Confirm all six people can see the intended project and collection in Atlas. Record blockers separately from application connection results.

## Each developer: configure locally

1. Follow the repository's installation instructions and update your working branch from the agreed baseline.
2. Copy `.env.local.example` to `.env.local` at the repository root.
3. Replace the placeholder with your assigned `MONGO_URI`. It must include your developer database name. Do not use the integration URI for routine experiments.
4. Use the Atlas-generated connection template and correctly encoded credentials. Do not post the URI if setup fails.
5. Verify that Git ignores your file using `git check-ignore .env.local`. Never add a populated env file to a commit.
6. Restart the local app after changing environment configuration.
7. Open the assigned Atlas project and verify you can inspect your data.

Git ignores `.env` and `.env.*`, including backups and nested environment files, while retaining `.env.local.example`. This does not untrack any previously committed secret. Standardize on `.env.local`; never force-add populated configuration.

## Run your database verification

Run from the repository root after `npm install`:

```bash
npm run db:check
npm run db:check:write
```

`db:check` is read-only. It performs a real `findOne` on `_coffee_shop_verification`; an empty result is a successful read. `db:check:write` explicitly inserts one UUID marker in that collection, reads it back, and deletes only that marker. It never writes offerings, clears collections, or drops databases. The empty verification collection may remain after cleanup.

The script uses Next's environment loader with development precedence, matching `npm run dev`: an existing process variable wins, then `.env.development.local`, `.env.local`, `.env.development`, and `.env`. Prefer private `.env.local` and remove stale overrides. Do not run the development checker with `NODE_ENV=test` or `production`. The URI must explicitly name a database using letters, digits, underscores, or hyphens; `admin`, `local`, and `config` are refused. No URI, credentials, document contents, or raw database exceptions are printed.

Expect `PASS configuration`, `connect`, `read`, and `close`. Write mode also requires `PASS write`, `read-back`, and `cleanup`. Any `FAIL` or nonzero exit means verification failed. Connection/socket/queue limits are five seconds; the whole command has a 30-second deadline. On cleanup failure or interruption, retain the printed marker and collection name and ask Brian to inspect and remove only that marker. Do not rerun repeatedly without resolving leftover verification records.

Example sanitized write-check evidence:

```text
PASS configuration: database=coffee_shop_brian; mode=write
PASS connect: Connected.
PASS read: Read _coffee_shop_verification; no document contents printed.
INFO disposable marker=<this-run-uuid>; collection=_coffee_shop_verification
PASS write: Disposable write acknowledged.
PASS read-back: Disposable marker read back.
PASS cleanup: Only this run's marker removed (or absent after a failed write).
PASS close: Connection closed.
```

The checker uses an independent short-lived MongoDB connection from Mongoose's bundled driver; it does not change the app's `connectDB` cache or serve a URL. See [Next's environment loader](https://nextjs.org/docs/app/guides/environment-variables#loading-environment-variables-with-nextenv) and [MongoDB connection timeouts](https://www.mongodb.com/docs/drivers/node/current/connect/connection-options/).

Successful checker output proves local database access; it does not replace testing the offerings API and browser flow after those are implemented.

## Verify the checker itself

```bash
npm run test:db
npm test
npm run lint
npm run typecheck
npm run build
```

`test:db` downloads MongoDB 7.0.24 on its first run and starts an authenticated, disposable loopback server in a temporary directory. It uses generated test configuration rather than your repository environment or Atlas. Tests cover missing/placeholder configuration, environment precedence, unavailable connection, denied reads/writes, write/read-back/cleanup, cleanup failure, and unrelated-record preservation. The server is stopped and its temporary data removed afterward. A binary download failure is a test failure, not a skipped verification; allow the first download to finish and rerun after fixing network/certificate issues. `npm test` also retains the existing public fixture GET regression checks.

These local tests do not produce any person's live Atlas result. Record those separately below. Seed commands will be supplied by #15; they are not part of this checker.

## Seed and application verification

1. After storage, handlers, and management UI are composed into the real app, run the documented seed command against your developer database. Seeding alone does not make the current fixture-backed API read your database.
2. Confirm 16 seeded offerings and three special offerings. Run the seed again: seeded count and identities must stay unchanged.
3. Confirm unrelated records remain. The seed must not clear the collection or overwrite edited records on rerun.
4. Start the app. Inspect GET `/api/offerings` and verify its data matches your database.
5. Open `/manage-offerings`, create a distinctly named offering, and record its returned string ID.
6. Refresh, then restart the app, and confirm the same record is still available. Inspect it in Atlas.
7. Check that a special offering appears on both Menu and Specials, while an ordinary offering appears only on Menu.
8. Submit invalid input and confirm useful feedback and no saved record.

## Team evidence matrix

Record dates and outcomes in the integration evidence under [parent #12](https://github.com/BrianLiDesign/coffee-shop/issues/12). Issue #13 ships checker/onboarding tooling and does not wait for these rows to pass. Do not attach populated environment files. These rows are pending, not verified.

| Developer | Atlas inspection | Read check | Write/read/cleanup | App persistence | Checked at  | Blocker      |
| --------- | ---------------- | ---------- | ------------------ | --------------- | ----------- | ------------ |
| Brian     | Pending          | Pending    | Pending            | Pending         | Not checked | Not assessed |
| Naomi     | Pending          | Pending    | Pending            | Pending         | Not checked | Not assessed |
| Jean      | Pending          | Pending    | Pending            | Pending         | Not checked | Not assessed |
| Sofie     | Pending          | Pending    | Pending            | Pending         | Not checked | Not assessed |
| Vedika    | Pending          | Pending    | Pending            | Pending         | Not checked | Not assessed |
| Aditi     | Pending          | Pending    | Pending            | Pending         | Not checked | Not assessed |

Brian collects sanitized evidence from each person. A result on Brian's machine does not establish that everyone else's configuration works.

## Troubleshooting

| Symptom                             | What to check                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| Missing configuration               | File location, variable name, placeholder replacement, app restart                        |
| Authentication failure              | Database username/password rather than dashboard login; credential encoding               |
| Connection timeout                  | Public IP allowlist, VPN/network change, cluster availability, local network restrictions |
| Read succeeds but write fails       | Database user's write permission on the exact target database                             |
| Empty menu after successful seed    | Seed and app selected the same database and collection                                    |
| Atlas UI works but app fails        | Dashboard access is separate from database credentials and network access                 |
| New offering vanishes after refresh | POST truly persists; GET reads that database; no frontend fixture fallback                |
| Verification cleanup fails          | Mark verification failed; report safe marker/collection to Brian for targeted cleanup     |

Report the failed stage, safe database alias, time, and sanitized error. Never paste credentials to debug a failure.

## Shared integration database

Use it only for coordinated integration and the meeting demonstration. Do not run destructive resets or routine tests there. Brian records the integration seed result and the complete browser persistence demo independently of each developer's onboarding result.

CI build success is not proof that the configured database can read or write. Routine automated checks should use isolated test data; deliberate Atlas checks use a designated database and report their result separately.
