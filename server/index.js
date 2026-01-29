/**
 * StackAudit.ai Server
 * Express API for SaaS stack auditing and report generation
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { ReportGenerator, ReportTemplateManager } = require('./services');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Initialize services
const reportGenerator = new ReportGenerator({
  outputDir: path.join(__dirname, 'reports'),
  companyName: 'StackAudit.ai'
});
const templateManager = new ReportTemplateManager();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'stackaudit-server', timestamp: new Date().toISOString() });
});

/**
 * Generate PDF Report
 * POST /api/reports/generate
 * Body: auditData object
 */
app.post('/api/reports/generate', async (req, res) => {
  try {
    const auditData = req.body;

    if (!auditData.clientName) {
      return res.status(400).json({ error: 'clientName is required' });
    }

    console.log(`📊 Generating report for: ${auditData.clientName}`);
    const reportPath = await reportGenerator.generateReport(auditData);
    
    // Return download URL
    const filename = path.basename(reportPath);
    const downloadUrl = `/reports/${filename}`;

    console.log(`✅ Report generated: ${filename}`);
    
    res.json({
      success: true,
      filename,
      downloadUrl,
      path: reportPath,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

/**
 * Download report
 * GET /api/reports/download/:filename
 */
app.get('/api/reports/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'reports', filename);
  
  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(404).json({ error: 'Report not found' });
    }
  });
});

/**
 * List all reports
 * GET /api/reports
 */
app.get('/api/reports', (req, res) => {
  const fs = require('fs');
  const reportsDir = path.join(__dirname, 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    return res.json({ reports: [] });
  }

  const files = fs.readdirSync(reportsDir)
    .filter(f => f.endsWith('.pdf'))
    .map(f => {
      const stats = fs.statSync(path.join(reportsDir, f));
      return {
        filename: f,
        downloadUrl: `/reports/${f}`,
        size: stats.size,
        createdAt: stats.birthtime
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ reports: files });
});

/**
 * Template endpoints
 */

// Get available brand presets
app.get('/api/templates/brands', (req, res) => {
  res.json({ brands: templateManager.getBrandPresets() });
});

// Get available report types
app.get('/api/templates/types', (req, res) => {
  res.json({ types: templateManager.getReportTypes() });
});

// Get available sections
app.get('/api/templates/sections', (req, res) => {
  res.json({ sections: templateManager.getSections() });
});

// Validate audit data
app.post('/api/templates/validate', (req, res) => {
  const { auditData, reportType = 'standard' } = req.body;
  const validation = templateManager.validateAuditData(auditData, reportType);
  res.json(validation);
});

// Calculate summary from audit data
app.post('/api/templates/calculate-summary', (req, res) => {
  const { auditData } = req.body;
  const summary = templateManager.calculateSummary(auditData);
  res.json(summary);
});

/**
 * Sample data endpoint for testing
 */
app.get('/api/sample-data', (req, res) => {
  res.json({
    clientName: 'Sample Company',
    auditDate: new Date(),
    currentStack: [
      { name: 'Slack', category: 'Communication', users: 150, monthlyCost: 1125, status: 'Active', utilization: 95 },
      { name: 'Microsoft 365', category: 'Productivity', users: 200, monthlyCost: 2400, status: 'Active', utilization: 88 },
      { name: 'Salesforce', category: 'Sales', users: 45, monthlyCost: 6750, status: 'Active', utilization: 72 },
      { name: 'Zoom', category: 'Communication', users: 200, monthlyCost: 3000, status: 'Underutilized', utilization: 35 },
      { name: 'GitHub', category: 'Development', users: 30, monthlyCost: 570, status: 'Active', utilization: 90 }
    ],
    executiveSummary: {
      totalTools: 5,
      totalMonthlySpend: 13845,
      identifiedWaste: 2500,
      potentialSavings: 2500,
      savingsPercentage: 18,
      overallHealthScore: 72,
      keyFindings: [
        'Zoom licenses significantly underutilized',
        'Multiple communication tools creating redundancy',
        'Good utilization on core productivity suite'
      ]
    },
    wasteItems: [
      { tool: 'Zoom', type: 'underutilized', reason: 'Only 35% utilization', wastedAmount: 1950 },
      { tool: 'Slack/Zoom overlap', type: 'duplicate', reason: 'Video calling redundancy', wastedAmount: 550 }
    ],
    recommendations: [
      { title: 'Reduce Zoom licenses', description: 'Downgrade to 70 licenses based on actual usage', priority: 'high', savings: 1950, effort: 'Low', timeline: '1 week' },
      { title: 'Consolidate video tools', description: 'Use Slack Huddles for quick calls', priority: 'medium', savings: 550, effort: 'Medium', timeline: '2 weeks' }
    ],
    projectedSavings: {
      immediate: 1950,
      shortTerm: 550,
      longTerm: 0,
      total: 2500,
      timeline: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, savings: 1950 + (i > 0 ? 550 : 0) }))
    },
    roiAnalysis: {
      currentROI: 165,
      projectedROI: 210,
      costPerEmployee: 69,
      industryBenchmark: 75,
      valueDelivered: 250000,
      utilizationRate: 76
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║           StackAudit.ai Report Server                  ║
╠═══════════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}                        ║
║                                                         ║
║  📊 POST /api/reports/generate   - Generate PDF report  ║
║  📥 GET  /reports/:filename      - Download report      ║
║  📋 GET  /api/reports            - List all reports     ║
║  🎨 GET  /api/templates/brands   - Brand presets        ║
║  📝 GET  /api/templates/types    - Report types         ║
║  🧪 GET  /api/sample-data        - Sample audit data    ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
