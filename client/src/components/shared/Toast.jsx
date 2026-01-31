import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'

// Toast Context
const ToastContext = createContext(null)

// Toast variants configuration
const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-success-50 border-success-200 text-success-800',
    iconClassName: 'text-success-500',
    progressClassName: 'bg-success-500'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-danger-50 border-danger-200 text-danger-800',
    iconClassName: 'text-danger-500',
    progressClassName: 'bg-danger-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning-50 border-warning-200 text-warning-800',
    iconClassName: 'text-warning-500',
    progressClassName: 'bg-warning-500'
  },
  info: {
    icon: Info,
    className: 'bg-primary-50 border-primary-200 text-primary-800',
    iconClassName: 'text-primary-500',
    progressClassName: 'bg-primary-500'
  }
}

// Individual Toast Component
function Toast({ id, variant = 'info', title, message, duration = 5000, onClose }) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const config = toastVariants[variant] || toastVariants.info
  const Icon = config.icon

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 200)
  }, [id, onClose])

  // Auto-dismiss with progress
  useEffect(() => {
    if (duration <= 0) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        handleClose()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, handleClose])

  return (
    <div
      className={clsx(
        'relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'transform transition-all duration-200 ease-out overflow-hidden',
        'min-w-[320px] max-w-[420px]',
        isExiting ? 'opacity-0 translate-x-4 scale-95' : 'opacity-100 translate-x-0 scale-100',
        config.className
      )}
      role="alert"
    >
      <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', config.iconClassName)} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm mb-0.5">{title}</h4>
        )}
        {message && (
          <p className="text-sm opacity-90 leading-relaxed">{message}</p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors -mt-1 -mr-1"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 opacity-60" />
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
          <div
            className={clsx('h-full transition-all duration-50 ease-linear', config.progressClassName)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>,
    document.body
  )
}

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random().toString(36).slice(2)
    const toast = {
      id,
      variant: 'info',
      duration: 5000,
      ...options
    }
    setToasts((prev) => [...prev, toast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const toast = {
    success: (title, message, options = {}) => 
      addToast({ variant: 'success', title, message, ...options }),
    error: (title, message, options = {}) => 
      addToast({ variant: 'error', title, message, ...options }),
    warning: (title, message, options = {}) => 
      addToast({ variant: 'warning', title, message, ...options }),
    info: (title, message, options = {}) => 
      addToast({ variant: 'info', title, message, ...options }),
    dismiss: removeToast,
    clear: clearToasts
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default Toast
