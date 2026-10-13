# PR #38 management-form browser evidence

Agent-performed verification on October 13, 2026, against implementation commit
`760f1be`, reconciled with main `1a74a78`. The real Next.js application ran locally
in Edge at `/manage-offerings` with temporary local management credentials and
intercepted `/api/offerings` responses. No deployed database was exercised.
This does not establish Aditi's personal browser verification.

Both viewports passed keyboard-only submission and correction. Tab traversed the
special checkbox, name, description, price, category, and Save in order; every
control had a visible 3px focus outline. Enter on empty Save showed errors without
a POST. Typing a name cleared only that error. Keyboard entry of valid data,
selection of Tea, and checking Special offer produced one successful POST. The
form then cleared name, description and price, restored Coffee, and unchecked
Special offer. Document width equaled viewport width; no JavaScript exceptions
were recorded.

| Route               | Viewport | Invalid submission                           | Successful reset                          |
| ------------------- | -------- | -------------------------------------------- | ----------------------------------------- |
| `/manage-offerings` | 1280x900 | [Desktop errors](./pr38-desktop-invalid.jpg) | [Desktop reset](./pr38-desktop-reset.jpg) |
| `/manage-offerings` | 390x844  | [Mobile errors](./pr38-mobile-invalid.jpg)   | [Mobile reset](./pr38-mobile-reset.jpg)   |

The [machine-readable results](./pr38-browser-results.json) record focus, viewport,
write count, measured document width, and screenshots. These controlled responses
verify UI behavior, not live Atlas persistence. Screenshots include Next.js's local
development indicator.

Final local validation against implementation `760f1be` passed on October 13,
2026: `npm run preflight` completed lint, typecheck, 119 Vitest cases, 51 Node
regression cases, 5 acceptance CLI cases, 3 disposable lifecycle cases, 1
real-application acceptance case, and the production build. An initial run hit
an acceptance-runner HTTP deadline while the merge commit hook ran; the isolated
rerun passed. Independent standards and spec reviews found no remaining blockers.
The subsequent commit adds only this evidence and contribution documentation.
