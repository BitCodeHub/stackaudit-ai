import clsx from 'clsx'

export default function UtilizationBar({ 
  value = 0, 
  showLabel = true,
  size = 'md',
  showPercentage = true,
  className 
}) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value))
  
  // Determine color based on utilization level
  const getColorClasses = (val) => {
    if (val >= 80) return { bar: 'bg-success-500', text: 'text-success-700' }
    if (val >= 60) return { bar: 'bg-primary-500', text: 'text-primary-700' }
    if (val >= 40) return { bar: 'bg-warning-500', text: 'text-warning-700' }
    return { bar: 'bg-danger-500', text: 'text-danger-700' }
  }
  
  const colors = getColorClasses(clampedValue)
  
  const sizes = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  }
  
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className={clsx(
        'flex-1 bg-neutral-100 rounded-full overflow-hidden',
        sizes[size]
      )}>
        <div 
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors.bar
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showPercentage && (
        <span className={clsx(
          'text-sm font-medium tabular-nums min-w-[3rem] text-right',
          colors.text
        )}>
          {clampedValue}%
        </span>
      )}
    </div>
  )
}

// Circular progress variant
export function CircularProgress({ 
  value = 0, 
  size = 48,
  strokeWidth = 4,
  showValue = true,
  className 
}) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedValue / 100) * circumference
  
  const getColor = (val) => {
    if (val >= 80) return '#10b981'
    if (val >= 60) return '#8b5cf6'
    if (val >= 40) return '#f59e0b'
    return '#f43f5e'
  }
  
  return (
    <div 
      className={clsx('relative inline-flex', className)}
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(clampedValue)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-neutral-700">
          {clampedValue}
        </span>
      )}
    </div>
  )
}

// Multi-segment bar for showing breakdowns
export function SegmentedBar({ 
  segments = [],
  height = 'md',
  className 
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }
  
  return (
    <div className={className}>
      <div className={clsx(
        'flex rounded-full overflow-hidden bg-neutral-100',
        heights[height]
      )}>
        {segments.map((segment, i) => {
          const percentage = (segment.value / total) * 100
          return (
            <div
              key={i}
              className={clsx(
                'transition-all duration-500',
                i === 0 && 'rounded-l-full',
                i === segments.length - 1 && 'rounded-r-full'
              )}
              style={{ 
                width: `${percentage}%`,
                backgroundColor: segment.color
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
