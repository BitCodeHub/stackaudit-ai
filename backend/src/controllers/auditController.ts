import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService';
import { AnalysisService } from '../services/analysisService';

const auditService = new AuditService();
const analysisService = new AnalysisService();

/**
 * Create a new audit
 * POST /api/audits
 * 
 * Accepts either:
 * - { userId, tier } for existing users
 * - { companyName, companySize, email? } for new users (IntakeForm flow)
 */
export const createAudit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, tier, companyName, companySize, email } = req.body;

    let auditUserId: string;

    // If userId provided, use it
    if (userId) {
      auditUserId = userId;
    } 
    // Otherwise create a guest user with company info
    else if (companyName && companySize) {
      const guestUser = await auditService.createGuestUser({
        companyName,
        companySize,
        email: email || `guest-${Date.now()}@stackaudit.ai`
      });
      auditUserId = guestUser.id;
    }
    else {
      return res.status(400).json({ 
        error: 'Either userId or (companyName + companySize) is required' 
      });
    }

    const audit = await auditService.createAudit({
      userId: auditUserId,
      tier: tier || 'free'
    });

    res.status(201).json({
      id: audit.id,
      status: audit.status,
      userId: audit.userId,
      tier: audit.tier,
      createdAt: audit.createdAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit by ID
 * GET /api/audits/:id
 */
export const getAudit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const audit = await auditService.getAuditById(id);

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    res.json(audit);
  } catch (error) {
    next(error);
  }
};

/**
 * Update audit (add tools, change tier, etc.)
 * PUT /api/audits/:id
 */
export const updateAudit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { tools, tier, status } = req.body;

    const audit = await auditService.updateAudit(id, {
      tools,
      tier,
      status
    });

    res.json(audit);
  } catch (error) {
    next(error);
  }
};

/**
 * Run AI analysis on the audit
 * POST /api/audits/:id/analyze
 */
export const analyzeAudit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get the audit with tools
    const audit = await auditService.getAuditById(id);
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    if (!audit.tools || audit.tools.length === 0) {
      return res.status(400).json({ error: 'No tools added to audit yet' });
    }

    // Update status to analyzing
    await auditService.updateAuditStatus(id, 'analyzing');

    // Run the AI analysis
    const analysisResult = await analysisService.analyzeToolStack(audit);

    // Update audit with results
    const updatedAudit = await auditService.updateAuditWithAnalysis(id, analysisResult);

    res.json(updatedAudit);
  } catch (error) {
    // Update status to failed if error occurs
    await auditService.updateAuditStatus(req.params.id, 'failed');
    next(error);
  }
};

/**
 * Add multiple tools to an audit (batch)
 * POST /api/audits/:id/tools/batch
 */
export const addToolsBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { tools } = req.body;

    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return res.status(400).json({ error: 'tools array is required' });
    }

    // Validate each tool has required fields
    for (const tool of tools) {
      if (!tool.toolName || tool.monthlyCost === undefined || tool.seats === undefined) {
        return res.status(400).json({ 
          error: 'Each tool must have toolName, monthlyCost, and seats' 
        });
      }
    }

    const audit = await auditService.addToolsBatch(id, tools);

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    res.json({
      id: audit.id,
      status: audit.status,
      toolsCount: audit.tools?.length || 0
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the complete audit report
 * GET /api/audits/:id/report
 */
export const getAuditReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const report = await auditService.getAuditReport(id);

    if (!report) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    if (report.status !== 'complete') {
      return res.status(400).json({ 
        error: 'Audit analysis not complete yet',
        status: report.status
      });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};
