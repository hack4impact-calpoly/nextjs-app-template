# PR #39 customer-page browser evidence

Agent-performed verification for issue #35 on October 12, 2026, against
implementation commit `533d7e1` (reconciliation with main `34a98d8`). The screenshots
were captured from that implementation before its commit; only formatting changed
during the commit hook. The later evidence commit changes documentation and aligns
the older network-error regression with the readable fallback; application code
is unchanged from the browser-verified implementation.

The real Next.js application ran locally in Edge with intercepted `/api/offerings`
responses. No Atlas or deployed database was exercised. These checks do not
establish that Vedika personally performed browser verification.

## Routes, focus, and overflow

All rows passed at 1280×900 desktop, 390×844 mobile, and 320×780 narrow mobile.
Tab reached the Home link with visible focus on every route. Keyboard activation
traversed Home → About → Menu → Specials → Contact at each width, with matching
headings and `aria-current="page"`. The navigation wraps at 320px.
Document scroll width equaled viewport width in every route check.

Menu and Specials used a 96-character unbroken offering name and 495-character
unbroken description, within the application's 100/500-character limits. Text
wrapped and the price remained visible without horizontal overflow.

| Route       | Desktop                                                | Mobile                                                | Narrow mobile                                         |
| ----------- | ------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------- |
| `/`         | [Home](./pr39-desktop-home.jpg)                        | [Home](./pr39-mobile-home.jpg)                        | [Home](./pr39-narrow-home.jpg)                        |
| `/about`    | [About](./pr39-desktop-about.jpg)                      | [About](./pr39-mobile-about.jpg)                      | [About](./pr39-narrow-about.jpg)                      |
| `/contact`  | [Contact](./pr39-desktop-contact.jpg)                  | [Contact](./pr39-mobile-contact.jpg)                  | [Contact](./pr39-narrow-contact.jpg)                  |
| `/menu`     | [Menu with long text](./pr39-desktop-menu.jpg)         | [Menu with long text](./pr39-mobile-menu.jpg)         | [Menu with long text](./pr39-narrow-menu.jpg)         |
| `/specials` | [Specials with long text](./pr39-desktop-specials.jpg) | [Specials with long text](./pr39-mobile-specials.jpg) | [Specials with long text](./pr39-narrow-specials.jpg) |

## Controlled feedback and keyboard recovery

All rows passed at all three viewports. Failed requests showed an alert rather
than empty-menu feedback. The retry button had visible keyboard focus; Enter
retried successfully, displayed the offering, and cleared the old error.
No browser JavaScript exceptions were recorded.

| Route and scenario                   | Result                                           | Desktop                                       | Mobile                                       | Narrow mobile                                |
| ------------------------------------ | ------------------------------------------------ | --------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| `/specials`, only ordinary offerings | `No specials are available right now.`           | [Empty](./pr39-desktop-none-special.jpg)      | [Empty](./pr39-mobile-none-special.jpg)      | [Empty](./pr39-narrow-none-special.jpg)      |
| `/menu`, rejected network request    | `Unable to load menu.`; keyboard retry recovered | [Error and focus](./pr39-desktop-network.jpg) | [Error and focus](./pr39-mobile-network.jpg) | [Error and focus](./pr39-narrow-network.jpg) |
| `/menu`, HTTP 500 with non-JSON body | `Unable to load menu.`; keyboard retry recovered | [Fallback](./pr39-desktop-unreadable.jpg)     | [Fallback](./pr39-mobile-unreadable.jpg)     | [Fallback](./pr39-narrow-unreadable.jpg)     |

The [machine-readable results](./pr39-browser-results.json) contain all 27 checks
and measured widths; 24 screenshots are linked above. Next.js's development
indicator appears in the screenshots and is not part of the production interface.
