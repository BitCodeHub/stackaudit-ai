import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'

export default function SpendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `$${(value / 1000)}k`}
        />
        <Tooltip 
          content={<CustomTooltip />}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
        />
        <Area 
          type="monotone" 
          dataKey="spend" 
          name="Total Spend"
          stroke="#0ea5e9" 
          fillOpacity={1} 
          fill="url(#colorSpend)" 
          strokeWidth={2}
        />
        <Area 
          type="monotone" 
          dataKey="savings" 
          name="Potential Savings"
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorSavings)" 
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}
