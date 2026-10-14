# Contributing

Here are all of the steps you should follow whenever contributing to this repo!

## Making Changes

1. Before you start making changes, always make sure you're on the `develop` branch, then `git pull` and `npm i` to make sure your code is up to date
2. Create a branch `git checkout -b <name-of-branch>`
3. Make changes to the code
4. `npm run lint` to ensure code standards. (running `npm run lint:fix` will fix most of the styling errors)
5. `npx tsc --noEmit` to catch type errors. Lint does not catch these, and the site will not build with them
6. `npm test` to run the unit tests

## Writing Tests

We use [Vitest](https://vitest.dev/) for unit tests.

- `npm test` runs every test once. `npm run test:watch` reruns them as you save
- Put the test file next to the code it tests and end the name with `.test.ts` (for example `src/lib/drinks.ts` -> `src/lib/drinks.test.ts`)
- See `src/lib/drinks.test.ts` for an example
- Test plain functions (data in, result out). If the logic you want to test is inside a page or component, move it into its own function first and test that
- Tests must not use the real database or the network

A test looks like this:

```ts
import { describe, expect, it } from "vitest";
import { add } from "@/lib/math";

describe("add", () => {
  it("adds two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

## Commiting Changes

When interacting with Git/GitHub, feel free to use the command line, VSCode extension, or Github desktop. These steps assume you have already made a branch using `git checkout -b <branch-name>` and you have made all neccessary code changes for the provided task.

1. View diffs of each file you changed using the VSCode Github extension (3rd icon on far left bar of VSCode) or GitHub Desktop
2. `git add .` (to stage all files) or `git add <file-name>` (to stage specific file)
3. `git commit -m "<type>[optional scope]: <description>"` or
   `git commit -m "<type>[optional scope]: <description>" -m "[optional body]"` or
   `git commit` to get a message prompt
4. `git push -u origin <name-of-branch>`

## Making Pull Requests

1. Open `https://github.com/tjsook/group3-h4i-bootcamp/compare/develop...<name-of-branch>` (don't use the "Compare & pull request" banner, it can point to the template repo)
2. Check that the base repository is **tjsook/group3-h4i-bootcamp** and the base branch is **develop**, then fill out the PR template
3. (If applicable, provide a screenshot of your work in the comment area)
4. Link your PR to the corresponding **Issue**
5. Request a reviewer to check your code
6. If the reviewer asks for changes, commit and push to the same branch. The PR updates on its own, no need for a new one
7. Once approved, your code is ready to be merged in 🎉
