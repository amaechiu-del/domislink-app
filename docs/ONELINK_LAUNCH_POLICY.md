# OneLink launch verification and SSO integration policy

## Statuses
- pending: configured URL, awaiting reachability and identity review.
- repair: needs investigation or rebuilding.
- development: not yet production-ready.
- live: explicitly approved after checks. **No app is currently approved.**

## Approval gates
1. HTTPS and allowlisted hostname.
2. Successful health check (reachability alone is insufficient).
3. Confirm that destination serves the intended DomisLink product, not a parked page, unrelated product, or generic homepage.
4. Confirm app login and tenant boundaries in staging.
5. Verify OIDC issuer https://sso.domislink.com, client registration, redirect URI, PKCE S256, state, nonce, logout and session controls.
6. Explicit human release approval and deployment verification.

The scheduled health workflow writes a downloadable report artifact only. It does not modify the registry or promote applications. No browser-side credentials or OIDC client secrets are stored in OneLink.

## Homepage release
Keep existing production homepage unchanged until build, installability, accessibility, offline-shell, navigation and security checks pass. Publish staging preview, review it on Android/iOS/desktop, then approve and merge a separate homepage promotion change.
