/**
 * StackAudit.ai - Core Audit Analysis Engine
 * 
 * Analyzes company AI tool stacks for:
 * - Overlap and redundancy
 * - ROI calculations (actual vs potential)
 * - Waste identification
 * - Actionable recommendations
 * 
 * @version 1.0.0
 */

// ============================================================================
// BENCHMARK DATA (from AI API Comparison Matrix 2025)
// ============================================================================

const BENCHMARK_DATA = {
  providers: {
    openai: {
      name: 'OpenAI',
      models: {
        'gpt-5.2': { input: 1.75, output: 14.00, context: 128000, speed: 'fast', tier: 'premium' },
        'gpt-5.2-pro': { input: 21.00, output: 168.00, context: 128000, speed: 'medium', tier: 'enterprise' },
        'gpt-5-mini': { input: 0.25, output: 2.00, context: 128000, speed: 'fast', tier: 'mid' },
        'gpt-4.1': { input: 2.00, output: 8.00, context: 128000, speed: 'fast', tier: 'premium' },
        'gpt-4.1-mini': { input: 0.40, output: 1.60, context: 128000, speed: 'fast', tier: 'mid' },
        'gpt-4.1-nano': { input: 0.10, output: 0.40, context: 128000, speed: 'fast', tier: 'budget' },
        'gpt-4o': { input: 2.50, output: 10.00, context: 128000, speed: 'fast', tier: 'premium' },
        'gpt-4o-mini': { input: 0.15, output: 0.60, context: 128000, speed: 'fast', tier: 'budget' },
      },
      capabilities: ['chat', 'coding', 'vision', 'audio', 'function-calling', 'fine-tuning', 'batch', 'realtime'],
      strengths: ['coding', 'general', 'agents', 'tooling'],
      cachingDiscount: 0.90,
      batchDiscount: 0.50,
    },
    anthropic: {
      name: 'Anthropic',
      models: {
        'claude-opus-4.5': { input: 5.00, output: 25.00, context: 200000, speed: 'medium', tier: 'enterprise' },
        'claude-opus-4.1': { input: 15.00, output: 75.00, context: 200000, speed: 'medium', tier: 'enterprise' },
        'claude-sonnet-4': { input: 3.00, output: 15.00, context: 200000, speed: 'medium', tier: 'premium' },
        'claude-sonnet-3.7': { input: 3.00, output: 15.00, context: 200000, speed: 'medium', tier: 'premium' },
        'claude-3.5-sonnet': { input: 3.00, output: 15.00, context: 200000, speed: 'medium', tier: 'premium' },
        'claude-3.5-haiku': { input: 0.80, output: 4.00, context: 200000, speed: 'fast', tier: 'mid' },
        'claude-3-haiku': { input: 0.25, output: 1.25, context: 200000, speed: 'fast', tier: 'budget' },
      },
      capabilities: ['chat', 'coding', 'vision', 'function-calling', 'computer-use', 'extended-thinking'],
      strengths: ['safety', 'long-context', 'analysis', 'reasoning'],
      cachingDiscount: 0.90,
    },
    google: {
      name: 'Google (Gemini)',
      models: {
        'gemini-2.5-pro': { input: 1.25, output: 10.00, context: 2000000, speed: 'fast', tier: 'premium' },
        'gemini-2.5-flash': { input: 0.15, output: 0.60, context: 1000000, speed: 'fast', tier: 'budget' },
        'gemini-2.0-flash': { input: 0.10, output: 0.40, context: 1000000, speed: 'fast', tier: 'budget' },
        'gemini-1.5-pro': { input: 1.25, output: 5.00, context: 2000000, speed: 'medium', tier: 'mid' },
        'gemini-1.5-flash': { input: 0.075, output: 0.30, context: 1000000, speed: 'fast', tier: 'budget' },
      },
      capabilities: ['chat', 'coding', 'vision', 'audio', 'video', 'function-calling', 'search-grounding'],
      strengths: ['multimodal', 'long-context', 'cost-effective'],
      cachingDiscount: 0.75,
      freeRPD: 1500,
    },
    mistral: {
      name: 'Mistral AI',
      models: {
        'mistral-large': { input: 2.00, output: 6.00, context: 128000, speed: 'fast', tier: 'premium' },
        'mistral-medium': { input: 2.70, output: 8.10, context: 32000, speed: 'medium', tier: 'mid' },
        'mistral-small': { input: 0.20, output: 0.60, context: 32000, speed: 'fast', tier: 'budget' },
        'codestral': { input: 0.30, output: 0.90, context: 32000, speed: 'fast', tier: 'budget' },
      },
      capabilities: ['chat', 'coding', 'function-calling', 'json-mode'],
      strengths: ['eu-compliance', 'cost-effective', 'open-weights'],
    },
    deepseek: {
      name: 'DeepSeek',
      models: {
        'deepseek-v3.2': { input: 0.28, output: 0.42, context: 128000, speed: 'medium', tier: 'budget' },
        'deepseek-reasoner': { input: 0.55, output: 2.19, context: 64000, speed: 'medium', tier: 'budget' },
        'deepseek-r1': { input: 0.55, output: 2.19, context: 64000, speed: 'medium', tier: 'budget' },
      },
      capabilities: ['chat', 'coding', 'function-calling', 'json-mode', 'reasoning'],
      strengths: ['budget', 'reasoning', 'open-source'],
      cachingDiscount: 0.97,
      warnings: ['china-based', 'data-sovereignty', 'availability-issues'],
    },
    groq: {
      name: 'Groq',
      models: {
        'gpt-oss-120b': { input: 0.15, output: 0.60, context: 128000, speed: 'ultra', tier: 'budget' },
        'gpt-oss-20b': { input: 0.075, output: 0.30, context: 128000, speed: 'ultra', tier: 'budget' },
        'llama-4-maverick': { input: 0.20, output: 0.60, context: 128000, speed: 'ultra', tier: 'budget' },
        'llama-3.3-70b': { input: 0.59, output: 0.79, context: 128000, speed: 'ultra', tier: 'budget' },
        'llama-3.1-8b': { input: 0.05, output: 0.08, context: 128000, speed: 'ultra', tier: 'budget' },
      },
      capabilities: ['chat', 'coding', 'function-calling', 'web-search', 'batch'],
      strengths: ['speed', 'cost-effective', 'prototyping'],
      batchDiscount: 0.50,
    },
    together: {
      name: 'Together AI',
      models: {
        'llama-4-maverick': { input: 0.27, output: 0.85, context: 128000, speed: 'fast', tier: 'budget' },
        'llama-4-scout': { input: 0.18, output: 0.59, context: 128000, speed: 'fast', tier: 'budget' },
        'llama-3.3-70b': { input: 0.88, output: 0.88, context: 128000, speed: 'fast', tier: 'budget' },
        'llama-3.1-405b': { input: 3.50, output: 3.50, context: 128000, speed: 'medium', tier: 'premium' },
        'deepseek-r1': { input: 3.00, output: 7.00, context: 128000, speed: 'medium', tier: 'mid' },
      },
      capabilities: ['chat', 'coding', 'fine-tuning', 'batch', 'image-gen', 'video-gen'],
      strengths: ['open-source', 'fine-tuning', 'variety'],
    },
    cohere: {
      name: 'Cohere',
      models: {
        'command-r-plus': { input: 2.50, output: 10.00, context: 128000, speed: 'medium', tier: 'premium' },
        'command-r': { input: 0.15, output: 0.60, context: 128000, speed: 'medium', tier: 'budget' },
        'command-r7b': { input: 0.0375, output: 0.15, context: 128000, speed: 'fast', tier: 'budget' },
        'embed-v4': { input: 0.06, output: 0, context: 0, speed: 'fast', tier: 'budget' },
        'rerank-3.5': { input: 2.00, output: 0, context: 0, speed: 'fast', tier: 'mid' },
      },
      capabilities: ['chat', 'rag', 'embeddings', 'rerank', 'multilingual'],
      strengths: ['enterprise', 'rag', 'search'],
    },
    perplexity: {
      name: 'Perplexity',
      models: {
        'sonar-reasoning-pro': { input: 3.00, output: 15.00, context: 128000, speed: 'medium', tier: 'premium', requestFee: 5.00 },
        'sonar-pro': { input: 3.00, output: 15.00, context: 128000, speed: 'medium', tier: 'premium', requestFee: 5.00 },
        'sonar': { input: 1.00, output: 1.00, context: 128000, speed: 'medium', tier: 'mid', requestFee: 5.00 },
      },
      capabilities: ['chat', 'web-search', 'citations', 'reasoning'],
      strengths: ['real-time-search', 'citations'],
    },
    aws_bedrock: {
      name: 'AWS Bedrock',
      models: {
        'claude-3.7-sonnet': { input: 3.00, output: 15.00, context: 200000, speed: 'medium', tier: 'premium' },
        'claude-3.5-sonnet': { input: 3.00, output: 15.00, context: 200000, speed: 'medium', tier: 'premium' },
        'llama-3.1-405b': { input: 5.32, output: 16.00, context: 128000, speed: 'medium', tier: 'premium' },
        'amazon-nova-pro': { input: 0.80, output: 3.20, context: 128000, speed: 'fast', tier: 'mid' },
      },
      capabilities: ['chat', 'rag', 'fine-tuning', 'guardrails', 'multi-provider'],
      strengths: ['aws-integration', 'enterprise', 'compliance'],
    },
  },

  // Capability categories for overlap detection
  capabilityCategories: {
    'text-generation': ['chat', 'coding', 'analysis'],
    'multimodal': ['vision', 'audio', 'video'],
    'search': ['web-search', 'rag', 'search-grounding'],
    'embeddings': ['embeddings', 'rerank'],
    'automation': ['function-calling', 'agents', 'computer-use'],
    'customization': ['fine-tuning', 'batch'],
  },

  // Use case to capability mapping
  useCaseCapabilities: {
    'chatbot': ['chat', 'function-calling'],
    'coding-assistant': ['coding', 'chat'],
    'document-analysis': ['chat', 'vision', 'long-context'],
    'search-assistant': ['web-search', 'rag', 'citations'],
    'content-generation': ['chat', 'batch'],
    'customer-support': ['chat', 'function-calling', 'rag'],
    'data-extraction': ['vision', 'json-mode', 'function-calling'],
    'translation': ['multilingual', 'chat'],
    'summarization': ['chat', 'long-context'],
    'code-review': ['coding', 'chat'],
  },
};

// ============================================================================
// AUDIT ENGINE CLASS
// ============================================================================

class AuditEngine {
  constructor(options = {}) {
    this.benchmarks = BENCHMARK_DATA;
    this.options = {
      currency: 'USD',
      includeRecommendations: true,
      detailedAnalysis: true,
      ...options,
    };
  }

  /**
   * Main audit entry point
   * @param {Object} companyData - Company's AI tool stack data
   * @returns {Object} Complete audit report
   */
  async runAudit(companyData) {
    const startTime = Date.now();
    
    // Validate input
    const validation = this.validateInput(companyData);
    if (!validation.valid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    // Normalize tool data
    const normalizedTools = this.normalizeToolData(companyData.tools);

    // Run all analyses
    const overlapAnalysis = this.analyzeOverlap(normalizedTools);
    const roiAnalysis = this.analyzeROI(normalizedTools, companyData.businessMetrics);
    const wasteAnalysis = this.analyzeWaste(normalizedTools);
    const benchmarkComparison = this.compareToBenchmarks(normalizedTools);
    const consolidationOpportunities = this.findConsolidationOpportunities(normalizedTools);
    
    // Generate recommendations
    const recommendations = this.options.includeRecommendations 
      ? this.generateRecommendations({
          overlapAnalysis,
          roiAnalysis,
          wasteAnalysis,
          benchmarkComparison,
          consolidationOpportunities,
          tools: normalizedTools,
          businessMetrics: companyData.businessMetrics,
        })
      : [];

    // Calculate overall health score
    const healthScore = this.calculateHealthScore({
      overlapAnalysis,
      roiAnalysis,
      wasteAnalysis,
    });

    return {
      meta: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        toolsAnalyzed: normalizedTools.length,
        version: '1.0.0',
      },
      summary: {
        healthScore,
        totalMonthlySpend: this.calculateTotalSpend(normalizedTools),
        potentialSavings: this.calculatePotentialSavings(wasteAnalysis, consolidationOpportunities),
        criticalIssues: this.getCriticalIssues({ overlapAnalysis, roiAnalysis, wasteAnalysis }),
      },
      analyses: {
        overlap: overlapAnalysis,
        roi: roiAnalysis,
        waste: wasteAnalysis,
        benchmarks: benchmarkComparison,
        consolidation: consolidationOpportunities,
      },
      recommendations,
      tools: normalizedTools,
    };
  }

  // ============================================================================
  // INPUT VALIDATION & NORMALIZATION
  // ============================================================================

  validateInput(data) {
    const errors = [];

    if (!data) {
      errors.push('No data provided');
      return { valid: false, errors };
    }

    if (!data.tools || !Array.isArray(data.tools)) {
      errors.push('tools must be an array');
    } else {
      data.tools.forEach((tool, idx) => {
        if (!tool.name) errors.push(`Tool at index ${idx} missing name`);
        if (!tool.provider) errors.push(`Tool "${tool.name || idx}" missing provider`);
      });
    }

    return { valid: errors.length === 0, errors };
  }

  normalizeToolData(tools) {
    return tools.map(tool => ({
      // Basic info
      id: tool.id || this.generateId(tool.name),
      name: tool.name,
      provider: tool.provider.toLowerCase().replace(/\s+/g, '_'),
      model: tool.model || 'unknown',
      
      // Cost data
      costs: {
        monthly: tool.monthlyCost || tool.costs?.monthly || 0,
        perToken: {
          input: tool.inputCostPer1M || tool.costs?.perToken?.input || null,
          output: tool.outputCostPer1M || tool.costs?.perToken?.output || null,
        },
        fixed: tool.fixedCost || tool.costs?.fixed || 0,
      },
      
      // Usage data
      usage: {
        monthlyTokens: {
          input: tool.monthlyInputTokens || tool.usage?.monthlyTokens?.input || 0,
          output: tool.monthlyOutputTokens || tool.usage?.monthlyTokens?.output || 0,
        },
        monthlyRequests: tool.monthlyRequests || tool.usage?.monthlyRequests || 0,
        activeUsers: tool.activeUsers || tool.usage?.activeUsers || 0,
        lastUsed: tool.lastUsed || tool.usage?.lastUsed || null,
        utilizationRate: tool.utilizationRate || tool.usage?.utilizationRate || null,
      },
      
      // Capabilities
      capabilities: tool.capabilities || [],
      useCases: tool.useCases || [],
      features: tool.features || [],
      
      // Additional metadata
      department: tool.department || 'unknown',
      owner: tool.owner || null,
      contractEndDate: tool.contractEndDate || null,
      notes: tool.notes || null,
    }));
  }

  generateId(name) {
    return `tool_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
  }

  // ============================================================================
  // OVERLAP ANALYSIS
  // ============================================================================

  analyzeOverlap(tools) {
    const overlaps = [];
    const capabilityMatrix = {};
    const useCaseMatrix = {};

    // Build capability matrix
    tools.forEach(tool => {
      tool.capabilities.forEach(cap => {
        if (!capabilityMatrix[cap]) capabilityMatrix[cap] = [];
        capabilityMatrix[cap].push(tool.id);
      });
      
      tool.useCases.forEach(useCase => {
        if (!useCaseMatrix[useCase]) useCaseMatrix[useCase] = [];
        useCaseMatrix[useCase].push(tool.id);
      });
    });

    // Find overlapping capabilities
    const capabilityOverlaps = Object.entries(capabilityMatrix)
      .filter(([_, toolIds]) => toolIds.length > 1)
      .map(([capability, toolIds]) => ({
        type: 'capability',
        name: capability,
        tools: toolIds.map(id => tools.find(t => t.id === id)),
        redundancyScore: this.calculateRedundancyScore(toolIds, tools),
        wastedSpend: this.calculateOverlapWaste(toolIds, tools, capability),
      }));

    // Find overlapping use cases
    const useCaseOverlaps = Object.entries(useCaseMatrix)
      .filter(([_, toolIds]) => toolIds.length > 1)
      .map(([useCase, toolIds]) => ({
        type: 'use_case',
        name: useCase,
        tools: toolIds.map(id => tools.find(t => t.id === id)),
        redundancyScore: this.calculateRedundancyScore(toolIds, tools),
        wastedSpend: this.calculateOverlapWaste(toolIds, tools, useCase),
      }));

    // Pairwise tool comparison
    const pairwiseOverlaps = [];
    for (let i = 0; i < tools.length; i++) {
      for (let j = i + 1; j < tools.length; j++) {
        const similarity = this.calculateToolSimilarity(tools[i], tools[j]);
        if (similarity.score > 0.5) {
          pairwiseOverlaps.push({
            tools: [tools[i], tools[j]],
            similarityScore: similarity.score,
            sharedCapabilities: similarity.sharedCapabilities,
            sharedUseCases: similarity.sharedUseCases,
            recommendation: similarity.score > 0.8 
              ? 'strong_consolidation_candidate'
              : 'review_for_consolidation',
          });
        }
      }
    }

    // Calculate overall redundancy metrics
    const totalRedundancy = this.calculateTotalRedundancy(tools, capabilityOverlaps);

    return {
      summary: {
        totalOverlaps: capabilityOverlaps.length + useCaseOverlaps.length,
        redundancyPercentage: totalRedundancy.percentage,
        estimatedWaste: totalRedundancy.wastedSpend,
      },
      byCapability: capabilityOverlaps,
      byUseCase: useCaseOverlaps,
      pairwise: pairwiseOverlaps,
      capabilityMatrix,
      useCaseMatrix,
    };
  }

  calculateRedundancyScore(toolIds, tools) {
    if (toolIds.length <= 1) return 0;
    
    const relevantTools = tools.filter(t => toolIds.includes(t.id));
    const totalSpend = relevantTools.reduce((sum, t) => sum + t.costs.monthly, 0);
    const highestSpend = Math.max(...relevantTools.map(t => t.costs.monthly));
    
    // Redundancy = (total spend - highest single tool spend) / total spend
    return totalSpend > 0 ? (totalSpend - highestSpend) / totalSpend : 0;
  }

  calculateOverlapWaste(toolIds, tools, capability) {
    const relevantTools = tools.filter(t => toolIds.includes(t.id));
    const sortedByValue = relevantTools.sort((a, b) => {
      // Sort by value (usage / cost ratio)
      const valueA = (a.usage.monthlyRequests || 1) / (a.costs.monthly || 1);
      const valueB = (b.usage.monthlyRequests || 1) / (b.costs.monthly || 1);
      return valueB - valueA;
    });

    // The waste is the cost of all tools except the best one for this capability
    return sortedByValue.slice(1).reduce((sum, t) => {
      // Estimate the portion of cost attributable to this capability
      const capabilityCount = t.capabilities.length || 1;
      return sum + (t.costs.monthly / capabilityCount);
    }, 0);
  }

  calculateToolSimilarity(tool1, tool2) {
    const caps1 = new Set(tool1.capabilities);
    const caps2 = new Set(tool2.capabilities);
    const sharedCaps = [...caps1].filter(c => caps2.has(c));
    
    const useCases1 = new Set(tool1.useCases);
    const useCases2 = new Set(tool2.useCases);
    const sharedUseCases = [...useCases1].filter(u => useCases2.has(u));

    const capSimilarity = sharedCaps.length / Math.max(caps1.size, caps2.size, 1);
    const useCaseSimilarity = sharedUseCases.length / Math.max(useCases1.size, useCases2.size, 1);

    // Also factor in if they're from similar providers/categories
    const providerSimilarity = tool1.provider === tool2.provider ? 0.3 : 0;

    const score = (capSimilarity * 0.4) + (useCaseSimilarity * 0.4) + providerSimilarity;

    return {
      score: Math.min(score, 1),
      sharedCapabilities: sharedCaps,
      sharedUseCases,
    };
  }

  calculateTotalRedundancy(tools, capabilityOverlaps) {
    const totalSpend = tools.reduce((sum, t) => sum + t.costs.monthly, 0);
    const wastedSpend = capabilityOverlaps.reduce((sum, o) => sum + o.wastedSpend, 0);
    
    return {
      percentage: totalSpend > 0 ? (wastedSpend / totalSpend) * 100 : 0,
      wastedSpend,
    };
  }

  // ============================================================================
  // ROI ANALYSIS
  // ============================================================================

  analyzeROI(tools, businessMetrics = {}) {
    const toolROIs = tools.map(tool => this.calculateToolROI(tool, businessMetrics));
    
    // Aggregate metrics
    const totalCost = toolROIs.reduce((sum, t) => sum + t.monthlyCost, 0);
    const totalValue = toolROIs.reduce((sum, t) => sum + t.estimatedValue, 0);
    const averageROI = toolROIs.length > 0 
      ? toolROIs.reduce((sum, t) => sum + t.roiPercentage, 0) / toolROIs.length 
      : 0;

    // Identify underperformers
    const underperformers = toolROIs.filter(t => t.roiPercentage < 100);
    const topPerformers = toolROIs.filter(t => t.roiPercentage >= 200);

    // Calculate potential ROI with optimizations
    const potentialROI = this.calculatePotentialROI(tools, businessMetrics);

    return {
      summary: {
        totalMonthlyCost: totalCost,
        totalEstimatedValue: totalValue,
        aggregateROI: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        averageToolROI: averageROI,
      },
      byTool: toolROIs,
      underperformers,
      topPerformers,
      potential: potentialROI,
      insights: this.generateROIInsights(toolROIs, businessMetrics),
    };
  }

  calculateToolROI(tool, businessMetrics) {
    const monthlyCost = tool.costs.monthly;
    
    // Estimate value based on usage and business metrics
    let estimatedValue = 0;
    
    // Value from productivity (time saved)
    if (tool.usage.monthlyRequests > 0) {
      const avgTimePerRequest = businessMetrics.avgMinutesPerTask || 5;
      const hourlyRate = businessMetrics.avgHourlyRate || 50;
      const automationFactor = 0.7; // Assumes 70% time savings
      
      estimatedValue += (tool.usage.monthlyRequests * avgTimePerRequest * automationFactor / 60) * hourlyRate;
    }

    // Value from active users
    if (tool.usage.activeUsers > 0) {
      const productivityGain = businessMetrics.productivityGainPerUser || 200; // $/month per user
      estimatedValue += tool.usage.activeUsers * productivityGain;
    }

    // Calculate various ROI metrics
    const roi = monthlyCost > 0 ? ((estimatedValue - monthlyCost) / monthlyCost) * 100 : 0;
    const costPerRequest = tool.usage.monthlyRequests > 0 
      ? monthlyCost / tool.usage.monthlyRequests 
      : null;
    const costPerUser = tool.usage.activeUsers > 0 
      ? monthlyCost / tool.usage.activeUsers 
      : null;

    // Compare to benchmark
    const benchmarkCost = this.getBenchmarkCost(tool);

    return {
      toolId: tool.id,
      toolName: tool.name,
      monthlyCost,
      estimatedValue,
      roiPercentage: roi,
      costPerRequest,
      costPerUser,
      benchmarkComparison: benchmarkCost ? {
        currentCost: monthlyCost,
        benchmarkCost,
        difference: monthlyCost - benchmarkCost,
        percentageAboveBenchmark: benchmarkCost > 0 
          ? ((monthlyCost - benchmarkCost) / benchmarkCost) * 100 
          : 0,
      } : null,
      status: roi >= 200 ? 'excellent' : roi >= 100 ? 'good' : roi >= 50 ? 'marginal' : 'poor',
    };
  }

  getBenchmarkCost(tool) {
    const providerData = this.benchmarks.providers[tool.provider];
    if (!providerData) return null;

    const modelData = providerData.models[tool.model];
    if (!modelData) return null;

    // Calculate benchmark cost based on usage
    const inputTokensCost = (tool.usage.monthlyTokens.input / 1000000) * modelData.input;
    const outputTokensCost = (tool.usage.monthlyTokens.output / 1000000) * modelData.output;

    return inputTokensCost + outputTokensCost;
  }

  calculatePotentialROI(tools, businessMetrics) {
    const optimizations = [];
    let potentialSavings = 0;

    tools.forEach(tool => {
      // Check for cheaper alternatives
      const alternatives = this.findCheaperAlternatives(tool);
      if (alternatives.length > 0) {
        const bestAlt = alternatives[0];
        const savings = tool.costs.monthly - bestAlt.estimatedCost;
        if (savings > 0) {
          potentialSavings += savings;
          optimizations.push({
            tool: tool.name,
            type: 'switch_provider',
            alternative: bestAlt.name,
            monthlySavings: savings,
          });
        }
      }

      // Check for caching opportunities
      const providerData = this.benchmarks.providers[tool.provider];
      if (providerData?.cachingDiscount && tool.usage.monthlyTokens.input > 1000000) {
        const cachingSavings = tool.costs.monthly * providerData.cachingDiscount * 0.3; // Assume 30% cache hit rate
        potentialSavings += cachingSavings;
        optimizations.push({
          tool: tool.name,
          type: 'enable_caching',
          monthlySavings: cachingSavings,
        });
      }

      // Check for batch processing opportunities
      if (providerData?.batchDiscount && !tool.features?.includes('batch')) {
        const batchSavings = tool.costs.monthly * providerData.batchDiscount * 0.2; // Assume 20% batchable
        potentialSavings += batchSavings;
        optimizations.push({
          tool: tool.name,
          type: 'use_batch_api',
          monthlySavings: batchSavings,
        });
      }
    });

    const currentTotalCost = tools.reduce((sum, t) => sum + t.costs.monthly, 0);
    
    return {
      currentMonthlyCost: currentTotalCost,
      optimizedMonthlyCost: currentTotalCost - potentialSavings,
      potentialMonthlySavings: potentialSavings,
      potentialAnnualSavings: potentialSavings * 12,
      optimizations,
    };
  }

  findCheaperAlternatives(tool) {
    const alternatives = [];
    const currentCost = tool.costs.monthly;
    const requiredCapabilities = new Set(tool.capabilities);

    Object.entries(this.benchmarks.providers).forEach(([providerId, provider]) => {
      // Skip same provider
      if (providerId === tool.provider) return;

      // Check if provider has required capabilities
      const providerCaps = new Set(provider.capabilities);
      const hasAllCaps = [...requiredCapabilities].every(cap => providerCaps.has(cap));
      if (!hasAllCaps) return;

      // Find cheapest suitable model
      Object.entries(provider.models).forEach(([modelId, model]) => {
        const estimatedCost = this.estimateCostWithModel(tool, model);
        if (estimatedCost < currentCost * 0.8) { // At least 20% cheaper
          alternatives.push({
            providerId,
            providerName: provider.name,
            modelId,
            name: `${provider.name} - ${modelId}`,
            estimatedCost,
            savings: currentCost - estimatedCost,
            savingsPercentage: ((currentCost - estimatedCost) / currentCost) * 100,
            tier: model.tier,
            caveats: provider.warnings || [],
          });
        }
      });
    });

    return alternatives.sort((a, b) => a.estimatedCost - b.estimatedCost);
  }

  estimateCostWithModel(tool, model) {
    const inputCost = (tool.usage.monthlyTokens.input / 1000000) * model.input;
    const outputCost = (tool.usage.monthlyTokens.output / 1000000) * model.output;
    return inputCost + outputCost;
  }

  generateROIInsights(toolROIs, businessMetrics) {
    const insights = [];

    // Identify tools with negative ROI
    const negativeROI = toolROIs.filter(t => t.roiPercentage < 0);
    if (negativeROI.length > 0) {
      insights.push({
        type: 'critical',
        title: 'Tools with Negative ROI',
        description: `${negativeROI.length} tool(s) are costing more than the value they provide`,
        tools: negativeROI.map(t => t.toolName),
        action: 'Review for immediate optimization or removal',
      });
    }

    // Identify underutilized expensive tools
    const expensiveUnderutilized = toolROIs.filter(t => 
      t.monthlyCost > 500 && t.costPerRequest && t.costPerRequest > 0.10
    );
    if (expensiveUnderutilized.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Expensive Underutilized Tools',
        description: 'High-cost tools with low usage rates',
        tools: expensiveUnderutilized.map(t => t.toolName),
        action: 'Increase adoption or consider downgrading',
      });
    }

    // Identify high performers
    const highPerformers = toolROIs.filter(t => t.roiPercentage > 500);
    if (highPerformers.length > 0) {
      insights.push({
        type: 'success',
        title: 'High-Value Tools',
        description: 'Tools delivering exceptional ROI',
        tools: highPerformers.map(t => t.toolName),
        action: 'Consider expanding usage or investment',
      });
    }

    return insights;
  }

  // ============================================================================
  // WASTE ANALYSIS
  // ============================================================================

  analyzeWaste(tools) {
    const wasteCategories = {
      unusedFeatures: [],
      underutilizedTools: [],
      duplicateCapabilities: [],
      overProvisioned: [],
      zombieSubscriptions: [],
    };

    tools.forEach(tool => {
      // Check for unused features
      const unusedFeatures = this.detectUnusedFeatures(tool);
      if (unusedFeatures.length > 0) {
        wasteCategories.unusedFeatures.push({
          tool: tool.name,
          features: unusedFeatures,
          estimatedWaste: this.estimateFeatureWaste(tool, unusedFeatures),
        });
      }

      // Check for underutilization
      const utilization = this.calculateUtilization(tool);
      if (utilization < 20) {
        wasteCategories.underutilizedTools.push({
          tool: tool.name,
          utilizationPercentage: utilization,
          monthlyCost: tool.costs.monthly,
          recommendation: utilization < 5 ? 'cancel' : 'optimize_or_downgrade',
        });
      }

      // Check for over-provisioning
      const isOverProvisioned = this.checkOverProvisioning(tool);
      if (isOverProvisioned.overProvisioned) {
        wasteCategories.overProvisioned.push({
          tool: tool.name,
          currentTier: isOverProvisioned.currentTier,
          recommendedTier: isOverProvisioned.recommendedTier,
          monthlySavings: isOverProvisioned.potentialSavings,
        });
      }

      // Check for zombie subscriptions (not used recently)
      if (this.isZombieSubscription(tool)) {
        wasteCategories.zombieSubscriptions.push({
          tool: tool.name,
          lastUsed: tool.usage.lastUsed,
          monthlyCost: tool.costs.monthly,
          daysSinceLastUse: this.daysSinceLastUse(tool),
        });
      }
    });

    // Calculate total waste
    const totalSpend = tools.reduce((sum, t) => sum + t.costs.monthly, 0);
    const totalWaste = this.calculateTotalWaste(wasteCategories, totalSpend);

    return {
      summary: {
        totalMonthlyWaste: totalWaste.monthly,
        totalAnnualWaste: totalWaste.annual,
        wastePercentage: totalWaste.percentage,
        categoriesAffected: Object.values(wasteCategories).filter(c => c.length > 0).length,
      },
      categories: wasteCategories,
      topWasteSources: this.identifyTopWasteSources(wasteCategories),
    };
  }

  detectUnusedFeatures(tool) {
    const providerData = this.benchmarks.providers[tool.provider];
    if (!providerData) return [];

    const availableCapabilities = providerData.capabilities || [];
    const usedCapabilities = new Set(tool.capabilities);
    
    return availableCapabilities.filter(cap => !usedCapabilities.has(cap));
  }

  estimateFeatureWaste(tool, unusedFeatures) {
    // Estimate that each unused feature represents ~10% of the cost
    const wastePerFeature = tool.costs.monthly * 0.1;
    return Math.min(unusedFeatures.length * wastePerFeature, tool.costs.monthly * 0.5);
  }

  calculateUtilization(tool) {
    if (tool.usage.utilizationRate !== null) {
      return tool.usage.utilizationRate;
    }

    // Estimate based on usage patterns
    const providerData = this.benchmarks.providers[tool.provider];
    if (!providerData) return 50; // Default to 50% if unknown

    // Compare to typical usage patterns
    const typicalMonthlyRequests = 10000; // Baseline
    const actualRequests = tool.usage.monthlyRequests || 0;
    
    return Math.min((actualRequests / typicalMonthlyRequests) * 100, 100);
  }

  checkOverProvisioning(tool) {
    const providerData = this.benchmarks.providers[tool.provider];
    if (!providerData) return { overProvisioned: false };

    const modelData = providerData.models[tool.model];
    if (!modelData) return { overProvisioned: false };

    // Check if a cheaper tier would suffice
    const tierOrder = ['budget', 'mid', 'premium', 'enterprise'];
    const currentTierIndex = tierOrder.indexOf(modelData.tier);
    
    // If using premium/enterprise but low usage, suggest downgrade
    if (currentTierIndex >= 2 && tool.usage.monthlyRequests < 5000) {
      // Find cheaper alternative in same provider
      const cheaperModels = Object.entries(providerData.models)
        .filter(([_, m]) => tierOrder.indexOf(m.tier) < currentTierIndex)
        .sort((a, b) => a[1].output - b[1].output);

      if (cheaperModels.length > 0) {
        const [cheaperModelId, cheaperModel] = cheaperModels[0];
        const currentCost = tool.costs.monthly;
        const estimatedNewCost = this.estimateCostWithModel(tool, cheaperModel);
        
        return {
          overProvisioned: true,
          currentTier: modelData.tier,
          recommendedTier: cheaperModel.tier,
          recommendedModel: cheaperModelId,
          potentialSavings: currentCost - estimatedNewCost,
        };
      }
    }

    return { overProvisioned: false };
  }

  isZombieSubscription(tool) {
    if (!tool.usage.lastUsed) return false;
    return this.daysSinceLastUse(tool) > 30;
  }

  daysSinceLastUse(tool) {
    if (!tool.usage.lastUsed) return Infinity;
    const lastUsed = new Date(tool.usage.lastUsed);
    const now = new Date();
    return Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));
  }

  calculateTotalWaste(wasteCategories, totalSpend = 0) {
    let monthly = 0;

    wasteCategories.unusedFeatures.forEach(w => monthly += w.estimatedWaste);
    wasteCategories.underutilizedTools.forEach(w => monthly += w.monthlyCost * 0.5);
    wasteCategories.overProvisioned.forEach(w => monthly += w.monthlySavings);
    wasteCategories.zombieSubscriptions.forEach(w => monthly += w.monthlyCost);

    return {
      monthly,
      annual: monthly * 12,
      percentage: totalSpend > 0 ? (monthly / totalSpend) * 100 : 0,
    };
  }

  identifyTopWasteSources(wasteCategories) {
    const allWaste = [];

    wasteCategories.unusedFeatures.forEach(w => {
      allWaste.push({ 
        tool: w.tool, 
        category: 'unused_features', 
        amount: w.estimatedWaste 
      });
    });

    wasteCategories.underutilizedTools.forEach(w => {
      allWaste.push({ 
        tool: w.tool, 
        category: 'underutilized', 
        amount: w.monthlyCost * 0.5 
      });
    });

    wasteCategories.overProvisioned.forEach(w => {
      allWaste.push({ 
        tool: w.tool, 
        category: 'over_provisioned', 
        amount: w.monthlySavings 
      });
    });

    wasteCategories.zombieSubscriptions.forEach(w => {
      allWaste.push({ 
        tool: w.tool, 
        category: 'zombie', 
        amount: w.monthlyCost 
      });
    });

    return allWaste.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }

  // ============================================================================
  // BENCHMARK COMPARISON
  // ============================================================================

  compareToBenchmarks(tools) {
    const comparisons = tools.map(tool => {
      const benchmarkData = this.getBenchmarkData(tool);
      
      return {
        tool: tool.name,
        provider: tool.provider,
        model: tool.model,
        currentPricing: {
          input: tool.costs.perToken.input,
          output: tool.costs.perToken.output,
          monthly: tool.costs.monthly,
        },
        benchmarkPricing: benchmarkData?.pricing || null,
        difference: benchmarkData ? {
          inputDiff: tool.costs.perToken.input 
            ? tool.costs.perToken.input - benchmarkData.pricing.input 
            : null,
          outputDiff: tool.costs.perToken.output 
            ? tool.costs.perToken.output - benchmarkData.pricing.output 
            : null,
        } : null,
        marketPosition: this.determineMarketPosition(tool),
        alternatives: this.findAlternatives(tool),
      };
    });

    return {
      comparisons,
      summary: this.summarizeBenchmarkComparison(comparisons),
      marketInsights: this.generateMarketInsights(tools),
    };
  }

  getBenchmarkData(tool) {
    const providerData = this.benchmarks.providers[tool.provider];
    if (!providerData) return null;

    const modelData = providerData.models[tool.model];
    if (!modelData) return null;

    return {
      pricing: {
        input: modelData.input,
        output: modelData.output,
      },
      context: modelData.context,
      speed: modelData.speed,
      tier: modelData.tier,
      capabilities: providerData.capabilities,
    };
  }

  determineMarketPosition(tool) {
    const allOutputPrices = [];
    
    Object.values(this.benchmarks.providers).forEach(provider => {
      Object.values(provider.models).forEach(model => {
        allOutputPrices.push(model.output);
      });
    });

    const sortedPrices = allOutputPrices.sort((a, b) => a - b);
    const toolPrice = tool.costs.perToken.output || 0;
    
    const percentile = (sortedPrices.filter(p => p <= toolPrice).length / sortedPrices.length) * 100;

    if (percentile <= 25) return 'budget';
    if (percentile <= 50) return 'mid-range';
    if (percentile <= 75) return 'premium';
    return 'enterprise';
  }

  findAlternatives(tool) {
    const alternatives = [];
    const toolCaps = new Set(tool.capabilities);

    Object.entries(this.benchmarks.providers).forEach(([providerId, provider]) => {
      if (providerId === tool.provider) return;

      const providerCaps = new Set(provider.capabilities);
      const matchingCaps = [...toolCaps].filter(c => providerCaps.has(c));
      const capabilityMatch = matchingCaps.length / Math.max(toolCaps.size, 1);

      if (capabilityMatch >= 0.7) {
        // Find best model from this provider
        const models = Object.entries(provider.models)
          .map(([id, m]) => ({ id, ...m }))
          .sort((a, b) => a.output - b.output);

        if (models.length > 0) {
          alternatives.push({
            provider: provider.name,
            providerId,
            topModel: models[0].id,
            pricing: {
              input: models[0].input,
              output: models[0].output,
            },
            capabilityMatch,
            strengths: provider.strengths,
            warnings: provider.warnings || [],
          });
        }
      }
    });

    return alternatives.sort((a, b) => a.pricing.output - b.pricing.output).slice(0, 5);
  }

  summarizeBenchmarkComparison(comparisons) {
    const aboveBenchmark = comparisons.filter(c => 
      c.difference?.outputDiff && c.difference.outputDiff > 0
    ).length;

    const belowBenchmark = comparisons.filter(c => 
      c.difference?.outputDiff && c.difference.outputDiff < 0
    ).length;

    return {
      toolsAboveBenchmark: aboveBenchmark,
      toolsBelowBenchmark: belowBenchmark,
      toolsAtBenchmark: comparisons.length - aboveBenchmark - belowBenchmark,
      averagePricingPosition: this.calculateAveragePricingPosition(comparisons),
    };
  }

  calculateAveragePricingPosition(comparisons) {
    const positions = comparisons.map(c => {
      switch (c.marketPosition) {
        case 'budget': return 1;
        case 'mid-range': return 2;
        case 'premium': return 3;
        case 'enterprise': return 4;
        default: return 2;
      }
    });

    const avg = positions.reduce((a, b) => a + b, 0) / positions.length;
    
    if (avg <= 1.5) return 'budget-focused';
    if (avg <= 2.5) return 'balanced';
    if (avg <= 3.5) return 'premium-focused';
    return 'enterprise-focused';
  }

  generateMarketInsights(tools) {
    const insights = [];

    // Provider concentration
    const providerCounts = {};
    tools.forEach(t => {
      providerCounts[t.provider] = (providerCounts[t.provider] || 0) + 1;
    });

    const topProvider = Object.entries(providerCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (topProvider && topProvider[1] > tools.length * 0.6) {
      insights.push({
        type: 'risk',
        title: 'High Provider Concentration',
        description: `${Math.round((topProvider[1] / tools.length) * 100)}% of tools from ${topProvider[0]}`,
        recommendation: 'Consider diversifying to reduce vendor lock-in risk',
      });
    }

    // Check for missing cost-saving features
    const toolsWithoutCaching = tools.filter(t => {
      const provider = this.benchmarks.providers[t.provider];
      return provider?.cachingDiscount && !t.features?.includes('caching');
    });

    if (toolsWithoutCaching.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Caching Not Enabled',
        description: `${toolsWithoutCaching.length} tool(s) could benefit from prompt caching`,
        potentialSavings: 'Up to 90% on repeated prompts',
      });
    }

    return insights;
  }

  // ============================================================================
  // CONSOLIDATION OPPORTUNITIES
  // ============================================================================

  findConsolidationOpportunities(tools) {
    const opportunities = [];

    // Group tools by primary capability
    const capabilityGroups = {};
    tools.forEach(tool => {
      const primaryCap = tool.capabilities[0] || 'general';
      if (!capabilityGroups[primaryCap]) capabilityGroups[primaryCap] = [];
      capabilityGroups[primaryCap].push(tool);
    });

    // Find groups with multiple tools
    Object.entries(capabilityGroups).forEach(([capability, groupTools]) => {
      if (groupTools.length > 1) {
        const totalCost = groupTools.reduce((sum, t) => sum + t.costs.monthly, 0);
        const bestTool = this.findBestToolForCapability(groupTools, capability);
        const potentialSavings = totalCost - bestTool.costs.monthly;

        if (potentialSavings > 0) {
          opportunities.push({
            capability,
            currentTools: groupTools.map(t => ({
              name: t.name,
              cost: t.costs.monthly,
            })),
            recommendedTool: {
              name: bestTool.name,
              cost: bestTool.costs.monthly,
              reason: this.explainToolSelection(bestTool, groupTools),
            },
            potentialMonthlySavings: potentialSavings,
            potentialAnnualSavings: potentialSavings * 12,
            difficulty: this.assessConsolidationDifficulty(groupTools, bestTool),
          });
        }
      }
    });

    // Also check for provider consolidation
    const providerConsolidation = this.findProviderConsolidation(tools);
    if (providerConsolidation) {
      opportunities.push(providerConsolidation);
    }

    return {
      opportunities: opportunities.sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings),
      totalPotentialSavings: {
        monthly: opportunities.reduce((sum, o) => sum + o.potentialMonthlySavings, 0),
        annual: opportunities.reduce((sum, o) => sum + o.potentialAnnualSavings, 0),
      },
    };
  }

  findBestToolForCapability(tools, capability) {
    // Score each tool based on:
    // - Usage (40%)
    // - Value (cost per request) (30%)
    // - Capabilities coverage (30%)
    
    const scored = tools.map(tool => {
      const usageScore = tool.usage.monthlyRequests / Math.max(...tools.map(t => t.usage.monthlyRequests || 1));
      const valueScore = tool.costs.monthly > 0 
        ? Math.min((tool.usage.monthlyRequests || 1) / tool.costs.monthly, 1) 
        : 0;
      const capScore = tool.capabilities.length / Math.max(...tools.map(t => t.capabilities.length));

      return {
        tool,
        score: (usageScore * 0.4) + (valueScore * 0.3) + (capScore * 0.3),
      };
    });

    return scored.sort((a, b) => b.score - a.score)[0].tool;
  }

  explainToolSelection(selected, alternatives) {
    const reasons = [];
    
    if (selected.usage.monthlyRequests >= Math.max(...alternatives.map(t => t.usage.monthlyRequests || 0))) {
      reasons.push('highest usage');
    }
    
    if (selected.capabilities.length >= Math.max(...alternatives.map(t => t.capabilities.length))) {
      reasons.push('most capabilities');
    }

    const valueRatio = selected.costs.monthly > 0 
      ? (selected.usage.monthlyRequests || 0) / selected.costs.monthly 
      : 0;
    const avgValueRatio = alternatives.reduce((sum, t) => 
      sum + (t.costs.monthly > 0 ? (t.usage.monthlyRequests || 0) / t.costs.monthly : 0), 0
    ) / alternatives.length;

    if (valueRatio > avgValueRatio) {
      reasons.push('best value ratio');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'overall best fit';
  }

  assessConsolidationDifficulty(tools, targetTool) {
    const factors = [];
    
    // Different departments = harder
    const departments = new Set(tools.map(t => t.department));
    if (departments.size > 1) factors.push('cross-department');

    // Different owners = harder
    const owners = new Set(tools.filter(t => t.owner).map(t => t.owner));
    if (owners.size > 1) factors.push('multiple-owners');

    // Active contracts = harder
    const activeContracts = tools.filter(t => {
      if (!t.contractEndDate) return false;
      return new Date(t.contractEndDate) > new Date();
    });
    if (activeContracts.length > 1) factors.push('active-contracts');

    if (factors.length === 0) return 'easy';
    if (factors.length === 1) return 'moderate';
    return 'complex';
  }

  findProviderConsolidation(tools) {
    const providers = {};
    tools.forEach(t => {
      if (!providers[t.provider]) providers[t.provider] = [];
      providers[t.provider].push(t);
    });

    // Check if consolidating to one provider makes sense
    const providerList = Object.entries(providers);
    if (providerList.length <= 1) return null;

    // Find provider that covers most capabilities
    let bestProvider = null;
    let bestCoverage = 0;

    const allCapabilities = new Set(tools.flatMap(t => t.capabilities));

    Object.entries(this.benchmarks.providers).forEach(([providerId, provider]) => {
      const providerCaps = new Set(provider.capabilities);
      const coverage = [...allCapabilities].filter(c => providerCaps.has(c)).length / allCapabilities.size;
      
      if (coverage > bestCoverage) {
        bestCoverage = coverage;
        bestProvider = { id: providerId, ...provider };
      }
    });

    if (bestProvider && bestCoverage >= 0.8) {
      const currentCost = tools.reduce((sum, t) => sum + t.costs.monthly, 0);
      // Estimate cost with single provider (assume 15% volume discount)
      const consolidatedCost = currentCost * 0.85;

      return {
        type: 'provider_consolidation',
        capability: 'all',
        currentTools: providerList.map(([provider, pts]) => ({
          provider,
          toolCount: pts.length,
          totalCost: pts.reduce((sum, t) => sum + t.costs.monthly, 0),
        })),
        recommendedProvider: {
          name: bestProvider.name,
          capabilityCoverage: bestCoverage,
          strengths: bestProvider.strengths,
        },
        potentialMonthlySavings: currentCost - consolidatedCost,
        potentialAnnualSavings: (currentCost - consolidatedCost) * 12,
        difficulty: 'complex',
        benefits: [
          'Volume discounts',
          'Simplified billing',
          'Unified support',
          'Easier compliance',
        ],
      };
    }

    return null;
  }

  // ============================================================================
  // RECOMMENDATIONS ENGINE
  // ============================================================================

  generateRecommendations(analysisData) {
    const recommendations = [];
    const { overlapAnalysis, roiAnalysis, wasteAnalysis, consolidationOpportunities, tools } = analysisData;

    // Priority 1: Critical waste (zombie subscriptions, negative ROI)
    wasteAnalysis.categories.zombieSubscriptions.forEach(zombie => {
      recommendations.push({
        priority: 'critical',
        category: 'waste_elimination',
        title: `Cancel unused subscription: ${zombie.tool}`,
        description: `This tool hasn't been used in ${zombie.daysSinceLastUse} days`,
        impact: {
          monthlySavings: zombie.monthlyCost,
          annualSavings: zombie.monthlyCost * 12,
        },
        effort: 'low',
        action: {
          type: 'cancel_subscription',
          tool: zombie.tool,
        },
      });
    });

    // Priority 2: High-value consolidation
    consolidationOpportunities.opportunities
      .filter(o => o.potentialMonthlySavings > 500)
      .forEach(opp => {
        // Handle both tool consolidation and provider consolidation
        const isProviderConsolidation = opp.type === 'provider_consolidation';
        const targetName = isProviderConsolidation 
          ? opp.recommendedProvider?.name 
          : opp.recommendedTool?.name;
        
        if (!targetName) return; // Skip if no valid target
        
        recommendations.push({
          priority: 'high',
          category: 'consolidation',
          title: isProviderConsolidation 
            ? `Consolidate to single provider: ${targetName}`
            : `Consolidate ${opp.capability} tools`,
          description: isProviderConsolidation
            ? `Move all tools to ${targetName} for volume discounts and simplified management`
            : `Merge ${opp.currentTools.length} tools into ${targetName}`,
          impact: {
            monthlySavings: opp.potentialMonthlySavings,
            annualSavings: opp.potentialAnnualSavings,
          },
          effort: opp.difficulty,
          action: {
            type: isProviderConsolidation ? 'provider_consolidation' : 'consolidate',
            from: isProviderConsolidation 
              ? opp.currentTools.map(t => t.provider)
              : opp.currentTools.map(t => t.name),
            to: targetName,
          },
        });
      });

    // Priority 3: Provider/model downgrades
    wasteAnalysis.categories.overProvisioned.forEach(op => {
      recommendations.push({
        priority: 'medium',
        category: 'optimization',
        title: `Downgrade ${op.tool} to ${op.recommendedTier} tier`,
        description: `Current usage doesn't justify ${op.currentTier} tier pricing`,
        impact: {
          monthlySavings: op.monthlySavings,
          annualSavings: op.monthlySavings * 12,
        },
        effort: 'low',
        action: {
          type: 'downgrade',
          tool: op.tool,
          to: op.recommendedTier,
        },
      });
    });

    // Priority 4: Switch to cheaper alternatives
    roiAnalysis.potential.optimizations
      .filter(o => o.type === 'switch_provider')
      .forEach(opt => {
        recommendations.push({
          priority: 'medium',
          category: 'cost_reduction',
          title: `Consider switching ${opt.tool} to ${opt.alternative}`,
          description: 'Cheaper alternative available with similar capabilities',
          impact: {
            monthlySavings: opt.monthlySavings,
            annualSavings: opt.monthlySavings * 12,
          },
          effort: 'medium',
          action: {
            type: 'switch_provider',
            from: opt.tool,
            to: opt.alternative,
          },
        });
      });

    // Priority 5: Enable cost-saving features
    roiAnalysis.potential.optimizations
      .filter(o => o.type === 'enable_caching' || o.type === 'use_batch_api')
      .forEach(opt => {
        recommendations.push({
          priority: 'low',
          category: 'optimization',
          title: `Enable ${opt.type === 'enable_caching' ? 'caching' : 'batch processing'} for ${opt.tool}`,
          description: `Reduce costs by utilizing ${opt.type === 'enable_caching' ? 'prompt caching' : 'batch API'}`,
          impact: {
            monthlySavings: opt.monthlySavings,
            annualSavings: opt.monthlySavings * 12,
          },
          effort: 'low',
          action: {
            type: opt.type,
            tool: opt.tool,
          },
        });
      });

    // Priority 6: Address underutilization
    wasteAnalysis.categories.underutilizedTools
      .filter(t => t.utilizationPercentage < 10)
      .forEach(tool => {
        recommendations.push({
          priority: 'medium',
          category: 'utilization',
          title: `Increase adoption or cancel: ${tool.tool}`,
          description: `Only ${tool.utilizationPercentage}% utilization`,
          impact: {
            monthlySavings: tool.recommendation === 'cancel' ? tool.monthlyCost : tool.monthlyCost * 0.5,
            annualSavings: (tool.recommendation === 'cancel' ? tool.monthlyCost : tool.monthlyCost * 0.5) * 12,
          },
          effort: 'medium',
          action: {
            type: tool.recommendation === 'cancel' ? 'cancel_subscription' : 'increase_adoption',
            tool: tool.tool,
          },
        });
      });

    // Sort by impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.impact.annualSavings - a.impact.annualSavings;
    });
  }

  // ============================================================================
  // HEALTH SCORE CALCULATION
  // ============================================================================

  calculateHealthScore(analyses) {
    const { overlapAnalysis, roiAnalysis, wasteAnalysis } = analyses;

    // Components (0-100 each)
    const scores = {
      // Overlap score: Less overlap = better
      // 0% redundancy = 100, 100% redundancy = 0
      overlap: Math.max(0, 100 - overlapAnalysis.summary.redundancyPercentage),
      
      // ROI score: Based on average ROI (200% ROI = 100 score)
      roi: Math.min(100, Math.max(0, roiAnalysis.summary.averageToolROI / 2)),
      
      // Waste score: Less waste = better
      // 0% waste = 100, 50%+ waste = 0
      waste: Math.max(0, 100 - (wasteAnalysis.summary.wastePercentage * 2)),
      
      // Utilization score: More tools at healthy utilization = better
      utilization: this.calculateUtilizationScore(wasteAnalysis),
    };

    // Weighted average
    const weights = { overlap: 0.25, roi: 0.30, waste: 0.25, utilization: 0.20 };
    const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
      return sum + (score * weights[key]);
    }, 0);

    return {
      overall: Math.round(totalScore),
      components: scores,
      grade: this.getGrade(totalScore),
      interpretation: this.interpretScore(totalScore),
    };
  }

  calculateUtilizationScore(wasteAnalysis) {
    const underutilized = wasteAnalysis.categories.underutilizedTools.length;
    const zombies = wasteAnalysis.categories.zombieSubscriptions.length;
    
    // Assume we know total tools from context
    const totalTools = underutilized + zombies + 10; // Rough estimate
    const healthyTools = totalTools - underutilized - zombies;
    
    return (healthyTools / totalTools) * 100;
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  interpretScore(score) {
    if (score >= 90) return 'Excellent - Your AI stack is highly optimized';
    if (score >= 80) return 'Good - Minor optimizations possible';
    if (score >= 70) return 'Fair - Several optimization opportunities exist';
    if (score >= 60) return 'Needs Attention - Significant waste detected';
    return 'Critical - Major restructuring recommended';
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  calculateTotalSpend(tools) {
    return tools.reduce((sum, t) => sum + t.costs.monthly, 0);
  }

  calculatePotentialSavings(wasteAnalysis, consolidationOpportunities) {
    return {
      fromWasteElimination: wasteAnalysis.summary.totalMonthlyWaste,
      fromConsolidation: consolidationOpportunities.totalPotentialSavings.monthly,
      total: wasteAnalysis.summary.totalMonthlyWaste + 
             consolidationOpportunities.totalPotentialSavings.monthly,
    };
  }

  getCriticalIssues(analyses) {
    const issues = [];

    // Zombie subscriptions
    if (analyses.wasteAnalysis.categories.zombieSubscriptions.length > 0) {
      issues.push({
        type: 'zombie_subscriptions',
        count: analyses.wasteAnalysis.categories.zombieSubscriptions.length,
        severity: 'critical',
      });
    }

    // Negative ROI tools
    const negativeROI = analyses.roiAnalysis.underperformers.filter(t => t.roiPercentage < 0);
    if (negativeROI.length > 0) {
      issues.push({
        type: 'negative_roi',
        count: negativeROI.length,
        severity: 'critical',
      });
    }

    // High redundancy
    if (analyses.overlapAnalysis.summary.redundancyPercentage > 30) {
      issues.push({
        type: 'high_redundancy',
        percentage: analyses.overlapAnalysis.summary.redundancyPercentage,
        severity: 'warning',
      });
    }

    return issues;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  AuditEngine,
  BENCHMARK_DATA,
};

// Example usage for testing
if (require.main === module) {
  const engine = new AuditEngine();
  
  // Sample company data
  const sampleData = {
    tools: [
      {
        name: 'GPT-4 API',
        provider: 'openai',
        model: 'gpt-4o',
        monthlyCost: 2500,
        monthlyInputTokens: 50000000,
        monthlyOutputTokens: 10000000,
        monthlyRequests: 15000,
        activeUsers: 25,
        capabilities: ['chat', 'coding', 'function-calling'],
        useCases: ['chatbot', 'coding-assistant'],
        department: 'engineering',
      },
      {
        name: 'Claude API',
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        monthlyCost: 3200,
        monthlyInputTokens: 80000000,
        monthlyOutputTokens: 15000000,
        monthlyRequests: 12000,
        activeUsers: 20,
        capabilities: ['chat', 'coding', 'vision'],
        useCases: ['chatbot', 'document-analysis'],
        department: 'product',
      },
      {
        name: 'Gemini Pro',
        provider: 'google',
        model: 'gemini-2.5-pro',
        monthlyCost: 800,
        monthlyInputTokens: 30000000,
        monthlyOutputTokens: 5000000,
        monthlyRequests: 5000,
        activeUsers: 8,
        lastUsed: '2024-11-01',
        capabilities: ['chat', 'vision'],
        useCases: ['chatbot'],
        department: 'marketing',
      },
    ],
    businessMetrics: {
      avgHourlyRate: 75,
      avgMinutesPerTask: 10,
      productivityGainPerUser: 300,
    },
  };

  engine.runAudit(sampleData).then(report => {
    console.log(JSON.stringify(report, null, 2));
  });
}
