// src/pages/habilite/IndisponibilitesPage.tsx
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Link2, Plus, Undo2 } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Modal } from '@/components/ui/modal'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { IndisponibiliteStatutPill } from '@/components/habilite/StatutPill'
import { FilterChips } from '@/components/habilite/FilterChips'
import { etudiantService } from '@/services/etudiantService'
import { habiliteService } from '@/services/habiliteService'
import { getErrorMessage } from '@/lib/apiError'
import { fieldClass } from '@/lib/format'
import { formatDateTimeFr, toInputDateTime } from '@/lib/habilite'
import type { Indisponibilite } from '@/types/habilite'

type Filtre = 'ACTIVES' | 'HISTORIQUE' | 'TOUTES'

const estActive = (i: Indisponibilite) => i.statut === 'EN_COURS' || i.statut === 'A_VENIR'

export function IndisponibilitesPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [filtre, setFiltre] = useState<Filtre>('ACTIVES')
  const [aLever, setALever] = useState<Indisponibilite | null>(null)
  const [alerte, setAlerte] = useState<string | null>(null)

  const creating = params.has('nouveau') || params.has('salleId')

  const { data, error, isLoading } = useQuery({ queryKey: ['habilite', 'indisponibilites'], queryFn: habiliteService.getIndisponibilites })

  const lever = useMutation({
    mutationFn: (id: number) => habiliteService.leverIndisponibilite(id),
    onSuccess: async () => {
      setALever(null)
      await queryClient.invalidateQueries({ queryKey: ['habilite'] })
    },
  })

  const visibles = (data ?? []).filter((i) => filtre === 'TOUTES' || (filtre === 'ACTIVES') === estActive(i))

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader eyebrow="Administration" title="Indisponibilités" subtitle="Les salles déclarées indisponibles ne peuvent pas être réservées sur la période concernée." />
        <Button onClick={() => setParams({ nouveau: '1' })} leftIcon={<Plus className="h-4 w-4" />}>
          Déclarer une indisponibilité
        </Button>
      </div>

      <div className="mb-6">
        <FilterChips<Filtre>
          value={filtre}
          onChange={setFiltre}
          options={[
            { value: 'ACTIVES', label: 'Actives', count: (data ?? []).filter(estActive).length },
            { value: 'HISTORIQUE', label: 'Historique', count: (data ?? []).filter((i) => !estActive(i)).length },
            { value: 'TOUTES', label: 'Toutes', count: data?.length },
          ]}
        />
      </div>

      {alerte && <Alert variant="warning" className="mb-4">{alerte}</Alert>}
      {error && <Alert variant="error" className="mb-4">{getErrorMessage(error)}</Alert>}
      {lever.error && <Alert variant="error" className="mb-4">{getErrorMessage(lever.error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}
      {data && visibles.length === 0 && <p className="text-sm text-text-secondary">Aucune indisponibilité.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibles.map((i) => (
          <article key={i.id} className="flex flex-col rounded-2xl border border-border bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-text-primary">{i.salleNom}</h3>
              <IndisponibiliteStatutPill statut={i.statut} />
            </div>
            <p className="mt-1 text-sm text-text-secondary">Bâtiment {i.batiment}</p>
            <p className="mt-3 text-sm text-text-primary">{formatDateTimeFr(i.dateDebut)} → {formatDateTimeFr(i.dateFin)}</p>
            <p className="mt-2 text-sm text-text-secondary">{i.motif}</p>
            <p className="mt-2 flex items-center gap-2 text-xs text-text-muted">
              {i.signalementId && (<><Link2 className="h-3.5 w-3.5" /> Signalement #{i.signalementId} ·</>)} déclarée par {i.createur}
            </p>
            {i.reservationsEnConflit > 0 && (
              <Alert variant="warning" className="mt-3">
                {i.reservationsEnConflit} réservation(s) confirmée(s) chevauchent cette période. Elles ne sont pas annulées automatiquement.
              </Alert>
            )}
            {estActive(i) && (
              <div className="mt-auto pt-4">
                <Button size="sm" variant="secondary" leftIcon={<Undo2 className="h-3.5 w-3.5" />} onClick={() => setALever(i)}>
                  Lever l'indisponibilité
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>

      <IndisponibiliteFormModal
        key={creating ? 'open' : 'closed'}
        open={creating}
        defaultSalleId={params.get('salleId') ?? ''}
        signalementId={params.get('signalementId') ? Number(params.get('signalementId')) : undefined}
        onClose={() => setParams({}, { replace: true })}
        onCreated={(i) => {
          setAlerte(
            i.reservationsEnConflit > 0
              ? `${i.salleNom} est désormais indisponible. ${i.reservationsEnConflit} réservation(s) confirmée(s) sont en conflit et doivent être traitées.`
              : null,
          )
          setParams({}, { replace: true })
        }}
      />

      <ConfirmDialog
        open={aLever !== null}
        title="Lever l'indisponibilité ?"
        description={aLever && `${aLever.salleNom} redeviendra réservable sur cette période (sauf autre indisponibilité, cours ou réservation).`}
        confirmLabel="Lever"
        loading={lever.isPending}
        onCancel={() => setALever(null)}
        onConfirm={() => aLever && lever.mutate(aLever.id)}
      />
    </div>
  )
}

function IndisponibiliteFormModal({
  open, defaultSalleId, signalementId, onClose, onCreated,
}: {
  open: boolean
  defaultSalleId: string
  signalementId?: number
  onClose: () => void
  onCreated: (i: Indisponibilite) => void
}) {
  const queryClient = useQueryClient()
  const [salleId, setSalleId] = useState(defaultSalleId)
  const [debut, setDebut] = useState(() => toInputDateTime(new Date()))
  const [fin, setFin] = useState(() => toInputDateTime(new Date(Date.now() + 24 * 3_600_000)))
  const [motif, setMotif] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const salles = useQuery({ queryKey: ['salles', 'all'], queryFn: () => etudiantService.getSalles(), enabled: open })

  const create = useMutation({
    mutationFn: () => habiliteService.creerIndisponibilite({ salleId: Number(salleId), dateDebut: debut, dateFin: fin, motif: motif.trim(), signalementId }),
    onSuccess: async (i) => {
      await queryClient.invalidateQueries({ queryKey: ['habilite'] })
      onCreated(i)
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!salleId) return setLocalError('Sélectionnez la salle concernée.')
    if (!motif.trim()) return setLocalError('Le motif est obligatoire.')
    if (fin <= debut) return setLocalError('La date de fin doit être postérieure à la date de début.')
    setLocalError(null)
    create.mutate()
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Déclarer une indisponibilité">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Salle">
          <select className={fieldClass} value={salleId} onChange={(e) => setSalleId(e.target.value)}>
            <option value="">Sélectionner une salle</option>
            {salles.data?.map((s) => (
              <option key={s.id} value={s.id}>{s.nom} — bât. {s.batiment}</option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Début">
            <input type="datetime-local" className={fieldClass} value={debut} onChange={(e) => setDebut(e.target.value)} required />
          </Field>
          <Field label="Fin">
            <input type="datetime-local" className={fieldClass} value={fin} onChange={(e) => setFin(e.target.value)} required />
          </Field>
        </div>
        <Field label="Motif">
          <textarea className={`${fieldClass} min-h-[90px]`} value={motif} maxLength={1000} onChange={(e) => setMotif(e.target.value)} placeholder="Ex. Fuite d'eau, vidéoprojecteur hors service…" />
        </Field>
        {signalementId && <p className="text-xs text-text-secondary">Liée au signalement #{signalementId}.</p>}

        {(localError || create.error) && <Alert variant="error">{localError ?? getErrorMessage(create.error)}</Alert>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={create.isPending}>Déclarer</Button>
        </div>
      </form>
    </Modal>
  )
}
