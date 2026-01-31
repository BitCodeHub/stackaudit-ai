-- StackAudit.ai Team Collaboration Migration
-- Version: 1.1.0
-- Adds: Team invites, audit comments, audit sharing

-- =============================================================================
-- TEAM INVITES
-- =============================================================================

CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'revoked');

CREATE TABLE team_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Invite details
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    status invite_status NOT NULL DEFAULT 'pending',
    
    -- Invite token (hashed for security)
    invite_token_hash VARCHAR(255) NOT NULL,
    
    -- Invitation metadata
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    personal_message TEXT,
    
    -- Timing
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate pending invites to same email in same org
    CONSTRAINT unique_pending_invite UNIQUE (organization_id, email, status) 
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX idx_team_invites_org ON team_invites(organization_id);
CREATE INDEX idx_team_invites_email ON team_invites(email);
CREATE INDEX idx_team_invites_token ON team_invites(invite_token_hash);
CREATE INDEX idx_team_invites_status ON team_invites(status) WHERE status = 'pending';

-- =============================================================================
-- AUDIT COMMENTS
-- =============================================================================

CREATE TABLE audit_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Comment author
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Comment content
    content TEXT NOT NULL,
    
    -- Thread support (for replies)
    parent_id UUID REFERENCES audit_comments(id) ON DELETE CASCADE,
    
    -- Rich content support
    mentions JSONB DEFAULT '[]',           -- [{userId, name}] mentioned users
    attachments JSONB DEFAULT '[]',        -- [{type, url, name}] attached files
    
    -- Targeting specific items (tool, recommendation, etc.)
    target_type VARCHAR(50),               -- 'audit', 'tool', 'recommendation', 'result'
    target_id UUID,                        -- ID of the targeted item
    
    -- Status
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    
    -- Edit tracking
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ                 -- Soft delete
);

CREATE INDEX idx_audit_comments_audit ON audit_comments(audit_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_audit_comments_user ON audit_comments(user_id);
CREATE INDEX idx_audit_comments_parent ON audit_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_audit_comments_target ON audit_comments(target_type, target_id) WHERE target_id IS NOT NULL;
CREATE INDEX idx_audit_comments_created_at ON audit_comments(created_at DESC);

-- =============================================================================
-- AUDIT SHARING / VISIBILITY
-- =============================================================================

CREATE TYPE audit_visibility AS ENUM ('private', 'team', 'organization', 'public');
CREATE TYPE share_permission AS ENUM ('view', 'comment', 'edit');

-- Audit visibility settings
CREATE TABLE audit_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Visibility level
    visibility audit_visibility NOT NULL DEFAULT 'team',
    
    -- Public sharing (if visibility = 'public')
    public_token VARCHAR(64),              -- Unique token for public access
    public_token_expires_at TIMESTAMPTZ,
    allow_public_comments BOOLEAN DEFAULT FALSE,
    
    -- Shared with specific users (in addition to team)
    shared_users JSONB DEFAULT '[]',       -- [{userId, permission, sharedAt, sharedBy}]
    
    -- Settings
    allow_downloads BOOLEAN DEFAULT TRUE,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(audit_id)
);

CREATE INDEX idx_audit_shares_audit ON audit_shares(audit_id);
CREATE INDEX idx_audit_shares_public_token ON audit_shares(public_token) WHERE public_token IS NOT NULL;
CREATE INDEX idx_audit_shares_visibility ON audit_shares(visibility);

-- Individual user share records (for querying shared-with-me)
CREATE TABLE audit_user_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    permission share_permission NOT NULL DEFAULT 'view',
    
    shared_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Access tracking
    last_viewed_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(audit_id, user_id)
);

CREATE INDEX idx_audit_user_shares_audit ON audit_user_shares(audit_id);
CREATE INDEX idx_audit_user_shares_user ON audit_user_shares(user_id);

-- =============================================================================
-- COMMENT REACTIONS (Optional: for emoji reactions on comments)
-- =============================================================================

CREATE TABLE comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES audit_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    emoji VARCHAR(50) NOT NULL,            -- emoji code like 'thumbsup', 'heart', etc.
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(comment_id, user_id, emoji)
);

CREATE INDEX idx_comment_reactions_comment ON comment_reactions(comment_id);

-- =============================================================================
-- ACTIVITY FEED (Track collaboration activity)
-- =============================================================================

CREATE TYPE activity_type AS ENUM (
    'audit_created', 'audit_updated', 'audit_shared', 'audit_completed',
    'comment_added', 'comment_replied', 'comment_resolved',
    'member_invited', 'member_joined', 'member_removed',
    'tool_added', 'tool_removed', 'recommendation_actioned'
);

CREATE TABLE collaboration_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    activity_type activity_type NOT NULL,
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Target resources
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES audit_comments(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collab_activity_org ON collaboration_activity(organization_id);
CREATE INDEX idx_collab_activity_audit ON collaboration_activity(audit_id) WHERE audit_id IS NOT NULL;
CREATE INDEX idx_collab_activity_user ON collaboration_activity(user_id);
CREATE INDEX idx_collab_activity_created ON collaboration_activity(created_at DESC);

-- =============================================================================
-- NOTIFICATION PREFERENCES (Per-user notification settings)
-- =============================================================================

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Email notifications
    email_comment_mentions BOOLEAN DEFAULT TRUE,
    email_comment_replies BOOLEAN DEFAULT TRUE,
    email_audit_shared BOOLEAN DEFAULT TRUE,
    email_team_invites BOOLEAN DEFAULT TRUE,
    email_audit_completed BOOLEAN DEFAULT TRUE,
    email_weekly_digest BOOLEAN DEFAULT TRUE,
    
    -- In-app notifications
    inapp_comment_mentions BOOLEAN DEFAULT TRUE,
    inapp_comment_replies BOOLEAN DEFAULT TRUE,
    inapp_audit_shared BOOLEAN DEFAULT TRUE,
    inapp_team_activity BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER update_team_invites_updated_at BEFORE UPDATE ON team_invites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_comments_updated_at BEFORE UPDATE ON audit_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_shares_updated_at BEFORE UPDATE ON audit_shares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_user_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Shared audits view (audits shared with a user)
CREATE VIEW vw_shared_audits AS
SELECT 
    aus.user_id,
    a.id AS audit_id,
    a.name AS audit_name,
    a.status,
    a.organization_id,
    o.name AS organization_name,
    aus.permission,
    aus.shared_by,
    u.full_name AS shared_by_name,
    aus.shared_at,
    aus.last_viewed_at
FROM audit_user_shares aus
JOIN audits a ON a.id = aus.audit_id AND a.deleted_at IS NULL
JOIN organizations o ON o.id = a.organization_id
LEFT JOIN users u ON u.id = aus.shared_by;

-- Comment thread view (with reply counts)
CREATE VIEW vw_comment_threads AS
SELECT 
    c.id,
    c.audit_id,
    c.user_id,
    u.full_name AS author_name,
    u.avatar_url AS author_avatar,
    c.content,
    c.parent_id,
    c.target_type,
    c.target_id,
    c.is_resolved,
    c.created_at,
    c.updated_at,
    c.is_edited,
    COUNT(r.id) AS reply_count,
    (SELECT COUNT(*) FROM comment_reactions cr WHERE cr.comment_id = c.id) AS reaction_count
FROM audit_comments c
LEFT JOIN users u ON u.id = c.user_id
LEFT JOIN audit_comments r ON r.parent_id = c.id AND r.deleted_at IS NULL
WHERE c.deleted_at IS NULL AND c.parent_id IS NULL
GROUP BY c.id, u.full_name, u.avatar_url;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE team_invites IS 'Pending team member invitations';
COMMENT ON TABLE audit_comments IS 'Comments and discussions on audits';
COMMENT ON TABLE audit_shares IS 'Audit visibility and sharing settings';
COMMENT ON TABLE audit_user_shares IS 'Individual user share records for audits';
COMMENT ON TABLE comment_reactions IS 'Emoji reactions on comments';
COMMENT ON TABLE collaboration_activity IS 'Activity feed for team collaboration';
COMMENT ON TABLE notification_preferences IS 'Per-user notification settings';
