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

// Professional color palette
const COLORS = {
  spend: '#8b5cf6',      // primary-500 (violet)
  savings: '#10b981',    // success-500 (emerald)
  grid: '#f4f4f5',       // neutral-100
  text: '#71717a',       // neutral-500
  border: '#e4e4e7',     // neutral-200
}

export default function SpendChart({ data, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart 
        data={data} 
        margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gradientSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.spend} stopOpacity={0.2}/>
            <stop offset="100%" stopColor={COLORS.spend} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradientSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.savings} stopOpacity={0.2}/>
            <stop offset="100%" stopColor={COLORS.savings} stopOpacity={0}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid 
          strokeDasharray="0" 
          stroke={COLORS.grid} 
          vertical={false}
        />
        
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12, fill: COLORS.text, fontWeight: 500 }}
          axisLine={{ stroke: COLORS.border }}
          tickLine={false}
          dy={10}
        />
        
        <YAxis 
          tick={{ fontSize: 12, fill: COLORS.text, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          dx={-10}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        <Legend 
          verticalAlign="top" 
          height={48}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingBottom: 16 }}
          formatter={(value) => (
            <span className="text-sm font-medium text-neutral-600 ml-1">{value}</span>
          )}
        />
        
        <Area 
          type="monotone" 
          dataKey="spend" 
          name="Total Spend"
          stroke={COLORS.spend}
          strokeWidth={2}
          fill="url(#gradientSpend)"
          dot={false}
          activeDot={{ 
            r: 4, 
            stroke: COLORS.spend, 
            strokeWidth: 2, 
            fill: 'white' 
          }}
        />
        
        <Area 
          type="monotone" 
          dataKey="savings" 
          name="Identified Savings"
          stroke={COLORS.savings}
          strokeWidth={2}
          fill="url(#gradientSavings)"
          dot={false}
          activeDot={{ 
            r: 4, 
            stroke: COLORS.savings, 
            strokeWidth: 2, 
            fill: 'white' 
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  
  return (
    <div className="bg-white rounded-xl shadow-large border border-neutral-200 p-4 min-w-[180px]">
      <p className="text-sm font-semibold text-neutral-900 mb-3">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-neutral-600">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 tabular-nums">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
