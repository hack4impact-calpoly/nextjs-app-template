# Milestone 3: Vercel deployment

This release uses Next.js 16, React 19, and Node.js 24.x. It implements real offering persistence and protected team management. The [plan](milestone-3-plan.md) is tracked under [#30](https://github.com/BrianLiDesign/coffee-shop/issues/30).

## Prepare the release

1. Run `npm ci` and `npm run preflight`. Resolve failures before deploying.
2. Review the branch and select the exact commit to deploy. Main is the eventual production branch; a feature-branch deployment is preview evidence until production is separately verified.
3. Prepare a named Atlas deployment database and a database user with scoped read/write access. Confirm the network access policy supports the deployment's egress. Do not copy a developer's unrestricted credential into Vercel.
4. Prepare a different database and credentials for Preview. Ordinary pull request checks must never write into production data.

## Configure Vercel

1. Sign in to the intended Vercel account/team and import `BrianLiDesign/coffee-shop`, or select its existing project.
2. Use the repository root, Next.js framework preset, Node.js 24.x, `npm ci`, and `npm run build`. `vercel.json` and `package.json` record the build/runtime agreement.
3. In project environment settings, privately configure `MONGO_URI`, `MANAGEMENT_USERNAME`, and `MANAGEMENT_PASSWORD` for Production and separately for Preview. Choose a unique management password of at least 16 characters; placeholder values are denied.
4. Keep secret names server-only. Never add a `NEXT_PUBLIC_` prefix or commit populated environment files. Save credentials privately, not in issues, PRs, logs, or screenshots.
5. Deploy a new build after changing environment variables. Existing deployments do not acquire changed values automatically.
6. If the preview has Vercel deployment protection, use its authorized browser access to inspect it. Do not disable protection merely to make an acceptance script pass.

Vercel references: [environment variables](https://vercel.com/docs/environment-variables), [deployment environments](https://vercel.com/docs/deployments/environments).

## Seed deliberately

Seeding never happens automatically during builds or requests. In a private local shell configured with the intended deployment database URI, run `npm run db:seed -- --apply`. Confirm the target privately before running it. Seed reruns use stable internal keys and insert-only behavior, so they preserve existing edits and unrelated records. Removing a seeded offering and deliberately rerunning the seed recreates that missing seed record.

## Verify the live application

1. Open the public root, About, Contact, Menu, and Specials URLs without team credentials. Confirm database-backed offerings load and the pages work on desktop and narrow mobile screens.
2. Open `/manage-offerings`. The browser requests team credentials. All writes are separately checked inside the route handlers; the server-rendered management page also checks access independently of proxy.
3. Configure `LIVE_BASE_URL` privately with the exact HTTPS origin. Run `npm run test:live` for a read-only check.
4. For deliberate live create/read evidence, configure the matching management credentials and run `npm run test:live -- --confirm-writes`. The runner creates a uniquely marked offering, verifies HTTP read-back, deletes only its own marked record, and confirms cleanup.
5. Run `npm run test:live -- --confirm-writes --all` to verify Brian's additional editing behavior too. Never treat a local disposable-database result as live evidence.
6. In the browser, create a normal offering and a special, refresh, and confirm Menu/Specials behavior. Record the evidence without credentials. Use clearly disposable records and remove only those records after the demonstration.
7. Demonstrate loading, empty, failed fetch/save, and save-success/reload-failure states in controlled local previews or an isolated preview database. Avoid deliberately breaking the production database for screenshots.
8. Record the production URL, deployed commit, checks, screenshots, and per-developer contributions in [release evidence](milestone-3-evidence.md). Update README's pending URL only after it is verified.

The smoke runner refuses remote plain HTTP, redirects, credential-bearing URLs, and unknown arguments. Failures print sanitized diagnostics. If cleanup cannot be verified, inspect the uniquely marked Verification offering before retrying; never clear the collection.

## Team access limitations

HTTP Basic over HTTPS is a small team-access mechanism for this student release, not an individual account or audit system. Use private credentials and rotate them when team access changes. Browsers may cache credentials until the browsing session closes. No password is stored in frontend state, source, or local storage. Cross-origin browser writes are denied. Production with individual staff accounts would need a separate authentication design.

If deployment fails, check Vercel's build/runtime diagnostics privately, the selected environment, Atlas permissions/network access, and the explicit database name. Do not paste connection strings or raw database errors into a PR.
