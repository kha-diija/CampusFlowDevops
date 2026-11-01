// src/components/etudiant/PageHeader.tsx
export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-extrabold text-text-primary">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
    </div>
  )
}