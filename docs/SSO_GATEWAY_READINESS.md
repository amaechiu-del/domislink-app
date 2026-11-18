# DomisLink SSO Gateway — Readiness and Integration Blueprint

**Issuer target:** `https://sso.domislink.com`  
**Protocol:** OpenID Connect (OIDC), OAuth 2.0 Authorization Code Flow with PKCE (S256)  
**Identity RP ID target:** `domislink.com` for passkeys used on that domain  
**Status:** Church already contains a substantially more complete SSO implementation in `amaechiu-del/domislink-church/services/sso/` on unmerged feature branches. See [Product Integration Contract](PRODUCT_INTEGRATION_CONTRACT.md). The small `gateway/` prototype in this repository is non-canonical and must not be deployed. The Church SSO candidate is not yet production-verified.

## 1. Existing canonical candidate discovered

A source review of `amaechiu-del/domislink-church` found:
- Dedicated Worker at `services/sso/`, intended for `https://sso.domislink.com`.
- OIDC discovery, RS256 JWKS, Authorization Code + PKCE S256, rotating refresh tokens, UserInfo and revocation.
- Client helper with state/nonce/PKCE and cryptographic ID-token signature validation.
- Email/phone OTP, WebAuthn passkeys and password-recovery modules.
- Existing Church relying-party callback/exchange adapter on an SSO feature branch.
- Shared `platform_tenants` and `platform_tenant_memberships` D1 registry, with Church membership synchronization triggers and a protected product-tenant registration endpoint.
- Church client `domislink-church-web` and exact callback `https://church.domislink.com/sso/callback`.

The source is on large unmerged branches (`feature/universal-sso-whatsapp-gateway` and `fix/sso-oauth-security-hardening`), not the inspected `main` branch. The SSO repository's release-gate document explicitly requires deployed Worker parity, secret inventory, read-only migration review, D1 backup, isolated protocol/security tests and rollback planning. No production migration or deploy is authorised by this discovery.

**Decision:** reuse and reconcile the Church `services/sso/` candidate rather than build a second issuer in this One Link repository. One Link becomes a relying-party PWA and account hub. Each app keeps its own local session and tenant/role authorization. The prior generic `gateway/` directory is a sandbox prototype only.

## 2. Existing evidence

### Church Management

The inspected `amaechiu-del/domislink-church` main branch has:
- A Cloudflare Worker / Hono API and D1-backed user, church and membership data.
- A local `/api/auth/register` flow.
- Session lookup joining `sessions`, `users`, `memberships` and `churches`, enforcing active account, membership and church states.
- Random session bearer values whose SHA-256 digests are stored in D1.
- A `dl_church_session` cookie set with `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=...`.
- PBKDF2-SHA256 password hashing (210,000 iterations in the inspected implementation).
- Rate-limiter bindings for account and IP checks in Wrangler configuration.

This is a useful local-session and tenant-authorization foundation. The inspected `src/index.ts` did not establish an OIDC callback or central issuer integration. This is a scoped file inspection, not a complete audit of every branch or file.

### Gateway repository discovery

A search for the SSO gateway repository name and related descriptions returned no repository in the connected `amaechiu-del` or `domislinkint` GitHub account inventories. Code searches for `sso.domislink.com` and common OIDC terms also returned no matching source files in the searched default branches. This means the gateway source was not located through those connected accounts; it does not prove that no other account, workspace or private system contains it.

## 3. Non-negotiable design

- OIDC authenticates a person; it does not grant church/business tenant permissions.
- Every relying application continues enforcing its own membership, role, branch, subscription and object-level authorization.
- Each app creates its own local session after validating the OIDC result. Do not try to share cookies across app domains.
- `domislink.com` and `domislinker.com` are separate registrable domains. Both use redirects to the same issuer and establish separate first-party sessions.
- Never put access tokens, ID tokens, refresh tokens, passwords or one-time codes in URL query strings.
- Do not put bearer or refresh tokens in localStorage or sessionStorage.
- Do not silently link accounts just because two records contain the same unverified email address.
- All redirect URIs, post-logout redirects, origins, client IDs and allowed scopes must be registered and exact-match validated.

## 4. Browser sign-in sequence

1. A user selects “Continue with DomisLink” in an application.
2. The application backend creates a cryptographically random `state`, `nonce` and PKCE verifier/challenge pair, stores the transaction server-side, and redirects to the issuer's authorization endpoint.
3. The user authenticates at `sso.domislink.com`. Google sign-in or additional factors may be offered by the issuer after their integration and recovery controls are verified.
4. The issuer redirects only to the registered callback URI with a short-lived, single-use authorization code.
5. The application backend exchanges the code using the original PKCE verifier and its confidential-client authentication where applicable.
6. The app validates ID token signature against issuer JWKS, exact issuer, audience/authorized party, expiry, issued-at, nonce and expected algorithm. It validates the saved state and consumes the transaction once.
7. The application maps the stable issuer subject (`iss + sub`) to an app-local identity. Account linking requires an explicit, authenticated linking process.
8. The application creates its existing first-party session cookie and continues to evaluate its local tenant permissions on every protected request.

## 5. Existing issuer endpoint contract

| Endpoint | Purpose |
|---|---|
| `/.well-known/openid-configuration` | OIDC discovery metadata |
| `/oauth/authorize` | Authorization request and user authentication |
| `/oauth/token` | Authorization code exchange and refresh grant, if enabled |
| `/oauth/userinfo` | Minimal claims for a valid access token |
| `/oauth/jwks.json` | Public signing keys |
| `/oauth/revoke` | Token/session revocation |
| `/oauth/logout` | User logout and session termination |
| `/health` | Non-sensitive service health |
| `/admin/clients` | Restricted client registration/management; not public self-service initially |

The Church SSO candidate currently publishes `/.well-known/openid-configuration`, `/oauth/authorize`, `/oauth/token`, `/oauth/userinfo`, `/oauth/jwks` and `/oauth/revoke`. Verify the deployed discovery document and behavior against the actual Worker version before connecting clients.

## 6. Shared data model already present

These are logical entities for design review; no migration is applied by this document.

- `identities`: internal user ID, status, created/updated timestamps.
- `identity_emails`: normalized email, verification timestamp, primary flag, unique constraints appropriate to policy.
- `identity_providers`: provider key and issuer metadata, no plaintext provider secrets.
- `provider_accounts`: provider issuer + provider subject + internal user ID; unique on issuer and subject.
- `oidc_clients`: client ID, client type, allowed redirect URIs, post-logout URIs, allowed origins, scopes, status and secret/key reference.
- `authorization_codes`: hashed code, client, subject, redirect URI, PKCE challenge/method, nonce, scopes, expiry and consumed timestamp.
- `sso_sessions`: hashed opaque session identifier, subject, created/expiry/revocation timestamps and risk metadata.
- `consents`: subject, client, scopes, policy version, grant/revoke timestamps.
- `audit_events`: append-only event category, subject/client references, timestamp, outcome and carefully minimized metadata.

Secrets and private signing keys belong in managed secret storage, not D1 plaintext columns, repository files or frontend bundles. Signing keys require rotation and a JWKS overlap period.

## 7. One Link relying-party adapter

1. Add a server-side OIDC client configuration for the Church Worker.
2. Implement login-start and callback routes with PKCE, state and nonce held server-side.
3. Validate tokens using a vetted OIDC/JWT library appropriate for Cloudflare Workers; pin dependencies and test key rotation, malformed tokens and algorithm confusion.
4. Resolve `iss + sub` to a church-local user mapping. First-time linking must require an explicit signed-in account-link flow or a separately verified invitation/recovery process.
5. After identity is established, check the local `users.status`, church status, active `memberships` and branch scope.
6. Create the current D1-backed church session using the existing hashed-token approach and existing cookie policy.
7. Keep existing email/password sign-in as a recovery/transition path until adoption, support and rollback criteria are satisfied.
8. Test logout at both the local app and issuer; ensure an expired/revoked central session does not leave a local session usable beyond its intended policy.

Do not put central issuer signing keys into the Church Worker. The Church app needs issuer public keys/JWKS and its own registered client credentials only where a confidential-client exchange requires them.

## 8. Security and test acceptance

- Authorization request: exact redirect URI and client validation; PKCE S256 mandatory; state and nonce required.
- Callback: reject missing, mismatched, expired and replayed state, nonce or authorization code.
- Tokens: reject wrong issuer/audience, expired/not-yet-valid tokens, invalid signatures, unsupported algorithms and unknown key IDs.
- Sessions: secure cookie flags; opaque high-entropy values; only hashes at rest; expiry, revocation, rotation and logout tests.
- Redirects: reject open redirects, wildcard callback matching and unregistered logout destinations.
- Account linking: require explicit intent and proof of control for both identities; detect collisions and provide support recovery.
- Tenant boundary: SSO user from Church A cannot read or modify Church B data without active membership/permission.
- Branch boundary: branch-scoped staff cannot perform owner-only or cross-branch operations.
- Abuse protections: rate limits, CSRF controls, origin validation, audit logging and anomaly monitoring.
- Availability: gateway outage does not silently bypass app authentication; apps fail closed for new SSO logins and preserve only appropriately bounded existing local sessions.

## 9. Delivery plan

| Phase | Work | Exit evidence |
|---|---|---|
| SSO-0 | Locate/confirm existing gateway source and ownership | Repository or explicit new-repo decision; canonical owner and branch |
| SSO-1 | Finalize OIDC client and claim contract | Discovery/JWKS schema, exact clients and redirect URIs, threat review |
| SSO-2 | Implement issuer Worker + D1 | Unit/protocol tests, rate limit, security review, health route |
| SSO-3 | Integrate Church pilot | Login, callback, account linking, local session, logout and tenant tests pass |
| SSO-4 | Integrate Meet, AI Studio, Business OS and remaining apps | Separate client configs and passing app-by-app tests |
| SSO-5 | Add passkeys / WebAuthn and upstream Google identity | Recovery, origin/RP ID, device revocation and linking tests pass |
| SSO-6 | Production rollout | Protected main deployment, monitoring, key rotation and rollback proven |

## 10. Immediate blocking items

1. Confirm whether the earlier `domislink-sso-gateway` project lives under another GitHub account or workspace; it was not visible in the two connected account inventories checked.
2. If no source exists, create a dedicated gateway repository using the Cloudflare Workers + D1 architecture, with production deployment withheld until the issuer security tests pass.
3. Confirm the canonical user/account model and first-party domain strategy across apps.
4. Begin with Church as the first relying-party integration; do not modify its existing production authentication in advance of a tested migration.
