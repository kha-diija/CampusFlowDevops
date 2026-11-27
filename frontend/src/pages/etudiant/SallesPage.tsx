// src/pages/etudiant/SallesPage.tsx
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { SalleCard } from '@/components/etudiant/SalleCard'
import { useDebounce } from '@/hooks/useDebounce'
import { etudiantService } from '@/services/etudiantService'
import { getErrorMessage } from '@/lib/apiError'
import { TYPE_SALLE_LABEL, fieldClass } from '@/lib/format'

export function SallesPage() {
  const [q, setQ] = useState('')
  const [batiment, setBatiment] = useState('')
  const [capaciteMin, setCapaciteMin] = useState('')
  const [type, setType] = useState('')
  const [equipement, setEquipement] = useState('')
  const debouncedQ = useDebounce(q)

  const all = useQuery({ queryKey: ['salles', 'all'], queryFn: () => etudiantService.getSalles() })
  const batiments = useMemo(() => [...new Set((all.data ?? []).map((s) => s.batiment))].sort(), [all.data])

  const { data, error, isLoading } = useQuery({
    queryKey: ['salles', debouncedQ, batiment, capaciteMin],
    queryFn: () =>
      etudiantService.getSalles({
        q: debouncedQ,
        batiment,
        capaciteMin: capaciteMin ? Number(capaciteMin) : undefined,
      }),
  })

  const salles = useMemo(() => {
    const needle = equipement.trim().toLowerCase()
    return (data ?? []).filter(
      (s) => (!type || s.type === type) && (!needle || (s.equipements ?? '').toLowerCase().includes(needle)),
    )
  }, [data, type, equipement])

  const reset = () => {
    setQ('')
    setBatiment('')
    setCapaciteMin('')
    setType('')
    setEquipement('')
  }

  return (
    <div>
      <PageHeader eyebrow="Espaces" title="Explorer les salles" subtitle="Trouvez l'espace adapté à votre activité." />

      <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Field label="Nom de salle">
          <input className={fieldClass} placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
        <Field label="Capacité minimale">
          <select className={fieldClass} value={capaciteMin} onChange={(e) => setCapaciteMin(e.target.value)}>
            <option value="">Toutes les capacités</option>
            <option value="10">10+ places</option>
            <option value="30">30+ places</option>
            <option value="100">100+ places</option>
          </select>
        </Field>
        <Field label="Bâtiment">
          <select className={fieldClass} value={batiment} onChange={(e) => setBatiment(e.target.value)}>
            <option value="">Tous les bâtiments</option>
            {batiments.map((b) => (
              <option key={b} value={b}>Bâtiment {b}</option>
            ))}
          </select>
        </Field>
        <Field label="Type de salle">
          <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tous les types</option>
            {Object.entries(TYPE_SALLE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Équipement">
          <input className={fieldClass} placeholder="Ex. vidéoprojecteur" value={equipement} onChange={(e) => setEquipement(e.target.value)} />
        </Field>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-text-secondary">
        <span>{salles.length} salle(s)</span>
        <button type="button" onClick={reset} className="font-medium text-brand-orange hover:text-[#ff8b4d]">
          Réinitialiser les filtres
        </button>
      </div>

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}
      {data && salles.length === 0 && <p className="text-sm text-text-secondary">Aucune salle trouvée.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {salles.map((s) => <SalleCard key={s.id} salle={s} />)}
      </div>
    </div>
  )
}