export default function ROIGauge({ value, maxValue = 100 }) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  const rotation = (percentage / 100) * 180 - 90
  
  const getColor = () => {
    if (percentage >= 70) return '#10b981'
    if (percentage >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="relative w-48 h-24 mx-auto">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.83} 283`}
          className="transition-all duration-500"
        />
        {/* Needle */}
        <g transform={`rotate(${rotation} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="8" fill="#374151" />
        </g>
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">ROI Score</div>
      </div>
    </div>
  )
}
