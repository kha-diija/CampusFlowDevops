// src/pages/etudiant/DisponibilitesPage.tsx
import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { SalleCard } from '@/components/etudiant/SalleCard'
import { etudiantService } from '@/services/etudiantService'
import { getErrorMessage } from '@/lib/apiError'
import { fieldClass, today } from '@/lib/format'

export function DisponibilitesPage() {
  const [date, setDate] = useState(today())
  const [debut, setDebut] = useState('14:00')
  const [fin, setFin] = useState('16:00')
  const [capaciteMin, setCapaciteMin] = useState('')
  const [periode, setPeriode] = useState<{ date: string; debut: string; fin: string } | null>(null)

  const search = useMutation({
    mutationFn: () =>
      etudiantService.getSalles({
        date, debut, fin,
        capaciteMin: capaciteMin ? Number(capaciteMin) : undefined,
        seulementLibres: true,
      }),
    onSuccess: () => setPeriode({ date, debut, fin }),
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    search.mutate()
  }

  return (
    <div>
      <PageHeader eyebrow="Espaces" title="Rechercher une disponibilité" subtitle="La disponibilité est calculée pour le créneau exact indiqué." />

      <form onSubmit={submit} className="rounded-2xl border border-border bg-white/5 p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Date">
            <input type="date" min={today()} className={fieldClass} value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Heure de début">
            <input type="time" className={fieldClass} value={debut} onChange={(e) => setDebut(e.target.value)} required />
          </Field>
          <Field label="Heure de fin">
            <input type="time" className={fieldClass} value={fin} onChange={(e) => setFin(e.target.value)} required />
          </Field>
          <Field label="Capacité minimale">
            <input type="number" min={1} className={fieldClass} value={capaciteMin} onChange={(e) => setCapaciteMin(e.target.value)} />
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" loading={search.isPending} leftIcon={<Search className="h-4 w-4" />}>
            Voir les disponibilités
          </Button>
        </div>
      </form>

      {search.error && <Alert variant="error" className="mt-4">{getErrorMessage(search.error)}</Alert>}

      {search.data && periode && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-text-primary">
            Salles disponibles <span className="text-sm font-normal text-text-secondary">· {search.data.length} résultat(s)</span>
          </h2>
          {search.data.length === 0 && <p className="mt-3 text-sm text-text-secondary">Aucune salle libre sur ce créneau.</p>}
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {search.data.map((s) => <SalleCard key={s.id} salle={s} periode={periode} />)}
          </div>
        </div>
      )}
    </div>
  )
}