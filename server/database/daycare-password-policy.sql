CREATE TABLE IF NOT EXISTS hp_daycare_password_policy (
  user_id BIGINT NOT NULL PRIMARY KEY,
  can_change_password TINYINT(1) NOT NULL DEFAULT 1,
  updated_by VARCHAR(190) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_daycare_password_policy_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
