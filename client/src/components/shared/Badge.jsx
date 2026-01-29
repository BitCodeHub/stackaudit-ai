import clsx from 'clsx'

const variants = {
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200/50',
  primary: 'bg-primary-50 text-primary-700 border-primary-200/50',
  success: 'bg-success-50 text-success-700 border-success-200/50',
  warning: 'bg-warning-50 text-warning-700 border-warning-200/50',
  danger: 'bg-danger-50 text-danger-700 border-danger-200/50',
  info: 'bg-accent-50 text-accent-700 border-accent-200/50',
}

const solidVariants = {
  neutral: 'bg-neutral-900 text-white',
  primary: 'bg-primary-600 text-white',
  success: 'bg-success-600 text-white',
  warning: 'bg-warning-600 text-white',
  danger: 'bg-danger-600 text-white',
  info: 'bg-accent-600 text-white',
}

const dotColors = {
  neutral: 'bg-neutral-500',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-accent-500',
}

const sizes = {
  xs: 'px-1.5 py-0.5 text-2xs gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
}

export default function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'sm',
  className,
  dot = false,
  pill = false,
  solid = false,
  icon: Icon,
  removable = false,
  onRemove
}) {
  return (
    <span className={clsx(
      'inline-flex items-center font-medium',
      'border',
      pill ? 'rounded-full' : 'rounded-md',
      solid ? solidVariants[variant] : variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={clsx(
          'rounded-full shrink-0',
          dotColors[variant],
          size === 'xs' && 'w-1 h-1',
          size === 'sm' && 'w-1.5 h-1.5',
          size === 'md' && 'w-1.5 h-1.5',
          size === 'lg' && 'w-2 h-2'
        )} />
      )}
      {Icon && !dot && (
        <Icon className={clsx(
          'shrink-0',
          size === 'xs' && 'w-2.5 h-2.5',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-3.5 h-3.5',
          size === 'lg' && 'w-4 h-4'
        )} />
      )}
      <span>{children}</span>
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className={clsx(
            'shrink-0 hover:bg-black/10 rounded-full p-0.5 -mr-0.5 transition-colors',
            size === 'xs' && 'ml-0.5',
            size === 'sm' && 'ml-0.5',
            size === 'md' && 'ml-1',
            size === 'lg' && 'ml-1.5'
          )}
        >
          <svg 
            className={clsx(
              size === 'xs' && 'w-2.5 h-2.5',
              size === 'sm' && 'w-3 h-3',
              size === 'md' && 'w-3.5 h-3.5',
              size === 'lg' && 'w-4 h-4'
            )} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

// Status badge with semantic meaning
export function StatusBadge({ status, className }) {
  const statusConfig = {
    active: { label: 'Active', variant: 'success', dot: true },
    inactive: { label: 'Inactive', variant: 'neutral', dot: true },
    pending: { label: 'Pending', variant: 'warning', dot: true },
    completed: { label: 'Completed', variant: 'success', dot: true },
    failed: { label: 'Failed', variant: 'danger', dot: true },
    warning: { label: 'Warning', variant: 'warning', dot: true },
    healthy: { label: 'Healthy', variant: 'success', dot: true },
    critical: { label: 'Critical', variant: 'danger', dot: true },
  }
  
  const config = statusConfig[status] || statusConfig.inactive
  
  return (
    <Badge 
      variant={config.variant} 
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  )
}
