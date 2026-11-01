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
import { fieldClass } from '@/lib/format'

export function SallesPage() {
  const [q, setQ] = useState('')
  const [batiment, setBatiment] = useState('')
  const [capaciteMin, setCapaciteMin] = useState('')
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

  return (
    <div>
      <PageHeader eyebrow="Espaces" title="Explorer les salles" subtitle="Trouvez l'espace adapté à votre activité." />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
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
      </div>

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}
      {data && data.length === 0 && <p className="text-sm text-text-secondary">Aucune salle trouvée.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((s) => <SalleCard key={s.id} salle={s} />)}
      </div>
    </div>
  )
}