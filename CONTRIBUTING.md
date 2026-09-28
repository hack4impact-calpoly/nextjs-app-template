# Contributing

## Workflow

1. Pick an issue from the **This Sprint** column on the project board and assign it to yourself.
2. Pull the latest code before you branch:
   ```bash
   git checkout develop
   git pull
   npm install
   ```
3. Make **one branch per issue** and name it `<issue-number>-<short-name>`:
   ```bash
   git checkout -b 3-navbar
   ```
4. Pull again while you're working, especially before opening a PR, so you catch conflicts early:
   ```bash
   git pull origin develop
   ```
5. Run `npm run lint` before you push. `npm run lint:fix` fixes most formatting problems automatically.
6. Open a PR, fill out the template, link the issue (`Closes #3`), and request a reviewer. You need at least one approval before you merge.

## Commit messages

Use the format `Action: short description`:

```
Add: opportunities API route
Fix: navbar overlapping page content on mobile
Update: README seed instructions
Remove: unused example page
```

Keep commits small and focused. If you can't describe a commit in one line, it probably needs to be split up.

## Comments

Comments should explain **why**, not **what**. The code already shows what it does.

```ts
// Bad: loop over opportunities
// Good: filter client-side because the API doesn't support date ranges yet
```

## Secrets

Never commit `.env.local` or paste the MongoDB URI anywhere public. If you think it leaked, tell the TL right away so it can be rotated.
