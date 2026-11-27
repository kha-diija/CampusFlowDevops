// src/pages/personnel/PersonnelDashboardPage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Bell, Building2, CalendarClock, CalendarSearch, DoorClosed, DoorOpen } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/hooks/useAuth'
import { personnelService } from '@/services/personnelService'
import { getErrorMessage } from '@/lib/apiError'

const pad = (n: number) => String(n).padStart(2, '0')

export function PersonnelDashboardPage() {
  const { user } = useAuth()
  const { data, error, isLoading } = useQuery({
    queryKey: ['personnel', 'dashboard'],
    queryFn: personnelService.getDashboard,
  })

  const stats = data && [
    { label: 'Salles libres', value: data.sallesLibres, hint: `sur ${data.totalSalles} salles`, icon: <DoorOpen className="h-5 w-5" />, to: '/disponibilites' },
    { label: 'Salles occupées', value: data.sallesOccupees, hint: 'en ce moment', icon: <DoorClosed className="h-5 w-5" />, to: '/occupations' },
    { label: 'Cours aujourd\'hui', value: data.coursAujourdhui, hint: 'créneaux programmés', icon: <CalendarClock className="h-5 w-5" />, to: '/occupations' },
    { label: 'Nouvelles annonces', value: data.nouvellesAnnonces, hint: '7 derniers jours', icon: <Bell className="h-5 w-5" />, to: '/annonces' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-brand-gradient p-6 shadow-soft">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Espace personnel</p>
        <h2 className="mt-2 text-3xl font-extrabold text-white">Bonjour {user?.prenom}, voici l'état du campus</h2>
        <p className="mt-1 text-sm text-white/80">Consultez les salles, leurs disponibilités et les annonces publiées.</p>
      </div>

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} to={s.to} className="rounded-2xl border border-border bg-white/5 p-5 transition-colors hover:border-brand-orange/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">{s.icon}</div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-text-secondary">{s.label}</p>
              <div className="mt-1 flex items-end gap-3">
                <span className="text-4xl font-extrabold text-brand-orange">{pad(s.value)}</span>
                <span className="pb-1 text-xs text-text-secondary">{s.hint}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-border bg-white/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary">À la une</h3>
              <p className="text-xs text-text-secondary">Dernières annonces publiées</p>
            </div>
            <Link to="/annonces" className="text-sm text-brand-orange hover:text-[#ff8b4d]">Toutes les annonces →</Link>
          </div>
          {data && data.alaUne.length === 0 && <p className="text-sm text-text-secondary">Aucune annonce publiée.</p>}
          {data?.alaUne.map((a) => (
            <article key={a.id} className="border-t border-border py-3 first:border-t-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">{a.datePublication?.slice(0, 10)} · {a.auteur}</p>
              <h4 className="mt-1 font-semibold text-text-primary">{a.titre}</h4>
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{a.contenu}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-white/5 p-5">
          <h3 className="mb-3 text-lg font-bold text-text-primary">Accès rapide</h3>
          <div className="space-y-2">
            {[
              { to: '/salles', label: 'Explorer les salles', icon: Building2 },
              { to: '/disponibilites', label: 'Rechercher une disponibilité', icon: CalendarSearch },
              { to: '/occupations', label: 'Occupation d\'une salle', icon: CalendarClock },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 rounded-xl border border-border px-3 py-3 text-sm font-medium text-text-primary transition-colors hover:border-brand-orange/50 hover:bg-white/5">
                <Icon className="h-4 w-4 text-brand-orange" /> {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}