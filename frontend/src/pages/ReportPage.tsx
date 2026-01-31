import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { AuditReport } from '../services/api';

interface ReportPageProps {
  auditId: string;
  onBack: () => void;
  onUpgrade: (tier: 'pro' | 'team') => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ 
  auditId, 
  onBack, 
  onUpgrade 
}) => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [auditId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAuditReport(auditId);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your audit report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Report
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const savingsPercent = report.audit.totalMonthlyCost > 0
    ? Math.round((report.audit.potentialSavings / report.audit.totalMonthlyCost) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">StackAudit.ai</h1>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {report.audit.companyName}
              </h2>
              <p className="text-gray-600">
                Company Size: {report.audit.companySize} employees
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Report Status</div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {report.audit.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-sm font-medium text-blue-600 mb-2">
                Current Monthly Spend
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${report.audit.totalMonthlyCost.toLocaleString()}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-sm font-medium text-green-600 mb-2">
                Potential Savings
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${report.audit.potentialSavings.toLocaleString()}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-sm font-medium text-purple-600 mb-2">
                Savings Potential
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {savingsPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            AI Analysis
          </h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {report.analysis.overallAssessment}
            </p>
          </div>

          {report.analysis.keyFindings.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Key Findings
              </h4>
              <ul className="space-y-2">
                {report.analysis.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.analysis.actionItems.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Action Items
              </h4>
              <ul className="space-y-2">
                {report.analysis.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tools Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Current AI Tools ({report.tools.length})
          </h3>
          <div className="space-y-4">
            {report.tools.map((tool) => (
              <div
                key={tool.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {tool.toolName}
                  </h4>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      ${tool.monthlyCost}/mo
                    </div>
                    <div className="text-sm text-gray-500">
                      {tool.seats} {tool.seats === 1 ? 'seat' : 'seats'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tool.useCases.map((useCase) => (
                    <span
                      key={useCase}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Recommendations ({report.recommendations.length})
            </h3>
            <div className="space-y-4">
              {report.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`border-l-4 rounded-lg p-4 ${
                    rec.priority === 'High'
                      ? 'border-red-500 bg-red-50'
                      : rec.priority === 'Medium'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-600 uppercase">
                          {rec.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            rec.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {rec.title}
                      </h4>
                    </div>
                    {rec.potentialSavings > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Save up to</div>
                        <div className="text-xl font-bold text-green-600">
                          ${rec.potentialSavings}/mo
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Want Deeper Insights?
              </h3>
              <p className="text-blue-100">
                Upgrade to Pro for detailed analysis, custom recommendations, and ongoing monitoring.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => onUpgrade('pro')}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
              >
                Upgrade to Pro - $49
              </button>
              <button
                onClick={() => onUpgrade('team')}
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition"
              >
                Upgrade to Team - $149
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
