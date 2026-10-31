import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { StatutBadge } from '@/components/etudiant/StatutBadge'
import { etudiantService } from '@/services/etudiantService'
import { getErrorMessage } from '@/lib/apiError'
import { formatDateFr, hhmm } from '@/lib/format'
import type { Reservation, StatutReservation } from '@/types/etudiant'

const TABS: { value: '' | StatutReservation; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'CONFIRMEE', label: 'Confirmée' },
  { value: 'ANNULEE', label: 'Annulée' },
]

export function MesReservationsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'' | StatutReservation>('')
  const [toCancel, setToCancel] = useState<Reservation | null>(null)

  const { data, error, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: etudiantService.getMesReservations,
  })

  const cancel = useMutation({
    mutationFn: (id: number) => etudiantService.annulerReservation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onSettled: () => setToCancel(null),
  })

  const shown = (data ?? []).filter((r) => !tab || r.statut === tab)

  return (
    <div>
      <PageHeader eyebrow="Réservations" title="Mes réservations" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.value)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              tab === t.value
                ? 'border-brand-orange bg-brand-orange text-white'
                : 'border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-2 text-sm text-text-secondary">{shown.length} réservation(s)</span>
      </div>

      {error && <Alert variant="error" className="mb-4">{getErrorMessage(error)}</Alert>}
      {cancel.error && <Alert variant="error" className="mb-4">{getErrorMessage(cancel.error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white/5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              {['Référence', 'Salle', 'Date & horaire', 'Motif', 'Statut', ''].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-border text-text-primary">
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{r.reference}</td>
                <td className="px-4 py-3 font-semibold">{r.salleNom}</td>
                <td className="px-4 py-3">
                  {formatDateFr(r.date)}
                  <div className="text-xs text-text-secondary">{hhmm(r.heureDebut)} – {hhmm(r.heureFin)}</div>
                </td>
                <td className="px-4 py-3">{r.motif}</td>
                <td className="px-4 py-3"><StatutBadge statut={r.statut} /></td>
                <td className="px-4 py-3 text-right">
                  {(r.statut === 'CONFIRMEE' || r.statut === 'EN_ATTENTE') && (
                    <button
                      onClick={() => setToCancel(r)}
                      className="text-sm font-medium text-brand-orange hover:text-[#ff8b4d]"
                    >
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && shown.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Aucune réservation.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={toCancel !== null}
        title="Annuler cette réservation ?"
        description={
          toCancel && (
            <>
              <strong className="text-text-primary">{toCancel.salleNom}</strong>, le {formatDateFr(toCancel.date)} de{' '}
              {hhmm(toCancel.heureDebut)} à {hhmm(toCancel.heureFin)}. Le créneau redeviendra disponible.
            </>
          )
        }
        confirmLabel="Annuler la réservation"
        cancelLabel="Conserver"
        loading={cancel.isPending}
        onConfirm={() => toCancel && cancel.mutate(toCancel.id)}
        onCancel={() => setToCancel(null)}
      />
    </div>
  )
}