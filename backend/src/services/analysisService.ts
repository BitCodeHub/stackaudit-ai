import Anthropic from '@anthropic-ai/sdk';
import { Audit, AuditTool } from '@prisma/client';
import { logger } from '../utils/logger';

interface Recommendation {
  type: 'consolidate' | 'eliminate' | 'keep' | 'migrate' | 'optimize';
  priority: number;
  description: string;
  savingsEstimate?: number;
  affectedTools?: string[];
}

interface AnalysisResult {
  totalSpend: number;
  potentialSavings: number;
  recommendations: Recommendation[];
  summary: string;
  overlapMatrix?: Record<string, string[]>;
}

type AuditWithTools = Audit & {
  tools: AuditTool[];
};

export class AnalysisService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  /**
   * Analyze the tool stack using Claude API
   */
  async analyzeToolStack(audit: AuditWithTools): Promise<AnalysisResult> {
    // Calculate total spend
    const totalSpend = audit.tools.reduce((sum, tool) => {
      return sum + Number(tool.monthlyCost);
    }, 0);

    // If no tools, return empty analysis
    if (audit.tools.length === 0) {
      return {
        totalSpend: 0,
        potentialSavings: 0,
        recommendations: [],
        summary: 'No tools to analyze. Add your AI tools to get started.'
      };
    }

    try {
      const prompt = this.prepareAnalysisPrompt(audit.tools, totalSpend);
      
      logger.info('Calling Claude API for analysis', { auditId: audit.id, toolCount: audit.tools.length });
      
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse the JSON response
      const analysisText = content.text;
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Could not parse analysis response');
      }

      const analysis = JSON.parse(jsonMatch[0]) as {
        recommendations: Recommendation[];
        summary: string;
        overlapMatrix?: Record<string, string[]>;
      };

      // Calculate potential savings from recommendations
      const potentialSavings = analysis.recommendations.reduce((sum, rec) => {
        return sum + (rec.savingsEstimate || 0);
      }, 0);

      logger.info('Analysis complete', { 
        auditId: audit.id, 
        recommendationCount: analysis.recommendations.length,
        potentialSavings 
      });

      return {
        totalSpend,
        potentialSavings,
        recommendations: analysis.recommendations,
        summary: analysis.summary,
        overlapMatrix: analysis.overlapMatrix
      };

    } catch (error) {
      logger.error('Claude API analysis failed', { error, auditId: audit.id });
      
      // Fall back to basic heuristic analysis
      return this.fallbackAnalysis(audit.tools, totalSpend);
    }
  }

  /**
   * Prepare the analysis prompt for Claude
   */
  private prepareAnalysisPrompt(tools: AuditTool[], totalSpend: number): string {
    const toolList = tools.map(tool => ({
      name: tool.toolName,
      monthlyCost: Number(tool.monthlyCost),
      seats: tool.seats,
      useCases: tool.useCases,
      utilization: tool.utilization || 'unknown'
    }));

    return `You are an expert AI tool spending analyst helping companies optimize their AI investments.

## Company's AI Tool Stack

Total Monthly Spend: $${totalSpend.toFixed(2)}

Tools:
${JSON.stringify(toolList, null, 2)}

## Your Task

Analyze this AI tool stack and provide actionable recommendations to reduce waste and improve ROI.

Consider:
1. **Overlap Detection**: Which tools have redundant capabilities?
2. **Utilization Analysis**: Are there underused tools that could be eliminated?
3. **Consolidation Opportunities**: Could multiple tools be replaced by one?
4. **Cost Optimization**: Are there cheaper alternatives with similar capabilities?
5. **Right-sizing**: Are they paying for more seats than needed?

## Response Format

Respond with a JSON object (no markdown code blocks, just the JSON):

{
  "summary": "2-3 sentence executive summary of findings",
  "overlapMatrix": {
    "toolName": ["list", "of", "overlapping", "tools"]
  },
  "recommendations": [
    {
      "type": "consolidate|eliminate|keep|migrate|optimize",
      "priority": 1-5,
      "description": "Specific, actionable recommendation with reasoning",
      "savingsEstimate": 123.45,
      "affectedTools": ["Tool1", "Tool2"]
    }
  ]
}

Priority scale:
- 5: Critical - immediate action, high savings
- 4: High - significant opportunity
- 3: Medium - worth considering
- 2: Low - minor optimization
- 1: Informational - no immediate action needed

Be specific about dollar amounts. Be direct about what to cut. The user is paying for this analysis — give them real value.`;
  }

  /**
   * Fallback analysis using heuristics when Claude API fails
   */
  private fallbackAnalysis(tools: AuditTool[], totalSpend: number): AnalysisResult {
    const recommendations: Recommendation[] = [];

    // Build use case overlap map
    const useCaseMap = new Map<string, AuditTool[]>();
    tools.forEach(tool => {
      tool.useCases.forEach(useCase => {
        if (!useCaseMap.has(useCase)) {
          useCaseMap.set(useCase, []);
        }
        useCaseMap.get(useCase)!.push(tool);
      });
    });

    // Generate consolidation recommendations for overlaps
    useCaseMap.forEach((toolsForUseCase, useCase) => {
      if (toolsForUseCase.length > 1) {
        const toolNames = toolsForUseCase.map(t => t.toolName);
        const totalCost = toolsForUseCase.reduce((sum, t) => sum + Number(t.monthlyCost), 0);
        const savingsEstimate = Math.round(totalCost * 0.4 * 100) / 100;

        recommendations.push({
          type: 'consolidate',
          priority: 4,
          description: `You have ${toolsForUseCase.length} tools for "${useCase}": ${toolNames.join(', ')}. Consolidating to your best-performing tool could save ~$${savingsEstimate}/month.`,
          savingsEstimate,
          affectedTools: toolNames
        });
      }
    });

    // Flag low utilization tools
    tools.forEach(tool => {
      if (tool.utilization === 'low') {
        const savings = Math.round(Number(tool.monthlyCost) * 0.75 * 100) / 100;
        recommendations.push({
          type: 'eliminate',
          priority: 5,
          description: `${tool.toolName} is marked as low utilization ($${Number(tool.monthlyCost)}/month). Consider eliminating or reducing to minimum seats.`,
          savingsEstimate: savings,
          affectedTools: [tool.toolName]
        });
      }
    });

    // Sort by priority (highest first)
    recommendations.sort((a, b) => b.priority - a.priority);

    const potentialSavings = recommendations.reduce((sum, rec) => sum + (rec.savingsEstimate || 0), 0);

    // Build overlap matrix
    const overlapMatrix: Record<string, string[]> = {};
    useCaseMap.forEach((toolsForUseCase, _) => {
      if (toolsForUseCase.length > 1) {
        toolsForUseCase.forEach(tool => {
          if (!overlapMatrix[tool.toolName]) {
            overlapMatrix[tool.toolName] = [];
          }
          toolsForUseCase.forEach(otherTool => {
            if (otherTool.toolName !== tool.toolName && !overlapMatrix[tool.toolName].includes(otherTool.toolName)) {
              overlapMatrix[tool.toolName].push(otherTool.toolName);
            }
          });
        });
      }
    });

    return {
      totalSpend,
      potentialSavings: Math.round(potentialSavings * 100) / 100,
      recommendations,
      summary: `Analysis of ${tools.length} AI tools totaling $${totalSpend.toFixed(2)}/month. Found ${recommendations.length} optimization opportunities with potential savings of $${potentialSavings.toFixed(2)}/month.`,
      overlapMatrix
    };
  }
}
