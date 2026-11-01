// src/components/etudiant/StatutBadge.tsx
import type { StatutReservation } from '@/types/etudiant'

const STYLES: Record<StatutReservation, { label: string; cls: string }> = {
  CONFIRMEE: { label: 'Confirmée', cls: 'bg-green-500/15 text-success' },
  EN_ATTENTE: { label: 'En attente', cls: 'bg-orange-500/15 text-warning' },
  ANNULEE: { label: 'Annulée', cls: 'bg-white/10 text-text-muted' },
  REFUSEE: { label: 'Refusée', cls: 'bg-red-500/15 text-[#ff5a52]' },
}

export function StatutBadge({ statut }: { statut: StatutReservation }) {
  const s = STYLES[statut] ?? STYLES.EN_ATTENTE
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>● {s.label}</span>
}