# Coffee Shop agents

Contract for coding agents in this repository. Learning developers can read it to see how an agent is supposed to work here.

Product scope lives in `README.md`. Setup, the folder map, and pull-request steps live in `docs/`.

## Change the app

Reviewers are learning TypeScript, React, Next.js, and Git. Several are coming from Java, Python, or HTML and CSS.

1. Fetch the assigned GitHub issue and restate its acceptance criteria. Done when you can point at the slice you will build.
2. Implement that slice. The planned features in `README.md` are the product boundary. Done when the diff satisfies the issue and adds nothing the issue left out.
3. Explain the change for a classmate. Done when the pull request names each file, the URL it serves, and the mechanism: page, layout, component, CSS Module, or `connectDB`.

## Repo rules

- Add a shop page as `src/app/<segment>/page.tsx`. `src/app/layout.tsx` already renders the navbar on every page.
- The navbar already links to `/`, `/about`, `/menu`, `/specials`, and `/contact`. Add the matching `page.tsx` when that route's issue is the one in progress.
- Keep `src/app/example`, `src/app/api/example`, and `src/database/userSchema.ts` as starter references until an issue replaces them. `userSchema.ts` is an example user model, separate from menu data.
- Call `connectDB` in `src/database/db.ts` only from code that reads or writes MongoDB. It reads `MONGO_URI`. The home page stays runnable without that variable.
- Style with `src/app/globals.css` or a CSS Module in `src/styles/`. Import application code with the `@/` alias, which points at `src/`.
- Check the `test` script in `package.json` before claiming tests ran. Add a test runner when the issue asks for tests.

## Reach these docs

- **Setup, languages, and wiring** — `docs/getting-started.md` when you explain the tree, a language, or how a `page.tsx` becomes a URL, or when a teammate is installing the app.
- **Branches and pull requests** — `docs/contributing.md` when you branch, commit, or open a pull request. One issue, one branch, into `main`.
- **Tools already here** — `docs/project-setup.md` when asked what is already configured.
- **Workflow skills** — the matching file under `skills/` when the task is grilling, a spec, tickets, test-first implementation, or triage.
- **Issue tracker** — `docs/agents/issue-tracker.md` when you publish a spec, fetch a ticket, or edit an issue. The tracker is GitHub Issues for `BrianLiDesign/coffee-shop`.
- **Triage labels** — `docs/agents/triage-labels.md` when a skill names a triage role. Apply this repo's label for that role.
- **Domain language** — `docs/agents/domain.md` when you name a shop concept in an issue, test, or refactor, or when a change would contradict a recorded decision. Glossary: root `CONTEXT.md`. Decisions: `docs/adr/`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
