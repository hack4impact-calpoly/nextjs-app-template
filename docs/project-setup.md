# Project setup

These tools are already configured. You do not need to add them before writing a feature.

1. **Next.js 16 App Router and React 19.** Pages and route handlers live under `src/app`. See [Getting started](./getting-started.md) for the folder map. Server request APIs and route parameters are asynchronous.
2. **TypeScript in strict mode**, with the `@/*` import alias pointed at `src/`.
3. **React 19** for interface components.
4. **Mongoose** connection helper in `src/database/db.ts`. It reads `MONGO_URI` and reuses one connection across requests. `src/database/userSchema.ts` is an example schema.
5. **Example routes.** `src/app/example/page.tsx` and `src/app/api/example/route.ts` show a page and an API route. The API route connects to MongoDB. New shop pages should follow the issue you were assigned.
6. **ESLint and Prettier.** `eslint.config.mjs` imports Next's Core Web Vitals flat configuration and reports Prettier issues as errors. Prettier uses a print width of 120. `npm run lint` runs ESLint directly.
7. **Pre-commit hook.** Husky runs lint-staged, which formats staged files and runs ESLint on JavaScript and TypeScript.
8. **Issue and pull request templates** in `.github`.
9. **Continuous integration.** `.github/workflows/ci.yml` runs on pushes and pull requests to `main` and `develop`. Node 24 runs `npm ci`, lint, typecheck, Vitest and regression tests, and a production build. Builds use no Atlas credentials; database regression checks use disposable loopback MongoDB.

10. **Milestone 3 release.** The [plan](milestone-3-plan.md), [deployment guide](milestone-3-deployment.md), and [evidence record](milestone-3-evidence.md) describe protected management, live verification, and developer contributions. HTTP Basic access is enforced in `src/proxy.ts`, the server management page, and every write handler.
11. **Tests.** `npm test` runs Vitest unit/component checks and the retained Node regression suite. The HTTP harness starts its own Next.js server with separate output and a seeded disposable MongoDB database. `npm run typecheck` checks TypeScript. See [the Offering contract](./offering-api-contract.md) for current and historical coverage boundaries.

The [test handoff](../tests/unit/README.md) gives Vedika a starting point on `main`.
Reference tests on this release branch do not count as her personal contributions.
The retained `npm run test:storage` command covers storage and deliberate seed
execution from Naomi's merged work; use `npm run db:seed -- --apply` to seed.
