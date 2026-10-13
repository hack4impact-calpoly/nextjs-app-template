# Getting Started

Install the app, learn the languages and folders, and run it on your machine.

## Contents

- [Setup for all developers](#setup-for-all-developers)
- [Languages](#languages)
- [Project structure](#project-structure)
- [How a page is wired](#how-a-page-is-wired)
- [Helpful commands](#helpful-commands)
- [Setup for tech leads](#setup-for-tech-leads)

## Setup for all developers

1. Install [Node.js](https://nodejs.org/) 24.x, matching continuous integration and Vercel.
2. Clone this repository: `git clone <repo-url>`
3. From the repository root, run `npm ci`.
4. Copy `.env.local.example` to `.env.local`. Configure your private `MONGO_URI` and management credentials following README. Next.js reads `.env.local` automatically, and git ignores it.
5. Open the folder in VS Code or Cursor and install the recommended extensions when prompted: ESLint and Prettier. `.vscode/settings.json` already turns on format on save. ESLint runs Prettier, so leave the default formatter as the workspace setting.
6. Read [Languages](#languages), [Project structure](#project-structure), and [Contributing](./contributing.md) before you change code.

The home page at `/` loads without MongoDB. `GET /api/example` calls the database connection and needs `MONGO_URI`.

## Languages

| Language or tool           | Where it shows up                                   | What you use it for                                                                        |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| TypeScript (`.ts`, `.tsx`) | `src/`                                              | Pages, components, API routes, and database code. `tsconfig.json` enables strict checking. |
| React 19                   | `src/app` and `src/components`                      | The user interface. Components are functions that return JSX.                              |
| CSS                        | `src/app/globals.css` and `src/styles/*.module.css` | Global rules, plus CSS Modules for a single component.                                     |
| Next.js 16                 | `src/app`                                           | App Router pages and API route handlers.                                                   |
| JavaScript                 | `next.config.js`, `prettier.config.js`              | Tool configuration. Application features go in TypeScript under `src/`.                    |
| Mongoose                   | `src/database`                                      | Talks to MongoDB.                                                                          |

Import application files with the `@/` alias. It points at `src/`, as set in `tsconfig.json`. Example: `import Navbar from "@/components/Navbar"`.

## Project structure

```text
coffee-shop/
├── src/                         Application code
│   ├── app/                     Next.js App Router
│   │   ├── layout.tsx           Shared shell. Renders Navbar on every page.
│   │   ├── page.tsx             Home page, route /
│   │   ├── globals.css          Global CSS
│   │   ├── icon.svg             Coffee shop icon
│   │   ├── example/page.tsx     Example page, route /example
│   │   └── api/example/route.ts Example API, GET /api/example
│   ├── components/              Shared React components (Navbar.tsx)
│   ├── styles/                  CSS Modules (navbar.module.css, example.module.css)
│   └── database/                Mongoose connection (db.ts) and an example User schema
├── docs/                        Guides for people working in this repo
├── .github/                     CI workflow, issue template, pull request template
├── .vscode/                     Recommended extensions and editor settings
└── skills/                      Workflow notes for coding agents
```

`src/database/userSchema.ts` is an example schema from the starter. It is separate from menu data.

`skills/` and `docs/agents/` are instructions for coding agents. Feature work belongs in `src/`.

There is no `public/` folder. The icon lives at `src/app/icon.svg`, which is an App Router metadata location.

## How a page is wired

A `page.tsx` file becomes a URL. `src/app/page.tsx` is `/`. A folder under `src/app` adds a segment, so `src/app/example/page.tsx` is `/example`.

`src/app/layout.tsx` wraps every page and renders `Navbar` once. Leave the navbar import out of individual pages.

The navbar links to the implemented customer pages `/`, `/about`, `/menu`, `/specials`, and `/contact`. Authorized team members use `/manage-offerings`.

An API route is a `route.ts` file under `src/app/api`. `src/app/api/example/route.ts` handles `GET /api/example` and calls `connectDB()` from `src/database/db.ts`.

## Helpful commands

- `npm run dev` — local app at [http://localhost:3000](http://localhost:3000)
- `npm run lint` — ESLint and Prettier
- `npm run lint:fix` — same checks, with automatic fixes where the tools can apply them
- `npm run build` — production build
- `npm test` — runs the offerings HTTP checks using an automatically started local server; no database credentials needed.
- `npm run typecheck` — checks TypeScript without emitting files.
- `git stash` — set aside uncommitted work so you can switch branches
- `git stash apply` — restore the most recent stash

To update a feature branch with the latest `main`:

```bash
git checkout main
git pull origin main
git checkout <your-branch>
git merge main
```

## Setup for tech leads

1. Create a MongoDB cluster and put its connection string in `.env.local` as `MONGO_URI`.
2. Add the same value as a repository secret named `MONGO_URI` so GitHub Actions can build. In the repo on GitHub: Settings → Secrets and variables → Actions → New repository secret.
3. Complete [Setup for all developers](#setup-for-all-developers) on your own machine.
4. Turn on branch protection for `main`:

   1. Open the repository on GitHub.
   2. Settings → Branches → Add rule.
   3. Enable "Require a pull request before merging".
   4. Save the rule.

   <img src="./images/require-code-review.png" alt="Require a pull request before merging" width="500"/>

5. Read [project setup](./project-setup.md) for the tools this repository already includes.

To learn the framework:

- [Next.js documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React documentation](https://react.dev/learn)
