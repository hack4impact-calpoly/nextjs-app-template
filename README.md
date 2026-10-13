# Coffee Shop

A student-built coffee shop site. Customers browse stored offerings and specials, read the shop story, and find contact information. Authorized team members can create, edit, and delete offerings through the management page.

**Existing public site:** [Coffee Shop on Vercel](https://coffee-shop-sigma-rouge.vercel.app/). The Milestone 3 foundation is integrated through PR #31; production deployment, database configuration, and live operation verification must be verified separately. The [Milestone 3 preview](https://coffee-shop-git-feat-milestone-3-release-brianlidesign.vercel.app/) has Vercel sign-in protection. See the [deployment guide](docs/milestone-3-deployment.md) and [release evidence](docs/milestone-3-evidence.md). A successful local build is not live deployment evidence.

## Features

- Public pages: Home (`/`), About (`/about`), Menu (`/menu`), Specials (`/specials`), and Contact (`/contact`).
- Menu and Specials read MongoDB through `/api/offerings`; Specials uses the saved boolean flag.
- Protected management at `/manage-offerings`: creation, editing, delete confirmation, validation, and pending/success/error feedback.
- Loading, empty, error, and retry states, with responsive layouts.
- Repeatable insert-only seeding of the 16 starting offerings, including three specials.
- Vitest unit/component tests plus real HTTP and disposable database regression tests.

Create/read are the required Milestone 3 operations. Update/delete are Brian's additional assignment. Customer orders, payments, drink customization, and delivery integrations remain future work. Starter examples at `/example` and `/api/example` are learning references.

## Tech stack

Next.js 16 App Router, React 19, TypeScript, CSS Modules, MongoDB Atlas, Mongoose 8, Vitest 5, React Testing Library, ESLint, Prettier, and Vercel. Use **Node.js 24.x** and npm, matching CI and the deployment runtime.

## Local setup

1. Clone the repository and open its root directory.
2. Install Node.js 24.x, then run `npm ci`.
3. Copy `.env.local.example` to the ignored `.env.local`.
4. Privately replace the MongoDB placeholder with a URI containing your assigned database name. Set your management username and a unique password of at least 16 characters.
5. Run `npm run db:check` to verify real read access.
6. To deliberately seed this database, run `npm run db:seed -- --apply`. Reruns insert missing seed records and preserve existing records and edits.
7. Run `npm run dev` and open [localhost:3000](http://localhost:3000).
8. Open [management](http://localhost:3000/manage-offerings) and sign in through the browser's credential prompt.

The home page runs without MongoDB. Database pages show a readable error when configuration or connectivity is unavailable; there is no sample-data fallback. Do not share populated environment files or screenshots of credentials.

## Environment variables

| Variable              | Purpose                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `MONGO_URI`           | Server-side MongoDB connection string with an explicit shop database                          |
| `MANAGEMENT_USERNAME` | Private team management username; must not contain a colon                                    |
| `MANAGEMENT_PASSWORD` | Private management password, at least 16 characters; placeholder values are rejected          |
| `LIVE_BASE_URL`       | Optional HTTPS origin for deliberate live acceptance checks; loopback HTTP is allowed locally |

Configure these privately in Vercel for the relevant environment. Never hardcode credentials or use a `NEXT_PUBLIC_` prefix for them. Keep preview and production database targets separate.

## Tests and quality checks

- `npm run test:unit` runs Vitest once; `npm run test:watch` runs it interactively.
- `npm run test:regression` checks real HTTP persistence, seeding, database access tooling, and existing frontend behavior.
- `npm test` runs both suites.
- `npm run preflight` runs lint, typecheck, all tests, and a production build.
- `npm run db:check:write` deliberately verifies write/read/cleanup using its own disposable marker.
- `npm run test:live` reads the explicitly configured live target without writing.
- `npm run test:live -- --confirm-writes` verifies live create/read and cleans up only its disposable offering.
- `npm run test:live -- --confirm-writes --all` also verifies updates. Cleanup verifies deletion.

Automated persistence checks start disposable loopback MongoDB instances and require no Atlas credentials. The first run may download MongoDB 7.0.24. Each developer must personally contribute and explain at least three relevant Vitest cases; the shared suite does not establish individual completion.

## Deployment

Follow the [Vercel release guide](docs/milestone-3-deployment.md). Keep customer pages public and management protected. Verify live persistence, responsive behavior, and failure states before replacing the pending live URL above.

## Team and workflow

After PR #31 merges, developers can start from updated `main`, including Sofie's
acceptance safeguards in issue #36. Vedika's customer-page test foundation was
already available before that merge. The [test handoff](tests/unit/README.md)
identifies her starter file and three assigned Vitest cases. Preserve submitted
contributions and record personal evidence in
[`docs/milestone-3-evidence.md`](docs/milestone-3-evidence.md).

Brian: tech lead, integration, access control, deployment, documentation, update/delete. Jean: backend handlers. Naomi: database and seeding. Vedika: customer frontend. Aditi: management frontend. Sofie: acceptance tooling and release evidence.

See the [Milestone 3 plan](docs/milestone-3-plan.md) for assignments, acceptance criteria, and the release checklist. Follow [Contributing](docs/contributing.md): one issue, one branch, one reviewed PR into main. Learning developers can start with [Getting started](docs/getting-started.md); agents follow [AGENTS.md](AGENTS.md).
