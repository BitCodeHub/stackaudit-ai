import clsx from 'clsx'

export function Card({ 
  children, 
  className, 
  hover = false, 
  padding = false,
  variant = 'default',
  ...props 
}) {
  return (
    <div 
      className={clsx(
        'rounded-xl overflow-hidden',
        variant === 'default' && 'bg-white border border-neutral-200/80',
        variant === 'elevated' && 'bg-white border border-neutral-200/60 shadow-soft',
        variant === 'ghost' && 'bg-neutral-50/50',
        hover && 'transition-all duration-200 ease-out hover:border-neutral-300 hover:shadow-medium cursor-pointer',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, actions }) {
  return (
    <div className={clsx(
      'flex items-start justify-between gap-4',
      className
    )}>
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={clsx(
      'text-base font-semibold text-neutral-900 tracking-tight',
      className
    )}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={clsx(
      'text-sm text-neutral-500 mt-1',
      className
    )}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={clsx('mt-4', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div className={clsx(
      'mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-4',
      className
    )}>
      {children}
    </div>
  )
}

// Metric card component for stats
export function MetricCard({ 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'bg-primary-50 text-primary-600',
  className 
}) {
  return (
    <Card className={clsx('p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        {Icon && (
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            iconColor
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0 text-right">
          <p className="text-sm text-neutral-500 truncate">{label}</p>
          <p className="text-2xl font-semibold text-neutral-900 tracking-tight tabular-nums mt-0.5">
            {value}
          </p>
          {change && (
            <p className={clsx(
              'text-xs font-medium mt-1 tabular-nums',
              changeType === 'positive' && 'text-success-600',
              changeType === 'negative' && 'text-danger-600',
              changeType === 'neutral' && 'text-neutral-500'
            )}>
              {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
