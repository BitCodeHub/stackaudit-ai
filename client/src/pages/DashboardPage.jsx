import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Users,
  ArrowRight,
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  PlusCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, EmptyState, MetricCard } from '../components/shared'
import { SpendChart } from '../components/charts'
import { mockData } from '../utils/api'
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters'
import clsx from 'clsx'

const stats = [
  {
    name: 'Monthly Spend',
    value: '$45,230',
    change: '+4.3% vs last month',
    changeType: 'negative',
    icon: DollarSign,
    iconColor: 'bg-primary-50 text-primary-600'
  },
  {
    name: 'Potential Savings',
    value: '$12,400',
    change: '+$2.1k identified',
    changeType: 'positive',
    icon: TrendingDown,
    iconColor: 'bg-success-50 text-success-600'
  },
  {
    name: 'Active Tools',
    value: '23',
    change: '2 need review',
    changeType: 'neutral',
    icon: Layers,
    iconColor: 'bg-accent-50 text-accent-600'
  },
  {
    name: 'Total Users',
    value: '156',
    change: '+12 this month',
    changeType: 'neutral',
    icon: Users,
    iconColor: 'bg-warning-50 text-warning-600'
  }
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [audits] = useState(mockData.audits)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Welcome back</p>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mt-0.5">
            Your SaaS Overview
          </h1>
        </div>
        <Button onClick={() => navigate('/audit/new')} icon={PlusCircle}>
          New Audit
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-5 group hover:border-neutral-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                stat.iconColor
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={clsx(
                "text-xs font-medium px-2 py-1 rounded-full",
                stat.changeType === 'positive' && 'bg-success-50 text-success-700',
                stat.changeType === 'negative' && 'bg-danger-50 text-danger-700',
                stat.changeType === 'neutral' && 'bg-neutral-100 text-neutral-600'
              )}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold text-neutral-900 tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-500 mt-0.5">{stat.name}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Spend Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader 
            actions={
              <div className="flex items-center gap-2">
                <button className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary-50 text-primary-700">
                  6M
                </button>
                <button className="text-xs font-medium px-2.5 py-1 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors">
                  1Y
                </button>
                <button className="text-xs font-medium px-2.5 py-1 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors">
                  All
                </button>
              </div>
            }
          >
            <CardTitle>Spend & Savings Trend</CardTitle>
            <p className="text-sm text-neutral-500 mt-0.5">Monthly comparison of total spend vs identified savings</p>
          </CardHeader>
          <CardContent className="mt-6">
            <SpendChart data={mockData.auditDetails.monthlyTrend} />
          </CardContent>
        </Card>

        {/* Quick Actions & Top Savings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-5">
            <CardTitle className="text-sm mb-4">Quick Actions</CardTitle>
            <div className="space-y-2">
              <Link 
                to="/audit/new"
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary-50 to-primary-50/50 hover:from-primary-100 hover:to-primary-50 border border-primary-100 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
                    <PlusCircle className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-primary-900 text-sm">Start New Audit</span>
                    <p className="text-xs text-primary-600 mt-0.5">Analyze your stack</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              
              <Link 
                to="/recommendations"
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-success-50 to-success-50/50 hover:from-success-100 hover:to-success-50 border border-success-100 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-success-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <span className="font-medium text-success-900 text-sm">View Recommendations</span>
                    <p className="text-xs text-success-600 mt-0.5">8 new insights</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-success-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Top Opportunity */}
          <Card className="p-5 border-warning-200 bg-gradient-to-br from-warning-50/50 to-white">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-warning-100 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-warning-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-warning-700 bg-warning-100 px-2 py-0.5 rounded-full">
                    Top Opportunity
                  </span>
                </div>
                <h4 className="font-semibold text-neutral-900 text-sm">Consolidate Video Tools</h4>
                <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                  You're paying for both Zoom and Google Meet. Consider consolidating to save $1,200/month.
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-warning-200">
                  <span className="text-lg font-semibold text-success-600 tabular-nums">
                    $1,200/mo
                  </span>
                  <Button size="xs" variant="ghost" icon={ArrowUpRight} iconPosition="right">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Audits */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <CardHeader 
            actions={
              <Link to="/audits" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1">
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <CardTitle>Recent Audits</CardTitle>
          </CardHeader>
        </div>
        
        {audits.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No audits yet"
            description="Create your first audit to start discovering savings in your SaaS stack."
            action={() => navigate('/audit/new')}
            actionLabel="Create Audit"
            actionIcon={PlusCircle}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50/80">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tools</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Spend</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Savings</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="w-12 py-3 px-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {audits.map((audit) => (
                  <tr 
                    key={audit.id} 
                    className="hover:bg-neutral-50/50 cursor-pointer group transition-colors"
                    onClick={() => navigate(`/audit/${audit.id}`)}
                  >
                    <td className="py-4 px-5">
                      <span className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
                        {audit.name}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 text-neutral-500 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(audit.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-neutral-900 text-sm tabular-nums">{audit.toolCount}</td>
                    <td className="py-4 px-5 font-medium text-neutral-900 text-sm tabular-nums">
                      {formatCurrency(audit.totalSpend)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-success-600 text-sm tabular-nums">
                          {formatCurrency(audit.potentialSavings)}
                        </span>
                        <span className="text-neutral-400 text-xs tabular-nums">
                          ({formatPercentage(audit.wastePercentage)})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Badge 
                        variant={audit.status === 'completed' ? 'success' : 'warning'}
                        dot
                        size="sm"
                      >
                        {audit.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                    </td>
                    <td className="py-4 px-5">
                      <button 
                        className="p-1.5 hover:bg-neutral-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
