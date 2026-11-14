// src/pages/habilite/GestionAnnoncesPage.tsx
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Archive, Pencil, Plus, Send } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { AnnonceStatutPill } from '@/components/habilite/StatutPill'
import { FilterChips } from '@/components/habilite/FilterChips'
import { habiliteService } from '@/services/habiliteService'
import { getErrorMessage } from '@/lib/apiError'
import { fieldClass } from '@/lib/format'
import { STATUT_ANNONCE_LABEL, formatDateTimeFr, toInputDateTime } from '@/lib/habilite'
import type { AnnonceGestion, StatutAnnonce } from '@/types/habilite'

type Filtre = StatutAnnonce | 'TOUTES'

export function GestionAnnoncesPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [filtre, setFiltre] = useState<Filtre>('TOUTES')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<AnnonceGestion | null>(null)
  const creating = params.get('nouveau') === '1'

  const { data, error, isLoading } = useQuery({ queryKey: ['habilite', 'annonces'], queryFn: habiliteService.getAnnonces })

  const statutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: StatutAnnonce }) => habiliteService.changerStatutAnnonce(id, statut),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habilite'] }),
  })

  const needle = q.trim().toLowerCase()
  const visibles = (data ?? [])
    .filter((a) => filtre === 'TOUTES' || a.statut === filtre)
    .filter((a) => !needle || a.titre.toLowerCase().includes(needle) || a.contenu.toLowerCase().includes(needle))
  const count = (s: StatutAnnonce) => (data ?? []).filter((a) => a.statut === s).length

  const closeForm = () => {
    setEditing(null)
    if (creating) setParams({}, { replace: true })
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader eyebrow="Administration" title="Gestion des annonces" subtitle="Rédigez, publiez et archivez les informations destinées au campus." />
        <Button onClick={() => setParams({ nouveau: '1' })} leftIcon={<Plus className="h-4 w-4" />}>
          Nouvelle annonce
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <FilterChips<Filtre>
          value={filtre}
          onChange={setFiltre}
          options={[
            { value: 'TOUTES', label: 'Toutes', count: data?.length },
            { value: 'PUBLIEE', label: 'Publiées', count: count('PUBLIEE') },
            { value: 'BROUILLON', label: 'Brouillons', count: count('BROUILLON') },
            { value: 'ARCHIVEE', label: 'Archivées', count: count('ARCHIVEE') },
          ]}
        />
        <div className="w-full max-w-xs">
          <Field label="Rechercher">
            <input className={fieldClass} placeholder="Titre ou contenu" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-4">{getErrorMessage(error)}</Alert>}
      {statutMutation.error && <Alert variant="error" className="mb-4">{getErrorMessage(statutMutation.error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}
      {data && visibles.length === 0 && <p className="text-sm text-text-secondary">Aucune annonce.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibles.map((a) => (
          <article key={a.id} className="flex flex-col rounded-2xl border border-border bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <AnnonceStatutPill statut={a.statut} />
              <button
                type="button"
                onClick={() => setEditing(a)}
                className="rounded-full p-2 text-text-secondary hover:bg-white/5 hover:text-text-primary"
                aria-label={`Modifier ${a.titre}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              {a.datePublication ? formatDateTimeFr(a.datePublication) : 'Non publiée'} · {a.auteur}
            </p>
            <h3 className="mt-2 text-lg font-bold text-text-primary">{a.titre}</h3>
            <p className="mt-2 line-clamp-4 text-sm text-text-secondary">{a.contenu}</p>

            <div className="mt-auto flex gap-2 pt-4">
              {a.statut !== 'PUBLIEE' && (
                <Button size="sm" leftIcon={<Send className="h-3.5 w-3.5" />} loading={statutMutation.isPending && statutMutation.variables?.id === a.id}
                  onClick={() => statutMutation.mutate({ id: a.id, statut: 'PUBLIEE' })}>
                  {a.statut === 'ARCHIVEE' ? 'Republier' : 'Publier'}
                </Button>
              )}
              {a.statut === 'PUBLIEE' && (
                <Button size="sm" variant="secondary" leftIcon={<Archive className="h-3.5 w-3.5" />} loading={statutMutation.isPending && statutMutation.variables?.id === a.id}
                  onClick={() => statutMutation.mutate({ id: a.id, statut: 'ARCHIVEE' })}>
                  Archiver
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>

      <AnnonceFormModal key={editing?.id ?? (creating ? 'new' : 'closed')} open={creating || editing !== null} annonce={editing} onClose={closeForm} />
    </div>
  )
}

function AnnonceFormModal({ open, annonce, onClose }: { open: boolean; annonce: AnnonceGestion | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [titre, setTitre] = useState(annonce?.titre ?? '')
  const [contenu, setContenu] = useState(annonce?.contenu ?? '')
  const [statut, setStatut] = useState<StatutAnnonce>(annonce?.statut ?? 'PUBLIEE')
  const [datePublication, setDatePublication] = useState(annonce?.datePublication?.slice(0, 16) ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: () => {
      const body = { titre: titre.trim(), contenu: contenu.trim(), statut, datePublication: datePublication || undefined }
      return annonce ? habiliteService.modifierAnnonce(annonce.id, body) : habiliteService.creerAnnonce(body)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['habilite'] })
      onClose()
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!titre.trim() || !contenu.trim()) {
      setLocalError('Le titre et la description sont obligatoires.')
      return
    }
    setLocalError(null)
    save.mutate()
  }

  return (
    <Modal isOpen={open} onClose={onClose} title={annonce ? "Modifier l'annonce" : 'Nouvelle annonce'} className="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Titre">
          <input className={fieldClass} value={titre} maxLength={255} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Ouverture des inscriptions" />
        </Field>
        <Field label="Description">
          <textarea className={`${fieldClass} min-h-[140px]`} value={contenu} maxLength={5000} onChange={(e) => setContenu(e.target.value)} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Statut">
            <select className={fieldClass} value={statut} onChange={(e) => setStatut(e.target.value as StatutAnnonce)}>
              {(Object.keys(STATUT_ANNONCE_LABEL) as StatutAnnonce[]).map((s) => (
                <option key={s} value={s}>{STATUT_ANNONCE_LABEL[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="Date de publication">
            <input type="datetime-local" className={fieldClass} value={datePublication} max={toInputDateTime(new Date())} onChange={(e) => setDatePublication(e.target.value)} />
          </Field>
        </div>
        <p className="text-xs text-text-secondary">Laissez la date vide pour publier immédiatement. Seules les annonces « Publiée » sont visibles par les étudiants.</p>

        {(localError || save.error) && <Alert variant="error">{localError ?? getErrorMessage(save.error)}</Alert>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" loading={save.isPending}>{annonce ? 'Enregistrer' : 'Créer'}</Button>
        </div>
      </form>
    </Modal>
  )
}
