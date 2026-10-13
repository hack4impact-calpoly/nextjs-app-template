# Unit and component test handoff

Vitest runs `tests/unit/**/*.test.ts` and `tests/unit/**/*.test.tsx`. The existing
`.mjs` regression files still use Node's test runner; keep their imports and
coverage intact.

## Vedika: issue #35

Start from updated `main`. You can complete this customer-page assignment without
waiting for PR #31. Extend `customer-pages.test.tsx`, which renders the shared
`OfferingsPage` component used by `/menu` and `/specials`.

The file contains five reference tests, browser setup, and cleanup. Vitest
restores stubbed globals after each test. Optional sample data and a JSON response
helper are in `helpers/offerings.ts`. None of your assigned Vitest cases has been
implemented for you. Existing Node regressions cover related UI states; keep them
and add your own rendered assertions in the Vitest file.

Personally write three new tests:

1. Specials shows its empty feedback when the response contains offerings but none
   have `specialOffer: true`.
2. A rejected network request shows an error and does not show the empty-menu feedback.
3. An unsuccessful API response with an unreadable error body shows useful fallback feedback.

Use controlled fetch responses. Render the component with the appropriate props
and inspect visible feedback. Async requests require waiting for the resulting UI.
Fix any related defects your tests expose. Do not copy the loading example and
claim it as a contribution, or replace the assigned cases with skipped tests.

Also check Home, About, Contact, Menu, Specials, and navigation at desktop/mobile
widths and with a keyboard. Capture focus, long-text, and overflow evidence as
required by [issue #35](https://github.com/BrianLiDesign/coffee-shop/issues/35).

## Commands

- Install the locked dependencies: `npm ci`.
- Run only customer-page tests: `npm run test:unit -- tests/unit/customer-pages.test.tsx`.
- Watch unit/component tests: `npm run test:watch`.
- Run all checks before submitting: `npm run preflight`.

Open your own reviewed PR into `main`. Record its link, your three test names,
what each protects, and browser evidence in
[`docs/milestone-3-evidence.md`](../../docs/milestone-3-evidence.md).
Controlled responses verify UI behavior; they do not prove live database persistence.

## Other developer assignments and release integration

PR #31 integrates the handlers, replacement management component, live acceptance
runner, and their reference tests into `main`. After it merges, developers can
start from updated `main` and follow their assigned issues. Sofie's issue #36
extends `scripts/live-acceptance.ts` through controlled fetch responses. Deployment
and live verification remain separate work, tracked in issue #30.

Preserve this handoff and each developer's contributed cases. Keep agent-written
reference tests distinct from personal contributions. Retain
both unit and regression commands, including storage and seed coverage from `main`.
