# Offering management preview

The controlled-response preview lets you demonstrate `/manage-offerings` before
the real `GET` and `POST /api/offerings` handlers are available. It runs in a
separate local Node process; it does not add mock data or a preview switch to
the production app.

1. In one terminal, run `npm run dev`.
2. In another terminal, run `npm run preview:offerings`.
3. Open `http://localhost:3001/manage-offerings?scenario=normal`.

The preview server proxies the page and static assets to Next.js on port 3000.
It handles only `/api/offerings` itself and marks those responses with
`X-Offering-Preview: controlled-response`. To reset a scenario, open its URL
again; each URL creates a fresh preview session.

Available controlled-response scenarios:

| URL suffix                 | Expected behavior                                                |
| -------------------------- | ---------------------------------------------------------------- |
| `?scenario=normal`         | Initial list, delayed successful save, then refreshed list       |
| `?scenario=empty`          | Empty-list state                                                 |
| `?scenario=list-error`     | Initial list-loading error                                       |
| `?scenario=field-errors`   | Controlled POST returns an API field error                       |
| `?scenario=save-failure`   | Failed save; form values remain available                        |
| `?scenario=reload-failure` | Save succeeds, then refresh fails with distinct success feedback |

Field validation is client-side: submit the empty form in any scenario to see
required-field errors. During `normal` saving, all form controls and the special
checkbox remain disabled while
the preview server delays its successful response. The preview-only
`/__preview/status` endpoint reports scenario request counts and the last
submitted `specialOffer` value.

## Controlled-response evidence

The screenshots below were captured from the explicitly test-only preview
server, not from the production runtime:

| Evidence                                     | Screenshot                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Save pending and duplicate-submit prevention | [issue-20-controlled-pending-save.png](./evidence/issue-20-controlled-pending-save.png)       |
| Successful save and refreshed list           | [issue-20-controlled-successful-save.png](./evidence/issue-20-controlled-successful-save.png) |
| Client-side field errors                     | [issue-20-controlled-field-errors.png](./evidence/issue-20-controlled-field-errors.png)       |
| Controlled API field error                   | [issue-20-controlled-api-field-error.png](./evidence/issue-20-controlled-api-field-error.png) |
| Failed save with form values retained        | [issue-20-controlled-save-failure.png](./evidence/issue-20-controlled-save-failure.png)       |
| Successful save followed by reload failure   | [issue-20-controlled-reload-failure.png](./evidence/issue-20-controlled-reload-failure.png)   |
| Empty list                                   | [issue-20-controlled-empty-list.png](./evidence/issue-20-controlled-empty-list.png)           |
| List loading error                           | [issue-20-controlled-list-error.png](./evidence/issue-20-controlled-list-error.png)           |
| Narrow-screen layout                         | [issue-20-controlled-narrow-screen.png](./evidence/issue-20-controlled-narrow-screen.png)     |

Keyboard verification confirmed Tab moves from the name field to description,
and Space toggles the special-offer checkbox. The mobile check used a 375 px
viewport: the form stacked into one column and the document had no horizontal
overflow. Controlled submissions verified both `specialOffer: false` and
`specialOffer: true`.

`npm test` also runs DOM interaction regressions in `tests/offering-form.test.mjs`.
They verify the reusable form's optional boolean prop (including its false
default), pending control locking and duplicate prevention, failed-save value
retention, and successful-save clearing with reload-failure feedback. These use
controlled HTTP responses in jsdom and do not establish real persistence.
