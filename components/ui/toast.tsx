import * as React from "react"
import { cn } from "../../lib/utils"

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const typeStyles = {
    success: 'bg-primary/10 border-primary/20 text-primary',
    error: 'bg-destructive/10 border-destructive/20 text-destructive',
    info: 'bg-secondary/10 border-secondary/20 text-secondary-foreground'
  }

  return (
    <div className="fixed top-4 right-4 z-50 fade-in">
      <div className={cn(
        'px-4 py-3 rounded-lg border shadow-lg max-w-sm',
        typeStyles[type]
      )}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-3 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
