# Coffee Shop

**Pause & Pour** is a student-built, fictional café website. Browse the menu and specials, read the shop story, or view sample hours. Authorized team members can create, edit, and delete offerings.

[Visit Pause & Pour](https://coffee-shop-sigma-rouge.vercel.app/)

## What it does

- Customer pages: Home, About, Menu, Specials, and Contact.
- Menu and Specials load stored offerings from MongoDB, with loading, empty, error, and retry feedback.
- Protected management at `/manage-offerings` supports creation, editing, and confirmed deletion.
- Repeatable seeding supplies 16 starting offerings, including three specials, and preserves existing edits.

This is a demo with no physical location or customer contact service. Orders, payments, customization, and delivery are future work. The homepage works without MongoDB. Starter routes `/example` and `/api/example` remain learning references.

## Run locally

Use **Node.js 24.x** and npm.

```bash
npm ci
```

1. Copy `.env.local.example` to `.env.local`.
2. Privately set `MONGO_URI` to your assigned database, plus `MANAGEMENT_USERNAME` and a unique `MANAGEMENT_PASSWORD` of at least 16 characters. Keep this file out of Git.
3. Check database read access with `npm run db:check`.
4. If you want the starting menu in that database, deliberately run `npm run db:seed -- --apply`.
5. Start the app with `npm run dev` and open [localhost:3000](http://localhost:3000).

Visit `/manage-offerings` and sign in through the browser credential prompt. Database pages show an error if the database is unavailable; they do not fall back to sample data.

For the folder map, onboarding, and troubleshooting, read [Getting started](docs/getting-started.md) and the [database setup guide](docs/milestone-2-developer-guide.md).

## Check your work

| Command              | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `npm run test:unit`  | Vitest unit and component tests                  |
| `npm run test:watch` | Vitest in watch mode                             |
| `npm test`           | All unit, regression, and acceptance tests       |
| `npm run preflight`  | Lint, typecheck, all tests, and production build |

Automated database tests use disposable local MongoDB and need no Atlas credentials. MongoDB may download on the first run. Live checks are separate and described in the [deployment guide](docs/milestone-3-deployment.md).

## Stack and team

Next.js 16, React 19, TypeScript, CSS Modules, MongoDB Atlas, Mongoose, Vitest, React Testing Library, ESLint, Prettier, and Vercel.

Brian leads integration, access control, deployment, and documentation. Jean handles backend work; Naomi database and seeding; Vedika customer pages; Aditi management UI; Sofie acceptance tooling and evidence.

Start from updated `main`. Follow [Contributing](docs/contributing.md): one issue, one branch, one reviewed PR. Each developer records three personally contributed Vitest cases and explanations in the [release evidence](docs/milestone-3-evidence.md).

- [Milestone 3 plan and remaining release work](docs/milestone-3-plan.md)
- [Deployment and live verification](docs/milestone-3-deployment.md)
- [Offering API contract](docs/offering-api-contract.md)
- [Shop design and image provenance](docs/evidence/pause-and-pour/README.md)
- [Agent instructions](AGENTS.md)
