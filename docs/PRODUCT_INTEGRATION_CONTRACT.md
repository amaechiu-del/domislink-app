# DomisLink One Link — Product Integration Contract

**Review date:** 18 November 2026  
**Primary One Link repository:** `amaechiu-del/domislink-app`  
**Church integration source reviewed:** `amaechiu-del/domislink-church`  
**Canonical issuer target:** `https://sso.domislink.com`  
**Status:** Architecture and source review only. No live SSO connection, migration, secret change or deployment was performed.

## 1. Executive decision

Do **not** build a second, competing identity platform inside One Link. The Church repository already contains a much more complete Universal SSO implementation under `services/sso/`, together with app-specific OIDC client helpers, passwordless identity methods, passkeys and a shared product-tenant registry.

Treat the Church SSO implementation as the **existing canonical candidate** for DomisLink Universal Identity, subject to branch reconciliation and the explicit production release gate. The smaller `gateway/` implementation previously added inside `domislink-app` is a development prototype, not the preferred issuer and must not be deployed or used to register production applications.

One Link should become the user-facing launcher and account experience. The SSO Worker should own identity authentication, verification and central sessions. Each app should continue to own its domain data, local session and tenant/role authorization.

## 2. What exists in DomisLink Church

### Main branch baseline

The inspected `main` branch is a React + TypeScript + Vite product with a Hono Cloudflare Worker API, D1 and R2. Its local authentication foundation includes:

- Passwords hashed with PBKDF2-HMAC-SHA-256 (210,000 iterations and a unique random salt).
- High-entropy opaque session tokens; only SHA-256 digests are stored in D1.
- HttpOnly, Secure, SameSite=Lax `dl_church_session` cookie, currently with a seven-day expiry.
- Server-side session lookup joining user, church, membership and active-status records.
- Church/tenant identity derived from the session, not a client-supplied church ID.
- Role and branch scope enforced by the Church API.
- Origin checks and credentialed CORS limited to the configured application origin.
- Account/IP rate-limiter bindings in Wrangler configuration.

The local session and membership/role model is valuable and should be preserved through an SSO migration.

### Universal SSO work found on feature branches

The Church repository contains:
- `services/sso/src/index.ts`: dedicated SSO Worker with OIDC discovery, RS256 JWKS, authorization-code flow, mandatory PKCE S256, one-time authorization codes, access tokens, rotating refresh tokens, UserInfo and revocation.
- `services/sso/client/oidc.ts`: browser client helper for starting authorization, saving state/nonce/PKCE verifier, exchanging the code, checking ID-token claims and verifying the ID-token signature against JWKS.
- `services/sso/client/auth.ts`: email OTP, phone OTP and WebAuthn passkey registration/sign-in helpers.
- `services/sso/src/passkeys.ts`: server-side WebAuthn flows and credential verification.
- `services/sso/src/identity-channels.ts`: email and phone verification flows.
- `services/sso/src/password-recovery.ts`: password recovery flow.
- `services/sso/src/google.ts` was not present on the reviewed SSO-hardening branch path; Google federation must be verified separately rather than assumed complete.
- `services/sso/src/pwa.ts`: installable identity PWA shell.
- `services/sso/wrangler.jsonc`: dedicated Worker `domislink-sso-gateway`, custom domain `sso.domislink.com`, and D1 binding to the Church database.

The first registered OIDC client is:
- Client ID: `domislink-church-web`
- Redirect URI: `https://church.domislink.com/sso/callback`
- Supported scopes in the issuer: `openid profile email phone`
- OIDC callback and client helper are already part of the Church feature implementation.

### Existing Church relying-party adapter

A feature branch also contains:
- `POST /api/auth/sso/exchange`: accepts the access token, calls the issuer UserInfo endpoint server-to-server, checks the expected Church client audience and subject, verifies the local account and creates a normal Church session.
- `POST /api/auth/sso/register-church`: consumes a short-lived, one-time, hashed setup token to create the first Church workspace for a verified identity without creating a duplicate user/password.
- The existing Church session and local permission model remain in force after exchange.

This is the right adapter pattern to preserve: central identity first, then a Church-specific local session, then normal Church membership/role/branch authorization.

## 3. Branch and release state

The Universal SSO code is not part of the inspected `main` baseline.

- `feature/universal-sso-whatsapp-gateway` compares as 642 commits ahead of `main` and adds a large set of product milestones, migrations 0012–0042, the SSO Worker, Church callback adapter and other application features.
- `fix/sso-oauth-security-hardening` compares as 663 commits ahead and one commit behind `main`; it includes the later SSO hardening/recovery work, including migration 0043 and `docs/milestone-43e-sso-release-gate.md`.
- These are large development/release branches, not evidence that the work is merged to `main`, migrated to remote D1 or deployed to the custom domain.
- The Church release gate explicitly says preparation only and prohibits deployment/migration until the evidence checklist is satisfied.

Do not merge either large branch blindly. Reconcile the two branch histories, preserve the intended product milestones and select one reviewed SSO implementation as the canonical release candidate.

## 4. Shared identity and tenant model already prepared

Migration `0040_universal_sso_whatsapp.sql` defines:
- `sso_clients`, `sso_sessions`, `sso_authorization_codes`, `sso_access_tokens` and `sso_refresh_tokens`.
- `platform_tenants` keyed by `product_key + resource_id`.
- `platform_tenant_memberships` keyed by tenant and user.
- D1 triggers that mirror existing Church workspaces and memberships into the central platform registry.
- A seeded public OIDC client for Church.

Migrations `0041` and `0042` add verified-phone and WebAuthn tables plus atomic OTP rate-limit counters. Migration `0043` adds a password-recovery token table; the release checklist notes a difference between this proposed table and a separately reported live recovery implementation. That discrepancy must be reconciled before applying the migration.

This registry is the intended extension point for more products. The documented protected issuer endpoint `POST /admin/tenants` can register a product workspace and its owner membership for products outside Church. It must be called only from a trusted product backend using the admin credential—never from a browser.

## 5. Recommended One Link ↔ SSO ↔ app flow

1. Visitor opens One Link PWA. Public app discovery remains available without sign-in.
2. Visitor selects **Sign in** or opens a protected app action.
3. One Link redirects to `sso.domislink.com` using the registered OIDC Authorization Code + PKCE S256 flow.
4. SSO verifies the identity by an enabled method (password, email OTP, phone OTP or passkey).
5. Issuer redirects to the exact registered One Link callback with a single-use authorization code and state.
6. One Link validates state, exchanges the code, validates ID-token signature/issuer/audience/expiry/nonce and establishes its own first-party session.
7. When the user opens Church, Church uses its own registered OIDC client and exact callback, then calls its server-side SSO exchange endpoint.
8. Church creates its existing `dl_church_session` cookie and resolves the user's active Church membership, role and branch scope.
9. Other products follow the same pattern with their own client ID, callback and local session adapter.
10. On logout, each app clears/revokes its local session and calls the central issuer logout/revocation flow as specified by the shared protocol.

Do not use cross-subdomain cookies as the integration mechanism. The issuer cookie is host-only on `sso.domislink.com`; each relying app gets its own local cookie. The same OIDC issuer can serve both `domislink.com` and `domislinker.com` products through explicit redirect registrations.

## 6. Future product integration contract

Every product that joins One Link must supply the following integration metadata:

| Contract item | Requirement |
|---|---|
| Product key | Stable lowercase identifier, e.g. `church`, `meet`, `ai-studio`, `business-os` |
| Product tenant | Product-local tenant/workspace ID, registered centrally |
| OIDC client | Unique public client ID and exact callback URI; use PKCE S256 |
| Origins | Exact approved HTTPS origins; do not rely on unrestricted wildcard subdomain trust |
| Subject mapping | Stable issuer + subject (`iss + sub`) mapped to a local app user |
| Local session | App-specific HttpOnly, Secure cookie/session; no long-lived token in localStorage |
| Authorization | Product-local membership, roles, branch/team/project and object access checked on every API request |
| Provisioning | Trusted server calls central tenant registry; browser never gets SSO admin credentials |
| Logout | Local session revoked plus central logout/revocation according to protocol |
| Entitlements | Subscription/usage checks remain in the owning app or approved billing service |
| Audit | Identity link, tenant join/leave, role change and privileged events recorded by the owning service |

### Suggested next client registrations

Register only after each app has a real callback and server adapter:
- One Link portal: `https://domislink.com/sso/callback`
- Meet: `https://meet.domislink.com/sso/callback`
- AI Studio: `https://studio.domislink.com/sso/callback`
- AI Business OS: `https://dabo.domislink.com/sso/callback`
- Air Ticketing: callback after its product foundation exists
- Store: callback after its source and checkout are verified
- Property Marketplace: callback after the product is built
- WhatsApp Business OS: use its product's authenticated backend; WhatsApp Embedded Signup is a separate provider authorization and must not be conflated with DomisLink OIDC.

These are planned URI examples. They must be registered exactly when the corresponding app implements the callback.

## 7. Important architecture boundaries

- SSO authenticates a person; it does not grant product tenant roles.
- A user may belong to several product tenants. Each product must select the relevant tenant/workspace and verify that user's membership there.
- Do not assume every app shares the Church D1 database. Church currently points the SSO Worker to `domislink-church-db`; a future product with a separate database must map the central `iss + sub` to its own local user record.
- Do not let a browser call `/admin/tenants` or expose `SSO_ADMIN_API_KEY`, `SSO_INTERNAL_API_KEY`, OIDC private keys, Resend/Termii keys or WhatsApp encryption keys.
- Do not make account profile, email or phone claims available unless verified and covered by the requested OIDC scope.
- Do not mix Church giving, marketplace transactions, app subscriptions and DomisLink platform revenue.
- One Link's account overview should aggregate information through authenticated, app-specific APIs; UserInfo is identity claims, not a cross-product billing or profile database.
- Keep PWA/service-worker caches limited to public app shell assets. Do not cache identity endpoints, authorization callbacks, account payloads or tokens.

## 8. Issues requiring reconciliation before reuse

1. **Branch divergence:** reconcile `feature/universal-sso-whatsapp-gateway` and `fix/sso-oauth-security-hardening`; do not assume one contains all the other's fixes.
2. **Mainline gap:** the existing SSO issuer and adapter are not on the inspected `main` branch; establish a reviewed PR and merge plan.
3. **Production parity:** compare actual deployed SSO Worker version/bundle and secret names/bindings with GitHub source. The Church release gate states that live Worker/source parity and some provider secrets are not yet verified.
4. **D1 state:** inspect remote migration history read-only, back up D1 and resolve the `0043` recovery-schema discrepancy before any migration.
5. **Origin allowlist:** the SSO source automatically accepts HTTPS origins under `*.domislink.com`. Before onboarding many products, prefer exact origins bound to enabled OIDC clients and consider the `domislinker.com` apps explicitly. A blanket subdomain trust rule increases the impact of a compromised or abandoned subdomain.
6. **OIDC token validation:** preserve signature verification against JWKS, exact issuer/audience, expiry, nonce, state and PKCE. Add tests for unknown `kid`, key rotation, missing/mismatched nonce, reused code, concurrent token exchange, revoked/rotated refresh token and wrong-client token use.
7. **Logout/revocation:** confirm issuer session termination, access-token revocation and refresh-token rotation behavior across every app; clearing a browser tab is not remote logout.
8. **Google:** the reviewed helper path was not present on the SSO hardening branch; verify whether Google OAuth is implemented elsewhere before presenting Google sign-in as available.
9. **Passkey recovery:** verify device removal, passkey loss, account recovery and step-up protection; do not make biometrics the only recovery method.
10. **Build verification:** root Church `npm run build` checks the Church front end, not necessarily the SSO Worker. Run isolated SSO Wrangler dry-run/build and protocol tests after runner availability is restored.

## 9. Recommended implementation order

- **I0 — Source-of-truth decision:** designate Church `services/sso/` as the canonical SSO candidate; mark One Link's duplicate `gateway/` prototype as non-canonical and do not deploy it.
- **I1 — Branch reconciliation and security review:** merge/port only reviewed SSO changes onto an auditable release branch; preserve Church's current authentication until the adapter passes.
- **I2 — Issuer validation:** verify D1 schema, deployed Worker parity, secrets, callback registration, JWKS, OIDC protocol/security tests and recovery.
- **I3 — Church pilot:** validate email/phone OTP, passkeys, OIDC callback, SSO exchange and preservation of Church role/branch checks in isolated D1.
- **I4 — One Link relying party:** add the One Link client and callback, create an app-specific session and expose Account Centre identity data from a server-side session.
- **I5 — Product adapters:** Meet and AI Business OS next; then AI Studio and additional products as their backend foundations are ready.
- **I6 — Account hub:** aggregate connected-app status, sessions, preferences, notifications and product billing via scoped backend APIs.
- **I7 — Production rollout:** custom domain, provider approval, key rotation, monitoring, rollback and production acceptance.

## 10. Release safety

This review did not change Church files, execute Wrangler, apply a D1 migration, configure secrets, deploy Workers, connect a live account or modify production authentication. The current Church SSO release gate remains authoritative until all listed evidence is complete.
