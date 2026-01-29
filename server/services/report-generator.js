/**
 * StackAudit.ai - Professional PDF Report Generator
 * 
 * Generates comprehensive SaaS stack audit reports with:
 * - Executive Summary
 * - Current Stack Overview
 * - ROI Analysis with Charts
 * - Waste Identification
 * - Prioritized Recommendations
 * - Projected Savings
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Brand Colors
const COLORS = {
  primary: '#2563EB',      // Blue
  secondary: '#1E40AF',    // Dark Blue
  accent: '#10B981',       // Green (savings)
  warning: '#F59E0B',      // Amber (caution)
  danger: '#EF4444',       // Red (waste)
  text: '#1F2937',         // Dark gray
  textLight: '#6B7280',    // Light gray
  background: '#F9FAFB',   // Light background
  white: '#FFFFFF'
};

// Font sizes
const FONTS = {
  title: 28,
  h1: 22,
  h2: 18,
  h3: 14,
  body: 11,
  small: 9
};

class ReportGenerator {
  constructor(options = {}) {
    this.options = {
      companyName: options.companyName || 'StackAudit.ai',
      logoPath: options.logoPath || null,
      outputDir: options.outputDir || './reports',
      ...options
    };
  }

  /**
   * Generate a complete audit report
   * @param {Object} auditData - The audit data to generate report from
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateReport(auditData) {
    const {
      clientName,
      auditDate = new Date(),
      currentStack = [],
      recommendations = [],
      wasteItems = [],
      projectedSavings = {},
      roiAnalysis = {},
      executiveSummary = {}
    } = auditData;

    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
      fs.mkdirSync(this.options.outputDir, { recursive: true });
    }

    const filename = `stackaudit-report-${clientName.replace(/\s+/g, '-').toLowerCase()}-${this._formatDateForFile(auditDate)}.pdf`;
    const outputPath = path.join(this.options.outputDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
        info: {
          Title: `SaaS Stack Audit Report - ${clientName}`,
          Author: 'StackAudit.ai',
          Subject: 'SaaS Stack Optimization Report',
          Keywords: 'SaaS, audit, optimization, cost savings'
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Generate report sections
      this._addCoverPage(doc, clientName, auditDate);
      this._addTableOfContents(doc);
      this._addExecutiveSummary(doc, executiveSummary, projectedSavings);
      this._addCurrentStackOverview(doc, currentStack);
      this._addROIAnalysis(doc, roiAnalysis, currentStack);
      this._addWasteIdentification(doc, wasteItems);
      this._addRecommendations(doc, recommendations);
      this._addProjectedSavings(doc, projectedSavings, currentStack);
      this._addNextSteps(doc, clientName);
      this._addFooter(doc);

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  /**
   * Cover Page
   */
  _addCoverPage(doc, clientName, auditDate) {
    // Background gradient effect (using rectangles)
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill(COLORS.primary);

    // Decorative elements
    doc.circle(doc.page.width * 0.8, doc.page.height * 0.2, 150)
       .fill(COLORS.secondary);
    doc.circle(doc.page.width * 0.1, doc.page.height * 0.8, 100)
       .fill(COLORS.secondary);

    // Main title area
    doc.rect(50, doc.page.height * 0.3, doc.page.width - 100, 200)
       .fill(COLORS.white);

    // Company branding
    doc.fontSize(FONTS.small)
       .fillColor(COLORS.white)
       .text('STACKAUDIT.AI', 50, 40);

    // Report title
    doc.fontSize(FONTS.title)
       .fillColor(COLORS.primary)
       .text('SaaS Stack', 70, doc.page.height * 0.35, { align: 'left' });
    
    doc.fontSize(FONTS.title)
       .fillColor(COLORS.text)
       .text('Audit Report', 70, doc.page.height * 0.35 + 35, { align: 'left' });

    // Client name
    doc.fontSize(FONTS.h2)
       .fillColor(COLORS.textLight)
       .text(`Prepared for: ${clientName}`, 70, doc.page.height * 0.35 + 80);

    // Date
    doc.fontSize(FONTS.body)
       .fillColor(COLORS.textLight)
       .text(`Report Date: ${this._formatDate(auditDate)}`, 70, doc.page.height * 0.35 + 110);

    // Bottom tagline
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.white)
       .text('Optimize Your Stack. Maximize Your ROI.', 0, doc.page.height - 100, { align: 'center' });

    doc.addPage();
  }

  /**
   * Table of Contents
   */
  _addTableOfContents(doc) {
    this._addSectionHeader(doc, 'Table of Contents');

    const tocItems = [
      { title: 'Executive Summary', page: 3 },
      { title: 'Current Stack Overview', page: 4 },
      { title: 'ROI Analysis', page: 5 },
      { title: 'Waste Identification', page: 6 },
      { title: 'Prioritized Recommendations', page: 7 },
      { title: 'Projected Savings', page: 8 },
      { title: 'Next Steps', page: 9 }
    ];

    let yPos = 150;
    tocItems.forEach((item, index) => {
      doc.fontSize(FONTS.h3)
         .fillColor(COLORS.text)
         .text(`${index + 1}.`, 60, yPos);
      
      doc.text(item.title, 90, yPos);
      
      // Dotted line
      const textWidth = doc.widthOfString(item.title);
      const dotsStart = 90 + textWidth + 10;
      const dotsEnd = doc.page.width - 100;
      let dotX = dotsStart;
      while (dotX < dotsEnd) {
        doc.circle(dotX, yPos + 6, 1).fill(COLORS.textLight);
        dotX += 6;
      }
      
      doc.text(item.page.toString(), doc.page.width - 80, yPos);
      yPos += 30;
    });

    doc.addPage();
  }

  /**
   * Executive Summary
   */
  _addExecutiveSummary(doc, summary, savings) {
    this._addSectionHeader(doc, '1. Executive Summary');

    const {
      totalTools = 0,
      totalMonthlySpend = 0,
      identifiedWaste = 0,
      potentialSavings = 0,
      savingsPercentage = 0,
      overallHealthScore = 0,
      keyFindings = []
    } = summary;

    // Summary cards
    const cardWidth = (doc.page.width - 120) / 3;
    const cardY = 140;

    // Card 1: Current Spend
    this._drawMetricCard(doc, 50, cardY, cardWidth, 
      'Monthly Spend', 
      `$${this._formatNumber(totalMonthlySpend)}`,
      `${totalTools} tools`,
      COLORS.primary
    );

    // Card 2: Identified Waste
    this._drawMetricCard(doc, 60 + cardWidth, cardY, cardWidth,
      'Waste Identified',
      `$${this._formatNumber(identifiedWaste)}`,
      `${savingsPercentage}% of spend`,
      COLORS.danger
    );

    // Card 3: Potential Savings
    this._drawMetricCard(doc, 70 + cardWidth * 2, cardY, cardWidth,
      'Annual Savings',
      `$${this._formatNumber(potentialSavings * 12)}`,
      `${savingsPercentage}% reduction`,
      COLORS.accent
    );

    // Health Score
    let yPos = cardY + 110;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('Stack Health Score', 50, yPos);
    
    this._drawProgressBar(doc, 50, yPos + 25, doc.page.width - 100, 20, overallHealthScore);

    // Key Findings
    yPos += 70;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('Key Findings', 50, yPos);

    yPos += 25;
    keyFindings.forEach((finding, index) => {
      doc.fontSize(FONTS.body)
         .fillColor(COLORS.textLight)
         .text(`• ${finding}`, 60, yPos, { width: doc.page.width - 120 });
      yPos += 20;
    });

    // Bottom-line statement
    yPos += 20;
    doc.rect(50, yPos, doc.page.width - 100, 60)
       .fill(COLORS.accent);
    
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.white)
       .text(`Your organization can save $${this._formatNumber(potentialSavings * 12)} annually`, 
             70, yPos + 15, { align: 'center' });
    doc.fontSize(FONTS.body)
       .text('by implementing the recommendations in this report.', 70, yPos + 38, { align: 'center' });

    doc.addPage();
  }

  /**
   * Current Stack Overview
   */
  _addCurrentStackOverview(doc, stack) {
    this._addSectionHeader(doc, '2. Current Stack Overview');

    // Category summary
    const categories = this._groupByCategory(stack);
    let yPos = 140;

    // Stack composition chart (horizontal bars)
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('Spend by Category', 50, yPos);

    yPos += 30;
    const maxSpend = Math.max(...Object.values(categories).map(c => c.totalSpend));
    const barMaxWidth = doc.page.width - 200;

    Object.entries(categories).forEach(([category, data]) => {
      const barWidth = (data.totalSpend / maxSpend) * barMaxWidth;
      
      doc.fontSize(FONTS.small)
         .fillColor(COLORS.text)
         .text(category, 50, yPos, { width: 100 });
      
      doc.rect(160, yPos, barWidth, 15)
         .fill(this._getCategoryColor(category));
      
      doc.fontSize(FONTS.small)
         .fillColor(COLORS.textLight)
         .text(`$${this._formatNumber(data.totalSpend)}/mo`, 170 + barWidth, yPos);
      
      yPos += 25;
    });

    // Tool inventory table
    yPos += 20;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('Tool Inventory', 50, yPos);

    yPos += 25;
    this._drawTableHeader(doc, yPos, ['Tool', 'Category', 'Users', 'Monthly Cost', 'Status']);
    
    yPos += 25;
    stack.slice(0, 12).forEach((tool) => {
      if (yPos > doc.page.height - 100) {
        doc.addPage();
        yPos = 50;
      }
      this._drawTableRow(doc, yPos, [
        tool.name || 'Unknown',
        tool.category || 'Other',
        (tool.users || 0).toString(),
        `$${this._formatNumber(tool.monthlyCost || 0)}`,
        tool.status || 'Active'
      ], tool.status === 'Underutilized' ? COLORS.warning : COLORS.text);
      yPos += 22;
    });

    if (stack.length > 12) {
      doc.fontSize(FONTS.small)
         .fillColor(COLORS.textLight)
         .text(`...and ${stack.length - 12} more tools`, 50, yPos + 10);
    }

    doc.addPage();
  }

  /**
   * ROI Analysis
   */
  _addROIAnalysis(doc, roiAnalysis, stack) {
    this._addSectionHeader(doc, '3. ROI Analysis');

    const {
      currentROI = 0,
      projectedROI = 0,
      costPerEmployee = 0,
      industryBenchmark = 0,
      valueDelivered = 0,
      utilizationRate = 0
    } = roiAnalysis;

    // ROI comparison chart
    let yPos = 140;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('ROI Comparison', 50, yPos);

    yPos += 30;
    
    // Current vs Projected ROI bars
    const barWidth = 200;
    const barHeight = 40;
    
    // Current ROI
    doc.rect(50, yPos, barWidth, barHeight)
       .fill(COLORS.textLight);
    doc.fontSize(FONTS.body)
       .fillColor(COLORS.white)
       .text(`Current ROI: ${currentROI}%`, 60, yPos + 12);

    // Projected ROI
    doc.rect(50, yPos + 50, barWidth * (projectedROI / Math.max(currentROI, projectedROI, 100)), barHeight)
       .fill(COLORS.accent);
    doc.fontSize(FONTS.body)
       .fillColor(COLORS.white)
       .text(`Projected ROI: ${projectedROI}%`, 60, yPos + 62);

    // Improvement indicator
    const improvement = projectedROI - currentROI;
    doc.rect(270, yPos, 150, 95)
       .fill(improvement > 0 ? COLORS.accent : COLORS.danger);
    doc.fontSize(FONTS.h1)
       .fillColor(COLORS.white)
       .text(`+${improvement}%`, 290, yPos + 25);
    doc.fontSize(FONTS.small)
       .text('ROI Improvement', 290, yPos + 60);

    // Key metrics
    yPos += 130;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('Key Metrics', 50, yPos);

    yPos += 30;
    const metrics = [
      { label: 'Cost per Employee', value: `$${this._formatNumber(costPerEmployee)}/mo`, benchmark: `Industry avg: $${industryBenchmark}/mo` },
      { label: 'Tool Utilization Rate', value: `${utilizationRate}%`, benchmark: 'Target: 80%+' },
      { label: 'Value Delivered', value: `$${this._formatNumber(valueDelivered)}/yr`, benchmark: 'vs. cost analysis' }
    ];

    metrics.forEach((metric) => {
      doc.rect(50, yPos, (doc.page.width - 120) / 3, 70)
         .stroke(COLORS.primary);
      
      doc.fontSize(FONTS.small)
         .fillColor(COLORS.textLight)
         .text(metric.label, 60, yPos + 10, { width: 120 });
      
      doc.fontSize(FONTS.h2)
         .fillColor(COLORS.primary)
         .text(metric.value, 60, yPos + 28, { width: 120 });
      
      doc.fontSize(FONTS.small)
         .fillColor(COLORS.textLight)
         .text(metric.benchmark, 60, yPos + 52, { width: 120 });
      
      doc.translate((doc.page.width - 120) / 3 + 10, 0);
    });

    doc.translate(-((doc.page.width - 120) / 3 + 10) * 3, 0);

    // Utilization breakdown
    yPos += 100;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('Tool Utilization Breakdown', 50, yPos);

    yPos += 30;
    const utilizationBuckets = this._categorizeUtilization(stack);
    
    Object.entries(utilizationBuckets).forEach(([bucket, data]) => {
      const color = bucket === 'High (80%+)' ? COLORS.accent : 
                   bucket === 'Medium (40-80%)' ? COLORS.warning : COLORS.danger;
      
      doc.rect(50, yPos, 15, 15).fill(color);
      doc.fontSize(FONTS.body)
         .fillColor(COLORS.text)
         .text(`${bucket}: ${data.count} tools ($${this._formatNumber(data.spend)}/mo)`, 75, yPos);
      yPos += 22;
    });

    doc.addPage();
  }

  /**
   * Waste Identification
   */
  _addWasteIdentification(doc, wasteItems) {
    this._addSectionHeader(doc, '4. Waste Identification');

    let yPos = 140;
    
    // Waste summary
    const totalWaste = wasteItems.reduce((sum, item) => sum + (item.wastedAmount || 0), 0);
    
    doc.rect(50, yPos, doc.page.width - 100, 60)
       .fill(COLORS.danger);
    
    doc.fontSize(FONTS.h2)
       .fillColor(COLORS.white)
       .text(`Total Identified Waste: $${this._formatNumber(totalWaste)}/month`, 0, yPos + 20, { align: 'center' });

    yPos += 80;

    // Waste categories
    const wasteCategories = [
      { type: 'Unused Licenses', icon: '🔴', items: wasteItems.filter(w => w.type === 'unused') },
      { type: 'Duplicate Tools', icon: '🟡', items: wasteItems.filter(w => w.type === 'duplicate') },
      { type: 'Underutilized', icon: '🟠', items: wasteItems.filter(w => w.type === 'underutilized') },
      { type: 'Overpriced Plans', icon: '🔵', items: wasteItems.filter(w => w.type === 'overpriced') }
    ];

    wasteCategories.forEach((category) => {
      if (category.items.length === 0) return;
      
      if (yPos > doc.page.height - 150) {
        doc.addPage();
        yPos = 50;
      }

      doc.fontSize(FONTS.h3)
         .fillColor(COLORS.text)
         .text(`${category.icon} ${category.type}`, 50, yPos);
      
      yPos += 25;
      
      category.items.forEach((item) => {
        doc.rect(60, yPos, doc.page.width - 130, 45)
           .stroke(COLORS.textLight);
        
        doc.fontSize(FONTS.body)
           .fillColor(COLORS.text)
           .text(item.tool || 'Unknown Tool', 70, yPos + 8);
        
        doc.fontSize(FONTS.small)
           .fillColor(COLORS.textLight)
           .text(item.reason || 'No reason specified', 70, yPos + 24);
        
        doc.fontSize(FONTS.h3)
           .fillColor(COLORS.danger)
           .text(`-$${this._formatNumber(item.wastedAmount || 0)}/mo`, doc.page.width - 150, yPos + 12);
        
        yPos += 55;
      });
      
      yPos += 15;
    });

    doc.addPage();
  }

  /**
   * Prioritized Recommendations
   */
  _addRecommendations(doc, recommendations) {
    this._addSectionHeader(doc, '5. Prioritized Recommendations');

    let yPos = 140;

    // Priority legend
    doc.fontSize(FONTS.small)
       .fillColor(COLORS.textLight)
       .text('Priority: ', 50, yPos);
    
    doc.circle(100, yPos + 4, 5).fill(COLORS.danger);
    doc.text('High', 110, yPos);
    
    doc.circle(150, yPos + 4, 5).fill(COLORS.warning);
    doc.text('Medium', 160, yPos);
    
    doc.circle(210, yPos + 4, 5).fill(COLORS.accent);
    doc.text('Low', 220, yPos);

    yPos += 30;

    recommendations.forEach((rec, index) => {
      if (yPos > doc.page.height - 120) {
        doc.addPage();
        yPos = 50;
      }

      const priorityColor = rec.priority === 'high' ? COLORS.danger :
                           rec.priority === 'medium' ? COLORS.warning : COLORS.accent;

      // Recommendation card
      doc.rect(50, yPos, doc.page.width - 100, 80)
         .fill(COLORS.background);
      
      // Priority indicator
      doc.rect(50, yPos, 5, 80)
         .fill(priorityColor);

      // Number badge
      doc.circle(75, yPos + 20, 12)
         .fill(COLORS.primary);
      doc.fontSize(FONTS.body)
         .fillColor(COLORS.white)
         .text((index + 1).toString(), 70, yPos + 14);

      // Content
      doc.fontSize(FONTS.h3)
         .fillColor(COLORS.text)
         .text(rec.title || 'Recommendation', 100, yPos + 10, { width: doc.page.width - 250 });

      doc.fontSize(FONTS.small)
         .fillColor(COLORS.textLight)
         .text(rec.description || '', 100, yPos + 30, { width: doc.page.width - 250 });

      // Savings badge
      if (rec.savings) {
        doc.rect(doc.page.width - 140, yPos + 15, 80, 30)
           .fill(COLORS.accent);
        doc.fontSize(FONTS.small)
           .fillColor(COLORS.white)
           .text(`Save $${this._formatNumber(rec.savings)}/mo`, doc.page.width - 135, yPos + 25);
      }

      // Effort indicator
      doc.fontSize(FONTS.small)
         .fillColor(COLORS.textLight)
         .text(`Effort: ${rec.effort || 'Low'} | Timeline: ${rec.timeline || '1-2 weeks'}`, 100, yPos + 60);

      yPos += 95;
    });

    doc.addPage();
  }

  /**
   * Projected Savings
   */
  _addProjectedSavings(doc, savings, stack) {
    this._addSectionHeader(doc, '6. Projected Savings');

    const {
      immediate = 0,
      shortTerm = 0,
      longTerm = 0,
      total = 0,
      timeline = []
    } = savings;

    let yPos = 140;

    // Savings summary cards
    const cardWidth = (doc.page.width - 140) / 4;

    this._drawMetricCard(doc, 50, yPos, cardWidth, 'Immediate', `$${this._formatNumber(immediate)}/mo`, '0-30 days', COLORS.accent);
    this._drawMetricCard(doc, 60 + cardWidth, yPos, cardWidth, 'Short-term', `$${this._formatNumber(shortTerm)}/mo`, '1-3 months', COLORS.primary);
    this._drawMetricCard(doc, 70 + cardWidth * 2, yPos, cardWidth, 'Long-term', `$${this._formatNumber(longTerm)}/mo`, '3-6 months', COLORS.secondary);
    this._drawMetricCard(doc, 80 + cardWidth * 3, yPos, cardWidth, 'Total Annual', `$${this._formatNumber(total * 12)}`, 'yearly', COLORS.accent);

    // Savings timeline chart
    yPos += 120;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('12-Month Savings Projection', 50, yPos);

    yPos += 30;
    this._drawSavingsChart(doc, 50, yPos, doc.page.width - 100, 150, timeline);

    // Before/After comparison
    yPos += 180;
    doc.fontSize(FONTS.h3)
       .fillColor(COLORS.text)
       .text('Before & After Comparison', 50, yPos);

    yPos += 25;
    const totalCurrentSpend = stack.reduce((sum, t) => sum + (t.monthlyCost || 0), 0);
    const optimizedSpend = totalCurrentSpend - total;

    // Before
    doc.rect(50, yPos, (doc.page.width - 110) / 2, 60)
       .fill(COLORS.danger);
    doc.fontSize(FONTS.small)
       .fillColor(COLORS.white)
       .text('BEFORE OPTIMIZATION', 60, yPos + 10);
    doc.fontSize(FONTS.h2)
       .text(`$${this._formatNumber(totalCurrentSpend)}/month`, 60, yPos + 28);

    // After
    doc.rect(60 + (doc.page.width - 110) / 2, yPos, (doc.page.width - 110) / 2, 60)
       .fill(COLORS.accent);
    doc.fontSize(FONTS.small)
       .fillColor(COLORS.white)
       .text('AFTER OPTIMIZATION', 70 + (doc.page.width - 110) / 2, yPos + 10);
    doc.fontSize(FONTS.h2)
       .text(`$${this._formatNumber(optimizedSpend)}/month`, 70 + (doc.page.width - 110) / 2, yPos + 28);

    doc.addPage();
  }

  /**
   * Next Steps
   */
  _addNextSteps(doc, clientName) {
    this._addSectionHeader(doc, '7. Next Steps');

    let yPos = 140;

    const steps = [
      {
        step: 1,
        title: 'Review This Report',
        description: 'Share this report with key stakeholders including IT, Finance, and department heads.',
        timeline: 'This week'
      },
      {
        step: 2,
        title: 'Quick Wins Implementation',
        description: 'Start with high-impact, low-effort recommendations to show immediate results.',
        timeline: 'Week 1-2'
      },
      {
        step: 3,
        title: 'Vendor Negotiations',
        description: 'Use insights from this audit to renegotiate contracts with vendors.',
        timeline: 'Month 1'
      },
      {
        step: 4,
        title: 'Tool Consolidation',
        description: 'Begin migrating users from duplicate/redundant tools to preferred alternatives.',
        timeline: 'Month 1-2'
      },
      {
        step: 5,
        title: 'License Right-sizing',
        description: 'Adjust license counts based on actual usage data.',
        timeline: 'Month 2-3'
      },
      {
        step: 6,
        title: 'Quarterly Review',
        description: 'Schedule recurring audits to maintain optimization.',
        timeline: 'Ongoing'
      }
    ];

    steps.forEach((step) => {
      doc.circle(70, yPos + 10, 15)
         .fill(COLORS.primary);
      doc.fontSize(FONTS.body)
         .fillColor(COLORS.white)
         .text(step.step.toString(), 65, yPos + 5);

      doc.fontSize(FONTS.h3)
         .fillColor(COLORS.text)
         .text(step.title, 100, yPos);

      doc.fontSize(FONTS.body)
         .fillColor(COLORS.textLight)
         .text(step.description, 100, yPos + 18, { width: doc.page.width - 220 });

      doc.fontSize(FONTS.small)
         .fillColor(COLORS.primary)
         .text(step.timeline, doc.page.width - 100, yPos + 5);

      // Connector line
      if (step.step < 6) {
        doc.moveTo(70, yPos + 25)
           .lineTo(70, yPos + 60)
           .stroke(COLORS.textLight);
      }

      yPos += 65;
    });

    // Contact CTA
    yPos += 30;
    doc.rect(50, yPos, doc.page.width - 100, 100)
       .fill(COLORS.primary);

    doc.fontSize(FONTS.h2)
       .fillColor(COLORS.white)
       .text('Ready to Optimize Your Stack?', 0, yPos + 20, { align: 'center' });

    doc.fontSize(FONTS.body)
       .text('Our team is ready to help you implement these recommendations.', 0, yPos + 50, { align: 'center' });

    doc.fontSize(FONTS.body)
       .text('Contact: hello@stackaudit.ai | www.stackaudit.ai', 0, yPos + 70, { align: 'center' });
  }

  /**
   * Footer on each page
   */
  _addFooter(doc) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Skip cover page
      if (i === 0) continue;

      doc.fontSize(FONTS.small)
         .fillColor(COLORS.textLight)
         .text(
           `StackAudit.ai - Confidential`,
           50,
           doc.page.height - 30,
           { align: 'left' }
         )
         .text(
           `Page ${i + 1} of ${pages.count}`,
           0,
           doc.page.height - 30,
           { align: 'right', width: doc.page.width - 50 }
         );
    }
  }

  // ============== Helper Methods ==============

  _addSectionHeader(doc, title) {
    doc.rect(0, 0, doc.page.width, 80)
       .fill(COLORS.background);
    
    doc.fontSize(FONTS.h1)
       .fillColor(COLORS.primary)
       .text(title, 50, 30);
    
    doc.moveTo(50, 65)
       .lineTo(200, 65)
       .stroke(COLORS.primary);
  }

  _drawMetricCard(doc, x, y, width, label, value, subtext, color) {
    doc.rect(x, y, width - 10, 90)
       .fill(color);
    
    doc.fontSize(FONTS.small)
       .fillColor(COLORS.white)
       .text(label.toUpperCase(), x + 10, y + 10, { width: width - 30 });
    
    doc.fontSize(FONTS.h2)
       .text(value, x + 10, y + 35, { width: width - 30 });
    
    doc.fontSize(FONTS.small)
       .text(subtext, x + 10, y + 65, { width: width - 30 });
  }

  _drawProgressBar(doc, x, y, width, height, percentage) {
    // Background
    doc.rect(x, y, width, height)
       .fill(COLORS.background);
    
    // Progress
    const color = percentage >= 70 ? COLORS.accent : 
                 percentage >= 40 ? COLORS.warning : COLORS.danger;
    doc.rect(x, y, width * (percentage / 100), height)
       .fill(color);
    
    // Label
    doc.fontSize(FONTS.body)
       .fillColor(COLORS.white)
       .text(`${percentage}%`, x + 10, y + 4);
  }

  _drawTableHeader(doc, y, headers) {
    const colWidths = [150, 100, 60, 100, 80];
    let x = 50;

    doc.rect(50, y - 5, doc.page.width - 100, 22)
       .fill(COLORS.primary);

    headers.forEach((header, i) => {
      doc.fontSize(FONTS.small)
         .fillColor(COLORS.white)
         .text(header, x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
  }

  _drawTableRow(doc, y, values, textColor = COLORS.text) {
    const colWidths = [150, 100, 60, 100, 80];
    let x = 50;

    values.forEach((value, i) => {
      doc.fontSize(FONTS.small)
         .fillColor(textColor)
         .text(value, x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
  }

  _drawSavingsChart(doc, x, y, width, height, timeline) {
    // Generate sample timeline if not provided
    if (!timeline || timeline.length === 0) {
      timeline = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        savings: Math.floor(Math.random() * 3000) + 1000 + (i * 200)
      }));
    }

    const maxSavings = Math.max(...timeline.map(t => t.savings));
    const barWidth = (width - 20) / 12;

    // Y-axis
    doc.moveTo(x, y)
       .lineTo(x, y + height)
       .stroke(COLORS.textLight);

    // X-axis
    doc.moveTo(x, y + height)
       .lineTo(x + width, y + height)
       .stroke(COLORS.textLight);

    // Bars
    timeline.forEach((point, i) => {
      const barHeight = (point.savings / maxSavings) * (height - 30);
      const barX = x + 15 + (i * barWidth);
      const barY = y + height - barHeight;

      doc.rect(barX, barY, barWidth - 5, barHeight)
         .fill(COLORS.accent);

      // Month label
      doc.fontSize(FONTS.small - 2)
         .fillColor(COLORS.textLight)
         .text(`M${point.month}`, barX, y + height + 5, { width: barWidth - 5, align: 'center' });
    });

    // Y-axis labels
    doc.fontSize(FONTS.small - 2)
       .fillColor(COLORS.textLight)
       .text(`$${this._formatNumber(maxSavings)}`, x - 45, y - 5)
       .text('$0', x - 25, y + height - 10);
  }

  _groupByCategory(stack) {
    const categories = {};
    stack.forEach(tool => {
      const cat = tool.category || 'Other';
      if (!categories[cat]) {
        categories[cat] = { tools: [], totalSpend: 0 };
      }
      categories[cat].tools.push(tool);
      categories[cat].totalSpend += tool.monthlyCost || 0;
    });
    return categories;
  }

  _categorizeUtilization(stack) {
    const buckets = {
      'High (80%+)': { count: 0, spend: 0 },
      'Medium (40-80%)': { count: 0, spend: 0 },
      'Low (<40%)': { count: 0, spend: 0 }
    };

    stack.forEach(tool => {
      const util = tool.utilization || 50;
      const bucket = util >= 80 ? 'High (80%+)' : 
                    util >= 40 ? 'Medium (40-80%)' : 'Low (<40%)';
      buckets[bucket].count++;
      buckets[bucket].spend += tool.monthlyCost || 0;
    });

    return buckets;
  }

  _getCategoryColor(category) {
    const colors = {
      'Productivity': '#3B82F6',
      'Communication': '#8B5CF6',
      'Development': '#10B981',
      'Security': '#EF4444',
      'Analytics': '#F59E0B',
      'Marketing': '#EC4899',
      'Finance': '#06B6D4',
      'HR': '#84CC16',
      'Other': '#6B7280'
    };
    return colors[category] || colors['Other'];
  }

  _formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toLocaleString();
  }

  _formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  _formatDateForFile(date) {
    return new Date(date).toISOString().split('T')[0];
  }
}

module.exports = ReportGenerator;

// Export a factory function for convenience
module.exports.createReportGenerator = (options) => new ReportGenerator(options);

// Example usage and testing
if (require.main === module) {
  const generator = new ReportGenerator({
    outputDir: './test-reports'
  });

  // Sample audit data
  const sampleAuditData = {
    clientName: 'Acme Corporation',
    auditDate: new Date(),
    currentStack: [
      { name: 'Slack', category: 'Communication', users: 150, monthlyCost: 1125, status: 'Active', utilization: 95 },
      { name: 'Microsoft 365', category: 'Productivity', users: 200, monthlyCost: 2400, status: 'Active', utilization: 88 },
      { name: 'Salesforce', category: 'Sales', users: 45, monthlyCost: 6750, status: 'Active', utilization: 72 },
      { name: 'Zoom', category: 'Communication', users: 200, monthlyCost: 3000, status: 'Underutilized', utilization: 35 },
      { name: 'GitHub', category: 'Development', users: 30, monthlyCost: 570, status: 'Active', utilization: 90 },
      { name: 'Jira', category: 'Development', users: 50, monthlyCost: 750, status: 'Active', utilization: 85 },
      { name: 'Notion', category: 'Productivity', users: 80, monthlyCost: 640, status: 'Underutilized', utilization: 45 },
      { name: 'Asana', category: 'Productivity', users: 60, monthlyCost: 660, status: 'Underutilized', utilization: 30 },
      { name: 'HubSpot', category: 'Marketing', users: 25, monthlyCost: 3200, status: 'Active', utilization: 78 },
      { name: 'Dropbox', category: 'Storage', users: 100, monthlyCost: 1500, status: 'Underutilized', utilization: 25 }
    ],
    executiveSummary: {
      totalTools: 10,
      totalMonthlySpend: 20595,
      identifiedWaste: 4850,
      potentialSavings: 4850,
      savingsPercentage: 24,
      overallHealthScore: 68,
      keyFindings: [
        'Duplicate project management tools (Notion, Asana, Jira) causing $1,400/mo in overlap',
        'Zoom licenses significantly underutilized - 65% of licenses unused',
        'Dropbox usage dropped 70% after Microsoft 365 OneDrive adoption',
        'Salesforce has 15 unused licenses costing $2,250/mo'
      ]
    },
    wasteItems: [
      { tool: 'Zoom', type: 'underutilized', reason: '130 of 200 licenses unused', wastedAmount: 1950 },
      { tool: 'Salesforce', type: 'unused', reason: '15 licenses never logged in', wastedAmount: 2250 },
      { tool: 'Asana', type: 'duplicate', reason: 'Functionality overlaps with Jira', wastedAmount: 660 },
      { tool: 'Dropbox', type: 'underutilized', reason: 'Only 25% active users, OneDrive preferred', wastedAmount: 1125 }
    ],
    recommendations: [
      { title: 'Reduce Zoom licenses', description: 'Downgrade to 70 licenses based on actual meeting hosts', priority: 'high', savings: 1950, effort: 'Low', timeline: '1 week' },
      { title: 'Consolidate to Jira for project management', description: 'Migrate Asana users to Jira, cancel Asana subscription', priority: 'high', savings: 660, effort: 'Medium', timeline: '1 month' },
      { title: 'Right-size Salesforce', description: 'Remove 15 unused licenses, review quarterly', priority: 'high', savings: 2250, effort: 'Low', timeline: '2 weeks' },
      { title: 'Phase out Dropbox', description: 'Complete migration to OneDrive, provide training', priority: 'medium', savings: 1500, effort: 'Medium', timeline: '2 months' },
      { title: 'Implement SSO across all tools', description: 'Centralize authentication for better license tracking', priority: 'low', savings: 0, effort: 'High', timeline: '3 months' }
    ],
    projectedSavings: {
      immediate: 2250,
      shortTerm: 2610,
      longTerm: 1500,
      total: 4850,
      timeline: [
        { month: 1, savings: 2250 },
        { month: 2, savings: 2910 },
        { month: 3, savings: 4850 },
        { month: 4, savings: 4850 },
        { month: 5, savings: 5350 },
        { month: 6, savings: 5350 },
        { month: 7, savings: 5350 },
        { month: 8, savings: 5350 },
        { month: 9, savings: 5350 },
        { month: 10, savings: 5350 },
        { month: 11, savings: 5350 },
        { month: 12, savings: 5350 }
      ]
    },
    roiAnalysis: {
      currentROI: 180,
      projectedROI: 245,
      costPerEmployee: 103,
      industryBenchmark: 85,
      valueDelivered: 450000,
      utilizationRate: 68
    }
  };

  generator.generateReport(sampleAuditData)
    .then(path => console.log(`✅ Report generated: ${path}`))
    .catch(err => console.error('Error generating report:', err));
}
