# Pause & Pour content verification

Approved conversation brief, October 13, 2026: introduce a fictional neighborhood
café called Pause & Pour; static Home with Menu and Specials links; a short About
story; Contact with clearly illustrative weekday 7am–5pm and weekend 8am–4pm hours;
shared navigation/footer disclosure; one generated local café image. The later
direction takes priority: fewer colors, one font, no uppercase styling, less content.

## Files and routes

| File                                                           | URL or use           | Mechanism                                                                |
| -------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| `src/app/page.tsx`                                             | `/`                  | Static page with local image and two links; no database dependency       |
| `src/app/about/page.tsx`                                       | `/about`             | Page with brief fictional story and student-demo notice                  |
| `src/app/contact/page.tsx`                                     | `/contact`           | Page with demo disclosure and sample hours                               |
| `src/app/layout.tsx`                                           | Shared               | Layout renders Navbar, page content, and Footer; site metadata           |
| `src/components/Navbar.tsx`                                    | Shared               | Component retains five routes and active-page indication, adds shop name |
| `src/components/Footer.tsx`                                    | Shared               | Component with five public links and fictional-shop disclosure           |
| `src/app/globals.css`                                          | Shared               | Global Arial font, three palette variables, focus outline, page height   |
| `src/styles/shop.module.css`                                   | Home, About, Contact | CSS Module for simple responsive layouts                                 |
| `src/styles/navbar.module.css`, `src/styles/footer.module.css` | Shared               | CSS Modules for navigation and footer                                    |
| `src/styles/offerings.module.css`                              | `/menu`, `/specials` | Existing CSS Module uses shared palette and removes uppercase styling    |
| `public/images/pause-and-pour-cafe.webp`                       | Home image           | Local 1672×941 WebP, 149,528 bytes, generated using built-in imagegen    |
| `CONTEXT.md`, `README.md`                                      | Documentation        | Fictional shop definition, content boundaries, image provenance          |

## Verification

The final implementation was checked using the local production build at
`http://localhost:3001`. This is not deployment or live Atlas evidence.

- `npm run preflight` passed lint, typecheck, all 185 tests, and the production build.
  The initial run had two timeouts in existing HTTP unit tests while the development
  preview was running. Both files passed a focused rerun (81 cases); the complete
  final gate passed with the development server stopped. No test thresholds changed.
- Standards review: no blocking findings. Spec review: no blocking findings.
- All five public routes passed at 1280×900, 390×844, and 320×780. Scroll width
  matched available document width, headings inherited Arial, no public elements
  used uppercase text transformation, and the footer disclosure appeared everywhere.
  Measurements: [checks.json](./checks.json).
- Keyboard Tab displayed a 3px focus outline on the brand link. Tab from the primary
  action reached Specials with visible focus. Enter activated Menu, Specials, and
  footer Contact and reached the correct route. Results: [keyboard.json](./keyboard.json).
- The hero image loaded successfully and had descriptive alternative text.
- Menu and Specials displayed their existing unavailable/retry state because the
  local database was unavailable. Their saved-data behavior remains covered by the
  existing unit and real HTTP regression suites; these browser checks do not prove
  local or deployed database connectivity.

## Screenshots

| Page    | Desktop                             | Mobile                             |
| ------- | ----------------------------------- | ---------------------------------- |
| Home    | [Screenshot](./home-desktop.png)    | [Screenshot](./home-mobile.png)    |
| About   | [Screenshot](./about-desktop.png)   | [Screenshot](./about-mobile.png)   |
| Contact | [Screenshot](./contact-desktop.png) | [Screenshot](./contact-mobile.png) |

Image prompt: warm editorial landscape photograph of an espresso-brown ceramic
coffee cup on a wooden table beside a sunny café window, softly blurred café seating,
cream/espresso/terracotta colors, natural light, no people, lettering, logos, or watermarks.
