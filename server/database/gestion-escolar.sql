CREATE TABLE IF NOT EXISTS gestion_escolar_permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  capability VARCHAR(80) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  is_global TINYINT(1) NOT NULL DEFAULT 0,
  plantel VARCHAR(32) NULL,
  nivel VARCHAR(64) NULL,
  grado VARCHAR(64) NULL,
  grupo VARCHAR(64) NULL,
  assigned_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ge_permission_scope (
    user_id,
    capability,
    is_global,
    plantel,
    nivel,
    grado,
    grupo
  ),
  KEY idx_ge_permissions_user (user_id, enabled),
  KEY idx_ge_permissions_capability_scope (capability, enabled, is_global, plantel, nivel, grado, grupo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gestion_escolar_scoped_content (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  uid VARCHAR(80) NOT NULL,
  kind ENUM('encuesta', 'convenio') NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(500) NULL,
  url TEXT NOT NULL,
  embed_url TEXT NULL,
  status ENUM('draft', 'active', 'inactive', 'scheduled') NOT NULL DEFAULT 'draft',
  is_global TINYINT(1) NOT NULL DEFAULT 0,
  plantel VARCHAR(32) NULL,
  nivel VARCHAR(64) NULL,
  grado VARCHAR(64) NULL,
  grupo VARCHAR(64) NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  published_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at DATETIME NULL,
  active_from DATETIME NULL,
  active_until DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ge_content_uid (uid),
  KEY idx_ge_content_resolution (kind, status, is_global, plantel, nivel, grado, grupo),
  KEY idx_ge_content_dates (kind, status, active_from, active_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gestion_escolar_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_uid VARCHAR(80) NOT NULL,
  actor_user_id BIGINT UNSIGNED NOT NULL,
  target_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  module VARCHAR(80) NULL,
  capability VARCHAR(80) NULL,
  scope_json JSON NULL,
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ge_audit_event (event_uid),
  KEY idx_ge_audit_actor_date (actor_user_id, created_at),
  KEY idx_ge_audit_target_date (target_user_id, created_at),
  KEY idx_ge_audit_action_date (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gestion_escolar_impersonation_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  event_uid VARCHAR(80) NOT NULL,
  actor_user_id BIGINT UNSIGNED NOT NULL,
  target_user_id BIGINT UNSIGNED NOT NULL,
  action ENUM('start', 'exit', 'denied') NOT NULL,
  reason VARCHAR(240) NULL,
  scope_json JSON NULL,
  metadata_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ge_impersonation_event (event_uid),
  KEY idx_ge_impersonation_actor_date (actor_user_id, created_at),
  KEY idx_ge_impersonation_target_date (target_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
