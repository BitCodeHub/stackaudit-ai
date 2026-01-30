export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export type UseCase = 
  | 'Writing'
  | 'Code'
  | 'Image Gen'
  | 'Data Analysis'
  | 'Customer Support'
  | 'Research'
  | 'Other';

export interface AITool {
  id: string;
  toolName: string;
  monthlyCost: number;
  seats: number;
  useCases: UseCase[];
}

export interface AuditFormData {
  companyName: string;
  companySize: CompanySize | '';
  tools: AITool[];
}
