import clsx from 'clsx'

export default function ROIGauge({ value = 0, size = 'md' }) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value))
  
  // Calculate the stroke offset for the progress arc
  const circumference = 2 * Math.PI * 90 // radius of 90
  const offset = circumference - (clampedValue / 100) * circumference * 0.75 // 270 degrees = 75%
  
  // Determine color based on value
  const getColor = (val) => {
    if (val >= 80) return { stroke: '#10b981', bg: '#ecfdf5', text: '#065f46' } // success
    if (val >= 60) return { stroke: '#8b5cf6', bg: '#f5f3ff', text: '#5b21b6' } // primary
    if (val >= 40) return { stroke: '#f59e0b', bg: '#fffbeb', text: '#92400e' } // warning
    return { stroke: '#f43f5e', bg: '#fff1f2', text: '#9f1239' } // danger
  }
  
  const colors = getColor(clampedValue)
  
  const getLabel = (val) => {
    if (val >= 80) return 'Excellent'
    if (val >= 60) return 'Good'
    if (val >= 40) return 'Fair'
    return 'Needs Work'
  }
  
  const sizes = {
    sm: { width: 160, fontSize: '2xl', labelSize: 'xs' },
    md: { width: 200, fontSize: '4xl', labelSize: 'sm' },
    lg: { width: 240, fontSize: '5xl', labelSize: 'base' },
  }
  
  const sizeConfig = sizes[size]
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative"
        style={{ width: sizeConfig.width, height: sizeConfig.width * 0.75 }}
      >
        <svg 
          viewBox="0 0 200 150" 
          className="w-full h-full"
        >
          {/* Background arc */}
          <path
            d="M 20 130 A 90 90 0 1 1 180 130"
            fill="none"
            stroke="#f4f4f5"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d="M 20 130 A 90 90 0 1 1 180 130"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.75}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ 
              filter: `drop-shadow(0 0 6px ${colors.stroke}40)`
            }}
          />
          
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick, i) => {
            const angle = -225 + (tick / 100) * 270
            const rad = (angle * Math.PI) / 180
            const x1 = 100 + 75 * Math.cos(rad)
            const y1 = 110 + 75 * Math.sin(rad)
            const x2 = 100 + 82 * Math.cos(rad)
            const y2 = 110 + 82 * Math.sin(rad)
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#d4d4d8"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span 
            className={clsx(
              'font-bold tracking-tight tabular-nums',
              `text-${sizeConfig.fontSize}`
            )}
            style={{ color: colors.text }}
          >
            {clampedValue}
          </span>
          <span className={clsx(
            'font-medium text-neutral-500 -mt-1',
            `text-${sizeConfig.labelSize}`
          )}>
            ROI Score
          </span>
        </div>
      </div>
      
      {/* Label badge */}
      <div 
        className="mt-2 px-3 py-1 rounded-full text-sm font-medium"
        style={{ 
          backgroundColor: colors.bg,
          color: colors.text
        }}
      >
        {getLabel(clampedValue)}
      </div>
    </div>
  )
}
