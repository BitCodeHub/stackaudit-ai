import clsx from 'clsx'
import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  actionIcon,
  secondaryAction,
  secondaryLabel,
  className
}) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center text-center py-16 px-6',
      className
    )}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-neutral-400" />
        </div>
      )}
      
      {title && (
        <h3 className="text-base font-semibold text-neutral-900 mb-1">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm">
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {action && (
            <Button onClick={action} icon={actionIcon}>
              {actionLabel}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Skeleton loading state
export function SkeletonCard({ className }) {
  return (
    <div className={clsx('rounded-xl bg-white border border-neutral-200/80 p-6', className)}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-1/3" />
            <div className="h-3 bg-neutral-100 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-neutral-100 rounded w-full" />
          <div className="h-3 bg-neutral-100 rounded w-5/6" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, className }) {
  return (
    <div className={clsx('rounded-xl bg-white border border-neutral-200/80 overflow-hidden', className)}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex gap-4 p-4 bg-neutral-50 border-b border-neutral-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 bg-neutral-200 rounded flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-neutral-100">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-4 bg-neutral-100 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
