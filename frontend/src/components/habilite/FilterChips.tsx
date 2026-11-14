// src/components/habilite/FilterChips.tsx
import { cn } from '@/lib/utils'

interface Option<T extends string> {
  value: T
  label: string
  count?: number
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'border-brand-orange/60 bg-brand-orange/10 text-brand-orange'
                : 'border-border text-text-secondary hover:bg-white/5 hover:text-text-primary',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className="ml-2 text-xs opacity-70">{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
