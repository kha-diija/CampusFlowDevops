// src/pages/etudiant/EtudiantDashboardPage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { etudiantService } from '@/services/etudiantService'
import { getErrorMessage } from '@/lib/apiError'
import { formatDateFr, hhmm } from '@/lib/format'
import { StatutBadge } from '@/components/etudiant/StatutBadge'

const pad = (n: number) => String(n).padStart(2, '0')

export function EtudiantDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, error } = useQuery({ queryKey: ['dashboard'], queryFn: etudiantService.getDashboard })

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-brand-gradient p-6 shadow-soft">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Votre campus, en un coup d'œil</p>
        <h2 className="mt-2 text-3xl font-extrabold text-white">Bonjour {user?.prenom}, prêt pour la suite ?</h2>
        <div className="mt-5">
          <Button onClick={() => navigate('/salles')} leftIcon={<Search className="h-4 w-4" />}>
            Rechercher une salle
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Réservations à venir', data.reservationsAVenir],
              ['Cette semaine', data.reservationsSemaine],
              ['Nouvelles annonces', data.nouvellesAnnonces],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-white/5 p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">{label}</p>
                <p className="mt-2 text-4xl font-extrabold text-brand-orange">{pad(Number(value))}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">Vos prochaines réservations</h3>
                <Link to="/reservations" className="text-sm text-brand-orange hover:text-[#ff8b4d]">Voir tout →</Link>
              </div>
              {data.prochainesReservations.length === 0 && (
                <p className="text-sm text-text-secondary">Aucune réservation à venir.</p>
              )}
              {data.prochainesReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0">
                  <div>
                    <p className="font-semibold text-text-primary">{r.salleNom}</p>
                    <p className="text-xs text-text-secondary">
                      {formatDateFr(r.date)} · {hhmm(r.heureDebut)} – {hhmm(r.heureFin)} · {r.motif}
                    </p>
                  </div>
                  <StatutBadge statut={r.statut} />
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-border bg-white/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-primary">À la une</h3>
                <Link to="/annonces" className="text-sm text-brand-orange hover:text-[#ff8b4d]">Toutes →</Link>
              </div>
              {data.alaUne.length === 0 && <p className="text-sm text-text-secondary">Aucune annonce.</p>}
              {data.alaUne.map((a) => (
                <div key={a.id} className="border-t border-border py-3 first:border-t-0">
                  <p className="font-semibold text-text-primary">{a.titre}</p>
                  <p className="text-xs text-text-secondary">{a.datePublication?.slice(0, 10)}</p>
                </div>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  )
}