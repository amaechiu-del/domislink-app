PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS identities (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','disabled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identity_emails (
  id TEXT PRIMARY KEY,
  identity_id TEXT NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  email_normalized TEXT NOT NULL UNIQUE,
  verified_at TEXT,
  is_primary INTEGER NOT NULL DEFAULT 1 CHECK (is_primary IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_identity_emails_identity ON identity_emails(identity_id);

CREATE TABLE IF NOT EXISTS identity_passwords (
  identity_id TEXT PRIMARY KEY REFERENCES identities(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS oidc_clients (
  client_id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_type TEXT NOT NULL CHECK (client_type IN ('public','confidential')),
  redirect_uris_json TEXT NOT NULL,
  post_logout_redirect_uris_json TEXT NOT NULL DEFAULT '[]',
  allowed_origins_json TEXT NOT NULL DEFAULT '[]',
  allowed_scopes_json TEXT NOT NULL DEFAULT '["openid","profile","email"]',
  client_secret_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((client_type = 'public' AND client_secret_hash IS NULL) OR client_type = 'confidential')
);

CREATE TABLE IF NOT EXISTS sso_sessions (
  id TEXT PRIMARY KEY,
  session_hash TEXT NOT NULL UNIQUE,
  identity_id TEXT NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_identity ON sso_sessions(identity_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_expiry ON sso_sessions(expires_at);

CREATE TABLE IF NOT EXISTS authorization_codes (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL REFERENCES oidc_clients(client_id),
  identity_id TEXT NOT NULL REFERENCES identities(id),
  redirect_uri TEXT NOT NULL,
  scope TEXT NOT NULL,
  nonce TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  code_challenge_method TEXT NOT NULL CHECK (code_challenge_method = 'S256'),
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_authorization_codes_expiry ON authorization_codes(expires_at);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  identity_id TEXT REFERENCES identities(id),
  client_id TEXT,
  outcome TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at);
