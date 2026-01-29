import clsx from 'clsx'
import { forwardRef } from 'react'

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 shadow-[0_1px_2px_rgb(0_0_0/0.1),inset_0_1px_0_rgb(255_255_255/0.1)]',
  secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100 focus-visible:ring-neutral-400 shadow-xs',
  ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:ring-neutral-400',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500 shadow-[0_1px_2px_rgb(0_0_0/0.1),inset_0_1px_0_rgb(255_255_255/0.1)]',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-[0_1px_2px_rgb(0_0_0/0.1),inset_0_1px_0_rgb(255_255_255/0.1)]',
  link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus-visible:ring-primary-400 p-0'
}

const sizes = {
  xs: 'text-xs px-2.5 py-1 gap-1.5 rounded-md',
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 gap-2 rounded-lg',
  lg: 'text-base px-5 py-2.5 gap-2.5 rounded-lg',
  xl: 'text-base px-6 py-3 gap-3 rounded-xl'
}

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}, ref) => {
  const isIconOnly = !children && Icon
  
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        isIconOnly && 'aspect-square p-0 justify-center',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{children || 'Loading...'}</span>
        </span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={clsx(
              size === 'xs' && 'w-3.5 h-3.5',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-5 h-5',
              size === 'xl' && 'w-5 h-5',
              isIconOnly && 'w-5 h-5'
            )} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={clsx(
              size === 'xs' && 'w-3.5 h-3.5',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-5 h-5',
              size === 'xl' && 'w-5 h-5'
            )} />
          )}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
