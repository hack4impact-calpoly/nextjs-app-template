# Issue 17: controlled-response verification

Verified October 7, 2026. This evidence uses an explicitly selected local preview, not Atlas or real application persistence. Final composition and refresh/restart persistence remain Brian's work under issue #12.

## Reproduce

Run `npm install`, then `npm run preview:special-offerings`. Open `http://127.0.0.1:3002`. No Next.js server or database is required. Stop the preview with Ctrl+C.

`scripts/special-offerings-preview.mjs` bundles the real `SpecialOfferingControl` and `OfferingsPage` components using the test-only entry in `tests/previews/special-offerings.tsx`. Its loopback server supplies controlled responses at `/api/offerings`. It does not change the application's route, customer navigation, management form, or fixture data.

The checkbox accepts `checked: boolean` and `onChange(next: boolean)`. Its parent owns the boolean. It is ready for Brian to compose with the management form later; the preview checkbox deliberately does not change the supplied offering responses.

## Browser results

Codex's Chromium in-app browser was set to a 375 by 812 viewport. The rendered document measured 360 CSS pixels wide after the scrollbar, with scroll width also 360: no horizontal overflow. The full-page screenshots below all include the controlled-response label.

| Scenario    | Observed behavior                                                                                                                                     | Screenshot                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| starting    | Menu has four supplied items; Specials has exactly Pumpkin Spice Latte, Golden Hour Cold Brew, and Hojicha Latte; Cappuccino is absent from Specials. | [Starting menu and specials](starting-mobile.jpg) |
| new-special | Cardamom Latte appears in both lists; Menu has five items and Specials has four.                                                                      | [New special](new-special-mobile.jpg)             |
| empty       | Both lists show their own empty message and no cards.                                                                                                 | [Empty lists](empty-mobile.jpg)                   |
| failure     | Both lists announce the readable 503 message and show no cards or empty message.                                                                      | [Failure](failure-mobile.jpg)                     |
| loading     | Both lists show loading feedback during the five-second controlled response delay.                                                                    | [Loading](loading-mobile.jpg)                     |

Keyboard verification: Tab from the final scenario link reaches the labeled native checkbox. Space changes its checked state and displayed boolean from false to true and back to false. A visible focus outline surrounds the focused checkbox in the starting screenshot.

## Automated validation

`npm test` passes 34 tests, including existing HTTP/database/form regressions, the controlled customer-display suite, and the standalone checkbox interaction test. Database checks use a disposable local instance, never shared Atlas. `npm run lint`, `npm run typecheck`, and `npm run build` also pass on local Node 24. The GitHub Node 18/20/22 matrix supplies supported-version verification before merge.
