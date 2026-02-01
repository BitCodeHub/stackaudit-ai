/**
 * StackAudit.ai Services
 * 
 * Export all available services
 */

const ReportGenerator = require('./report-generator');
const { ReportTemplateManager, BRAND_PRESETS, SECTION_TEMPLATES, REPORT_TYPES } = require('./report-templates');
const { RecommendationsEngine, TOOL_ALTERNATIVES_DB, RECOMMENDATION_RULES } = require('./recommendations-engine');
const { AuditEngine, BENCHMARK_DATA } = require('./audit-engine');

module.exports = {
  // Core Engines
  RecommendationsEngine,
  AuditEngine,
  
  // Report Generation
  ReportGenerator,
  createReportGenerator: (options) => new ReportGenerator(options),

  // Template Management
  ReportTemplateManager,
  createTemplateManager: () => new ReportTemplateManager(),
  
  // Constants
  BRAND_PRESETS,
  SECTION_TEMPLATES,
  REPORT_TYPES,
  TOOL_ALTERNATIVES_DB,
  RECOMMENDATION_RULES,
  BENCHMARK_DATA
};
