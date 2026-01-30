import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService';
import { AnalysisService } from '../services/analysisService';

const auditService = new AuditService();
const analysisService = new AnalysisService();

/**
 * Create a new audit
 * POST /api/audits
 */
export const createAudit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, tier } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const audit = await auditService.createAudit({
      userId,
      tier: tier || 'free'
    });

    res.status(201).json(audit);
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
