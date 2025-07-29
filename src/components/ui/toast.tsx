import * as React from 'react'
import { toast, Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Modern toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface CustomToastProps {
  title: string
  description?: string
  type: ToastType
  onDismiss?: () => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toastStyles = {
  success: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
  error: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  info: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
}

// Custom toast component
export const CustomToast: React.FC<CustomToastProps> = ({
  title,
  description,
  type,
  onDismiss,
}) => {
  const Icon = toastIcons[type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-sm border border-white/20 max-w-md',
        toastStyles[type]
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm leading-5">{title}</h4>
        {description && (
          <p className="text-xs opacity-90 mt-1 leading-4">{description}</p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Enhanced toast functions
export const showToast = {
  success: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast
        title={title}
        description={description}
        type="success"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'bottom-right',
    })
  },
  
  error: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast
        title={title}
        description={description}
        type="error"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 5000,
      position: 'bottom-right',
    })
  },
  
  warning: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast
        title={title}
        description={description}
        type="warning"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4500,
      position: 'bottom-right',
    })
  },
  
  info: (title: string, description?: string) => {
    toast.custom((t) => (
      <CustomToast
        title={title}
        description={description}
        type="info"
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'bottom-right',
    })
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading: (
        <CustomToast
          title={loading}
          type="info"
        />
      ),
      success: (data) => (
        <CustomToast
          title={typeof success === 'function' ? success(data) : success}
          type="success"
        />
      ),
      error: (err) => (
        <CustomToast
          title={typeof error === 'function' ? error(err) : error}
          type="error"
        />
      ),
    })
  },
}

// Main Toaster component with modern styling
export const ModernToaster = () => (
  <Toaster
    position="bottom-right"
    gutter={12}
    toastOptions={{
      duration: 4000,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        margin: 0,
      },
    }}
  />
) 