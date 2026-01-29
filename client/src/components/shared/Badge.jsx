import clsx from 'clsx'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700'
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
}

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  dot = false
}) {
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={clsx(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-yellow-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'primary' && 'bg-primary-500',
          variant === 'default' && 'bg-gray-500'
        )} />
      )}
      {children}
    </span>
  )
}
