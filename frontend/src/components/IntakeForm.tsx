import React, { useState } from 'react';
import { AuditFormData, AITool, UseCase, CompanySize } from '../types';

const USE_CASES: UseCase[] = [
  'Writing',
  'Code',
  'Image Gen',
  'Data Analysis',
  'Customer Support',
  'Research',
  'Other',
];

const COMPANY_SIZES: CompanySize[] = ['1-10', '11-50', '51-200', '201-500', '500+'];

export const IntakeForm: React.FC = () => {
  const [formData, setFormData] = useState<AuditFormData>({
    companyName: '',
    companySize: '',
    tools: [],
  });

  const addTool = () => {
    const newTool: AITool = {
      id: crypto.randomUUID(),
      toolName: '',
      monthlyCost: 0,
      seats: 1,
      useCases: [],
    };
    setFormData({ ...formData, tools: [...formData.tools, newTool] });
  };

  const removeTool = (id: string) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((tool) => tool.id !== id),
    });
  };

  const updateTool = (id: string, field: keyof AITool, value: any) => {
    setFormData({
      ...formData,
      tools: formData.tools.map((tool) =>
        tool.id === id ? { ...tool, [field]: value } : tool
      ),
    });
  };

  const toggleUseCase = (toolId: string, useCase: UseCase) => {
    setFormData({
      ...formData,
      tools: formData.tools.map((tool) => {
        if (tool.id !== toolId) return tool;
        const useCases = tool.useCases.includes(useCase)
          ? tool.useCases.filter((uc) => uc !== useCase)
          : [...tool.useCases, useCase];
        return { ...tool, useCases };
      }),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Send to API
    alert('Audit submitted! (API integration pending)');
  };

  const totalMonthlyCost = formData.tools.reduce(
    (sum, tool) => sum + tool.monthlyCost,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Stack Audit
        </h1>
        <p className="text-gray-600 mb-8">
          Help us understand your AI tool usage to identify savings opportunities
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Company Information
            </h2>

            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Name *
              </label>
              <input
                type="text"
                id="companyName"
                required
                className="input-field"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Acme Inc."
              />
            </div>

            <div>
              <label
                htmlFor="companySize"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company Size *
              </label>
              <select
                id="companySize"
                required
                className="input-field"
                value={formData.companySize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companySize: e.target.value as CompanySize,
                  })
                }
              >
                <option value="">Select company size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} employees
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Tools */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your AI Tools
              </h2>
              <button
                type="button"
                onClick={addTool}
                className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors"
              >
                + Add Tool
              </button>
            </div>

            {formData.tools.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600">
                  No tools added yet. Click "Add Tool" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.tools.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Tool #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeTool(tool.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tool Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="input-field"
                          value={tool.toolName}
                          onChange={(e) =>
                            updateTool(tool.id, 'toolName', e.target.value)
                          }
                          placeholder="ChatGPT"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Cost ($) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          className="input-field"
                          value={tool.monthlyCost || ''}
                          onChange={(e) =>
                            updateTool(
                              tool.id,
                              'monthlyCost',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="20.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Seats *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="input-field"
                          value={tool.seats}
                          onChange={(e) =>
                            updateTool(
                              tool.id,
                              'seats',
                              parseInt(e.target.value) || 1
                            )
                          }
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Use Cases *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {USE_CASES.map((useCase) => (
                          <button
                            key={useCase}
                            type="button"
                            onClick={() => toggleUseCase(tool.id, useCase)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              tool.useCases.includes(useCase)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {useCase}
                          </button>
                        ))}
                      </div>
                      {tool.useCases.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Select at least one use case
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary & Submit */}
          {formData.tools.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600">Total Monthly Spend</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${totalMonthlyCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    across {formData.tools.length} tool
                    {formData.tools.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button type="submit" className="btn-primary">
                  Analyze My Stack →
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
