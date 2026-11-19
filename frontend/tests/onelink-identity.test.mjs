import {test} from 'node:test';
import assert from 'node:assert/strict';
import {identity,isIdentityReady,identityMessage} from '../src/onelink-identity.js';
test('SSO remains disabled without registered client',()=>{assert.equal(isIdentityReady(identity),false);assert.match(identityMessage(),/being prepared/)});
test('requires pinned issuer, PKCE and explicit verification',()=>{
 const good={...identity,clientId:'onelink-public',status:'verified'};
 assert.equal(isIdentityReady(good),true);
 assert.equal(isIdentityReady({...good,issuer:'https://example.com'}),false);
 assert.equal(isIdentityReady({...good,pkceMethod:'plain'}),false);
 assert.equal(isIdentityReady({...good,status:'pending'}),false);
});
