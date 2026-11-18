# DomisLink SSO Gateway — foundation

This directory contains the first Worker/D1 issuer implementation for `https://sso.domislink.com`.

**Status: development foundation only. Do not point production applications at this issuer yet.** The gateway requires a real D1 database, an RSA signing-key pair, provisioned identities and OIDC clients, security review, integration tests and a protected production deployment before launch.

## Implemented in this foundation

- OIDC discovery document.
- RS256 JWKS publication from a Worker signing-key secret.
- D1-backed identity, verified-email metadata, password hashes, OIDC clients, SSO sessions, authorization codes and audit events.
- Password login to an HttpOnly, Secure, host-only `__Host-` SSO cookie.
- Authorization-code endpoint with exact registered redirect URI matching, mandatory PKCE S256, required state and nonce, short-lived one-time codes.
- Token exchange for public PKCE clients, one-time code consumption and RS256 ID token issuance.
- Local SSO logout and health endpoint.

## Not yet implemented / not launch-ready

- Confidential OIDC client authentication.
- Access-token issuance as an independently verifiable JWT or opaque introspection-backed token (the current access token field is a random placeholder and must not be relied on by applications).
- UserInfo, refresh tokens, token revocation endpoint and RP-initiated GET logout semantics.
- Self-service registration, email verification, password reset, MFA, WebAuthn/passkeys and Google identity federation.
- Login CSRF token / authenticated device and recovery UX beyond exact Origin enforcement.
- Rate limiting, bot protection, anomaly detection, audit retention/rotation, key rotation automation and complete protocol/security test suite.
- Production D1 resource creation, custom domain, secret configuration and monitoring.

**Relying applications must not use the current access token.** Treat this as an integration sandbox until access-token validation, client authentication, security controls and tests are completed. The issued ID token is also for protocol development only until an independent OIDC conformance and security review succeeds.

## Setup

1. Create the D1 database named `domislink-sso-db` in the target Cloudflare account.
2. Replace the placeholder `database_id` in `wrangler.jsonc` with the real database ID.
3. Apply migrations: `npm run db:migrate:local`, test locally, then `npm run db:migrate:remote` only after reviewing the remote target.
4. Generate an RSA private key (PKCS#8 PEM) and matching KID. Store the private key with `wrangler secret put OIDC_SIGNING_PRIVATE_KEY`; set `OIDC_SIGNING_KID` as a Worker variable. Never commit the private key.
5. Configure `LOGIN_ALLOWED_ORIGINS` with an exact JSON array of trusted One Link origins.
6. Provision identities and public clients using reviewed, audited admin scripts/SQL; never enable public client self-registration.
7. Run typecheck, unit, protocol, negative and end-to-end tests before connecting any app.

## Register a public PKCE client

Insert a client through a reviewed administrative operation. Example local/dev record (replace values):

```sql
INSERT INTO oidc_clients
(client_id, client_name, client_type, redirect_uris_json, post_logout_redirect_uris_json, allowed_origins_json, allowed_scopes_json)
VALUES
('one-link-dev', 'DomisLink One Link (development)', 'public',
 '["https://domislink.com/auth/callback"]',
 '["https://domislink.com/"]',
 '["https://domislink.com"]',
 '["openid","profile","email"]');
```

Never use wildcards in redirect URIs or origins. Production clients must be reviewed individually.

## Domain handling

`domislink.com` and `domislinker.com` cannot share a browser cookie. Each app redirects to this issuer and establishes its own local session after verifying the OIDC response. The issuer's `__Host-` cookie is host-only.

## Deployment

The Worker is intentionally not deployed. Once the security acceptance list is complete, use a separate production release from a protected branch and attach the custom domain `sso.domislink.com`.
