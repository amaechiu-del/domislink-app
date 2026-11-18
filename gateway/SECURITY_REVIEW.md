# Gateway security review — pre-production blockers

- [ ] Add refresh-token rotation and introspection if long-lived sessions or non-browser API clients require them; current opaque access tokens are short-lived and checked by UserInfo.
- [ ] Implement confidential-client authentication, including hashed client-secret storage and rotation.
- [ ] Review the one-time database-backed login CSRF flow and add explicit CSRF protection to any future state-changing browser forms; protect logout against cross-site requests and verify same-site behavior.
- [ ] Add rate limits on login, authorize and token routes, plus abuse monitoring.
- [ ] Add full OIDC validation tests: PKCE, state, nonce, exact redirect matching, code replay, audience, issuer, key rotation, expiry and algorithm rejection.
- [ ] Confirm `jose` key-import/JWKS interoperability in the Workers runtime and use a stable, reviewed key-management procedure.
- [ ] Review UserInfo claims disclosure, access-token client binding and CORS policy with negative tests.
- [ ] Implement the complete RP-initiated logout contract and session revocation propagation for relying parties.
- [ ] Review authorization-code one-time consumption and transaction consistency under concurrent exchanges.
- [ ] Add email verification, recovery and account linking before user onboarding.
- [ ] Add WebAuthn/passkey origin and RP-ID validation, replay protection, device removal and recovery.
- [ ] Add privacy-preserving audit metadata and retention controls.
- [ ] Review CSP, CORS, security headers, redirect handling, error content and rate-limit responses.
- [ ] Perform external OIDC conformance and application security review.
- [ ] Test that no relying application treats identity as tenant authorization.
- [ ] Keep production clients, secrets, D1 and custom domain separate from development.
