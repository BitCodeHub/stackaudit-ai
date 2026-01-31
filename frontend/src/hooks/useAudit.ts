/**
 * Custom hook for managing audit state and polling
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { AuditReport } from '../services/api';

interface UseAuditOptions {
  auditId: string;
  pollInterval?: number; // milliseconds
  enabled?: boolean;
}

interface UseAuditResult {
  report: AuditReport | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  status: string | null;
}

export const useAudit = ({
  auditId,
  pollInterval = 0,
  enabled = true,
}: UseAuditOptions): UseAuditResult => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First check status
      const auditStatus = await api.getAudit(auditId);
      setStatus(auditStatus.status);

      // If completed, fetch full report
      if (auditStatus.status === 'Completed') {
        const reportData = await api.getAuditReport(auditId);
        setReport(reportData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit');
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    if (!enabled) return;

    fetchAudit();

    // Set up polling if interval is specified and audit is not completed
    if (pollInterval > 0 && status !== 'Completed') {
      const intervalId = setInterval(fetchAudit, pollInterval);
      return () => clearInterval(intervalId);
    }
  }, [enabled, fetchAudit, pollInterval, status]);

  return {
    report,
    loading,
    error,
    reload: fetchAudit,
    status,
  };
};
