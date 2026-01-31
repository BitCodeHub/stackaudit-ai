-- StackAudit.ai Team Collaboration Migration ROLLBACK
-- Removes: Team invites, audit comments, audit sharing

-- Drop views first
DROP VIEW IF EXISTS vw_comment_threads;
DROP VIEW IF EXISTS vw_shared_audits;

-- Drop tables in reverse order of creation (respecting foreign keys)
DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS collaboration_activity;
DROP TABLE IF EXISTS comment_reactions;
DROP TABLE IF EXISTS audit_user_shares;
DROP TABLE IF EXISTS audit_shares;
DROP TABLE IF EXISTS audit_comments;
DROP TABLE IF EXISTS team_invites;

-- Drop enums
DROP TYPE IF EXISTS activity_type;
DROP TYPE IF EXISTS share_permission;
DROP TYPE IF EXISTS audit_visibility;
DROP TYPE IF EXISTS invite_status;
