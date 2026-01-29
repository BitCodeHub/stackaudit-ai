import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Users,
  ArrowRight,
  MoreVertical,
  Clock,
  PlusCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, EmptyState } from '../components/shared'
import { SpendChart } from '../components/charts'
import { mockData } from '../utils/api'
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters'

const stats = [
  {
    name: 'Total Monthly Spend',
    value: '$45,230',
    change: '+4.3%',
    changeType: 'negative',
    icon: DollarSign,
    color: 'bg-blue-500'
  },
  {
    name: 'Potential Savings',
    value: '$12,400',
    change: '+27%',
    changeType: 'positive',
    icon: TrendingDown,
    color: 'bg-green-500'
  },
  {
    name: 'Active Tools',
    value: '23',
    change: '+2',
    changeType: 'neutral',
    icon: Layers,
    color: 'bg-purple-500'
  },
  {
    name: 'Total Users',
    value: '156',
    change: '+12',
    changeType: 'neutral',
    icon: Users,
    color: 'bg-orange-500'
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor your SaaS stack and identify savings opportunities</p>
        </div>
        <Button onClick={() => navigate('/audit/new')} icon={PlusCircle}>
          New Audit
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-4">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`inline-flex items-center text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'negative' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {stat.changeType === 'positive' && <TrendingUp className="w-4 h-4 mr-1" />}
                {stat.changeType === 'negative' && <TrendingDown className="w-4 h-4 mr-1" />}
                {stat.change}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.name}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Spend Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <CardHeader>
            <CardTitle>Spend & Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendChart data={mockData.auditDetails.monthlyTrend} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              to="/audit/new"
              className="flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-primary-700">Start New Audit</span>
              </div>
              <ArrowRight className="w-4 h-4 text-primary-500" />
            </Link>
            
            <Link 
              to="/recommendations"
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-green-700">View Recommendations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-green-500" />
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top Savings Opportunity</h4>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">Consolidate Zoom</p>
                    <p className="text-sm text-yellow-600 mt-1">Save $1,200/mo by using Google Meet</p>
                  </div>
                  <Badge variant="warning">High</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <Card className="p-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Audits</CardTitle>
          <Link to="/audit/new" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <EmptyState
              title="No audits yet"
              description="Create your first audit to start discovering savings in your SaaS stack."
              action={() => navigate('/audit/new')}
              actionLabel="Create Audit"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tools</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Spend</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Potential Savings</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => (
                    <tr 
                      key={audit.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/audit/${audit.id}`)}
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{audit.name}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDate(audit.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{audit.toolCount}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatCurrency(audit.totalSpend)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-green-600 font-medium">
                          {formatCurrency(audit.potentialSavings)}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">
                          ({formatPercentage(audit.wastePercentage)})
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant={audit.status === 'completed' ? 'success' : 'warning'}
                          dot
                        >
                          {audit.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
