/**
 * StackAudit.ai - AI Stack Recommendations Engine
 * 
 * Proactively suggests better alternatives after analyzing a company's tools.
 * Uses intelligent matching based on:
 * - Cost optimization opportunities
 * - Capability gaps and improvements
 * - Performance benchmarks
 * - Security & compliance requirements
 * - Industry best practices
 * - Emerging technology trends
 * 
 * @version 1.0.0
 */

// ============================================================================
// ALTERNATIVE TOOL DATABASE
// ============================================================================

const TOOL_ALTERNATIVES_DB = {
  // LLM Providers with detailed comparison data
  llm_providers: {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      description: 'Industry leader with GPT models',
      pricing_tier: 'premium',
      strengths: ['ecosystem', 'tooling', 'developer-experience', 'function-calling', 'fine-tuning'],
      weaknesses: ['cost', 'rate-limits', 'data-privacy'],
      best_for: ['general-ai', 'coding', 'agents', 'production-apps'],
      compliance: ['SOC2', 'GDPR'],
      alternatives: ['anthropic', 'google', 'mistral', 'groq'],
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Safety-focused with Claude models',
      pricing_tier: 'premium',
      strengths: ['safety', 'long-context', 'reasoning', 'analysis', 'computer-use'],
      weaknesses: ['limited-ecosystem', 'no-fine-tuning'],
      best_for: ['enterprise', 'analysis', 'safety-critical', 'research'],
      compliance: ['SOC2', 'HIPAA', 'GDPR'],
      alternatives: ['openai', 'google', 'mistral'],
    },
    google: {
      id: 'google',
      name: 'Google (Gemini)',
      description: 'Multimodal with massive context windows',
      pricing_tier: 'mid',
      strengths: ['multimodal', 'long-context', 'cost-effective', 'search-grounding', 'video'],
      weaknesses: ['api-stability', 'enterprise-support'],
      best_for: ['multimodal', 'document-processing', 'video-analysis', 'cost-conscious'],
      compliance: ['SOC2', 'GDPR', 'FedRAMP'],
      alternatives: ['openai', 'anthropic', 'mistral'],
    },
    mistral: {
      id: 'mistral',
      name: 'Mistral AI',
      description: 'European AI with strong open-source options',
      pricing_tier: 'budget',
      strengths: ['eu-compliance', 'cost-effective', 'open-weights', 'coding'],
      weaknesses: ['smaller-ecosystem', 'fewer-features'],
      best_for: ['eu-companies', 'cost-optimization', 'self-hosting'],
      compliance: ['GDPR', 'AI-Act'],
      alternatives: ['groq', 'together', 'deepseek'],
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek',
      description: 'Ultra-low cost with strong reasoning',
      pricing_tier: 'ultra-budget',
      strengths: ['extremely-cheap', 'reasoning', 'open-source'],
      weaknesses: ['china-based', 'data-sovereignty', 'availability'],
      best_for: ['prototyping', 'high-volume-low-stakes', 'research'],
      compliance: [],
      alternatives: ['groq', 'together', 'mistral'],
      warnings: ['Data processed in China', 'May not meet compliance requirements'],
    },
    groq: {
      id: 'groq',
      name: 'Groq',
      description: 'Ultra-fast inference with custom hardware',
      pricing_tier: 'budget',
      strengths: ['speed', 'cost-effective', 'low-latency'],
      weaknesses: ['limited-models', 'rate-limits', 'no-fine-tuning'],
      best_for: ['real-time', 'chatbots', 'prototyping', 'latency-sensitive'],
      compliance: ['SOC2'],
      alternatives: ['together', 'fireworks', 'mistral'],
    },
    together: {
      id: 'together',
      name: 'Together AI',
      description: 'Open-source model hosting with fine-tuning',
      pricing_tier: 'budget',
      strengths: ['open-source-models', 'fine-tuning', 'variety', 'cost'],
      weaknesses: ['support', 'enterprise-features'],
      best_for: ['open-source', 'fine-tuning', 'experimentation'],
      compliance: ['SOC2'],
      alternatives: ['groq', 'fireworks', 'anyscale'],
    },
    cohere: {
      id: 'cohere',
      name: 'Cohere',
      description: 'Enterprise-focused with strong RAG capabilities',
      pricing_tier: 'mid',
      strengths: ['rag', 'embeddings', 'enterprise', 'reranking', 'multilingual'],
      weaknesses: ['general-llm-quality', 'ecosystem'],
      best_for: ['enterprise-search', 'rag', 'multilingual', 'embeddings'],
      compliance: ['SOC2', 'GDPR', 'HIPAA'],
      alternatives: ['openai', 'anthropic', 'voyage'],
    },
    perplexity: {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Search-augmented AI with citations',
      pricing_tier: 'premium',
      strengths: ['web-search', 'citations', 'real-time-data', 'research'],
      weaknesses: ['cost', 'limited-use-cases'],
      best_for: ['research', 'fact-checking', 'news-analysis', 'real-time-search'],
      compliance: ['SOC2'],
      alternatives: ['tavily', 'you-com', 'google'],
    },
    aws_bedrock: {
      id: 'aws_bedrock',
      name: 'AWS Bedrock',
      description: 'Multi-provider managed service on AWS',
      pricing_tier: 'premium',
      strengths: ['aws-integration', 'multi-provider', 'enterprise', 'compliance', 'guardrails'],
      weaknesses: ['cost', 'complexity', 'vendor-lock-in'],
      best_for: ['aws-shops', 'enterprise', 'regulated-industries'],
      compliance: ['SOC2', 'HIPAA', 'FedRAMP', 'PCI-DSS'],
      alternatives: ['azure-openai', 'google-vertex'],
    },
  },

  // Specialized tool categories
  categories: {
    embeddings: {
      top_picks: [
        { id: 'openai-embeddings', name: 'OpenAI text-embedding-3', cost: 0.02, quality: 'excellent' },
        { id: 'cohere-embed-v4', name: 'Cohere Embed v4', cost: 0.06, quality: 'excellent' },
        { id: 'voyage-3', name: 'Voyage AI 3', cost: 0.06, quality: 'best' },
        { id: 'jina-v3', name: 'Jina Embeddings v3', cost: 0.02, quality: 'very-good' },
      ],
      budget_pick: { id: 'fastembed', name: 'FastEmbed (local)', cost: 0, quality: 'good' },
    },
    vector_db: {
      top_picks: [
        { id: 'pinecone', name: 'Pinecone', type: 'managed', cost: 'pay-per-use' },
        { id: 'weaviate', name: 'Weaviate', type: 'hybrid', cost: 'open-source' },
        { id: 'qdrant', name: 'Qdrant', type: 'hybrid', cost: 'open-source' },
        { id: 'pgvector', name: 'pgvector', type: 'extension', cost: 'free' },
      ],
    },
    coding: {
      top_picks: [
        { id: 'cursor', name: 'Cursor', type: 'ide', best_for: 'full-ide' },
        { id: 'github-copilot', name: 'GitHub Copilot', type: 'plugin', best_for: 'inline-completion' },
        { id: 'codeium', name: 'Codeium', type: 'plugin', best_for: 'free-tier' },
        { id: 'tabnine', name: 'Tabnine', type: 'plugin', best_for: 'privacy' },
      ],
    },
    image_gen: {
      top_picks: [
        { id: 'midjourney', name: 'Midjourney', quality: 'best', cost: 'subscription' },
        { id: 'dall-e-3', name: 'DALL-E 3', quality: 'excellent', cost: 'per-image' },
        { id: 'flux', name: 'Flux Pro', quality: 'excellent', cost: 'per-image' },
        { id: 'stable-diffusion', name: 'Stable Diffusion', quality: 'good', cost: 'free-self-host' },
      ],
    },
    speech: {
      tts: [
        { id: 'elevenlabs', name: 'ElevenLabs', quality: 'best', cost: 'premium' },
        { id: 'openai-tts', name: 'OpenAI TTS', quality: 'excellent', cost: 'mid' },
        { id: 'azure-tts', name: 'Azure TTS', quality: 'excellent', cost: 'mid' },
        { id: 'cartesia', name: 'Cartesia', quality: 'excellent', cost: 'budget' },
      ],
      stt: [
        { id: 'whisper', name: 'OpenAI Whisper', quality: 'excellent', cost: 'budget' },
        { id: 'deepgram', name: 'Deepgram', quality: 'excellent', cost: 'mid', best_for: 'real-time' },
        { id: 'assembly-ai', name: 'AssemblyAI', quality: 'excellent', cost: 'mid' },
      ],
    },
  },

  // Model-level alternatives for quick switching
  model_alternatives: {
    // OpenAI alternatives
    'gpt-4o': ['claude-sonnet-4', 'gemini-2.5-pro', 'llama-4-maverick'],
    'gpt-4o-mini': ['claude-3.5-haiku', 'gemini-2.5-flash', 'mistral-small'],
    'gpt-4-turbo': ['claude-opus-4.5', 'gemini-2.5-pro', 'mistral-large'],
    'gpt-3.5-turbo': ['gemini-2.0-flash', 'claude-3-haiku', 'mistral-small', 'llama-3.1-8b'],
    // Anthropic alternatives
    'claude-opus-4.5': ['gpt-4o', 'gemini-2.5-pro', 'llama-4-maverick'],
    'claude-sonnet-4': ['gpt-4o', 'gemini-2.5-pro', 'mistral-large'],
    'claude-3.5-haiku': ['gpt-4o-mini', 'gemini-2.5-flash', 'mistral-small'],
    // Google alternatives  
    'gemini-2.5-pro': ['claude-sonnet-4', 'gpt-4o', 'mistral-large'],
    'gemini-2.5-flash': ['gpt-4o-mini', 'claude-3.5-haiku', 'mistral-small'],
  },
};

// ============================================================================
// RECOMMENDATION RULES ENGINE
// ============================================================================

const RECOMMENDATION_RULES = {
  // Cost-based rules
  cost: [
    {
      id: 'high_spend_alternative',
      condition: (tool) => tool.costs?.monthly > 1000,
      weight: 0.3,
      generate: (tool, ctx) => ({
        type: 'cost_optimization',
        title: `Reduce ${tool.name} costs with alternative providers`,
        priority: tool.costs.monthly > 5000 ? 'high' : 'medium',
      }),
    },
    {
      id: 'deepseek_for_low_stakes',
      condition: (tool, ctx) => {
        const isCoding = tool.useCases?.includes('coding-assistant');
        const isLowRisk = !ctx.compliance_required;
        return isCoding && isLowRisk && tool.costs?.monthly > 500;
      },
      weight: 0.2,
      generate: (tool) => ({
        type: 'cost_optimization',
        title: `Consider DeepSeek for ${tool.name} (90%+ cost reduction)`,
        alternative: 'deepseek',
        estimated_savings: tool.costs.monthly * 0.9,
        caveats: ['Data processed in China', 'Review compliance requirements'],
      }),
    },
    {
      id: 'groq_for_speed_sensitive',
      condition: (tool) => {
        const needsSpeed = tool.useCases?.some(u => ['chatbot', 'real-time'].includes(u));
        return needsSpeed && tool.provider !== 'groq';
      },
      weight: 0.2,
      generate: (tool) => ({
        type: 'performance_improvement',
        title: `Switch to Groq for faster responses on ${tool.name}`,
        alternative: 'groq',
        benefit: '10x faster inference, lower cost',
      }),
    },
  ],

  // Capability-based rules
  capability: [
    {
      id: 'missing_vision',
      condition: (tool, ctx) => {
        const needsVision = ctx.use_cases?.includes('document-analysis');
        const hasVision = tool.capabilities?.includes('vision');
        return needsVision && !hasVision;
      },
      weight: 0.25,
      generate: (tool) => ({
        type: 'capability_gap',
        title: `Add vision capabilities to ${tool.name}`,
        alternatives: ['gemini-2.5-pro', 'claude-sonnet-4', 'gpt-4o'],
        benefit: 'Process documents, images, and screenshots',
      }),
    },
    {
      id: 'missing_long_context',
      condition: (tool, ctx) => {
        const needsLongContext = ctx.avg_input_tokens > 50000;
        const modelContext = ctx.model_context || 128000;
        return needsLongContext && modelContext < 200000;
      },
      weight: 0.2,
      generate: (tool) => ({
        type: 'capability_gap',
        title: `Upgrade to longer context for ${tool.name}`,
        alternatives: ['gemini-2.5-pro', 'claude-opus-4.5'],
        benefit: 'Process larger documents without chunking',
      }),
    },
    {
      id: 'missing_function_calling',
      condition: (tool, ctx) => {
        const needsTools = ctx.use_cases?.some(u => ['agents', 'automation'].includes(u));
        const hasTools = tool.capabilities?.includes('function-calling');
        return needsTools && !hasTools;
      },
      weight: 0.25,
      generate: (tool) => ({
        type: 'capability_gap',
        title: `Enable function calling for ${tool.name}`,
        alternatives: ['gpt-4o', 'claude-sonnet-4', 'gemini-2.5-pro'],
        benefit: 'Build autonomous agents and tool-using systems',
      }),
    },
  ],

  // Compliance-based rules
  compliance: [
    {
      id: 'gdpr_compliance',
      condition: (tool, ctx) => {
        const needsGDPR = ctx.regions?.includes('eu') || ctx.compliance?.includes('gdpr');
        const provider = TOOL_ALTERNATIVES_DB.llm_providers[tool.provider];
        return needsGDPR && !provider?.compliance?.includes('GDPR');
      },
      weight: 0.4,
      generate: (tool) => ({
        type: 'compliance',
        title: `GDPR-compliant alternative needed for ${tool.name}`,
        priority: 'critical',
        alternatives: ['mistral', 'anthropic', 'aws_bedrock'],
        reason: 'EU data residency requirements',
      }),
    },
    {
      id: 'hipaa_compliance',
      condition: (tool, ctx) => {
        const needsHIPAA = ctx.compliance?.includes('hipaa') || ctx.industry === 'healthcare';
        const provider = TOOL_ALTERNATIVES_DB.llm_providers[tool.provider];
        return needsHIPAA && !provider?.compliance?.includes('HIPAA');
      },
      weight: 0.5,
      generate: (tool) => ({
        type: 'compliance',
        title: `HIPAA-compliant alternative required for ${tool.name}`,
        priority: 'critical',
        alternatives: ['anthropic', 'aws_bedrock', 'azure-openai'],
        reason: 'Healthcare data protection requirements',
      }),
    },
    {
      id: 'data_sovereignty_warning',
      condition: (tool) => tool.provider === 'deepseek',
      weight: 0.3,
      generate: (tool) => ({
        type: 'compliance',
        title: `Data sovereignty concern with ${tool.name}`,
        priority: 'high',
        warning: 'Data is processed in China',
        alternatives: ['mistral', 'groq', 'together'],
      }),
    },
  ],

  // Performance-based rules
  performance: [
    {
      id: 'latency_sensitive',
      condition: (tool, ctx) => {
        const needsLowLatency = ctx.avg_response_time_required < 1000; // ms
        const isSlowProvider = ['anthropic', 'deepseek'].includes(tool.provider);
        return needsLowLatency && isSlowProvider;
      },
      weight: 0.25,
      generate: (tool) => ({
        type: 'performance_improvement',
        title: `Reduce latency for ${tool.name}`,
        alternatives: ['groq', 'fireworks', 'google'],
        benefit: 'Sub-second response times',
      }),
    },
    {
      id: 'batch_processing',
      condition: (tool, ctx) => {
        const highVolume = tool.usage?.monthlyRequests > 50000;
        const notUsingBatch = !tool.features?.includes('batch');
        return highVolume && notUsingBatch;
      },
      weight: 0.2,
      generate: (tool) => ({
        type: 'cost_optimization',
        title: `Enable batch processing for ${tool.name}`,
        benefit: '50% cost reduction on eligible requests',
        providers_with_batch: ['openai', 'anthropic', 'groq'],
      }),
    },
  ],

  // Strategic rules
  strategic: [
    {
      id: 'vendor_concentration',
      condition: (tool, ctx) => {
        const providerCount = ctx.provider_counts?.[tool.provider] || 0;
        const totalTools = ctx.total_tools || 1;
        return (providerCount / totalTools) > 0.6;
      },
      weight: 0.15,
      generate: (tool, ctx) => ({
        type: 'strategic',
        title: 'Reduce vendor concentration risk',
        priority: 'low',
        suggestion: `Consider diversifying from ${tool.provider}`,
        alternatives: Object.keys(TOOL_ALTERNATIVES_DB.llm_providers)
          .filter(p => p !== tool.provider)
          .slice(0, 3),
      }),
    },
    {
      id: 'emerging_capability',
      condition: (tool, ctx) => {
        const currentYear = new Date().getFullYear();
        return currentYear >= 2025;
      },
      weight: 0.1,
      generate: (tool) => ({
        type: 'innovation',
        title: `Consider emerging AI capabilities for ${tool.name}`,
        suggestions: [
          'Computer use agents (Anthropic)',
          'Extended thinking/reasoning modes',
          'Multi-modal real-time APIs',
          'Fine-tuned specialized models',
        ],
      }),
    },
  ],
};

// ============================================================================
// RECOMMENDATIONS ENGINE CLASS
// ============================================================================

class RecommendationsEngine {
  constructor(options = {}) {
    this.alternativesDB = TOOL_ALTERNATIVES_DB;
    this.rules = RECOMMENDATION_RULES;
    this.options = {
      maxRecommendationsPerTool: 5,
      minConfidenceScore: 0.3,
      includeInnovation: true,
      considerCompliance: true,
      ...options,
    };
  }

  /**
   * Generate AI stack recommendations based on analyzed tools
   * @param {Object} auditData - Audit results from AuditEngine
   * @returns {Object} Comprehensive recommendations
   */
  async generateRecommendations(auditData) {
    const startTime = Date.now();
    const { tools, analyses, summary } = auditData;

    // Build context for rule evaluation
    const context = this.buildContext(auditData);

    // Generate recommendations for each tool
    const toolRecommendations = tools.map(tool => 
      this.generateToolRecommendations(tool, context)
    );

    // Generate stack-level recommendations
    const stackRecommendations = this.generateStackRecommendations(tools, context, analyses);

    // Generate innovation suggestions
    const innovationSuggestions = this.options.includeInnovation 
      ? this.generateInnovationSuggestions(tools, context)
      : [];

    // Score and prioritize all recommendations
    const allRecommendations = this.prioritizeRecommendations([
      ...toolRecommendations.flatMap(tr => tr.recommendations),
      ...stackRecommendations,
      ...innovationSuggestions,
    ]);

    // Calculate potential impact
    const impactSummary = this.calculateImpactSummary(allRecommendations, tools);

    return {
      meta: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        toolsAnalyzed: tools.length,
        recommendationsGenerated: allRecommendations.length,
        version: '1.0.0',
      },
      summary: {
        totalRecommendations: allRecommendations.length,
        criticalCount: allRecommendations.filter(r => r.priority === 'critical').length,
        highCount: allRecommendations.filter(r => r.priority === 'high').length,
        potentialMonthlySavings: impactSummary.monthlySavings,
        potentialAnnualSavings: impactSummary.annualSavings,
        topOpportunities: allRecommendations.slice(0, 3).map(r => r.title),
      },
      recommendations: {
        byPriority: this.groupByPriority(allRecommendations),
        byType: this.groupByType(allRecommendations),
        byTool: this.groupByTool(toolRecommendations),
      },
      alternatives: this.generateAlternativesMatrix(tools),
      actionPlan: this.generateActionPlan(allRecommendations, context),
      impact: impactSummary,
    };
  }

  /**
   * Build evaluation context from audit data
   */
  buildContext(auditData) {
    const { tools, analyses } = auditData;

    // Count providers
    const provider_counts = {};
    tools.forEach(t => {
      provider_counts[t.provider] = (provider_counts[t.provider] || 0) + 1;
    });

    // Aggregate use cases and capabilities
    const all_use_cases = new Set(tools.flatMap(t => t.useCases || []));
    const all_capabilities = new Set(tools.flatMap(t => t.capabilities || []));

    // Calculate average metrics
    const total_monthly_spend = tools.reduce((sum, t) => sum + (t.costs?.monthly || 0), 0);
    const avg_input_tokens = tools.reduce((sum, t) => 
      sum + (t.usage?.monthlyTokens?.input || 0), 0) / Math.max(tools.length, 1);

    return {
      tools,
      total_tools: tools.length,
      provider_counts,
      use_cases: [...all_use_cases],
      capabilities: [...all_capabilities],
      total_monthly_spend,
      avg_input_tokens,
      compliance: auditData.compliance || [],
      regions: auditData.regions || [],
      industry: auditData.industry || 'general',
      compliance_required: auditData.compliance?.length > 0,
      analyses,
    };
  }

  /**
   * Generate recommendations for a single tool
   */
  generateToolRecommendations(tool, context) {
    const recommendations = [];
    const toolContext = { ...context, current_tool: tool };

    // Evaluate all rules
    Object.entries(this.rules).forEach(([category, rules]) => {
      rules.forEach(rule => {
        try {
          if (rule.condition(tool, toolContext)) {
            const recommendation = rule.generate(tool, toolContext);
            recommendations.push({
              id: `${rule.id}_${tool.id}`,
              ruleId: rule.id,
              toolId: tool.id,
              toolName: tool.name,
              category,
              weight: rule.weight,
              ...recommendation,
            });
          }
        } catch (err) {
          // Skip failed rule evaluations
        }
      });
    });

    // Find direct alternatives
    const alternatives = this.findAlternatives(tool, context);
    if (alternatives.length > 0) {
      recommendations.push({
        id: `alternatives_${tool.id}`,
        toolId: tool.id,
        toolName: tool.name,
        category: 'alternatives',
        type: 'alternative_options',
        title: `Alternative providers for ${tool.name}`,
        priority: 'medium',
        alternatives: alternatives.slice(0, 5),
        weight: 0.2,
      });
    }

    return {
      tool: {
        id: tool.id,
        name: tool.name,
        provider: tool.provider,
        currentCost: tool.costs?.monthly || 0,
      },
      recommendations: recommendations.slice(0, this.options.maxRecommendationsPerTool),
    };
  }

  /**
   * Find alternative tools/providers
   */
  findAlternatives(tool, context) {
    const alternatives = [];
    const currentProvider = this.alternativesDB.llm_providers[tool.provider];

    if (!currentProvider) return alternatives;

    // Get suggested alternatives
    const suggestedIds = currentProvider.alternatives || [];
    
    suggestedIds.forEach(altId => {
      const altProvider = this.alternativesDB.llm_providers[altId];
      if (!altProvider) return;

      // Calculate fit score
      const fitScore = this.calculateFitScore(tool, altProvider, context);
      
      // Estimate cost difference
      const costComparison = this.estimateCostComparison(tool, altProvider);

      alternatives.push({
        providerId: altId,
        providerName: altProvider.name,
        description: altProvider.description,
        fitScore,
        strengths: altProvider.strengths,
        weaknesses: altProvider.weaknesses,
        compliance: altProvider.compliance,
        warnings: altProvider.warnings || [],
        costComparison,
        switchDifficulty: this.assessSwitchDifficulty(tool.provider, altId),
      });
    });

    // Sort by fit score
    return alternatives.sort((a, b) => b.fitScore - a.fitScore);
  }

  /**
   * Calculate how well an alternative fits the current needs
   */
  calculateFitScore(tool, alternative, context) {
    let score = 0.5; // Base score

    // Capability match
    const neededCaps = new Set(tool.capabilities || []);
    const altStrengths = new Set(alternative.strengths || []);
    const capMatch = [...neededCaps].filter(c => altStrengths.has(c)).length / Math.max(neededCaps.size, 1);
    score += capMatch * 0.2;

    // Use case match
    const useCases = new Set(tool.useCases || []);
    const bestFor = new Set(alternative.best_for || []);
    const useCaseMatch = [...useCases].filter(u => bestFor.has(u)).length / Math.max(useCases.size, 1);
    score += useCaseMatch * 0.2;

    // Compliance match
    if (context.compliance_required) {
      const neededCompliance = new Set(context.compliance || []);
      const altCompliance = new Set(alternative.compliance || []);
      const complianceMatch = [...neededCompliance].filter(c => altCompliance.has(c.toUpperCase())).length / Math.max(neededCompliance.size, 1);
      score += complianceMatch * 0.1;
    }

    // Pricing tier preference (budget consciousness)
    if (tool.costs?.monthly > 2000) {
      const tierScores = { 'ultra-budget': 0.15, 'budget': 0.1, 'mid': 0.05, 'premium': 0 };
      score += tierScores[alternative.pricing_tier] || 0;
    }

    return Math.min(score, 1);
  }

  /**
   * Estimate cost comparison between current and alternative
   */
  estimateCostComparison(tool, alternative) {
    const tierMultipliers = {
      'ultra-budget': 0.1,
      'budget': 0.3,
      'mid': 0.6,
      'premium': 1.0,
    };

    const currentMultiplier = tierMultipliers[this.getProviderTier(tool.provider)] || 1;
    const altMultiplier = tierMultipliers[alternative.pricing_tier] || 1;

    const estimatedSavings = (currentMultiplier - altMultiplier) * (tool.costs?.monthly || 0);

    return {
      estimatedMonthlySavings: Math.max(0, estimatedSavings),
      savingsPercentage: currentMultiplier > 0 
        ? Math.round((1 - altMultiplier / currentMultiplier) * 100) 
        : 0,
      direction: estimatedSavings > 0 ? 'cheaper' : estimatedSavings < 0 ? 'more_expensive' : 'similar',
    };
  }

  /**
   * Get pricing tier for a provider
   */
  getProviderTier(providerId) {
    const provider = this.alternativesDB.llm_providers[providerId];
    return provider?.pricing_tier || 'mid';
  }

  /**
   * Assess difficulty of switching providers
   */
  assessSwitchDifficulty(fromProvider, toProvider) {
    // Some switches are harder than others
    const hardSwitches = [
      ['aws_bedrock', 'azure-openai'],
      ['openai', 'anthropic'], // Different API structures
    ];

    const isHardSwitch = hardSwitches.some(([a, b]) => 
      (fromProvider === a && toProvider === b) || (fromProvider === b && toProvider === a)
    );

    if (isHardSwitch) return 'moderate';
    if (fromProvider === toProvider) return 'trivial';
    return 'easy';
  }

  /**
   * Generate stack-level recommendations
   */
  generateStackRecommendations(tools, context, analyses) {
    const recommendations = [];

    // Multi-provider efficiency
    if (Object.keys(context.provider_counts).length > 3) {
      recommendations.push({
        id: 'consolidate_providers',
        type: 'strategic',
        title: 'Consolidate AI providers for better pricing',
        priority: 'medium',
        description: `Currently using ${Object.keys(context.provider_counts).length} different providers. Consolidation could unlock volume discounts.`,
        estimatedSavings: context.total_monthly_spend * 0.15,
        effort: 'moderate',
      });
    }

    // Missing RAG stack
    const hasEmbeddings = tools.some(t => t.capabilities?.includes('embeddings'));
    const hasRAG = tools.some(t => t.useCases?.includes('rag') || t.capabilities?.includes('rag'));
    
    if (!hasEmbeddings && !hasRAG && tools.length > 2) {
      recommendations.push({
        id: 'add_rag_stack',
        type: 'capability_gap',
        title: 'Add RAG capabilities for better accuracy',
        priority: 'medium',
        description: 'No retrieval-augmented generation detected. RAG can improve accuracy and reduce hallucinations.',
        suggestedTools: this.alternativesDB.categories.embeddings.top_picks.slice(0, 3),
        effort: 'moderate',
      });
    }

    // Caching opportunities
    const highVolumeTools = tools.filter(t => 
      (t.usage?.monthlyTokens?.input || 0) > 10000000 && 
      !t.features?.includes('caching')
    );
    
    if (highVolumeTools.length > 0) {
      recommendations.push({
        id: 'enable_caching',
        type: 'cost_optimization',
        title: 'Enable prompt caching for high-volume tools',
        priority: 'high',
        description: `${highVolumeTools.length} tool(s) could benefit from prompt caching (up to 90% savings on cached prompts)`,
        tools: highVolumeTools.map(t => t.name),
        estimatedSavings: highVolumeTools.reduce((sum, t) => 
          sum + (t.costs?.monthly || 0) * 0.3, 0),
      });
    }

    // Evaluate from analyses
    if (analyses?.waste?.summary?.wastePercentage > 20) {
      recommendations.push({
        id: 'address_waste',
        type: 'cost_optimization',
        title: 'Address significant waste in AI stack',
        priority: 'critical',
        description: `${analyses.waste.summary.wastePercentage.toFixed(1)}% of spend may be wasted`,
        estimatedSavings: analyses.waste.summary.totalMonthlyWaste,
      });
    }

    return recommendations;
  }

  /**
   * Generate innovation-focused suggestions
   */
  generateInnovationSuggestions(tools, context) {
    const suggestions = [];

    // Computer use agents
    const hasAgents = tools.some(t => t.useCases?.includes('agents'));
    if (hasAgents) {
      suggestions.push({
        id: 'computer_use',
        type: 'innovation',
        title: 'Explore computer-use capable AI agents',
        priority: 'low',
        description: 'Anthropic\'s computer-use feature enables AI to interact with desktop applications',
        benefit: 'Automate complex workflows involving multiple applications',
        providers: ['anthropic'],
      });
    }

    // Real-time APIs
    const hasChatbots = tools.some(t => t.useCases?.includes('chatbot'));
    if (hasChatbots) {
      suggestions.push({
        id: 'realtime_api',
        type: 'innovation',
        title: 'Consider real-time voice AI for chatbots',
        priority: 'low',
        description: 'OpenAI\'s Realtime API enables natural voice conversations',
        benefit: 'Better user experience for voice-first applications',
        providers: ['openai'],
      });
    }

    // Reasoning models
    const hasAnalysis = tools.some(t => 
      t.useCases?.some(u => ['analysis', 'research', 'coding'].includes(u))
    );
    if (hasAnalysis) {
      suggestions.push({
        id: 'reasoning_models',
        type: 'innovation',
        title: 'Try extended thinking/reasoning models',
        priority: 'low',
        description: 'Models like o1, Claude with extended thinking, or DeepSeek R1 for complex reasoning',
        benefit: 'Better accuracy on complex analytical tasks',
        providers: ['openai', 'anthropic', 'deepseek'],
      });
    }

    // Fine-tuning
    if (context.total_monthly_spend > 5000) {
      suggestions.push({
        id: 'fine_tuning',
        type: 'innovation',
        title: 'Consider fine-tuning for your use cases',
        priority: 'medium',
        description: 'Custom fine-tuned models can be cheaper and better for specific tasks',
        benefit: 'Potentially 50-80% cost reduction with better quality',
        providers: ['openai', 'together', 'anyscale'],
      });
    }

    return suggestions;
  }

  /**
   * Prioritize and score recommendations
   */
  prioritizeRecommendations(recommendations) {
    return recommendations
      .map(rec => ({
        ...rec,
        score: this.calculateRecommendationScore(rec),
        priority: rec.priority || this.inferPriority(rec),
      }))
      .filter(rec => rec.score >= this.options.minConfidenceScore)
      .sort((a, b) => {
        // Sort by priority first, then score
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        if (priorityDiff !== 0) return priorityDiff;
        return b.score - a.score;
      });
  }

  /**
   * Calculate recommendation confidence score
   */
  calculateRecommendationScore(rec) {
    let score = rec.weight || 0.5;

    // Boost for quantified savings
    if (rec.estimatedSavings > 0) {
      score += Math.min(rec.estimatedSavings / 1000, 0.2);
    }

    // Boost for compliance-related
    if (rec.type === 'compliance') {
      score += 0.2;
    }

    // Penalty for high effort
    if (rec.effort === 'high') {
      score -= 0.1;
    }

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Infer priority from recommendation data
   */
  inferPriority(rec) {
    if (rec.type === 'compliance') return 'critical';
    if (rec.estimatedSavings > 2000) return 'high';
    if (rec.estimatedSavings > 500) return 'medium';
    if (rec.type === 'innovation') return 'low';
    return 'medium';
  }

  /**
   * Group recommendations by priority
   */
  groupByPriority(recommendations) {
    return {
      critical: recommendations.filter(r => r.priority === 'critical'),
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low'),
    };
  }

  /**
   * Group recommendations by type
   */
  groupByType(recommendations) {
    const groups = {};
    recommendations.forEach(rec => {
      const type = rec.type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(rec);
    });
    return groups;
  }

  /**
   * Group recommendations by tool
   */
  groupByTool(toolRecommendations) {
    const groups = {};
    toolRecommendations.forEach(tr => {
      groups[tr.tool.name] = {
        tool: tr.tool,
        recommendations: tr.recommendations,
      };
    });
    return groups;
  }

  /**
   * Generate alternatives comparison matrix
   */
  generateAlternativesMatrix(tools) {
    const matrix = {};
    
    tools.forEach(tool => {
      const modelAlts = this.alternativesDB.model_alternatives[tool.model] || [];
      const providerData = this.alternativesDB.llm_providers[tool.provider];
      
      matrix[tool.name] = {
        current: {
          provider: tool.provider,
          model: tool.model,
          monthlyCost: tool.costs?.monthly || 0,
        },
        modelAlternatives: modelAlts.map(alt => ({
          model: alt,
          category: this.categorizeModel(alt),
        })),
        providerAlternatives: (providerData?.alternatives || []).map(altId => {
          const alt = this.alternativesDB.llm_providers[altId];
          return {
            providerId: altId,
            name: alt?.name,
            tier: alt?.pricing_tier,
            strengths: alt?.strengths?.slice(0, 3),
          };
        }),
      };
    });

    return matrix;
  }

  /**
   * Categorize a model by capability tier
   */
  categorizeModel(model) {
    if (model.includes('opus') || model.includes('4o') || model.includes('2.5-pro')) {
      return 'flagship';
    }
    if (model.includes('sonnet') || model.includes('large')) {
      return 'balanced';
    }
    if (model.includes('haiku') || model.includes('mini') || model.includes('flash')) {
      return 'fast';
    }
    return 'general';
  }

  /**
   * Generate actionable implementation plan
   */
  generateActionPlan(recommendations, context) {
    const phases = {
      immediate: {
        name: 'Quick Wins (This Week)',
        actions: [],
        estimatedSavings: 0,
      },
      shortTerm: {
        name: 'Short-term (This Month)',
        actions: [],
        estimatedSavings: 0,
      },
      mediumTerm: {
        name: 'Medium-term (This Quarter)',
        actions: [],
        estimatedSavings: 0,
      },
      longTerm: {
        name: 'Strategic (This Year)',
        actions: [],
        estimatedSavings: 0,
      },
    };

    recommendations.forEach(rec => {
      const action = {
        title: rec.title,
        type: rec.type,
        toolName: rec.toolName,
        estimatedSavings: rec.estimatedSavings || 0,
      };

      // Categorize by effort and priority
      if (rec.priority === 'critical' || (rec.effort === 'low' && rec.estimatedSavings > 0)) {
        phases.immediate.actions.push(action);
        phases.immediate.estimatedSavings += action.estimatedSavings;
      } else if (rec.priority === 'high' || rec.effort === 'low') {
        phases.shortTerm.actions.push(action);
        phases.shortTerm.estimatedSavings += action.estimatedSavings;
      } else if (rec.effort === 'moderate') {
        phases.mediumTerm.actions.push(action);
        phases.mediumTerm.estimatedSavings += action.estimatedSavings;
      } else {
        phases.longTerm.actions.push(action);
        phases.longTerm.estimatedSavings += action.estimatedSavings;
      }
    });

    return phases;
  }

  /**
   * Calculate total impact summary
   */
  calculateImpactSummary(recommendations, tools) {
    const currentSpend = tools.reduce((sum, t) => sum + (t.costs?.monthly || 0), 0);
    const potentialSavings = recommendations.reduce((sum, r) => sum + (r.estimatedSavings || 0), 0);

    return {
      currentMonthlySpend: currentSpend,
      monthlySavings: potentialSavings,
      annualSavings: potentialSavings * 12,
      savingsPercentage: currentSpend > 0 ? (potentialSavings / currentSpend) * 100 : 0,
      capabilityGaps: recommendations.filter(r => r.type === 'capability_gap').length,
      complianceIssues: recommendations.filter(r => r.type === 'compliance').length,
      innovationOpportunities: recommendations.filter(r => r.type === 'innovation').length,
    };
  }

  /**
   * Get specific alternative recommendations for a tool
   * @param {string} toolId - Tool identifier
   * @param {Object} tool - Tool data
   * @param {Object} requirements - Specific requirements
   * @returns {Array} Ranked alternatives
   */
  getAlternativesForTool(toolId, tool, requirements = {}) {
    const context = {
      compliance: requirements.compliance || [],
      regions: requirements.regions || [],
      compliance_required: (requirements.compliance?.length || 0) > 0,
      avg_response_time_required: requirements.maxLatencyMs || 5000,
    };

    return this.findAlternatives(tool, context);
  }

  /**
   * Compare two providers head-to-head
   * @param {string} providerId1 
   * @param {string} providerId2 
   * @returns {Object} Comparison result
   */
  compareProviders(providerId1, providerId2) {
    const p1 = this.alternativesDB.llm_providers[providerId1];
    const p2 = this.alternativesDB.llm_providers[providerId2];

    if (!p1 || !p2) {
      return { error: 'Provider not found' };
    }

    return {
      providers: [
        { id: providerId1, name: p1.name },
        { id: providerId2, name: p2.name },
      ],
      comparison: {
        pricing: {
          [providerId1]: p1.pricing_tier,
          [providerId2]: p2.pricing_tier,
          winner: this.compareTiers(p1.pricing_tier, p2.pricing_tier),
        },
        strengths: {
          [providerId1]: p1.strengths,
          [providerId2]: p2.strengths,
          unique: {
            [providerId1]: p1.strengths.filter(s => !p2.strengths.includes(s)),
            [providerId2]: p2.strengths.filter(s => !p1.strengths.includes(s)),
          },
        },
        compliance: {
          [providerId1]: p1.compliance,
          [providerId2]: p2.compliance,
        },
        bestFor: {
          [providerId1]: p1.best_for,
          [providerId2]: p2.best_for,
        },
        warnings: {
          [providerId1]: p1.warnings || [],
          [providerId2]: p2.warnings || [],
        },
      },
      recommendation: this.generateComparisonRecommendation(p1, p2),
    };
  }

  /**
   * Compare pricing tiers
   */
  compareTiers(tier1, tier2) {
    const tierRank = { 'ultra-budget': 1, 'budget': 2, 'mid': 3, 'premium': 4 };
    const rank1 = tierRank[tier1] || 3;
    const rank2 = tierRank[tier2] || 3;
    
    if (rank1 < rank2) return tier1 + ' (cheaper)';
    if (rank2 < rank1) return tier2 + ' (cheaper)';
    return 'similar';
  }

  /**
   * Generate comparison recommendation
   */
  generateComparisonRecommendation(p1, p2) {
    const recommendations = [];

    // Cost-focused
    const tierRank = { 'ultra-budget': 1, 'budget': 2, 'mid': 3, 'premium': 4 };
    if (tierRank[p1.pricing_tier] < tierRank[p2.pricing_tier]) {
      recommendations.push(`Choose ${p1.name} for cost savings`);
    } else if (tierRank[p2.pricing_tier] < tierRank[p1.pricing_tier]) {
      recommendations.push(`Choose ${p2.name} for cost savings`);
    }

    // Compliance-focused
    if (p1.compliance.length > p2.compliance.length) {
      recommendations.push(`Choose ${p1.name} for better compliance coverage`);
    } else if (p2.compliance.length > p1.compliance.length) {
      recommendations.push(`Choose ${p2.name} for better compliance coverage`);
    }

    // Warnings
    if ((p1.warnings?.length || 0) > 0 && (p2.warnings?.length || 0) === 0) {
      recommendations.push(`${p2.name} has fewer concerns`);
    } else if ((p2.warnings?.length || 0) > 0 && (p1.warnings?.length || 0) === 0) {
      recommendations.push(`${p1.name} has fewer concerns`);
    }

    return recommendations;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  RecommendationsEngine,
  TOOL_ALTERNATIVES_DB,
  RECOMMENDATION_RULES,
};

// Example usage for testing
if (require.main === module) {
  const engine = new RecommendationsEngine();

  // Sample audit data
  const sampleAuditData = {
    tools: [
      {
        id: 'tool_1',
        name: 'GPT-4 API',
        provider: 'openai',
        model: 'gpt-4o',
        costs: { monthly: 2500 },
        usage: { 
          monthlyTokens: { input: 50000000, output: 10000000 },
          monthlyRequests: 15000,
        },
        capabilities: ['chat', 'coding', 'function-calling'],
        useCases: ['chatbot', 'coding-assistant'],
      },
      {
        id: 'tool_2',
        name: 'Claude API',
        provider: 'anthropic',
        model: 'claude-sonnet-4',
        costs: { monthly: 3200 },
        usage: { 
          monthlyTokens: { input: 80000000, output: 15000000 },
          monthlyRequests: 12000,
        },
        capabilities: ['chat', 'coding', 'vision'],
        useCases: ['chatbot', 'document-analysis'],
      },
    ],
    analyses: {
      waste: { summary: { wastePercentage: 15, totalMonthlyWaste: 800 } },
    },
    compliance: ['gdpr'],
    regions: ['us', 'eu'],
  };

  engine.generateRecommendations(sampleAuditData).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}
