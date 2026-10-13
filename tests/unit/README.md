# Unit and component test handoff

Vitest runs `tests/unit/**/*.test.ts` and `tests/unit/**/*.test.tsx`. The existing
`.mjs` regression files still use Node's test runner; keep their imports and
coverage intact.

## Vedika: issue #35

PR #39 contributes Vedika's three cases in `customer-pages.test.tsx`, which
renders the shared `OfferingsPage` component used by `/menu` and `/specials`.

The file contains five original reference tests, Vedika's three contributed
cases, and one agent-added reload regression. Keep their attribution comments.
Vitest restores stubbed globals after each test. Sample data and a JSON response
helper are in `helpers/offerings.ts`. Existing Node regressions remain enabled.

Vedika's contributed cases protect these behaviors:

1. Specials shows its empty feedback when the response contains offerings but none
   have `specialOffer: true`.
2. A rejected network request shows an error and does not show the empty-menu feedback.
3. An unsuccessful API response with an unreadable error body shows useful fallback feedback.

Use controlled fetch responses. Render the component with the appropriate props
and inspect visible feedback. Async requests require waiting for the resulting UI.
Fix any related defects your tests expose. Do not copy the loading example and
claim it as a contribution, or replace the assigned cases with skipped tests.

Agent-performed browser checks cover Home, About, Contact, Menu, Specials,
navigation, keyboard focus, long text, and overflow at desktop/mobile widths.
See the [PR #39 evidence](../../docs/evidence/pr39-browser.md) for routes,
viewports, screenshots, and the controlled-response verification boundary.

## Commands

- Install the locked dependencies: `npm ci`.
- Run only customer-page tests: `npm run test:unit -- tests/unit/customer-pages.test.tsx`.
- Watch unit/component tests: `npm run test:watch`.
- Run all checks before submitting: `npm run preflight`.

PR #39, the three test names, and explanations are recorded in
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
