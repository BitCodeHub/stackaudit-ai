# Team Collaboration Feature

StackAudit.ai v1.1.0 introduces comprehensive team collaboration features, enabling teams to work together on tech stack audits.

## Overview

The collaboration feature includes:

1. **Team Management** - Invite and manage team members with role-based access
2. **Audit Sharing** - Share audits with specific users or make them public
3. **Comments & Discussions** - Comment on audits, tools, and recommendations
4. **Activity Feed** - Track all collaboration activity in real-time

## Team Management

### Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full access, can transfer ownership, manage billing |
| **Admin** | Manage members, settings, all audits |
| **Member** | Create/edit own audits, comment on all audits |
| **Viewer** | View-only access to shared audits |

### Inviting Team Members

```bash
POST /api/teams/invites
{
  "email": "colleague@company.com",
  "role": "member",
  "personalMessage": "Join our team to collaborate on audits!"
}
```

**Response:**
```json
{
  "message": "Invite sent successfully",
  "invite": {
    "id": "invite_abc123",
    "email": "colleague@company.com",
    "role": "member",
    "expiresAt": "2024-02-05T00:00:00Z"
  },
  "inviteLink": "https://app.stackaudit.ai/invite/token123..."
}
```

### Plan Limits

| Plan | Team Size |
|------|-----------|
| Free | 1 user |
| Pro | 10 users |
| Enterprise | 100 users |

## Audit Sharing

### Visibility Levels

| Level | Description |
|-------|-------------|
| **Private** | Only creator can access |
| **Team** | All organization members can access (default) |
| **Organization** | All members in organization hierarchy |
| **Public** | Anyone with the link can access |

### Sharing with Specific Users

Share an audit with users outside your organization:

```bash
POST /api/audits/:auditId/sharing/users
{
  "email": "external@partner.com",
  "permission": "comment"
}
```

**Permission Levels:**
- `view` - Can view audit results
- `comment` - Can view and add comments
- `edit` - Can view, comment, and edit audit details

### Public Sharing

Make an audit publicly accessible:

```bash
PATCH /api/audits/:auditId/sharing
{
  "visibility": "public",
  "allowPublicComments": true,
  "allowDownloads": true
}
```

## Comments & Discussions

### Adding Comments

Comments can target different parts of an audit:

```bash
POST /api/audits/:auditId/comments
{
  "content": "We should consider replacing this tool with a cheaper alternative.",
  "targetType": "tool",
  "targetId": "tool_xyz789",
  "mentions": [{"userId": "user_123", "name": "John Doe"}]
}
```

**Target Types:**
- `audit` - General audit comment
- `tool` - Comment on a specific tool
- `recommendation` - Comment on a recommendation
- `result` - Comment on an analysis result

### Threaded Replies

Reply to existing comments:

```bash
POST /api/audits/:auditId/comments
{
  "content": "Good point! I'll research alternatives.",
  "parentId": "comment_abc123"
}
```

### Resolving Discussions

Mark a comment as resolved when action is taken:

```bash
POST /api/audits/:auditId/comments/:commentId/resolve
```

### Reactions

Add emoji reactions to comments:

```bash
POST /api/audits/:auditId/comments/:commentId/reactions
{
  "emoji": "thumbsup"
}
```

## Activity Feed

Track all collaboration activity:

```bash
GET /api/teams/activity?limit=20&offset=0
```

**Activity Types:**
- `audit_created` - New audit created
- `audit_shared` - Audit sharing settings changed
- `audit_completed` - Audit analysis completed
- `comment_added` - New comment added
- `comment_replied` - Reply to comment
- `comment_resolved` - Comment marked resolved
- `member_invited` - Team invite sent
- `member_joined` - Member accepted invite
- `member_removed` - Member removed from team

## Database Schema

The collaboration feature adds the following tables:

### team_invites
Stores pending team invitations with secure hashed tokens.

### audit_comments
Stores all comments with support for threading, mentions, and attachments.

### audit_shares
Stores audit visibility settings and public sharing tokens.

### audit_user_shares
Individual user share records for tracking access.

### comment_reactions
Emoji reactions on comments.

### collaboration_activity
Activity feed for all collaboration events.

## Security Considerations

1. **Invite Tokens** - Hashed with SHA-256, expire after 7 days
2. **Public Links** - Randomly generated 64-character tokens
3. **Permission Checks** - All endpoints verify user access rights
4. **Rate Limiting** - API endpoints are rate-limited to prevent abuse
5. **Audit Logging** - All sharing changes are logged

## Migration

Run the migration to add collaboration tables:

```bash
psql $DATABASE_URL < database/migrations/003_team_collaboration.sql
```

To rollback:

```bash
psql $DATABASE_URL < database/migrations/003_team_collaboration_rollback.sql
```

## Frontend Integration

### React Hooks (Suggested)

```typescript
// useTeamMembers.ts
export const useTeamMembers = () => {
  return useQuery(['team', 'members'], () => 
    api.get('/api/teams/members')
  );
};

// useAuditComments.ts
export const useAuditComments = (auditId: string) => {
  return useQuery(['audit', auditId, 'comments'], () =>
    api.get(`/api/audits/${auditId}/comments`)
  );
};

// useAddComment.ts
export const useAddComment = (auditId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: CommentInput) => api.post(`/api/audits/${auditId}/comments`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['audit', auditId, 'comments']);
      }
    }
  );
};
```

### Component Example

```tsx
// CommentThread.tsx
export const CommentThread: React.FC<{ auditId: string }> = ({ auditId }) => {
  const { data: comments } = useAuditComments(auditId);
  const addComment = useAddComment(auditId);

  return (
    <div className="space-y-4">
      {comments?.map(comment => (
        <Comment 
          key={comment.id} 
          comment={comment}
          onReply={(content) => addComment.mutate({ 
            content, 
            parentId: comment.id 
          })}
        />
      ))}
      <CommentForm onSubmit={(content) => addComment.mutate({ content })} />
    </div>
  );
};
```

## API Response Examples

### List Team Members

```json
{
  "members": [
    {
      "id": "user_abc123",
      "email": "john@company.com",
      "name": "John Doe",
      "role": "owner",
      "avatarUrl": "https://...",
      "joinedAt": "2024-01-01T00:00:00Z",
      "lastLoginAt": "2024-01-28T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Get Audit Comments

```json
{
  "comments": [
    {
      "id": "comment_abc123",
      "auditId": "audit_xyz789",
      "content": "Great analysis! Should we dig deeper into the security tools?",
      "author": {
        "id": "user_abc123",
        "name": "John Doe",
        "email": "john@company.com",
        "avatarUrl": "https://..."
      },
      "targetType": "audit",
      "reactions": {
        "thumbsup": { "count": 2, "users": ["Jane", "Bob"] }
      },
      "replyCount": 3,
      "isResolved": false,
      "isOwner": true,
      "createdAt": "2024-01-28T10:00:00Z",
      "replies": [...]
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### Get Sharing Settings

```json
{
  "sharing": {
    "id": "share_abc123",
    "auditId": "audit_xyz789",
    "visibility": "team",
    "publicToken": null,
    "allowPublicComments": false,
    "allowDownloads": true,
    "allowComments": true,
    "sharedUsers": [
      {
        "id": "usershare_abc",
        "userId": "user_external",
        "email": "external@partner.com",
        "name": "External User",
        "permission": "comment",
        "sharedBy": "John Doe",
        "sharedAt": "2024-01-28T10:00:00Z"
      }
    ]
  }
}
```
