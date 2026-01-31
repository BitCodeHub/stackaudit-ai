import { Router } from 'express';
import {
  createAudit,
  updateAudit,
  analyzeAudit,
  getAuditReport,
  getAudit,
  addToolsBatch
} from '../controllers/auditController';

const router = Router();

/**
 * POST /api/audits
 * Create a new audit
 */
router.post('/', createAudit);

/**
 * GET /api/audits/:id
 * Get audit by ID
 */
router.get('/:id', getAudit);

/**
 * PUT /api/audits/:id
 * Update audit (add tools, change status, etc.)
 */
router.put('/:id', updateAudit);

/**
 * POST /api/audits/:id/tools/batch
 * Add multiple tools to an audit
 */
router.post('/:id/tools/batch', addToolsBatch);

/**
 * POST /api/audits/:id/analyze
 * Run AI analysis on the audit
 */
router.post('/:id/analyze', analyzeAudit);

/**
 * GET /api/audits/:id/report
 * Get the complete audit report data
 */
router.get('/:id/report', getAuditReport);

export default router;
