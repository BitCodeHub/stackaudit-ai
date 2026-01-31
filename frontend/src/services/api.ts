/**
 * API client for StackAudit backend
 */

export interface AuditReport {
  audit: {
    id: string;
    companyName: string;
    companySize: string;
    createdAt: string;
    status: string;
    totalMonthlyCost: number;
    potentialSavings: number;
    costPerUser?: number;
  };
  analysis: {
    overallAssessment?: string;
    keyFindings: string[];
    actionItems: string[];
  };
  tools: ToolUsage[];
  recommendations: Recommendation[];
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: string;
}

export interface CostAnalysis {
  totalMonthlyCost: number;
  costPerUser: number;
  potentialSavings: number;
}

export interface ToolUsage {
  toolName: string;
  useCases: string[];
  seats: number;
  monthlyCost: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async createAudit(data: { companyName: string; companySize: string }) {
    return this.request<{ id: string; status: string }>('/audits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAudit(auditId: string) {
    return this.request<{ id: string; status: string }>(`/audits/${auditId}`);
  }

  async getAuditReport(auditId: string): Promise<AuditReport> {
    return this.request<AuditReport>(`/audits/${auditId}/report`);
  }

  async addToolToAudit(
    auditId: string,
    tool: {
      toolName: string;
      monthlyCost: number;
      seats: number;
      useCases: string[];
    }
  ) {
    return this.request(`/audits/${auditId}/tools`, {
      method: 'POST',
      body: JSON.stringify(tool),
    });
  }

  async addTools(
    auditId: string,
    tools: Array<{
      toolName: string;
      monthlyCost: number;
      seats: number;
      useCases: string[];
    }>
  ) {
    return this.request(`/audits/${auditId}/tools/batch`, {
      method: 'POST',
      body: JSON.stringify({ tools }),
    });
  }

  async startAnalysis(auditId: string) {
    return this.request(`/audits/${auditId}/analyze`, {
      method: 'POST',
    });
  }

  async analyzeAudit(auditId: string) {
    return this.request(`/audits/${auditId}/analyze`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
