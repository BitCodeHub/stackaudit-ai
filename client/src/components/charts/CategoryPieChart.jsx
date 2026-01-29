import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6', '#84cc16']

export default function CategoryPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
      </div>
    )
  }
  return null
}
