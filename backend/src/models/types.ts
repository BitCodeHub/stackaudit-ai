/**
 * Shared TypeScript types and interfaces
 */

export interface CreateUserRequest {
  email: string;
  companyName?: string;
  companySize?: string;
}

export interface CreateAuditRequest {
  userId: string;
  tier?: 'free' | 'paid';
}

export interface UpdateAuditRequest {
  tools?: ToolInput[];
  tier?: 'free' | 'paid';
  status?: 'draft' | 'analyzing' | 'complete' | 'failed';
}

export interface ToolInput {
  toolName: string;
  monthlyCost: number;
  seats: number;
  useCases: string[];
  utilization?: 'high' | 'medium' | 'low' | 'unknown';
}

export interface RecommendationOutput {
  type: 'consolidate' | 'eliminate' | 'keep' | 'migrate';
  priority: number;
  description: string;
  savingsEstimate?: number;
}

export interface AnalysisResult {
  totalSpend: number;
  potentialSavings: number;
  recommendations: RecommendationOutput[];
}

export interface AuditReport {
  id: string;
  userId: string;
  status: string;
  tier: string;
  totalSpend: number;
  potentialSavings: number;
  createdAt: Date;
  user: {
    email: string;
    companyName?: string;
    companySize?: string;
  };
  tools: Array<{
    toolName: string;
    monthlyCost: number;
    seats: number;
    useCases: string[];
    utilization?: string;
  }>;
  recommendations: RecommendationOutput[];
}
