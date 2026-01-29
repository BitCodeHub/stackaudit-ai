import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  hint,
  className,
  wrapperClassName,
  type = 'text',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  suffix,
  prefix,
  ...props 
}, ref) => {
  const sizes = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }
  
  const hasLeftAdornment = Icon && iconPosition === 'left' || prefix
  const hasRightAdornment = Icon && iconPosition === 'right' || suffix
  
  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {hasLeftAdornment && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {prefix && <span className="text-neutral-400 text-sm">{prefix}</span>}
            {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 text-neutral-400" />}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full rounded-lg',
            'text-neutral-900 placeholder:text-neutral-400',
            'bg-white border shadow-xs',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2',
            error 
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
            'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
            sizes[size],
            hasLeftAdornment && 'pl-10',
            hasRightAdornment && 'pr-10',
            className
          )}
          {...props}
        />
        {hasRightAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 text-neutral-400" />}
            {suffix && <span className="text-neutral-400 text-sm">{suffix}</span>}
          </div>
        )}
      </div>
      {(error || hint) && (
        <p className={clsx(
          'mt-1.5 text-sm',
          error ? 'text-danger-600' : 'text-neutral-500'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input

export const Select = forwardRef(({ 
  label, 
  error, 
  hint,
  className, 
  wrapperClassName,
  children, 
  size = 'md',
  ...props 
}, ref) => {
  const sizes = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  }
  
  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'w-full rounded-lg appearance-none cursor-pointer',
          'text-neutral-900 bg-white border shadow-xs',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2',
          error 
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
          'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
          'pr-10',
          sizes[size],
          className
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em'
        }}
        {...props}
      >
        {children}
      </select>
      {(error || hint) && (
        <p className={clsx(
          'mt-1.5 text-sm',
          error ? 'text-danger-600' : 'text-neutral-500'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export const Textarea = forwardRef(({ 
  label, 
  error, 
  hint,
  className, 
  wrapperClassName,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'w-full px-3 py-2.5 rounded-lg',
          'text-sm text-neutral-900 placeholder:text-neutral-400',
          'bg-white border shadow-xs',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2',
          error 
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
            : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500/20',
          'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
          'resize-none',
          className
        )}
        {...props}
      />
      {(error || hint) && (
        <p className={clsx(
          'mt-1.5 text-sm',
          error ? 'text-danger-600' : 'text-neutral-500'
        )}>
          {error || hint}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

// Toggle switch
export function Toggle({ 
  checked = false, 
  onChange, 
  label,
  description,
  disabled = false,
  size = 'md',
  className 
}) {
  const sizes = {
    sm: { track: 'h-4 w-7', thumb: 'h-3 w-3', translate: 'translate-x-3' },
    md: { track: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    lg: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
  }
  
  const sizeConfig = sizes[size]
  
  return (
    <label className={clsx(
      'inline-flex items-start gap-3 cursor-pointer',
      disabled && 'cursor-not-allowed opacity-50',
      className
    )}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={clsx(
          'relative inline-flex shrink-0 cursor-pointer rounded-full',
          'border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2',
          sizeConfig.track,
          checked ? 'bg-primary-600' : 'bg-neutral-200'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm',
            'ring-0 transition-transform duration-200 ease-in-out',
            sizeConfig.thumb,
            checked ? sizeConfig.translate : 'translate-x-0'
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-neutral-900">{label}</span>
          )}
          {description && (
            <span className="text-sm text-neutral-500">{description}</span>
          )}
        </div>
      )}
    </label>
  )
}
