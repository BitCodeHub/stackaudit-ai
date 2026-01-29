import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend 
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'

// Sophisticated color palette
const COLORS = [
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#84cc16', // lime
  '#ec4899', // pink
]

export default function CategoryPieChart({ data, height = 300 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      <div className="w-full lg:w-1/2">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="w-full lg:w-1/2 space-y-3">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <div 
              key={item.name}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-900 tabular-nums">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-xs text-neutral-400 tabular-nums w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null
  
  const data = payload[0]
  const percentage = ((data.value / total) * 100).toFixed(1)
  
  return (
    <div className="bg-white rounded-xl shadow-large border border-neutral-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: data.payload.fill }}
        />
        <span className="text-sm font-medium text-neutral-900">
          {data.name}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-neutral-900 tabular-nums">
          {formatCurrency(data.value)}
        </span>
        <span className="text-sm text-neutral-500">
          ({percentage}%)
        </span>
      </div>
    </div>
  )
}
