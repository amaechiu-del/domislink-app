# Milestone 7 — OneLink unified identity gateway

## Current implementation
OneLink now exposes an explicit identity configuration contract and a visible sign-in preparation state. No sign-in or user session is claimed. No application launch is enabled by merely visiting an app details page.

## Secure implementation steps
1. Deploy and validate https://sso.domislink.com/.well-known/openid-configuration, issuer, JWKS, authorization endpoint and token endpoint.
2. Register a **public** OneLink OIDC client with an exact HTTPS redirect URI and PKCE S256; configure allowed origins. Never store client secrets in browser bundles.
3. Prefer a backend-for-frontend session exchange: backend validates authorization code, state, nonce, issuer, audience, signatures and expiry, then issues Secure, HttpOnly, SameSite session cookies. Rotate session IDs; enforce CSRF protection.
4. Integrate Google sign-in, WebAuthn/passkeys and email OTP **at the gateway**, not separately in OneLink. Require phishing-resistant step-up for privileged actions.
5. Map stable OIDC subject to each application's account and tenant membership server-side. Do not infer roles or tenant access from browser data.
6. Implement logout, session expiry, revocation, error handling and account recovery.
7. Test cross-subdomain navigation, redirect allowlists, expired tokens, replay, state/nonce mismatch, cross-tenant denial and sign-out.
8. Only then mark the identity config verified and add the authenticated sign-in flow to OneLink.

Production homepage and current application authentication remain unchanged until the above tests pass.
