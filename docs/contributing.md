# Contributing

Every change lands on its own branch and pull request. Do not commit directly to `main`.

## Making changes

1. Start from an up-to-date `main` branch:

   ```bash
   git checkout main
   git pull origin main
   npm ci
   ```

2. Open the GitHub issue assigned to you. Use **Create a branch for this issue** when GitHub offers it. Otherwise create the branch locally:

   ```bash
   git checkout -b <short-issue-name>
   ```

3. Change only what that issue asks for.
4. Run `npm run lint`. Use `npm run lint:fix` when you want the tools to apply safe fixes. Some ESLint findings still need a manual edit.

## Committing

Use the command line, the VS Code or Cursor source control view, or GitHub Desktop. These steps assume you are already on your issue branch and the code change is done.

1. Review the diff of each file you changed.
2. Stage files with `git add <file>` or `git add .` for everything in this change.
3. Commit with a [Conventional Commit](https://h4i.notion.site/Conventional-Commits-593452ad1179489399ad3bd696ef772a) message:

   ```bash
   git commit -m "<type>[optional scope]: <description>"
   ```

   Add a body when the reason is not obvious from the subject:

   ```bash
   git commit -m "<type>[optional scope]: <description>" -m "<why this change>"
   ```

4. Push the branch:

   ```bash
   git push -u origin <short-issue-name>
   ```

A pre-commit hook runs lint-staged. It formats staged files and runs ESLint on JavaScript and TypeScript. If the hook fails, fix the reported files and commit again.

## Pull requests

1. Open a pull request from your issue branch into `main`.
2. Fill out the pull request template: your name, a summary, the files you changed, and what you tested.
3. Link the issue in the description, for example `Closes #123`.
4. Add a screenshot or short recording when the change is visible in the browser.
5. Request a reviewer.
6. Merge after the review is approved.

If you get stuck, push the branch as it is and ask for help on the issue or pull request.
