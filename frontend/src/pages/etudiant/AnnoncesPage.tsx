// src/pages/etudiant/AnnoncesPage.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/etudiant/Field'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { useDebounce } from '@/hooks/useDebounce'
import { etudiantService } from '@/services/etudiantService'
import { getErrorMessage } from '@/lib/apiError'
import { fieldClass } from '@/lib/format'

export function AnnoncesPage() {
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const debouncedQ = useDebounce(q)

  const { data, error, isLoading } = useQuery({
    queryKey: ['annonces', debouncedQ],
    queryFn: () => etudiantService.getAnnonces(debouncedQ),
  })

  return (
    <div>
      <PageHeader eyebrow="Vie universitaire" title="Actualités du campus" subtitle="Annonces publiées par le personnel habilité." />

      <div className="mb-6 max-w-md">
        <Field label="Rechercher">
          <input className={fieldClass} placeholder="Rechercher une annonce" value={q} onChange={(e) => setQ(e.target.value)} />
        </Field>
      </div>

      {error && <Alert variant="error" className="mb-4">{getErrorMessage(error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}
      {data && data.length === 0 && <p className="text-sm text-text-secondary">Aucune annonce publiée.</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((a, i) => {
          const long = a.contenu.length > 140
          const open = openId === a.id
          return (
            <article key={a.id} className="flex flex-col rounded-2xl border border-border bg-white/5 p-5">
              <span className="text-4xl font-extrabold text-brand-orange">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                {a.datePublication?.slice(0, 10)} · {a.auteur}
              </p>
              <h3 className="mt-2 text-lg font-bold text-text-primary">{a.titre}</h3>
              <p className="mt-2 text-sm text-text-secondary">{open || !long ? a.contenu : `${a.contenu.slice(0, 140)}…`}</p>
              {long && (
                <button
                  onClick={() => setOpenId(open ? null : a.id)}
                  className="mt-3 self-start text-sm font-medium text-brand-orange hover:text-[#ff8b4d]"
                >
                  {open ? 'Réduire' : "Lire l'annonce →"}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}