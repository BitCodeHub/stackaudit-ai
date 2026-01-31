# Data Models

Complete reference for all data structures used in the StackAudit.ai API.

---

## Core Models

### User

User account data.

```typescript
interface User {
  id: string;              // "user_abc123"
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  plan: Plan;
  createdAt: string;       // ISO 8601
  lastLoginAt: string;     // ISO 8601
  avatarUrl?: string;
}

type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
type Plan = 'free' | 'pro' | 'enterprise';
```

---

### Organization

Organization/team data.

```typescript
interface Organization {
  id: string;              // "org_xyz789"
  name: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  settings: OrganizationSettings;
}

interface OrganizationSettings {
  allowedDomains: string[];
  maxAuditsPerMonth: number;
  auditRetentionDays: number;
}
```

---

### Audit

An audit represents a stack analysis job.

```typescript
interface Audit {
  id: string;              // "audit_abc123"
  name: string;
  url?: string;
  repositoryUrl?: string;
  description?: string;
  tags: string[];
  status: AuditStatus;
  organizationId: string;
  createdBy: string;       // User ID
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  results?: AnalysisResults;
  score?: number;          // 0-100
  recommendations?: Recommendations;
}

type AuditStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
```

**Example:**
```json
{
  "id": "audit_abc123",
  "name": "Q1 Stack Review",
  "url": "https://myapp.com",
  "description": "Quarterly infrastructure audit",
  "tags": ["quarterly", "production"],
  "status": "completed",
  "organizationId": "org_xyz789",
  "createdBy": "user_def456",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:05:00.000Z",
  "completedAt": "2025-01-15T10:05:00.000Z",
  "score": 78
}
```

---

### AnalysisResults

Results from running analysis on an audit.

```typescript
interface AnalysisResults {
  id: string;              // "analysis_xyz789"
  auditId: string;
  createdAt: string;
  depth: AnalysisDepth;
  overallScore: number;    // 0-100
  categories: {
    security: CategoryResult;
    performance: CategoryResult;
    cost: CategoryResult;
    compliance: CategoryResult;
  };
  techStack: TechStack;
  recommendations: AnalysisRecommendation[];
}

type AnalysisDepth = 'quick' | 'standard' | 'deep';

interface CategoryResult {
  score: number;           // 0-100
  grade: Grade;
  findings: Finding[];
}

type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

interface Finding {
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
}

type Severity = 'critical' | 'high' | 'medium' | 'low';
```

**Example:**
```json
{
  "id": "analysis_xyz789",
  "auditId": "audit_abc123",
  "depth": "standard",
  "overallScore": 78,
  "categories": {
    "security": {
      "score": 85,
      "grade": "B",
      "findings": [
        {
          "severity": "high",
          "title": "Outdated dependencies detected",
          "description": "Several npm packages have known vulnerabilities",
          "recommendation": "Update packages using npm audit fix"
        }
      ]
    },
    "performance": {
      "score": 82,
      "grade": "B",
      "findings": [...]
    },
    "cost": {
      "score": 68,
      "grade": "D",
      "findings": [...]
    },
    "compliance": {
      "score": 78,
      "grade": "C",
      "findings": [...]
    }
  },
  "techStack": {
    "frontend": ["React", "TypeScript", "Tailwind CSS"],
    "backend": ["Node.js", "Express"],
    "database": ["PostgreSQL"],
    "hosting": ["AWS", "CloudFront"],
    "monitoring": ["DataDog"]
  }
}
```

---

### TechStack

Detected technology stack.

```typescript
interface TechStack {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  hosting?: string[];
  monitoring?: string[];
  ci_cd?: string[];
  security?: string[];
}
```

---

### Comment

Audit comment with threading support.

```typescript
interface Comment {
  id: string;              // "comment_abc123"
  auditId: string;
  userId: string;
  content: string;
  parentId?: string;       // For replies
  targetType: CommentTarget;
  targetId?: string;       // Specific item ID
  mentions: string[];      // User IDs
  attachments: Attachment[];
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;      // Soft delete
}

type CommentTarget = 'audit' | 'tool' | 'recommendation' | 'result';

interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}
```

**Example:**
```json
{
  "id": "comment_abc123",
  "auditId": "audit_xyz789",
  "userId": "user_def456",
  "content": "We should prioritize fixing the security issues first",
  "parentId": null,
  "targetType": "audit",
  "mentions": ["user_ghi789"],
  "isResolved": false,
  "isEdited": false,
  "createdAt": "2025-01-15T11:00:00.000Z"
}
```

---

### CommentReaction

Emoji reaction on a comment.

```typescript
interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;           // "👍", "🎉", etc.
  createdAt: string;
}
```

---

### AuditShare

Sharing settings for an audit.

```typescript
interface AuditShare {
  id: string;
  auditId: string;
  visibility: ShareVisibility;
  publicToken?: string;
  publicTokenExpiresAt?: string;
  allowPublicComments: boolean;
  allowDownloads: boolean;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
}

type ShareVisibility = 'private' | 'team' | 'organization' | 'public';
```

---

### AuditUserShare

Individual user share on an audit.

```typescript
interface AuditUserShare {
  id: string;
  auditId: string;
  userId: string;
  permission: SharePermission;
  sharedBy: string;        // User ID who shared
  sharedAt: string;
  lastViewedAt?: string;
  viewCount: number;
}

type SharePermission = 'view' | 'comment' | 'edit';
```

---

### TeamInvite

Pending team invitation.

```typescript
interface TeamInvite {
  id: string;              // "invite_abc123"
  organizationId: string;
  organizationName: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  inviteTokenHash: string;
  invitedBy: string;
  invitedByName: string;
  invitedByEmail: string;
  personalMessage?: string;
  expiresAt: string;       // 7 days from creation
  createdAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
}

type InviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
```

---

### CollaborationActivity

Activity feed entry.

```typescript
interface CollaborationActivity {
  id: string;
  organizationId: string;
  activityType: ActivityType;
  userId: string;
  auditId?: string;
  commentId?: string;
  targetUserId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

type ActivityType = 
  | 'audit_created'
  | 'audit_completed'
  | 'audit_shared'
  | 'comment_added'
  | 'comment_replied'
  | 'comment_resolved'
  | 'member_invited'
  | 'member_joined'
  | 'member_removed'
  | 'member_role_changed';
```

---

### Subscription

Billing subscription data.

```typescript
interface Subscription {
  id: string;              // Stripe subscription ID
  customerId: string;      // Stripe customer ID
  organizationId: string;
  status: SubscriptionStatus;
  priceId: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

type SubscriptionStatus = 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'incomplete' 
  | 'trialing';
```

---

### ToolCost

Imported tool/subscription cost.

```typescript
interface ToolCost {
  id: string;
  toolName: string;
  vendor: string;
  category: ToolCategory;
  amount: number;
  currency: string;        // "USD", "EUR", etc.
  billingPeriod: BillingPeriod;
  billingDate: string;
  status: ToolStatus;
  source: IntegrationSource;
  externalId: string;      // ID from source system
  metadata?: Record<string, any>;
}

type ToolCategory = 
  | 'ai_ml'
  | 'productivity'
  | 'communication'
  | 'development'
  | 'infrastructure'
  | 'analytics'
  | 'security'
  | 'marketing'
  | 'sales'
  | 'support'
  | 'other';

type BillingPeriod = 'monthly' | 'yearly' | 'weekly' | 'one-time';
type ToolStatus = 'active' | 'cancelled' | 'paused';
type IntegrationSource = 'stripe' | 'quickbooks' | 'manual';
```

---

## Recommendations Models

### Recommendations

Full recommendations response.

```typescript
interface Recommendations {
  summary: RecommendationSummary;
  items: RecommendationItem[];
  consolidation: ConsolidationOpportunity[];
  alternatives: AlternativeRecommendation[];
}

interface RecommendationSummary {
  totalRecommendations: number;
  potentialSavings: number;
  criticalIssues: number;
  byPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
```

---

### RecommendationItem

Individual recommendation.

```typescript
interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: RecommendationCategory;
  savings?: number;
  effort: Effort;
  timeline: string;
  toolsAffected: string[];
  prerequisites?: string[];
}

type Priority = 'critical' | 'high' | 'medium' | 'low';
type Effort = 'Low' | 'Medium' | 'High';
type RecommendationCategory = 
  | 'cost_reduction'
  | 'consolidation'
  | 'optimization'
  | 'governance'
  | 'security'
  | 'compliance';
```

---

### Provider

AI/LLM provider data.

```typescript
interface Provider {
  id: string;              // "openai", "anthropic", etc.
  name: string;
  description: string;
  pricing_tier: PricingTier;
  strengths: string[];
  weaknesses: string[];
  best_for: string[];      // Use cases
  compliance: string[];    // "SOC2", "GDPR", "HIPAA"
  warnings?: string[];
  alternatives: string[];  // Provider IDs
}

type PricingTier = 'ultra-budget' | 'budget' | 'mid' | 'premium';
```

---

## Request/Response Models

### PaginatedResponse

Standard pagination wrapper.

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

---

### ErrorResponse

Standard error format.

```typescript
interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
  };
}

type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'INVALID_KEY'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';
```

---

## Enums Reference

### User Roles

```typescript
const USER_ROLES = ['owner', 'admin', 'member', 'viewer'];

// Permissions by role:
// owner    - Full access, can transfer ownership
// admin    - Manage members, billing, all audits
// member   - Create/edit own audits, view team audits
// viewer   - View audits only
```

### Plans

```typescript
const PLANS = ['free', 'pro', 'enterprise'];

// Limits by plan:
// free       - 3 audits/month, 1 user, 7-day retention
// pro        - 50 audits/month, 10 users, 90-day retention
// enterprise - 500 audits/month, 100 users, 365-day retention
```

### Analysis Categories

```typescript
const ANALYSIS_CATEGORIES = [
  'security',
  'performance', 
  'cost',
  'compliance'
];
```

### Tool Categories

```typescript
const TOOL_CATEGORIES = [
  'ai_ml',
  'productivity',
  'communication',
  'development',
  'infrastructure',
  'analytics',
  'security',
  'marketing',
  'sales',
  'support',
  'other'
];
```

### AI Providers

```typescript
const AI_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'mistral',
  'deepseek',
  'groq',
  'together',
  'cohere',
  'perplexity',
  'aws_bedrock',
  'azure_openai'
];
```

---

## Next Steps

- [API Endpoints →](./endpoints.md)
- [Authentication →](./authentication.md)
- [Webhooks →](./webhooks.md)
