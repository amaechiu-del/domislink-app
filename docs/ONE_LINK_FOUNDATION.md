# One Link — Product, Identity and Release Foundation

## 1. Product definition

One Link is the front door to the DomisLink ecosystem. It has three jobs:

1. **Discover:** make every real DomisLink product easy to find from one responsive app directory.
2. **Enter:** progressively provide one secure identity and a consistent account/session experience.
3. **Continue:** let people move between permitted apps without repeated friction while preserving each app's tenant boundary and authorization rules.

One Link is not a claim that every app is already operational, nor that SSO is already deployed. The directory's verification labels must reflect evidence, not aspiration.

## 2. Identity and domain model

### Central identity

- Issuer target: `https://sso.domislink.com`.
- Protocol: OpenID Connect (OIDC), authorization-code flow with PKCE.
- Client applications: each app registers its exact redirect URIs, allowed origins, logout URIs and required scopes.
- Token handling: validate issuer, audience, signature, expiry, nonce and state on the server; do not treat client-side user objects as proof of authentication.
- Session: secure, HttpOnly cookies issued by the gateway; use short-lived access tokens and controlled refresh / revocation.
- Recovery and step-up: email/phone OTP and WebAuthn/passkeys can be added with rate limits, origin/RP ID checks, recovery controls and audit events.
- Google sign-in may be an upstream identity provider; it must resolve to a stable DomisLink subject, not a second disconnected account.

### Critical cross-domain rule

`domislink.com` and `domislinker.com` are different registrable domains. A browser cookie scoped to one cannot be shared with the other. Apps on `domislinker.com` must use a normal OIDC redirect to the same issuer and establish their own local session. Do not attempt to widen cookie scope across both domains or pass bearer tokens in query strings.

### App authorization

SSO proves identity, not permission. Each app remains responsible for:
- tenant / church / business membership and role checks;
- object-level authorization and data isolation;
- subscription entitlements and usage limits;
- server-side validation of every privileged API request;
- logout, session revocation and account suspension behavior.

## 3. App registry and audit policy

The registry is maintained in `frontend/src/data/subdomains.js`.

| Product | Intended URL | Registry state | Current evidence |
|---|---|---|---|
| Church Management | church.domislink.com | Connection check pending | Repository exists; runtime not verified in this change |
| DomisLink Meet | meet.domislink.com | Connection check pending | Repository exists; runtime not verified in this change |
| AI Studio | studio.domislink.com | Connection check pending | Repository and roadmap exist; runtime not verified in this change |
| Aviation Safety Summit | summit.domislink.com | Connection check pending | Summit repository exists; post-event/runtime state needs review |
| Air Ticketing | airticket.domislink.com | Connection check pending | Flight repository exists; booking flow not verified |
| DomisLink Store | store.domislink.com | Connection check pending | Store repository exists; checkout not verified |
| WhatsApp Business OS | wa.domislinker.com | Connection check pending | Domain is part of product plan; runtime not verified |
| Property Marketplace | propertymarketplace.domislinker.com | Connection check pending | Real-estate repository exists; runtime not verified |
| Practice & Learning | practice.domislinker.com | Connection check pending | Product URL known; runtime not verified |
| AI Business OS | Not confirmed | Preparing for launch | Repository exists; public production URL not confirmed |

A product becomes **Verified live** only after the following evidence is recorded:
1. DNS resolves to the intended host and TLS is valid.
2. Public health route returns the expected success response.
3. Sign-in and sign-out work, including session expiry and recovery.
4. A representative core workflow succeeds.
5. Tenant/role isolation tests pass for protected apps.
6. The test date, commit/deployment identifier and result are recorded.

A card being visible or a URL returning HTTP 200 is not enough.

## 4. Target architecture

- **One Link web/PWA:** Cloudflare Pages; static app directory, web manifest, service-worker shell cache.
- **Identity gateway:** Cloudflare Worker at `sso.domislink.com`.
- **Identity store:** Cloudflare D1 for users, identity links, OAuth clients, sessions, consent and audit metadata.
- **Cryptographic keys:** managed secrets / key rotation; never committed to GitHub or exposed in frontend bundles.
- **App APIs:** each app verifies OIDC tokens or a trusted gateway assertion server-side and applies its own tenant authorization.
- **Files:** Cloudflare R2 where application workflows require object storage.
- **Build/deploy:** GitHub branch checks and Cloudflare Pages/Workers deployment; production deploy only from verified commits on the protected production branch.

## 5. Delivery milestones

### M0 — Portal foundation (this branch)
- [x] Reframe the existing app directory as One Link.
- [x] Replace speculative legacy app cards with the known product registry.
- [x] Add explicit unverified / planned states.
- [x] Add search and category filters.
- [x] Add installable PWA metadata, install affordance and offline shell.
- [ ] Run a clean production build and browser smoke test.
- [ ] Review contrast, keyboard navigation and mobile installed behavior.

### M1 — App inventory and live verification
- [ ] Inspect each listed repository, its default branch, workflow and deployment config.
- [ ] Verify DNS/TLS/health and representative user journeys.
- [ ] Mark only passing destinations as verified live.
- [ ] Identify duplicates, abandoned prototypes and apps that need rebuilding.
- [ ] Do not delete or archive repositories until ownership, data and deployment dependencies are confirmed.

### M2 — Identity gateway
- [ ] Deploy issuer discovery and JWKS endpoints.
- [ ] Implement OIDC authorization-code + PKCE and client registration.
- [ ] Implement secure session, logout, revocation and audit trail.
- [ ] Add abuse controls, rate limiting, CSRF protections and safe redirect allowlists.
- [ ] Add automated protocol and security tests.

### M3 — First-party SSO integration
- [ ] Integrate one app first (Church Management is the proposed pilot).
- [ ] Verify login, callback state/nonce, token validation, local session, logout and role mapping.
- [ ] Add Meet and AI Studio only after the pilot passes.
- [ ] Integrate `domislinker.com` apps using OIDC redirects, never cross-domain cookies.

### M4 — Account and device experience
- [ ] Account profile and linked identity management.
- [ ] WebAuthn/passkeys with recovery and device revocation.
- [ ] Google identity linking and verified email/phone.
- [ ] User-controlled app launcher and recent apps.
- [ ] Consistent consent, privacy and session settings.

### M5 — Production release
- [ ] Domain and Cloudflare Pages configuration verified.
- [ ] Production checks on the protected `main` branch.
- [ ] Security, accessibility, performance and PWA install checks pass.
- [ ] Rollback plan and monitoring are documented.
- [ ] No production cutover until all release gates pass.

## 6. Security and product guardrails

- Never store passwords or long-lived bearer tokens in localStorage.
- Never put API secrets, private keys or session tokens in Vite `VITE_*` variables.
- Never trust a client-side admin flag, tenant id or subscription flag.
- Never accept arbitrary post-login redirect URLs.
- Do not silently merge accounts based only on matching display names.
- Do not imply SSO is live until each app's server verifies identity and permissions.
- Keep the portal directory usable without login; require login only for protected app actions.

## 7. Immediate next action

Complete the app-by-app repository and deployment audit (M1). That audit determines which products can be linked as-is, which need configuration repairs, which require a rebuild, and which should be archived after dependency review.


## 8. Repository inventory — first-pass findings (18 November 2026)

This review inspected repository README and package metadata through the connected GitHub account. It did **not** inspect every source file, deployment environment, Cloudflare resource, live domain or production database. Therefore, classifications below are source-repository findings, not production health claims.

| Product / repository | Evidence found | First-pass classification | Required next action |
|---|---|---|---|
| Church Management — `amaechiu-del/domislink-church` | React + TypeScript + Vite frontend; Hono Worker API; D1/R2 stack; test, typecheck and build scripts; domain documented as `church.domislink.com` | **Keep and repair / verify** | Inspect latest CI, production Worker and Pages configuration, remote D1 migrations, secrets, then run sign-in, tenant-isolation and giving workflows |
| Meet — `amaechiu-del/domislink-international` | Separate `apps/web` and `apps/api` workspaces; typecheck, API tests and deployment-config validation scripts; README explicitly says initial foundation and production setup required | **Keep; continue building** | Audit source completeness, tests and Cloudflare deployment configuration; do not label production-ready |
| AI Studio — `amaechiu-del/domislink-ai-studio` | README and roadmap describe a deterministic prompt-planning prototype; explicitly says real generation, persistence, visual editor, Gemini, metering and deployment automation remain unverified | **Keep; prototype / build** | Compare progress tracker with source tree; implement the missing production capabilities milestone by milestone |
| AI Business OS — `amaechiu-del/ai-business` | React/Vite frontend and Worker API workspaces, unit/security tests and staging preflight tooling; README says early implementation and identifies PocketBase | **Keep; architecture reconciliation required** | Resolve the documented PocketBase direction against the approved D1/R2 plan; inspect migration branch, auth, tenant isolation and deployed staging before production |
| Aviation Safety Summit — `amaechiu-del/summit` | React 19/Vite app, Express server, file-based JSON persistence, Gemini and Paystack dependencies; summit date documented as 17 November 2026 | **Keep as event archive / assess** | Preserve summit records; assess whether it remains a live secretariat or becomes a read-only event archive; plan a durable data/backend migration before ongoing production use |
| Air Ticketing — `amaechiu-del/flight-ticket` | README currently contains only a title | **Rebuild / investigate** | Check remaining files and any live deployment before deciding whether this is a reusable starter or a new build |
| Store — `amaechiu-del/domislinkstore` | README was not found in this review | **Investigate** | Inspect repository contents, latest commits, actual build and deployment before linking |
| Property — `amaechiu-del/-domislink-realestate` | README explicitly says “realestate app - to be built” | **Build required** | Do not link a user-facing production destination yet; create the real application foundation |
| Webhook integration — `amaechiu-del/domislink-webhook` | README describes a general Node webhook receiver with HMAC/shared-secret verification and provider-neutral deployment options | **Keep as supporting infrastructure** | Review authentication, signature validation, replay/idempotency and deployment; do not list as an end-user app |
| Static website — `amaechiu-del/domislink-www` | README describes a plain static landing page / PWA with GitHub Pages deployment | **Consolidate / compare** | Compare it with One Link and the existing `domislink-app` portal; identify canonical domain ownership and avoid maintaining multiple competing homepages |
| `amaechiu-del/domislink-clean` | GitHub reports repository is empty | **Empty / candidate archive** | Confirm no external deployment or future purpose before archiving |
| `amaechiu-del/dom islink-admin` | README lookup did not resolve in this pass | **Unverified** | Check exact repository identity and source content before assigning a role |

### 8.1 Important corrections to the app directory

- Air Ticketing now points its repository reference to `flight-ticket` and is labelled **Preparing for launch** because the available README is only a title.
- Store now references the actual listed repository name `domislinkstore`; it remains **Preparing for launch** pending source review.
- Property Marketplace is retained in the product roadmap but its destination is not exposed as an active link because the located repository says the app is still to be built.
- AI Business OS uses its documented product URL `https://dabo.domislink.com`, but remains unverified and carries an explicit architecture-reconciliation warning.
- The Summit remains represented as an event product, but its post-event role needs a decision and its current Express/file-based backend should not be treated as the approved long-term platform architecture.

### 8.2 No destructive repository actions

This first pass does not delete, archive, transfer or overwrite any product repository. A repository can appear unused while still holding production data, custom-domain configuration, deployment secrets, DNS dependencies or user records. Require a deployment/dependency check and backup plan before any destructive cleanup.

### 8.3 Priority order from the audit

1. **Church Management:** verify production and complete the first SSO pilot readiness review.
2. **Meet:** complete its core foundation and safety/security implementation.
3. **AI Business OS:** settle D1/R2 migration and authentication architecture before further production claims.
4. **AI Studio:** move from planning prototype to real generation and deployment capabilities.
5. **Summit:** preserve event data and decide archive versus ongoing secretariat.
6. **Air Ticketing, Store and Property:** inspect remaining repository contents and rebuild where no usable application exists.
7. **One Link / domislink-www:** consolidate to one canonical public entry point.



### 8.4 Repeatable endpoint check

Run from PowerShell or a terminal with outbound internet access:

```powershell
cd frontend
npm run verify:apps
```

The script `scripts/check-app-endpoints.mjs` checks each registry URL that is not marked planned. It records the HTTP response, host, elapsed time and final URL. A timeout or DNS failure is reported as unreachable from that machine/network only. An HTTP response is not authentication or application acceptance evidence; complete the sign-in, role/tenant and representative workflow checks separately. The command does not change product readiness labels or deploy anything.
