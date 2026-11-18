CREATE TABLE IF NOT EXISTS login_csrf_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_login_csrf_expiry ON login_csrf_tokens(expires_at);

CREATE TABLE IF NOT EXISTS access_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  identity_id TEXT NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES oidc_clients(client_id),
  scope TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_access_tokens_identity ON access_tokens(identity_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expiry ON access_tokens(expires_at);

UPDATE oidc_clients
SET allowed_scopes_json='["openid","email"]', updated_at=CURRENT_TIMESTAMP
WHERE allowed_scopes_json='["openid","profile","email"]';
