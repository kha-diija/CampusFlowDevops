// src/pages/habilite/SignalementsPage.tsx
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Flag, MessageSquare, Play, Plus, ShieldAlert, XCircle } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { SignalementStatutPill } from '@/components/habilite/StatutPill'
import { FilterChips } from '@/components/habilite/FilterChips'
import { etudiantService } from '@/services/etudiantService'
import { habiliteService } from '@/services/habiliteService'
import { getErrorMessage } from '@/lib/apiError'
import { fieldClass } from '@/lib/format'
import { TYPE_SIGNALEMENT_LABEL, formatDateTimeFr, formatRelativeDateTime } from '@/lib/habilite'
import type { Signalement, StatutSignalement, TypeSignalement } from '@/types/habilite'

type Filtre = StatutSignalement | 'TOUS'

export function SignalementsPage() {
  const [params, setParams] = useSearchParams()
  const [filtre, setFiltre] = useState<Filtre>('TOUS')
  const [q, setQ] = useState('')

  const selectedId = params.get('id') ? Number(params.get('id')) : null
  const creating = params.get('nouveau') === '1'

  const { data, error, isLoading } = useQuery({ queryKey: ['habilite', 'signalements'], queryFn: habiliteService.getSignalements })

  const needle = q.trim().toLowerCase()
  const visibles = (data ?? [])
    .filter((s) => filtre === 'TOUS' || s.statut === filtre)
    .filter((s) => !needle || s.salleNom.toLowerCase().includes(needle) || s.description.toLowerCase().includes(needle))
  const count = (s: StatutSignalement) => (data ?? []).filter((x) => x.statut === s).length

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader eyebrow="Administration" title="Signalements" subtitle="Suivi administratif des problèmes constatés dans les salles." />
        <Button onClick={() => setParams({ nouveau: '1' })} leftIcon={<Plus className="h-4 w-4" />}>
          Nouveau signalement
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <FilterChips<Filtre>
          value={filtre}
          onChange={setFiltre}
          options={[
            { value: 'TOUS', label: 'Tous', count: data?.length },
            { value: 'EN_ATTENTE', label: 'En attente', count: count('EN_ATTENTE') },
            { value: 'EN_COURS', label: 'En cours', count: count('EN_COURS') },
            { value: 'RESOLU', label: 'Résolus', count: count('RESOLU') },
            { value: 'REJETE', label: 'Rejetés', count: count('REJETE') },
          ]}
        />
        <div className="w-full max-w-xs">
          <Field label="Rechercher">
            <input className={fieldClass} placeholder="Salle ou description" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-4">{getErrorMessage(error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}
      {data && visibles.length === 0 && <p className="text-sm text-text-secondary">Aucun signalement.</p>}

      <div className="space-y-3">
        {visibles.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setParams({ id: String(s.id) })}
            className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/5 p-4 text-left transition-colors hover:border-brand-orange/50"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Flag className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-text-primary">
                  {TYPE_SIGNALEMENT_LABEL[s.type]} <span className="text-sm font-medium text-text-secondary">· {s.salleNom} (bât. {s.batiment})</span>
                </p>
                <p className="line-clamp-1 text-sm text-text-secondary">{s.description}</p>
                <p className="mt-1 text-xs text-text-muted">{formatRelativeDateTime(s.dateCreation)} · par {s.createur}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {s.indisponibiliteActive && (
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-[#ff5a52]">Salle indisponible</span>
              )}
              <SignalementStatutPill statut={s.statut} />
            </div>
          </button>
        ))}
      </div>

      <SignalementFormModal
        key={creating ? 'new' : 'closed'}
        open={creating}
        defaultSalleId={params.get('salleId') ?? ''}
        onClose={() => setParams({}, { replace: true })}
        onCreated={(s) => setParams({ id: String(s.id) }, { replace: true })}
      />

      {selectedId !== null && (
        <SignalementDetailModal key={selectedId} id={selectedId} onClose={() => setParams({}, { replace: true })} />
      )}
    </div>
  )
}

/* ------------------------------ Création ------------------------------ */

function SignalementFormModal({
  open, defaultSalleId, onClose, onCreated,
}: { open: boolean; defaultSalleId: string; onClose: () => void; onCreated: (s: Signalement) => void }) {
  const queryClient = useQueryClient()
  const [salleId, setSalleId] = useState(defaultSalleId)
  const [type, setType] = useState<TypeSignalement>('EQUIPEMENT_DEFECTUEUX')
  const [description, setDescription] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const salles = useQuery({ queryKey: ['salles', 'all'], queryFn: () => etudiantService.getSalles(), enabled: open })

  const create = useMutation({
    mutationFn: () => habiliteService.creerSignalement({ salleId: Number(salleId), type, description: description.trim() }),
    onSuccess: async (s) => {
      await queryClient.invalidateQueries({ queryKey: ['habilite'] })
      onCreated(s)
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!salleId) return setLocalError('Sélectionnez la salle concernée.')
    if (!description.trim()) return setLocalError('La description est obligatoire.')
    setLocalError(null)
    create.mutate()
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Nouveau signalement">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Salle concernée">
          <select className={fieldClass} value={salleId} onChange={(e) => setSalleId(e.target.value)}>
            <option value="">Sélectionner une salle</option>
            {salles.data?.map((s) => (
              <option key={s.id} value={s.id}>{s.nom} — bât. {s.batiment}</option>
            ))}
          </select>
        </Field>
        <Field label="Type de problème">
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value as TypeSignalement)}>
            {(Object.keys(TYPE_SIGNALEMENT_LABEL) as TypeSignalement[]).map((t) => (
              <option key={t} value={t}>{TYPE_SIGNALEMENT_LABEL[t]}</option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <textarea className={`${fieldClass} min-h-[110px]`} value={description} maxLength={2000} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le problème constaté" />
        </Field>

        {(localError || create.error) && <Alert variant="error">{localError ?? getErrorMessage(create.error)}</Alert>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={create.isPending}>Créer le signalement</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ------------------------------- Détail ------------------------------- */

function SignalementDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'resoudre' | 'rejeter' | null>(null)
  const [texte, setTexte] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const { data: s, error } = useQuery({ queryKey: ['habilite', 'signalement', id], queryFn: () => habiliteService.getSignalement(id) })

  const refresh = (updated: Signalement) => {
    queryClient.setQueryData(['habilite', 'signalement', id], updated)
    void queryClient.invalidateQueries({ queryKey: ['habilite'] })
  }

  const statutMutation = useMutation({
    mutationFn: (body: { statut: StatutSignalement; commentaire?: string; motifRejet?: string }) =>
      habiliteService.changerStatutSignalement(id, body),
    onSuccess: (updated) => {
      refresh(updated)
      setMode(null)
      setTexte('')
    },
  })

  const commentMutation = useMutation({
    mutationFn: () => habiliteService.commenterSignalement(id, commentaire.trim()),
    onSuccess: (updated) => {
      refresh(updated)
      setCommentaire('')
    },
  })

  const confirmer = () => {
    if (mode === 'rejeter') {
      if (!texte.trim()) return setLocalError('Un motif est obligatoire pour rejeter un signalement.')
      statutMutation.mutate({ statut: 'REJETE', motifRejet: texte.trim() })
    } else if (mode === 'resoudre') {
      statutMutation.mutate({ statut: 'RESOLU', commentaire: texte.trim() || undefined })
    }
    setLocalError(null)
  }

  const ouvert = s && (s.statut === 'EN_ATTENTE' || s.statut === 'EN_COURS')

  return (
    <Modal isOpen onClose={onClose} title={s ? `${TYPE_SIGNALEMENT_LABEL[s.type]} · ${s.salleNom}` : 'Signalement'} className="max-w-2xl max-h-[90vh] overflow-y-auto">
      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
      {!s && !error && <p className="text-sm text-text-secondary">Chargement…</p>}

      {s && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <SignalementStatutPill statut={s.statut} />
            {s.indisponibiliteActive && (
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-[#ff5a52]">Salle déclarée indisponible</span>
            )}
          </div>

          <p className="rounded-xl border border-border bg-white/5 p-4 text-sm text-text-primary">{s.description}</p>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Salle" value={`${s.salleNom} — bât. ${s.batiment}`} />
            <Info label="Créé le" value={`${formatDateTimeFr(s.dateCreation)} par ${s.createur}`} />
            <Info label="Responsable" value={s.responsable ?? '—'} />
            {s.dateResolution && <Info label="Résolu le" value={formatDateTimeFr(s.dateResolution)} />}
            {s.motifRejet && <Info label="Motif du rejet" value={s.motifRejet} />}
          </dl>

          <section>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-text-primary">
              <MessageSquare className="h-4 w-4 text-brand-orange" /> Suivi
            </h4>
            {s.commentaires.length === 0 && <p className="text-sm text-text-secondary">Aucun commentaire.</p>}
            <ul className="space-y-2">
              {s.commentaires.map((c) => (
                <li key={c.id} className="rounded-xl border border-border bg-white/5 p-3 text-sm">
                  <p className="text-text-primary">{c.texte}</p>
                  <p className="mt-1 text-xs text-text-muted">{c.auteur} · {formatDateTimeFr(c.dateCreation)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input className={fieldClass} placeholder="Ajouter un commentaire de suivi" value={commentaire} maxLength={2000} onChange={(e) => setCommentaire(e.target.value)} />
              <Button type="button" variant="secondary" disabled={!commentaire.trim()} loading={commentMutation.isPending} onClick={() => commentMutation.mutate()}>
                Ajouter
              </Button>
            </div>
            {commentMutation.error && <Alert variant="error" className="mt-2">{getErrorMessage(commentMutation.error)}</Alert>}
          </section>

          {ouvert ? (
            <section className="space-y-3 border-t border-border pt-4">
              {mode === null ? (
                <div className="flex flex-wrap gap-2">
                  {s.statut === 'EN_ATTENTE' && (
                    <Button size="sm" leftIcon={<Play className="h-3.5 w-3.5" />} loading={statutMutation.isPending} onClick={() => statutMutation.mutate({ statut: 'EN_COURS' })}>
                      Prendre en charge
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => setMode('resoudre')}>
                    Marquer résolu
                  </Button>
                  <Button size="sm" variant="secondary" leftIcon={<XCircle className="h-3.5 w-3.5" />} onClick={() => setMode('rejeter')}>
                    Rejeter
                  </Button>
                  {!s.indisponibiliteActive && (
                    <Button size="sm" variant="ghost" leftIcon={<ShieldAlert className="h-3.5 w-3.5" />}
                      onClick={() => navigate(`/indisponibilites?salleId=${s.salleId}&signalementId=${s.id}`)}>
                      Déclarer la salle indisponible
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Field label={mode === 'rejeter' ? 'Motif du rejet (obligatoire)' : 'Commentaire de traitement (facultatif)'}>
                    <textarea className={`${fieldClass} min-h-[90px]`} value={texte} maxLength={2000} onChange={(e) => setTexte(e.target.value)} />
                  </Field>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setMode(null); setTexte(''); setLocalError(null) }}>Retour</Button>
                    <Button size="sm" loading={statutMutation.isPending} onClick={confirmer}>
                      {mode === 'rejeter' ? 'Confirmer le rejet' : 'Confirmer la résolution'}
                    </Button>
                  </div>
                </div>
              )}
              {(localError || statutMutation.error) && <Alert variant="error">{localError ?? getErrorMessage(statutMutation.error)}</Alert>}
              <p className="text-xs text-text-muted">
                Résoudre un signalement ne rend pas la salle disponible : levez l'indisponibilité depuis la page « Indisponibilités ».
              </p>
            </section>
          ) : (
            <p className="border-t border-border pt-4 text-sm text-text-secondary">Ce signalement est clôturé.</p>
          )}
        </div>
      )}
    </Modal>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-text-primary">{value}</dd>
    </div>
  )
}
