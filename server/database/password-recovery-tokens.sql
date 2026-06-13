CREATE TABLE IF NOT EXISTS password_recovery_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  email VARCHAR(190) NOT NULL,
  account_kind VARCHAR(32) NOT NULL DEFAULT 'family',
  token_hash CHAR(64) NOT NULL,
  requested_ip_hash CHAR(64) NULL,
  user_agent_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  superseded_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_recovery_token_hash (token_hash),
  KEY idx_password_recovery_user_active (user_id, account_kind, used_at, superseded_at, expires_at),
  KEY idx_password_recovery_email_created (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
