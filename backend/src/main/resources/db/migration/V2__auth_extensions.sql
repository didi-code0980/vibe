-- Auth extensions: must_change_password column, password_reset_tokens table, audit_logs columns

ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    INDEX idx_prt_token (token)
);

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_data TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_data TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
