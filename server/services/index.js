/**
 * StackAudit.ai Services
 * 
 * Export all available services
 */

const ReportGenerator = require('./report-generator');
const { ReportTemplateManager, BRAND_PRESETS, SECTION_TEMPLATES, REPORT_TYPES } = require('./report-templates');

module.exports = {
  // Report Generation
  ReportGenerator,
  createReportGenerator: (options) => new ReportGenerator(options),

  // Template Management
  ReportTemplateManager,
  createTemplateManager: () => new ReportTemplateManager(),
  
  // Constants
  BRAND_PRESETS,
  SECTION_TEMPLATES,
  REPORT_TYPES
};
