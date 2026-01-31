import { prisma } from '../utils/prisma';
import { Audit, AuditTool, Recommendation } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface CreateAuditData {
  userId: string;
  tier: string;
}

interface UpdateAuditData {
  tools?: Array<{
    toolName: string;
    monthlyCost: number;
    seats: number;
    useCases: string[];
    utilization?: string;
  }>;
  tier?: string;
  status?: string;
}

interface AnalysisResult {
  totalSpend: number;
  potentialSavings: number;
  recommendations: Array<{
    type: string;
    priority: number;
    description: string;
    savingsEstimate?: number;
  }>;
}

export class AuditService {
  /**
   * Create a guest user for IntakeForm flow
   */
  async createGuestUser(data: {
    companyName: string;
    companySize: string;
    email: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        companyName: data.companyName,
        companySize: data.companySize
      }
    });
  }

  /**
   * Create a new audit
   */
  async createAudit(data: CreateAuditData): Promise<Audit> {
    return prisma.audit.create({
      data: {
        userId: data.userId,
        tier: data.tier,
        status: 'draft'
      },
      include: {
        user: true,
        tools: true
      }
    });
  }

  /**
   * Get audit by ID
   */
  async getAuditById(id: string) {
    return prisma.audit.findUnique({
      where: { id },
      include: {
        user: true,
        tools: true,
        recommendations: {
          orderBy: { priority: 'desc' }
        }
      }
    });
  }

  /**
   * Update audit with tools and other data
   */
  async updateAudit(id: string, data: UpdateAuditData) {
    const updateData: any = {};

    if (data.tier) {
      updateData.tier = data.tier;
    }

    if (data.status) {
      updateData.status = data.status;
    }

    // If tools are provided, delete existing and create new ones
    if (data.tools) {
      await prisma.auditTool.deleteMany({
        where: { auditId: id }
      });

      updateData.tools = {
        create: data.tools.map(tool => ({
          toolName: tool.toolName,
          monthlyCost: new Decimal(tool.monthlyCost),
          seats: tool.seats,
          useCases: tool.useCases,
          utilization: tool.utilization
        }))
      };
    }

    return prisma.audit.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        tools: true,
        recommendations: true
      }
    });
  }

  /**
   * Update audit status
   */
  async updateAuditStatus(id: string, status: string) {
    return prisma.audit.update({
      where: { id },
      data: { status }
    });
  }

  /**
   * Update audit with analysis results
   */
  async updateAuditWithAnalysis(id: string, analysis: AnalysisResult) {
    // Delete existing recommendations
    await prisma.recommendation.deleteMany({
      where: { auditId: id }
    });

    return prisma.audit.update({
      where: { id },
      data: {
        totalSpend: new Decimal(analysis.totalSpend),
        potentialSavings: new Decimal(analysis.potentialSavings),
        status: 'complete',
        recommendations: {
          create: analysis.recommendations.map(rec => ({
            type: rec.type,
            priority: rec.priority,
            description: rec.description,
            savingsEstimate: rec.savingsEstimate ? new Decimal(rec.savingsEstimate) : null
          }))
        }
      },
      include: {
        user: true,
        tools: true,
        recommendations: {
          orderBy: { priority: 'desc' }
        }
      }
    });
  }

  /**
   * Add multiple tools to an audit (batch)
   */
  async addToolsBatch(id: string, tools: Array<{
    toolName: string;
    monthlyCost: number;
    seats: number;
    useCases: string[];
  }>) {
    // Delete existing tools (if any)
    await prisma.auditTool.deleteMany({
      where: { auditId: id }
    });

    // Create all new tools
    await prisma.auditTool.createMany({
      data: tools.map(tool => ({
        auditId: id,
        toolName: tool.toolName,
        monthlyCost: new Decimal(tool.monthlyCost),
        seats: tool.seats,
        useCases: tool.useCases || []
      }))
    });

    // Return the updated audit with tools
    return this.getAuditById(id);
  }

  /**
   * Get complete audit report
   */
  async getAuditReport(id: string) {
    return this.getAuditById(id);
  }
}
