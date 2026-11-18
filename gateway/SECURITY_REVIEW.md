# Gateway security review — pre-production blockers

- [ ] Replace the placeholder access token returned by `/oauth/token` with a verifiable JWT or a securely introspected opaque token. Do not integrate relying apps before this is done.
- [ ] Implement confidential-client authentication, including hashed client-secret storage and rotation.
- [ ] Add explicit CSRF protection for login and logout forms; exact Origin checks are not a full CSRF defence by themselves.
- [ ] Add rate limits on login, authorize and token routes, plus abuse monitoring.
- [ ] Add full OIDC validation tests: PKCE, state, nonce, exact redirect matching, code replay, audience, issuer, key rotation, expiry and algorithm rejection.
- [ ] Confirm `jose` key-import/JWKS interoperability in the Workers runtime and use a stable, reviewed key-management procedure.
- [ ] Implement UserInfo only with a well-defined minimal claims policy.
- [ ] Implement a complete logout contract and session revocation propagation for relying parties.
- [ ] Review authorization-code one-time consumption and transaction consistency under concurrent exchanges.
- [ ] Add email verification, recovery and account linking before user onboarding.
- [ ] Add WebAuthn/passkey origin and RP-ID validation, replay protection, device removal and recovery.
- [ ] Add privacy-preserving audit metadata and retention controls.
- [ ] Review CSP, CORS, security headers, redirect handling, error content and rate-limit responses.
- [ ] Perform external OIDC conformance and application security review.
- [ ] Test that no relying application treats identity as tenant authorization.
- [ ] Keep production clients, secrets, D1 and custom domain separate from development.
