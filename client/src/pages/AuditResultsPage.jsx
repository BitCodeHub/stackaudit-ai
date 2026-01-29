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
  BarChart3,
  Clock,
  ExternalLink
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/shared'
import { SpendChart, CategoryPieChart, UtilizationBar, ROIGauge } from '../components/charts'
import { mockData } from '../utils/api'
import { formatCurrency, formatDate, getStatusColor } from '../utils/formatters'
import clsx from 'clsx'

const statCards = [
  { key: 'totalSpend', label: 'Total Spend', icon: DollarSign, color: 'bg-primary-50 text-primary-600', prefix: '' },
  { key: 'potentialSavings', label: 'Potential Savings', icon: TrendingDown, color: 'bg-success-50 text-success-600', prefix: '' },
  { key: 'toolCount', label: 'Tools Analyzed', icon: Layers, color: 'bg-accent-50 text-accent-600', prefix: '' },
  { key: 'activeUsers', label: 'Active Users', icon: Users, color: 'bg-warning-50 text-warning-600', prefix: '' },
  { key: 'wastePercentage', label: 'Waste Identified', icon: AlertTriangle, color: 'bg-danger-50 text-danger-600', suffix: '%' }
]

export default function AuditResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  
  const audit = mockData.auditDetails

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'tools', name: 'Tools Analysis' },
    { id: 'savings', name: 'Savings Breakdown' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-3 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">{audit.name}</h1>
            <Badge variant="success" dot size="sm">Completed</Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4" />
            <span>Created {formatDate(audit.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Share2}>Share</Button>
          <Button variant="secondary" size="sm" icon={Download}>Export</Button>
          <Link to="/recommendations">
            <Button size="sm" icon={ArrowRight} iconPosition="right">Recommendations</Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          let value = audit.summary[stat.key]
          if (stat.key === 'totalSpend' || stat.key === 'potentialSavings') {
            value = formatCurrency(value)
          } else if (stat.suffix) {
            value = `${value}${stat.suffix}`
          }
          
          return (
            <Card key={stat.key} className="p-4">
              <div className="flex items-center gap-3">
                <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', stat.color)}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">{stat.label}</div>
                  <div className={clsx(
                    'text-lg font-semibold tracking-tight tabular-nums',
                    stat.key === 'potentialSavings' ? 'text-success-600' : 
                    stat.key === 'wastePercentage' ? 'text-danger-600' : 'text-neutral-900'
                  )}>
                    {value}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors rounded-t-lg',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
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
            <CardContent className="pt-6">
              <ROIGauge value={audit.summary.roiScore} />
              <div className="mt-8 space-y-3">
                {[
                  { label: 'Cost Efficiency', value: 73 },
                  { label: 'Utilization Rate', value: 68 },
                  { label: 'Redundancy Score', value: 75 }
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">{metric.label}</span>
                    <span className="text-sm font-semibold text-neutral-900 tabular-nums">{metric.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spend Trend */}
          <Card className="lg:col-span-2 p-6">
            <CardHeader>
              <CardTitle>Spend & Savings Trend</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <SpendChart data={audit.monthlyTrend} height={280} />
            </CardContent>
          </Card>

          {/* Spend by Category */}
          <Card className="lg:col-span-2 p-6">
            <CardHeader>
              <CardTitle>Spend by Category</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <CategoryPieChart data={audit.spendByCategory} height={280} />
            </CardContent>
          </Card>

          {/* Top Recommendations Preview */}
          <Card className="p-6">
            <CardHeader 
              actions={
                <Link to="/recommendations" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  View all <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <CardTitle>Top Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 mt-4">
              {mockData.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-neutral-900 text-sm line-clamp-1">{rec.title}</span>
                    <Badge 
                      variant={rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}
                      size="xs"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-success-600 tabular-nums">
                    Save {formatCurrency(rec.potentialSavings)}/mo
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tools' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tool</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Monthly Cost</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Users</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider min-w-[160px]">Utilization</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {audit.tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-medium text-neutral-900 text-sm">{tool.name}</span>
                    </td>
                    <td className="py-4 px-5 text-neutral-500 text-sm">{tool.category}</td>
                    <td className="py-4 px-5 font-medium text-neutral-900 text-sm tabular-nums">
                      {formatCurrency(tool.monthlyCost)}
                    </td>
                    <td className="py-4 px-5 text-neutral-900 text-sm tabular-nums">{tool.users}</td>
                    <td className="py-4 px-5">
                      <UtilizationBar value={tool.utilization} />
                    </td>
                    <td className="py-4 px-5">
                      <Badge
                        variant={tool.status === 'healthy' ? 'success' : tool.status === 'warning' ? 'warning' : 'danger'}
                        dot
                        size="sm"
                      >
                        {tool.status === 'healthy' ? 'Healthy' : tool.status === 'warning' ? 'Review' : 'Action'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'savings' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Savings Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="space-y-5">
                {[
                  { category: 'License Optimization', amount: 4200, percentage: 34 },
                  { category: 'Tool Consolidation', amount: 3600, percentage: 29 },
                  { category: 'Usage Rightsizing', amount: 2800, percentage: 23 },
                  { category: 'Contract Renegotiation', amount: 1800, percentage: 14 }
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">{item.category}</span>
                      <span className="text-sm font-semibold text-success-600 tabular-nums">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success-500 rounded-full transition-all duration-700"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-neutral-400 mt-1 tabular-nums">{item.percentage}% of total</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 bg-gradient-to-br from-success-50 to-success-50/30 rounded-xl border border-success-100">
                <div className="text-sm font-medium text-success-700">Total Potential Savings</div>
                <div className="text-3xl font-bold text-success-800 tabular-nums mt-1">
                  {formatCurrency(audit.summary.potentialSavings)}<span className="text-lg font-normal">/mo</span>
                </div>
                <div className="text-sm text-success-600 mt-1 tabular-nums">
                  {formatCurrency(audit.summary.potentialSavings * 12)}/year
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="space-y-6">
                {[
                  { phase: 'Quick Wins', timeframe: '1-2 weeks', savings: 1800, items: ['Cancel unused Zoom', 'Downgrade Intercom'], status: 'current' },
                  { phase: 'Short Term', timeframe: '1 month', savings: 4400, items: ['Reduce Salesforce licenses', 'Consolidate video tools'], status: 'upcoming' },
                  { phase: 'Medium Term', timeframe: '2-3 months', savings: 6200, items: ['AWS Reserved Instances', 'Renegotiate contracts'], status: 'upcoming' }
                ].map((phase, index) => (
                  <div key={phase.phase} className="relative pl-8">
                    <div className={clsx(
                      'absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                      phase.status === 'current' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    )}>
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div className="absolute left-3 top-6 w-px h-full bg-neutral-200" />
                    )}
                    <div className="pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-neutral-900 text-sm">{phase.phase}</h4>
                        <span className="text-sm font-semibold text-success-600 tabular-nums">
                          +{formatCurrency(phase.savings)}/mo
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mb-2">{phase.timeframe}</div>
                      <ul className="space-y-1.5">
                        {phase.items.map((item, i) => (
                          <li key={i} className="text-sm text-neutral-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-neutral-400 rounded-full" />
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
