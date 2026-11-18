# DomisLink One Link

**One destination for the DomisLink digital ecosystem.**  
Brand line: **The Digital Empire.**  
Intended primary domain: `https://domislink.com` (deployment and DNS must be verified separately).

One Link is the unified app directory and, over time, the identity gateway into DomisLink services. It is being prepared as a responsive, installable Progressive Web App (PWA).

## Current scope in this repository

- A polished mobile-first app directory using the DomisLink gold / dark visual identity.
- Search and category filtering across the known DomisLink products.
- Personal app launcher views for All Apps, Pinned and Recent.
- Device-local pinned favourites and a six-app recent history; no account or sensitive data is stored there.
- Status-aware launch controls that disable products still marked Preparing for launch.
- Automated Node.js tests for preference validation, local persistence, de-duplication and recent-list limits.
- Registry-driven product cards with explicit verification states.
- Product detail dialogs with target audience, capabilities, product address, readiness note and source repository.
- Native PWA manifest, install prompt and an offline shell.
- Product and technical integration plan in `docs/ONE_LINK_FOUNDATION.md`.

## Important status rules

- **Connection check pending**: a product destination is known, but its production availability, sign-in, authorization and core workflows have not passed an end-to-end verification.
- **Preparing for launch**: no production destination is confirmed.
- **Verified live**: only use after a dated health check and successful sign-in / authorization / key workflow checks.
- The presence of an app card is not evidence that the target app is deployed or working.
- Unified SSO is a roadmap capability. Do not represent it as active until the central gateway and each relying application complete the integration tests.

## Technology

- Vite and vanilla JavaScript.
- Static assets and native browser PWA APIs; no third-party PWA runtime is required.
- Designed for Cloudflare Pages hosting. Confirm Pages build settings and custom-domain routing before production cutover.
- The identity gateway is expected to use OpenID Connect authorization-code flow with PKCE and Cloudflare Workers / D1 according to the architecture document.

## Local development

```bash
cd frontend
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Deployment target

- Repository: `amaechiu-del/domislink-app`
- Branch for this preparation: `feature/one-link-unified-portal`
- Intended public URL: `https://domislink.com`
- Hosting: Cloudflare Pages (target; not asserted as configured by this change).

Configure the Pages project with the repository, the intended production branch, build command `npm install && npm run build`, and output directory `dist` (working directory `frontend`). Verify DNS, TLS, redirects, caching headers and rollback before switching production traffic. Do not deploy this feature branch to the production domain.

## Product registry

Edit `frontend/src/data/subdomains.js`. Each entry includes an app id, name, category, domain, URL, description, status and optional repository. Use `status: "verify"` until a live test proves the app works. Never add credentials or private API keys to this file.

## Next work

1. Audit each target repository and deployed URL; record evidence and date.
2. Establish the central SSO gateway at `sso.domislink.com`.
3. Integrate one relying app at a time using OIDC + PKCE, tenant-aware authorization and server-side token validation.
4. Add account linking, passkeys / WebAuthn and recovery flows after the base SSO path passes tests.
5. Add account-synchronised favourites after SSO is complete.
6. Test all app journeys on mobile, desktop and installed PWA before production release.

See [docs/ONE_LINK_FOUNDATION.md](docs/ONE_LINK_FOUNDATION.md) for architecture, app audit and release gates.
