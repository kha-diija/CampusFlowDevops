// src/pages/personnel/OccupationsPage.tsx
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { etudiantService } from '@/services/etudiantService'
import { personnelService } from '@/services/personnelService'
import { getErrorMessage } from '@/lib/apiError'
import { fieldClass, hhmm, today } from '@/lib/format'
import {
  DAY_END,
  DAY_START,
  OCCUPATION_LABEL,
  OCCUPATION_STYLE,
  freeWindows,
  toMinutes,
} from '@/lib/occupation'

const HOURS = Array.from({ length: (DAY_END - DAY_START) / 120 + 1 }, (_, i) => DAY_START / 60 + i * 2)
const pct = (min: number) => `${((Math.min(Math.max(min, DAY_START), DAY_END) - DAY_START) / (DAY_END - DAY_START)) * 100}%`

export function OccupationsPage() {
  const [params, setParams] = useSearchParams()
  const salleId = params.get('salleId') ? Number(params.get('salleId')) : undefined
  const date = params.get('date') ?? today()

  const update = (next: { salleId?: string; date?: string }) => {
    const p = new URLSearchParams(params)
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)))
    setParams(p, { replace: true })
  }

  const salles = useQuery({ queryKey: ['salles', 'all'], queryFn: () => etudiantService.getSalles() })
  const salle = salles.data?.find((s) => s.id === salleId)

  const occupations = useQuery({
    queryKey: ['occupations', salleId, date],
    queryFn: () => personnelService.getOccupations(salleId as number, date),
    enabled: salleId !== undefined,
  })

  const libres = useMemo(() => freeWindows(occupations.data ?? []), [occupations.data])

  return (
    <div>
      <PageHeader
        eyebrow="Espaces"
        title="Occupation des salles"
        subtitle="Cours programmés, réservations confirmées et indisponibilités, jour par jour."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Field label="Salle">
          <select className={fieldClass} value={salleId ?? ''} onChange={(e) => update({ salleId: e.target.value })}>
            <option value="">Choisir une salle…</option>
            {salles.data?.map((s) => (
              <option key={s.id} value={s.id}>{s.nom} · Bât. {s.batiment}</option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" className={fieldClass} value={date} onChange={(e) => update({ date: e.target.value })} />
        </Field>
      </div>

      {salles.error && <Alert variant="error" className="mb-4">{getErrorMessage(salles.error)}</Alert>}
      {occupations.error && <Alert variant="error" className="mb-4">{getErrorMessage(occupations.error)}</Alert>}
      {salleId === undefined && <p className="text-sm text-text-secondary">Sélectionnez une salle pour afficher son planning.</p>}
      {occupations.isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}

      {occupations.data && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-white/5 p-5">
            <h2 className="text-lg font-bold text-text-primary">
              {salle?.nom} <span className="text-sm font-normal text-text-secondary">· {date}</span>
            </h2>

            <div className="relative mt-5 h-4 rounded-full bg-white/10" aria-label="Planning de la journée">
              {occupations.data.map((o, i) => (
                <div
                  key={i}
                  title={`${OCCUPATION_LABEL[o.type]} ${hhmm(o.heureDebut)}–${hhmm(o.heureFin)}`}
                  className={`absolute top-0 h-4 rounded-full ${OCCUPATION_STYLE[o.type].bar}`}
                  style={{ left: pct(toMinutes(o.heureDebut)), width: `calc(${pct(toMinutes(o.heureFin))} - ${pct(toMinutes(o.heureDebut))})` }}
                />
              ))}
            </div>
            <div className="relative mt-1 h-4 text-[10px] text-text-muted">
              {HOURS.map((h) => (
                <span key={h} className="absolute -translate-x-1/2" style={{ left: pct(h * 60) }}>{String(h).padStart(2, '0')}h</span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-secondary">
              {(Object.keys(OCCUPATION_LABEL) as (keyof typeof OCCUPATION_LABEL)[]).map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${OCCUPATION_STYLE[t].bar}`} /> {OCCUPATION_LABEL[t]}
                </span>
              ))}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white/5 p-5">
              <h3 className="mb-3 text-lg font-bold text-text-primary">Créneaux occupés</h3>
              {occupations.data.length === 0 && <p className="text-sm text-text-secondary">Aucune occupation ce jour-là.</p>}
              {occupations.data.map((o, i) => (
                <div key={i} className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0">
                  <div>
                    <p className="font-semibold text-text-primary">{hhmm(o.heureDebut)} – {hhmm(o.heureFin)}</p>
                    <p className="text-sm text-text-secondary">{o.libelle}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${OCCUPATION_STYLE[o.type].pill}`}>
                    {OCCUPATION_LABEL[o.type]}
                  </span>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-border bg-white/5 p-5">
              <h3 className="mb-1 text-lg font-bold text-text-primary">Créneaux libres</h3>
              <p className="mb-3 text-xs text-text-secondary">Entre {DAY_START / 60}h et {DAY_END / 60}h</p>
              {libres.length === 0 && <p className="text-sm text-text-secondary">Aucun créneau libre sur cette journée.</p>}
              <div className="flex flex-wrap gap-2">
                {libres.map((w) => (
                  <span key={w.debut} className="rounded-full bg-green-500/15 px-3 py-1.5 text-sm font-semibold text-success">
                    {w.debut} – {w.fin}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}