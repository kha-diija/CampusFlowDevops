// src/pages/etudiant/NouvelleReservationPage.tsx
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { etudiantService } from '@/services/etudiantService'
import { getErrorMessage } from '@/lib/apiError'
import { fieldClass, today } from '@/lib/format'

export function NouvelleReservationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params] = useSearchParams()

  const [salleId, setSalleId] = useState(params.get('salleId') ?? '')
  const [date, setDate] = useState(params.get('date') ?? today())
  const [heureDebut, setHeureDebut] = useState(params.get('debut') ?? '14:00')
  const [heureFin, setHeureFin] = useState(params.get('fin') ?? '16:00')
  const [motif, setMotif] = useState('')
  const [confirme, setConfirme] = useState(false)

  const salles = useQuery({ queryKey: ['salles', 'all'], queryFn: () => etudiantService.getSalles() })

  // Vérification en direct de la disponibilité (créneau valide uniquement)
  const creneauValide = Boolean(salleId && date && heureDebut && heureFin && heureFin > heureDebut)
  const verif = useQuery({
    queryKey: ['salles', 'verif', date, heureDebut, heureFin],
    queryFn: () => etudiantService.getSalles({ date, debut: heureDebut, fin: heureFin }),
    enabled: creneauValide,
  })
  const libre = verif.data?.find((s) => String(s.id) === salleId)?.disponible ?? null
  const salle = salles.data?.find((s) => String(s.id) === salleId)

  const create = useMutation({
    mutationFn: () =>
      etudiantService.creerReservation({ salleId: Number(salleId), date, heureDebut, heureFin, motif }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['reservations'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/reservations')
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    create.mutate()
  }

  return (
    <div>
      <PageHeader eyebrow="Réservations" title="Nouvelle réservation" subtitle="Une réservation ponctuelle pour une activité universitaire." />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-white/5 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Salle">
              <select className={fieldClass} value={salleId} onChange={(e) => setSalleId(e.target.value)} required>
                <option value="">Choisir une salle</option>
                {salles.data?.map((s) => (
                  <option key={s.id} value={s.id}>{s.nom} · Bât. {s.batiment}</option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" min={today()} className={fieldClass} value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>
            <Field label="Heure de début">
              <input type="time" className={fieldClass} value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} required />
            </Field>
            <Field label="Heure de fin">
              <input type="time" className={fieldClass} value={heureFin} onChange={(e) => setHeureFin(e.target.value)} required />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Motif de la réservation">
              <textarea
                rows={4}
                maxLength={255}
                className={fieldClass}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex. : réunion de l'association étudiante"
                required
              />
            </Field>
          </div>

          <label className="mt-4 flex items-start gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={confirme}
              onChange={(e) => setConfirme(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border bg-[#0D0D0D] text-brand-orange focus:ring-brand-orange"
            />
            Je confirme que cette réservation concerne une activité autorisée.
          </label>

          {heureFin <= heureDebut && <Alert variant="error" className="mt-4">L'heure de fin doit être postérieure à l'heure de début.</Alert>}
          {create.error && <Alert variant="error" className="mt-4">{getErrorMessage(create.error)}</Alert>}

          <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Annuler</Button>
            <Button type="submit" loading={create.isPending} disabled={!confirme || libre === false || !creneauValide}>
              Envoyer la demande
            </Button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-white/5 p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Récapitulatif</p>
          <h3 className="mt-1 text-xl font-bold text-text-primary">Votre créneau</h3>
          <p className="mt-4 font-semibold text-text-primary">{salle ? salle.nom : '—'}</p>
          {salle && <p className="text-sm text-text-secondary">Bâtiment {salle.batiment} · {salle.capacite} places</p>}
          <p className="mt-3 text-sm text-text-secondary">{date}</p>
          <p className="text-sm text-text-secondary">{heureDebut} — {heureFin}</p>
          {libre === true && <p className="mt-4 rounded-xl bg-green-500/15 px-3 py-2 text-sm text-success">● Créneau libre à la vérification</p>}
          {libre === false && <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-[#ff5a52]">● Créneau indisponible</p>}
          <p className="mt-4 text-xs text-text-muted">La réservation est confirmée si le créneau est encore libre au moment de l'envoi.</p>
        </aside>
      </div>
    </div>
  )
}