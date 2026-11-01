// src/lib/format.ts
export const today = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const hhmm = (t: string) => t.slice(0, 5)

export const formatDateFr = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export const TYPE_SALLE_LABEL: Record<string, string> = {
  AMPHITHEATRE: 'Amphithéâtre',
  SALLE_COURS: 'Salle de cours',
  SALLE_TP: 'Salle de TP',
  SALLE_REUNION: 'Salle de réunion',
}

export const fieldClass =
  'w-full rounded-xl border border-border bg-[#0D0D0D] px-3 py-2.5 text-sm text-text-primary ' +
  'placeholder:text-text-secondary focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange'