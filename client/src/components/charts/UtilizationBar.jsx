import clsx from 'clsx'

export default function UtilizationBar({ value, showLabel = true }) {
  const getColor = () => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={clsx('h-full rounded-full transition-all duration-500', getColor())}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className={clsx(
          'text-sm font-medium min-w-[3rem] text-right',
          value >= 80 ? 'text-green-600' : value >= 50 ? 'text-yellow-600' : 'text-red-600'
        )}>
          {value}%
        </span>
      )}
    </div>
  )
}
