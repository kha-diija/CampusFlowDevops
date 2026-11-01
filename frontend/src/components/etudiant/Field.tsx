// src/components/etudiant/Field.tsx
import type { ReactNode } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">{label}</span>
      {children}
    </label>
  )
}