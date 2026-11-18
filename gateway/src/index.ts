import { SignJWT, exportJWK, importPKCS8, importSPKI } from "jose";

interface Env {
  DB: D1Database;
  ISSUER_URL: string;
  APP_ENV: string;
  SESSION_TTL_SECONDS?: string;
  AUTH_CODE_TTL_SECONDS?: string;
  OIDC_SIGNING_PRIVATE_KEY?: string;
  OIDC_SIGNING_KID?: string;
  OIDC_SIGNING_PUBLIC_KEY?: string;
  LOGIN_ALLOWED_ORIGINS?: string;
}

interface ClientRow {
  client_id: string;
  client_name: string;
  client_type: "public" | "confidential";
  redirect_uris_json: string;
  allowed_scopes_json: string;
  client_secret_hash: string | null;
  status: string;
}
interface SessionRow { id: string; identity_id: string; status: string; expires_at: string; }
interface CodeRow {
  client_id: string; identity_id: string; redirect_uri: string; scope: string;
  nonce: string; code_challenge: string; code_challenge_method: string;
}

const encoder = new TextEncoder();
const COOKIE = "__Host-dl_sso";
const DEFAULT_SCOPES = ["openid", "email"];

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  const h = new Headers(headers);
  h.set("Content-Type", "application/json; charset=utf-8");
  h.set("Cache-Control", "no-store");
  h.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(data), { status, headers: h });
}
function randomToken(bytes = 32): string {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  let binary = "";
  for (const b of value) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
function cookie(value: string, maxAge: number) {
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
function clearCookie() { return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`; }
function readCookie(request: Request): string | null {
  const header = request.headers.get("Cookie") ?? "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}
function seconds(value: string | undefined, fallback: number, max: number) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? Math.min(n, max) : fallback;
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function allowedLoginOrigins(env: Env): string[] {
  try { return JSON.parse(env.LOGIN_ALLOWED_ORIGINS ?? '["https://domislink.com"]'); }
  catch { return ["https://domislink.com"]; }
}
function loginOriginAllowed(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  return Boolean(origin && allowedLoginOrigins(env).includes(origin));
}
function parseArray(value: string, fallback: string[]): string[] {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : fallback; }
  catch { return fallback; }
}
async function getSession(request: Request, env: Env): Promise<SessionRow | null> {
  const raw = readCookie(request);
  if (!raw) return null;
  return env.DB.prepare(`SELECT s.id, s.identity_id, i.status, s.expires_at
    FROM sso_sessions s JOIN identities i ON i.id=s.identity_id
    WHERE s.session_hash=? AND s.revoked_at IS NULL AND s.expires_at>?
    AND i.status='active' LIMIT 1`).bind(await sha256(raw), new Date().toISOString()).first<SessionRow>();
}
async function audit(env: Env, type: string, outcome: string, identityId?: string, clientId?: string) {
  await env.DB.prepare("INSERT INTO audit_events (id,event_type,identity_id,client_id,outcome) VALUES (?,?,?,?,?)")
    .bind(crypto.randomUUID(), type, identityId ?? null, clientId ?? null, outcome).run();
}
async function getClient(env: Env, clientId: string) {
  return env.DB.prepare("SELECT * FROM oidc_clients WHERE client_id=? AND status='active' LIMIT 1")
    .bind(clientId).first<ClientRow>();
}
function loginPage(returnTo: string, csrfToken: string, error = "") {
  const escaped = returnTo.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const message = error ? "<p class='error'>Sign-in failed. Check your details and try again.</p>" : "";
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><title>DomisLink Sign in</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#090b12;color:#f8f5ee;font:15px system-ui}.card{width:min(390px,calc(100% - 40px));padding:32px;border:1px solid #66502c;border-radius:20px;background:#151a25;box-sizing:border-box}.crown{color:#e8bd68;font-size:38px}h1{font-size:24px;margin:12px 0}p{color:#aab2c1;line-height:1.6}label{display:block;margin:18px 0 7px;font-size:12px}input{box-sizing:border-box;width:100%;padding:13px;border:1px solid #384154;border-radius:9px;background:#0d111b;color:white}button{width:100%;padding:14px;margin-top:22px;border:0;border-radius:9px;background:#e8bd68;color:#15120c;font-weight:800}.error{color:#ffb2a8}</style><main class="card"><div class="crown">♛</div><h1>Sign in to DomisLink</h1><p>Use your DomisLink identity to continue securely.</p>${message}<form method="post" action="/login"><input type="hidden" name="return_to" value="${escaped}"><input type="hidden" name="csrf_token" value="${csrfToken}"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="username" required maxlength="254"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="128"><button type="submit">Continue</button></form></main></html>`, { headers: { "Content-Type":"text/html; charset=utf-8", "Cache-Control":"no-store", "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'", "X-Frame-Options":"DENY", "Referrer-Policy":"no-referrer" } });
}
async function verifyPassword(password: string, stored: string) {
  const [algorithm, rounds, saltText, hashText] = stored.split("$");
  const iterations = Number(rounds);
  if (algorithm !== "pbkdf2_sha256" || !Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  const decode = (value: string) => {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  };
  const salt = decode(saltText);
  const expected = decode(hashText);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name:"PBKDF2", hash:"SHA-256", salt, iterations }, key, expected.length * 8));
  return safeEqual(Array.from(bits).map((b)=>b.toString(16).padStart(2,"0")).join(""), Array.from(expected).map((b)=>b.toString(16).padStart(2,"0")).join(""));
}
async function issueIdToken(env: Env, identityId: string, clientId: string, nonce: string, scopes: string[]) {
  if (!env.OIDC_SIGNING_PRIVATE_KEY || !env.OIDC_SIGNING_KID) throw new Error("OIDC signing key is not configured");
  const user = await env.DB.prepare("SELECT e.email,e.verified_at FROM identity_emails e WHERE e.identity_id=? AND e.is_primary=1 LIMIT 1")
    .bind(identityId).first<{email:string;verified_at:string|null}>();
  const key = await importPKCS8(env.OIDC_SIGNING_PRIVATE_KEY, "RS256");
  const now = Math.floor(Date.now()/1000);
  const claims: Record<string, unknown> = { nonce };
  if (scopes.includes("email") && user) { claims.email = user.email; claims.email_verified = Boolean(user.verified_at); }
  return new SignJWT(claims).setProtectedHeader({ alg:"RS256", kid:env.OIDC_SIGNING_KID, typ:"JWT" })
    .setIssuer(env.ISSUER_URL).setSubject(identityId).setAudience(clientId)
    .setIssuedAt(now).setExpirationTime(now + 300).sign(key);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    if (method === "GET" && url.pathname === "/health") {
      try { await env.DB.prepare("SELECT 1").first(); return json({ ok:true, service:"domislink-sso-gateway", environment:env.APP_ENV }); }
      catch { return json({ ok:false, service:"domislink-sso-gateway", error:"database_unavailable" }, 503); }
    }

    if (method === "GET" && url.pathname === "/.well-known/openid-configuration") {
      const issuer = env.ISSUER_URL.replace(/\/$/, "");
      return json({
        issuer,
        authorization_endpoint: issuer + "/oauth/authorize",
        token_endpoint: issuer + "/oauth/token",
        jwks_uri: issuer + "/oauth/jwks.json",
        end_session_endpoint: issuer + "/oauth/logout",
        response_types_supported:["code"],
        response_modes_supported:["query"],
        grant_types_supported:["authorization_code"],
        subject_types_supported:["public"],
        id_token_signing_alg_values_supported:["RS256"],
        token_endpoint_auth_methods_supported:["none","client_secret_basic"],
        code_challenge_methods_supported:["S256"],
        scopes_supported:DEFAULT_SCOPES,
        claims_supported:["iss","sub","aud","exp","iat","nonce","email","email_verified"]
      });
    }

    if (method === "GET" && url.pathname === "/oauth/jwks.json") {
      if (!env.OIDC_SIGNING_PUBLIC_KEY || !env.OIDC_SIGNING_KID) return json({ error:"public_signing_key_not_configured" }, 503);
      try {
        const publicKey = await importSPKI(env.OIDC_SIGNING_PUBLIC_KEY, "RS256");
        const jwk = await exportJWK(publicKey);
        return json({ keys:[{...jwk,use:"sig",alg:"RS256",kid:env.OIDC_SIGNING_KID}] });
      } catch { return json({ error:"public_signing_key_invalid" }, 503); }
    }

    if (method === "GET" && url.pathname === "/login") {
      const returnTo = url.searchParams.get("return_to") ?? "/account";
      if (!returnTo.startsWith("/oauth/authorize?") || returnTo.startsWith("//") || returnTo.includes("\\") ) return json({ error:"invalid_return_to" }, 400);
      const csrf = randomToken();
      await env.DB.prepare("INSERT INTO login_csrf_tokens (id,token_hash,expires_at) VALUES (?,?,?)")
        .bind(crypto.randomUUID(),await sha256(csrf),new Date(Date.now()+5*60*1000).toISOString()).run();
      return loginPage(returnTo,csrf);
    }

    if (method === "POST" && url.pathname === "/login") {
      if (!loginOriginAllowed(request, env)) return json({ error:"origin_not_allowed" }, 403);
      const form = await request.formData();
      const email = String(form.get("email") ?? "").trim().toLowerCase();
      const password = String(form.get("password") ?? "");
      const returnTo = String(form.get("return_to") ?? "");
      const csrf = String(form.get("csrf_token") ?? "");
      if (!returnTo.startsWith("/oauth/authorize?") || returnTo.startsWith("//") || returnTo.includes("\\") || !email || password.length > 128 || !csrf) return json({ error:"invalid_request" }, 400);
      const csrfRow = await env.DB.prepare("UPDATE login_csrf_tokens SET consumed_at=? WHERE token_hash=? AND consumed_at IS NULL AND expires_at>? RETURNING id")
        .bind(new Date().toISOString(),await sha256(csrf),new Date().toISOString()).first<{id:string}>();
      if (!csrfRow) return json({ error:"invalid_csrf_token" }, 403);
      const row = await env.DB.prepare(`SELECT i.id, p.password_hash FROM identities i
        JOIN identity_emails e ON e.identity_id=i.id
        JOIN identity_passwords p ON p.identity_id=i.id
        WHERE e.email_normalized=? AND i.status='active' LIMIT 1`).bind(email).first<{id:string;password_hash:string}>();
      const valid = row ? await verifyPassword(password, row.password_hash) : false;
      if (!row || !valid) {
        await audit(env,"login","denied",row?.id);
        const retryCsrf = randomToken();
        await env.DB.prepare("INSERT INTO login_csrf_tokens (id,token_hash,expires_at) VALUES (?,?,?)")
          .bind(crypto.randomUUID(),await sha256(retryCsrf),new Date(Date.now()+5*60*1000).toISOString()).run();
        return loginPage(returnTo,retryCsrf,"invalid");
      }
      const raw = randomToken();
      const ttl = seconds(env.SESSION_TTL_SECONDS,28800,86400);
      await env.DB.prepare("INSERT INTO sso_sessions (id,session_hash,identity_id,expires_at) VALUES (?,?,?,?)")
        .bind(crypto.randomUUID(),await sha256(raw),row.id,new Date(Date.now()+ttl*1000).toISOString()).run();
      await audit(env,"login","success",row.id);
      return new Response(null,{status:303,headers:{"Location":returnTo,"Set-Cookie":cookie(raw,ttl),"Cache-Control":"no-store"}});
    }

    if (method === "GET" && url.pathname === "/oauth/authorize") {
      const clientId = url.searchParams.get("client_id") ?? "";
      const redirectUri = url.searchParams.get("redirect_uri") ?? "";
      const responseType = url.searchParams.get("response_type") ?? "";
      const scopeText = url.searchParams.get("scope") ?? "";
      const state = url.searchParams.get("state") ?? "";
      const nonce = url.searchParams.get("nonce") ?? "";
      const challenge = url.searchParams.get("code_challenge") ?? "";
      const challengeMethod = url.searchParams.get("code_challenge_method") ?? "";
      const client = await getClient(env,clientId);
      if (!client || responseType !== "code" || !parseArray(client.redirect_uris_json,[]).includes(redirectUri) ||
        !state || state.length > 512 || !nonce || nonce.length > 512 || !/^[A-Za-z0-9_-]{43,128}$/.test(challenge) || challengeMethod !== "S256") {
        return json({ error:"invalid_request" },400);
      }
      const allowedScopes = parseArray(client.allowed_scopes_json,DEFAULT_SCOPES);
      const scopes = scopeText.split(/\s+/).filter(Boolean);
      if (!scopes.includes("openid") || scopes.some(scope=>!allowedScopes.includes(scope))) return json({error:"invalid_scope"},400);
      const current = await getSession(request,env);
      if (!current) return new Response(null,{status:302,headers:{Location:"/login?return_to="+encodeURIComponent(url.pathname+url.search),"Cache-Control":"no-store"}});
      const code = randomToken();
      const ttl = seconds(env.AUTH_CODE_TTL_SECONDS,90,180);
      await env.DB.prepare(`INSERT INTO authorization_codes
        (id,code_hash,client_id,identity_id,redirect_uri,scope,nonce,code_challenge,code_challenge_method,expires_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(crypto.randomUUID(),await sha256(code),clientId,current.identity_id,redirectUri,scopes.join(" "),nonce,challenge,"S256",new Date(Date.now()+ttl*1000).toISOString()).run();
      await audit(env,"authorize","success",current.identity_id,clientId);
      const target = new URL(redirectUri);
      target.searchParams.set("code",code);
      target.searchParams.set("state",state);
      return new Response(null,{status:302,headers:{Location:target.toString(),"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
    }

    if (method === "POST" && url.pathname === "/oauth/token") {
      const form = await request.formData();
      const grantType = String(form.get("grant_type") ?? "");
      const clientId = String(form.get("client_id") ?? "");
      const client = await getClient(env,clientId);
      if (!client || grantType !== "authorization_code") return json({error:"invalid_client_or_grant"},400);
      if (client.client_type === "confidential") return json({error:"confidential_client_authentication_not_configured"},401);
      const code = String(form.get("code") ?? "");
      const redirectUri = String(form.get("redirect_uri") ?? "");
      const verifier = String(form.get("code_verifier") ?? "");
      if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || !code) return json({error:"invalid_grant"},400);
      const codeRow = await env.DB.prepare(`UPDATE authorization_codes SET consumed_at=?
        WHERE code_hash=? AND client_id=? AND redirect_uri=? AND consumed_at IS NULL AND expires_at>?
        RETURNING client_id,identity_id,redirect_uri,scope,nonce,code_challenge,code_challenge_method`)
        .bind(new Date().toISOString(),await sha256(code),clientId,redirectUri,new Date().toISOString()).first<CodeRow>();
      if (!codeRow || !safeEqual(await sha256(verifier),codeRow.code_challenge)) {
        await audit(env,"token_exchange","denied",undefined,clientId);
        return json({error:"invalid_grant"},400);
      }
      const identity = await env.DB.prepare("SELECT status FROM identities WHERE id=?").bind(codeRow.identity_id).first<{status:string}>();
      if (identity?.status !== "active") return json({error:"invalid_grant"},400);
      const idToken = await issueIdToken(env,codeRow.identity_id,clientId,codeRow.nonce,codeRow.scope.split(" "));
      const accessToken = randomToken();
      const accessTtl = 300;
      await env.DB.prepare("INSERT INTO access_tokens (id,token_hash,identity_id,client_id,scope,expires_at) VALUES (?,?,?,?,?,?)")
        .bind(crypto.randomUUID(),await sha256(accessToken),codeRow.identity_id,clientId,codeRow.scope,new Date(Date.now()+accessTtl*1000).toISOString()).run();
      await audit(env,"token_exchange","success",codeRow.identity_id,clientId);
      return json({access_token:accessToken,token_type:"Bearer",expires_in:accessTtl,id_token:idToken,scope:codeRow.scope});
    }

    if (method === "GET" && url.pathname === "/oauth/userinfo") {
      const authorization = request.headers.get("Authorization") ?? "";
      const match = /^Bearer ([A-Za-z0-9_-]{40,128})$/.exec(authorization);
      if (!match) return json({error:"invalid_token"},401,{"WWW-Authenticate":"Bearer"});
      const tokenHash = await sha256(match[1]);
      const token = await env.DB.prepare("SELECT identity_id,client_id,scope FROM access_tokens WHERE token_hash=? AND revoked_at IS NULL AND expires_at>? LIMIT 1")
        .bind(tokenHash,new Date().toISOString()).first<{identity_id:string;client_id:string;scope:string}>();
      if (!token) return json({error:"invalid_token"},401,{"WWW-Authenticate":"Bearer"});
      const scopes = token.scope.split(/\\s+/);
      const claims: Record<string,unknown> = {sub:token.identity_id};
      if (scopes.includes("email")) {
        const email = await env.DB.prepare("SELECT email_normalized,verified_at FROM identity_emails WHERE identity_id=? AND is_primary=1 LIMIT 1")
          .bind(token.identity_id).first<{email_normalized:string;verified_at:string|null}>();
        if (email) { claims.email=email.email_normalized; claims.email_verified=Boolean(email.verified_at); }
      }
      return json(claims);
    }

    if (method === "POST" && url.pathname === "/oauth/revoke") {
      const form = await request.formData();
      const tokenValue = String(form.get("token") ?? "");
      if (!tokenValue) return new Response(null,{status:200,headers:{"Cache-Control":"no-store"}});
      await env.DB.prepare("UPDATE access_tokens SET revoked_at=? WHERE token_hash=?")
        .bind(new Date().toISOString(),await sha256(tokenValue)).run();
      return new Response(null,{status:200,headers:{"Cache-Control":"no-store"}});
    }

    if (method === "POST" && url.pathname === "/oauth/logout") {
      const token = readCookie(request);
      if (token) await env.DB.prepare("UPDATE sso_sessions SET revoked_at=? WHERE session_hash=?")
        .bind(new Date().toISOString(),await sha256(token)).run();
      return new Response(null,{status:204,headers:{"Set-Cookie":clearCookie(),"Cache-Control":"no-store"}});
    }

    return json({error:"not_found"},404);
  }
};
