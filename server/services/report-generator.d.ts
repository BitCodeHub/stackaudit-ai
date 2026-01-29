/**
 * TypeScript definitions for StackAudit Report Generator
 */

export interface Tool {
  name: string;
  category: string;
  users: number;
  monthlyCost: number;
  status: 'Active' | 'Underutilized' | 'Inactive';
  utilization: number;
  vendor?: string;
  contractEnd?: Date;
  notes?: string;
}

export interface WasteItem {
  tool: string;
  type: 'unused' | 'duplicate' | 'underutilized' | 'overpriced';
  reason: string;
  wastedAmount: number;
  recommendedAction?: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  savings: number;
  effort: 'Low' | 'Medium' | 'High';
  timeline: string;
  category?: string;
  dependencies?: string[];
}

export interface SavingsTimeline {
  month: number;
  savings: number;
  cumulative?: number;
}

export interface ProjectedSavings {
  immediate: number;
  shortTerm: number;
  longTerm: number;
  total: number;
  timeline: SavingsTimeline[];
}

export interface ROIAnalysis {
  currentROI: number;
  projectedROI: number;
  costPerEmployee: number;
  industryBenchmark: number;
  valueDelivered: number;
  utilizationRate: number;
}

export interface ExecutiveSummary {
  totalTools: number;
  totalMonthlySpend: number;
  identifiedWaste: number;
  potentialSavings: number;
  savingsPercentage: number;
  overallHealthScore: number;
  keyFindings: string[];
}

export interface AuditData {
  clientName: string;
  auditDate?: Date;
  currentStack: Tool[];
  recommendations: Recommendation[];
  wasteItems: WasteItem[];
  projectedSavings: ProjectedSavings;
  roiAnalysis: ROIAnalysis;
  executiveSummary: ExecutiveSummary;
}

export interface ReportGeneratorOptions {
  companyName?: string;
  logoPath?: string;
  outputDir?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface GeneratedReport {
  success: boolean;
  filename: string;
  downloadUrl: string;
  path: string;
  generatedAt: string;
}

declare class ReportGenerator {
  constructor(options?: ReportGeneratorOptions);
  generateReport(auditData: AuditData): Promise<string>;
}

export default ReportGenerator;
export function createReportGenerator(options?: ReportGeneratorOptions): ReportGenerator;
