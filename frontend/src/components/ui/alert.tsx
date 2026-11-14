import * as React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertMap = {
  info: {
    icon: Info,
    container: 'border-border bg-white/5 text-text-primary',
  },
  success: {
    icon: CheckCircle2,
    container: 'border-success/30 bg-success/10 text-success',
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-warning/40 bg-warning/10 text-warning',
  },
  error: {
    icon: AlertCircle,
    container: 'border-error/40 bg-error/10 text-error',
  },
} as const

export function Alert({
  variant = 'info',
  children,
  className,
}: {
  variant?: keyof typeof alertMap
  children: React.ReactNode
  className?: string
}) {
  const config = alertMap[variant]
  const Icon = config.icon

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        config.container,
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
