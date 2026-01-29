import { useEffect, Fragment } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Modal({ 
  isOpen, 
  onClose, 
  title,
  description,
  children, 
  size = 'md',
  showClose = true,
  centered = true,
  className
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)]'
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className={clsx(
        'min-h-screen px-4 text-center',
        centered && 'flex items-center justify-center'
      )}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal panel */}
        <div className={clsx(
          'relative inline-block w-full text-left',
          'bg-white rounded-2xl shadow-large',
          'transform transition-all animate-scale-in',
          sizes[size],
          className
        )}>
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              {(title || description) && (
                <div>
                  {title && (
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {description}
                    </p>
                  )}
                </div>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  className={clsx(
                    'p-2 -m-2 rounded-lg',
                    'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
                    'transition-colors duration-150'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal footer for action buttons
export function ModalFooter({ children, className }) {
  return (
    <div className={clsx(
      'flex items-center justify-end gap-3 pt-4 mt-2 border-t border-neutral-100',
      className
    )}>
      {children}
    </div>
  )
}

// Confirmation modal variant
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false
}) {
  const variantStyles = {
    danger: 'bg-danger-600 hover:bg-danger-700',
    warning: 'bg-warning-600 hover:bg-warning-700',
    primary: 'bg-primary-600 hover:bg-primary-700',
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <ModalFooter>
        <button
          onClick={onClose}
          disabled={loading}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-lg',
            'bg-white text-neutral-700 border border-neutral-300',
            'hover:bg-neutral-50 transition-colors',
            'disabled:opacity-50'
          )}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-lg text-white',
            'transition-colors disabled:opacity-50',
            variantStyles[variant]
          )}
        >
          {loading ? 'Loading...' : confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  )
}
