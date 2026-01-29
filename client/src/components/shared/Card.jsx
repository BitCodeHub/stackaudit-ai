import clsx from 'clsx'

export function Card({ children, className, hover = false, padding = true }) {
  return (
    <div className={clsx(
      'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
      hover && 'hover:shadow-md transition-shadow duration-200',
      padding && 'p-6',
      className
    )}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={clsx('text-sm text-gray-500 mt-1', className)}>
      {children}
    </p>
  )
}

export function CardContent({ children, className }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
