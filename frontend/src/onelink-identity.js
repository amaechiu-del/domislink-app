// Milestone 7: OIDC integration contract. No simulated sessions or client-side secrets.
export const identity = Object.freeze({
 issuer: 'https://sso.domislink.com',
 discovery: 'https://sso.domislink.com/.well-known/openid-configuration',
 clientId: null, // Set only after registering a public OneLink client with the gateway.
 redirectPath: '/auth/callback',
 scopes: ['openid','profile','email'],
 pkceMethod: 'S256',
 status: 'configuration-required'
});
export function isIdentityReady(config=identity) {
 return config.status==='verified' && typeof config.clientId==='string' && config.clientId.length>0 &&
 config.issuer==='https://sso.domislink.com' && config.pkceMethod==='S256';
}
export function identityMessage(config=identity) {
 return isIdentityReady(config) ? 'Identity provider configured; backend session exchange required' :
 'Unified sign-in is being prepared. Application previews remain available.';
}
