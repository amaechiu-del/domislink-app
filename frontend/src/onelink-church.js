import {registry,getLaunchUrl} from './onelink-registry.js';
const church=registry.church;
export const churchIntegration=Object.freeze({
 appId:'church',origin:church.url,sessionEndpoint:church.sessionEndpoint,
 loginPath:church.loginPath,existingSessionCookie:'dl_church_session',
 authMode:church.auth,plannedAuth:church.plannedAuth
});
export function churchLoginUrl(entry=church) {
 const approved=getLaunchUrl(entry);
 if(!approved)return null;
 const origin=new URL(approved).origin;
 return new URL(entry.loginPath||'/',origin).href;
}
export function churchSessionState(payload) {
 if(!payload||typeof payload!=='object')return {authenticated:false};
 const user=payload.user;
 if(!user||typeof user!=='object'||typeof user.id!=='string')return {authenticated:false};
 return {authenticated:true};
}
// The Church session cookie is HttpOnly and scoped to Church. OneLink must never read
// or copy it, and must not attempt cross-origin /api/auth/me from the browser.
// SSO requires server-side OIDC account linking and separate per-app sessions.
