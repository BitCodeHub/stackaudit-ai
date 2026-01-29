import { useState } from 'react'
import { 
  Lightbulb, 
  Filter, 
  TrendingDown, 
  Layers, 
  Scissors, 
  RefreshCw,
  MessageSquare,
  Check,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/shared'
import { mockData } from '../utils/api'
import { formatCurrency, getPriorityColor, getEffortBadge } from '../utils/formatters'
import clsx from 'clsx'

const typeIcons = {
  consolidation: Layers,
  rightsizing: Scissors,
  optimization: RefreshCw,
  elimination: TrendingDown,
  negotiation: MessageSquare
}

const typeLabels = {
  consolidation: 'Consolidation',
  rightsizing: 'Right-sizing',
  optimization: 'Optimization',
  elimination: 'Elimination',
  negotiation: 'Negotiation'
}

export default function RecommendationsPage() {
  const [recommendations] = useState(mockData.recommendations)
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [completedIds, setCompletedIds] = useState([])

  const filteredRecs = filter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.priority === filter)

  const totalSavings = recommendations.reduce((sum, r) => sum + r.potentialSavings, 0)
  const completedSavings = recommendations
    .filter(r => completedIds.includes(r.id))
    .reduce((sum, r) => sum + r.potentialSavings, 0)

  const toggleComplete = (id) => {
    setCompletedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-500 mt-1">AI-powered insights to optimize your SaaS stack</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Potential Savings</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(totalSavings)}/mo
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Recommendations</div>
              <div className="text-xl font-bold text-gray-900">
                {recommendations.length} actions
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Savings Captured</div>
              <div className="text-xl font-bold text-purple-600">
                {formatCurrency(completedSavings)}/mo
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500 mr-2">Filter by priority:</span>
        {['all', 'high', 'medium', 'low'].map((priority) => (
          <button
            key={priority}
            onClick={() => setFilter(priority)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === priority
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const Icon = typeIcons[rec.type] || Lightbulb
          const isExpanded = expandedId === rec.id
          const isCompleted = completedIds.includes(rec.id)
          const effortBadge = getEffortBadge(rec.effort)

          return (
            <Card 
              key={rec.id} 
              className={clsx(
                'p-0 transition-all',
                isCompleted && 'opacity-60'
              )}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    rec.type === 'consolidation' && 'bg-blue-100',
                    rec.type === 'rightsizing' && 'bg-yellow-100',
                    rec.type === 'optimization' && 'bg-green-100',
                    rec.type === 'elimination' && 'bg-red-100',
                    rec.type === 'negotiation' && 'bg-purple-100'
                  )}>
                    <Icon className={clsx(
                      'w-5 h-5',
                      rec.type === 'consolidation' && 'text-blue-600',
                      rec.type === 'rightsizing' && 'text-yellow-600',
                      rec.type === 'optimization' && 'text-green-600',
                      rec.type === 'elimination' && 'text-red-600',
                      rec.type === 'negotiation' && 'text-purple-600'
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={clsx(
                            'font-semibold text-gray-900',
                            isCompleted && 'line-through'
                          )}>
                            {rec.title}
                          </h3>
                          <Badge variant="default" size="sm">{typeLabels[rec.type]}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{rec.description}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(rec.potentialSavings)}/mo
                        </span>
                      </div>
                      <Badge 
                        variant={rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info'}
                        size="sm"
                      >
                        {rec.priority} priority
                      </Badge>
                      <span className={clsx('text-xs font-medium px-2 py-1 rounded-full', effortBadge.color)}>
                        {effortBadge.text}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Layers className="w-4 h-4" />
                        {rec.tools.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      
                      <h4 className="font-medium text-gray-900 mt-4 mb-2">Affected Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {rec.tools.map((tool) => (
                          <Badge key={tool} variant="default">{tool}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Implementation Steps</h4>
                      <ol className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                          Review current usage and identify affected users
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                          Communicate changes to stakeholders
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                          Execute optimization and monitor results
                        </li>
                      </ol>

                      <div className="flex items-center gap-3 mt-6">
                        <Button
                          variant={isCompleted ? 'secondary' : 'primary'}
                          icon={isCompleted ? Clock : Check}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleComplete(rec.id)
                          }}
                        >
                          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {filteredRecs.length === 0 && (
        <Card className="p-12 text-center">
          <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No recommendations found</h3>
          <p className="text-gray-500">Try adjusting your filters or run a new audit.</p>
        </Card>
      )}
    </div>
  )
}
