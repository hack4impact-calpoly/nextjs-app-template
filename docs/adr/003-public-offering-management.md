# Public offering management for Milestone 3

Status: accepted for the implementation branch on October 7, 2026.

Brian approved implementing the Milestone 3 plan, including controlled management access and additional update/delete operations. This supersedes Milestone 2's local-only write restriction for this release.

Customer pages and GET offerings are public. Management uses private HTTP Basic team credentials over HTTPS in deployment. Proxy provides the browser challenge, while the server page and each write handler independently enforce access. Missing or placeholder configuration denies access. Browser writes from another origin are rejected. Secrets are read only on the server.

This student release intentionally has no individual accounts, roles, session database, or password recovery. Browsers cache Basic credentials; ending the browsing session is the practical sign-out mechanism. Individual staff access is a separate future design.

Brian also approved a supported framework upgrade after the production dependency audit found critical vulnerabilities in Next.js 14. The release uses Next.js 16, React 19, Node.js 24, ESLint flat configuration, asynchronous request APIs, and `proxy.ts`. The plan and deployment guide record verification and release boundaries.
