/**
 * StackAudit.ai - Report Templates
 * 
 * Pre-configured templates for different report styles and branding
 */

// Brand presets for white-labeling
const BRAND_PRESETS = {
  stackaudit: {
    name: 'StackAudit.ai',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444'
    },
    tagline: 'Optimize Your Stack. Maximize Your ROI.'
  },
  
  enterprise: {
    name: 'Enterprise Stack Review',
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#059669',
      warning: '#D97706',
      danger: '#DC2626'
    },
    tagline: 'Strategic Technology Assessment'
  },

  modern: {
    name: 'SaaS Optimization Report',
    colors: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#06B6D4',
      warning: '#FBBF24',
      danger: '#F43F5E'
    },
    tagline: 'Transform Your Technology Stack'
  },

  minimal: {
    name: 'Technology Audit',
    colors: {
      primary: '#0F172A',
      secondary: '#334155',
      accent: '#22C55E',
      warning: '#EAB308',
      danger: '#EF4444'
    },
    tagline: 'Data-Driven Insights'
  }
};

// Section templates for custom report composition
const SECTION_TEMPLATES = {
  executiveSummary: {
    id: 'executive-summary',
    title: 'Executive Summary',
    required: true,
    description: 'High-level overview of findings and potential savings'
  },
  
  stackOverview: {
    id: 'stack-overview',
    title: 'Current Stack Overview',
    required: true,
    description: 'Complete inventory of tools, costs, and categories'
  },
  
  roiAnalysis: {
    id: 'roi-analysis',
    title: 'ROI Analysis',
    required: false,
    description: 'Return on investment calculations and benchmarks'
  },
  
  wasteIdentification: {
    id: 'waste-identification',
    title: 'Waste Identification',
    required: true,
    description: 'Detailed breakdown of waste by category'
  },
  
  recommendations: {
    id: 'recommendations',
    title: 'Prioritized Recommendations',
    required: true,
    description: 'Action items sorted by priority and impact'
  },
  
  projectedSavings: {
    id: 'projected-savings',
    title: 'Projected Savings',
    required: true,
    description: '12-month savings projection and timeline'
  },
  
  nextSteps: {
    id: 'next-steps',
    title: 'Implementation Roadmap',
    required: false,
    description: 'Step-by-step guide for optimization'
  },
  
  vendorComparison: {
    id: 'vendor-comparison',
    title: 'Vendor Alternatives',
    required: false,
    description: 'Alternative tool recommendations'
  },
  
  securityAssessment: {
    id: 'security-assessment',
    title: 'Security & Compliance',
    required: false,
    description: 'Security posture and compliance status'
  }
};

// Report types with pre-configured sections
const REPORT_TYPES = {
  standard: {
    name: 'Standard Audit Report',
    sections: ['executiveSummary', 'stackOverview', 'wasteIdentification', 'recommendations', 'projectedSavings', 'nextSteps'],
    description: 'Complete audit with all essential sections'
  },
  
  executive: {
    name: 'Executive Brief',
    sections: ['executiveSummary', 'projectedSavings', 'recommendations'],
    description: 'Condensed report for C-suite stakeholders'
  },
  
  detailed: {
    name: 'Detailed Technical Report',
    sections: ['executiveSummary', 'stackOverview', 'roiAnalysis', 'wasteIdentification', 'recommendations', 'projectedSavings', 'vendorComparison', 'securityAssessment', 'nextSteps'],
    description: 'Comprehensive report with all available sections'
  },
  
  financial: {
    name: 'Financial Impact Report',
    sections: ['executiveSummary', 'roiAnalysis', 'wasteIdentification', 'projectedSavings'],
    description: 'Focus on costs, ROI, and savings potential'
  }
};

// Utility functions for template management
class ReportTemplateManager {
  constructor() {
    this.brandPresets = BRAND_PRESETS;
    this.sectionTemplates = SECTION_TEMPLATES;
    this.reportTypes = REPORT_TYPES;
  }

  /**
   * Get all available brand presets
   */
  getBrandPresets() {
    return Object.entries(this.brandPresets).map(([key, preset]) => ({
      id: key,
      ...preset
    }));
  }

  /**
   * Get a specific brand preset
   */
  getBrandPreset(presetId) {
    return this.brandPresets[presetId] || this.brandPresets.stackaudit;
  }

  /**
   * Get all available sections
   */
  getSections() {
    return Object.entries(this.sectionTemplates).map(([key, section]) => ({
      ...section,
      key
    }));
  }

  /**
   * Get all report types
   */
  getReportTypes() {
    return Object.entries(this.reportTypes).map(([key, type]) => ({
      id: key,
      ...type
    }));
  }

  /**
   * Get sections for a specific report type
   */
  getSectionsForType(typeId) {
    const type = this.reportTypes[typeId];
    if (!type) return [];
    
    return type.sections.map(sectionKey => ({
      ...this.sectionTemplates[sectionKey],
      key: sectionKey
    }));
  }

  /**
   * Create a custom template configuration
   */
  createCustomTemplate(options) {
    const {
      name = 'Custom Report',
      brandPreset = 'stackaudit',
      sections = ['executiveSummary', 'stackOverview', 'recommendations', 'projectedSavings'],
      customColors = null,
      customLogo = null,
      customTagline = null
    } = options;

    const brand = this.getBrandPreset(brandPreset);

    return {
      name,
      brand: {
        ...brand,
        ...(customColors && { colors: { ...brand.colors, ...customColors } }),
        ...(customTagline && { tagline: customTagline })
      },
      sections: sections.map(key => this.sectionTemplates[key]).filter(Boolean),
      logo: customLogo
    };
  }

  /**
   * Validate audit data against required sections
   */
  validateAuditData(auditData, reportType = 'standard') {
    const errors = [];
    const warnings = [];
    const type = this.reportTypes[reportType];

    if (!auditData.clientName) {
      errors.push('Client name is required');
    }

    if (type.sections.includes('stackOverview') && (!auditData.currentStack || auditData.currentStack.length === 0)) {
      errors.push('Current stack data is required for this report type');
    }

    if (type.sections.includes('recommendations') && (!auditData.recommendations || auditData.recommendations.length === 0)) {
      warnings.push('No recommendations provided - report may appear incomplete');
    }

    if (type.sections.includes('wasteIdentification') && (!auditData.wasteItems || auditData.wasteItems.length === 0)) {
      warnings.push('No waste items identified - consider adding waste analysis');
    }

    if (type.sections.includes('roiAnalysis') && !auditData.roiAnalysis) {
      warnings.push('ROI analysis data missing - section will use defaults');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate summary statistics from audit data
   */
  calculateSummary(auditData) {
    const { currentStack = [], wasteItems = [], recommendations = [] } = auditData;

    const totalMonthlySpend = currentStack.reduce((sum, tool) => sum + (tool.monthlyCost || 0), 0);
    const identifiedWaste = wasteItems.reduce((sum, item) => sum + (item.wastedAmount || 0), 0);
    const potentialSavings = recommendations.reduce((sum, rec) => sum + (rec.savings || 0), 0);
    const savingsPercentage = totalMonthlySpend > 0 ? Math.round((identifiedWaste / totalMonthlySpend) * 100) : 0;

    // Calculate health score based on utilization and waste
    const avgUtilization = currentStack.length > 0
      ? currentStack.reduce((sum, tool) => sum + (tool.utilization || 50), 0) / currentStack.length
      : 50;
    
    const wasteRatio = totalMonthlySpend > 0 ? identifiedWaste / totalMonthlySpend : 0;
    const healthScore = Math.round(avgUtilization * (1 - wasteRatio * 0.5));

    return {
      totalTools: currentStack.length,
      totalMonthlySpend,
      identifiedWaste,
      potentialSavings,
      savingsPercentage,
      overallHealthScore: Math.min(100, Math.max(0, healthScore)),
      keyFindings: this._generateKeyFindings(auditData)
    };
  }

  _generateKeyFindings(auditData) {
    const findings = [];
    const { currentStack = [], wasteItems = [] } = auditData;

    // Find duplicate categories
    const categoryCount = {};
    currentStack.forEach(tool => {
      const cat = tool.category || 'Other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    Object.entries(categoryCount)
      .filter(([, count]) => count > 2)
      .forEach(([category, count]) => {
        findings.push(`${count} tools in ${category} category - potential consolidation opportunity`);
      });

    // Summarize waste by type
    const wasteByType = {};
    wasteItems.forEach(item => {
      wasteByType[item.type] = (wasteByType[item.type] || 0) + item.wastedAmount;
    });

    if (wasteByType.unused > 0) {
      findings.push(`$${wasteByType.unused.toLocaleString()}/month in unused licenses detected`);
    }
    if (wasteByType.duplicate > 0) {
      findings.push(`$${wasteByType.duplicate.toLocaleString()}/month spent on duplicate tools`);
    }
    if (wasteByType.underutilized > 0) {
      findings.push(`$${wasteByType.underutilized.toLocaleString()}/month on underutilized subscriptions`);
    }

    // Low utilization alert
    const lowUtilTools = currentStack.filter(t => (t.utilization || 50) < 40);
    if (lowUtilTools.length > 0) {
      findings.push(`${lowUtilTools.length} tools with utilization below 40%`);
    }

    return findings.slice(0, 5); // Return top 5 findings
  }
}

module.exports = {
  BRAND_PRESETS,
  SECTION_TEMPLATES,
  REPORT_TYPES,
  ReportTemplateManager
};
