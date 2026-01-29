import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  TrendingDown,
  DollarSign,
  Users,
  Layers,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/shared'
import { SpendChart, CategoryPieChart, UtilizationBar, ROIGauge } from '../components/charts'
import { mockData } from '../utils/api'
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters'
import clsx from 'clsx'

export default function AuditResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  // In real app, fetch based on id
  const audit = mockData.auditDetails

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'tools', name: 'Tools Analysis' },
    { id: 'savings', name: 'Savings Breakdown' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{audit.name}</h1>
            <Badge variant="success" dot>Completed</Badge>
          </div>
          <p className="text-gray-500 mt-1">Created {formatDate(audit.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Share2}>Share</Button>
          <Button variant="secondary" icon={Download}>Export PDF</Button>
          <Link to="/recommendations">
            <Button icon={ArrowRight} iconPosition="right">View Recommendations</Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Spend</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(audit.summary.totalSpend)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Potential Savings</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(audit.summary.potentialSavings)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Tools Analyzed</div>
              <div className="text-xl font-bold text-gray-900">{audit.summary.toolCount}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Users</div>
              <div className="text-xl font-bold text-gray-900">{audit.summary.activeUsers}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Waste Identified</div>
              <div className="text-xl font-bold text-red-600">{audit.summary.wastePercentage}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ROI Score */}
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Stack ROI Score</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ROIGauge value={audit.summary.roiScore} />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Cost Efficiency</span>
                  <span className="font-medium text-gray-900">73%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Utilization Rate</span>
                  <span className="font-medium text-gray-900">68%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Redundancy Score</span>
                  <span className="font-medium text-gray-900">75%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spend Trend */}
          <Card className="lg:col-span-2 p-6">
            <CardHeader>
              <CardTitle>Spend & Savings Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendChart data={audit.monthlyTrend} />
            </CardContent>
          </Card>

          {/* Spend by Category */}
          <Card className="lg:col-span-2 p-6">
            <CardHeader>
              <CardTitle>Spend by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={audit.spendByCategory} />
            </CardContent>
          </Card>

          {/* Top Recommendations Preview */}
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Recommendations</CardTitle>
              <Link to="/recommendations" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">{rec.title}</span>
                    <Badge 
                      variant={rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Save {formatCurrency(rec.potentialSavings)}/mo
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tools' && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Tools Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tool</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Monthly Cost</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Users</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[200px]">Utilization</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.tools.map((tool) => (
                    <tr key={tool.id} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{tool.name}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{tool.category}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatCurrency(tool.monthlyCost)}
                      </td>
                      <td className="py-4 px-4 text-gray-900">{tool.users}</td>
                      <td className="py-4 px-4">
                        <UtilizationBar value={tool.utilization} />
                      </td>
                      <td className="py-4 px-4">
                        <span className={clsx(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                          getStatusColor(tool.status)
                        )}>
                          {tool.status === 'healthy' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          {tool.status === 'healthy' ? 'Healthy' : tool.status === 'warning' ? 'Review' : 'Action Needed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'savings' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Savings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'License Optimization', amount: 4200, percentage: 34 },
                  { category: 'Tool Consolidation', amount: 3600, percentage: 29 },
                  { category: 'Usage Rightsizing', amount: 2800, percentage: 23 },
                  { category: 'Contract Renegotiation', amount: 1800, percentage: 14 }
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.percentage}% of total savings</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Total Potential Savings</div>
                <div className="text-3xl font-bold text-green-700">
                  {formatCurrency(audit.summary.potentialSavings)}/mo
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {formatCurrency(audit.summary.potentialSavings * 12)}/year
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { phase: 'Quick Wins', timeframe: '1-2 weeks', savings: 1800, items: ['Cancel unused Zoom', 'Downgrade Intercom'] },
                  { phase: 'Short Term', timeframe: '1 month', savings: 4400, items: ['Reduce Salesforce licenses', 'Consolidate video tools'] },
                  { phase: 'Medium Term', timeframe: '2-3 months', savings: 6200, items: ['AWS Reserved Instances', 'Renegotiate contracts'] }
                ].map((phase, index) => (
                  <div key={phase.phase} className="relative pl-8">
                    <div className={clsx(
                      'absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                      index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    )}>
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200" />
                    )}
                    <div className="pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                        <span className="text-sm text-green-600 font-medium">
                          +{formatCurrency(phase.savings)}/mo
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">{phase.timeframe}</div>
                      <ul className="space-y-1">
                        {phase.items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
