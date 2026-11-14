// src/pages/habilite/HabiliteDashboardPage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Bell, Clock, Flag, Megaphone, ShieldAlert } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { SignalementStatutPill } from '@/components/habilite/StatutPill'
import { useAuth } from '@/hooks/useAuth'
import { habiliteService } from '@/services/habiliteService'
import { getErrorMessage } from '@/lib/apiError'
import { TYPE_SIGNALEMENT_LABEL, formatRelativeDateTime } from '@/lib/habilite'

const pad = (n: number) => String(n).padStart(2, '0')

export function HabiliteDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, error } = useQuery({ queryKey: ['habilite', 'dashboard'], queryFn: habiliteService.getDashboard })

  const stats = data && [
    {
      label: 'Signalements en attente',
      value: data.signalementsEnAttente,
      hint: `${data.signalementsEnAttenteDepuisHier} depuis hier`,
      icon: <Flag className="h-5 w-5" />,
      to: '/signalements',
    },
    {
      label: 'En cours de traitement',
      value: data.signalementsEnCours,
      hint:
        data.tempsMoyenTraitementJours === null
          ? 'Temps moyen : —'
          : `Temps moyen : ${data.tempsMoyenTraitementJours.toLocaleString('fr-FR')} j`,
      icon: <Clock className="h-5 w-5" />,
      to: '/signalements',
    },
    {
      label: 'Annonces publiées',
      value: data.annoncesPubliees,
      hint: `${data.annoncesCeMois} ce mois`,
      icon: <Bell className="h-5 w-5" />,
      to: '/gestion/annonces',
    },
    {
      label: 'Indisponibilités actives',
      value: data.indisponibilitesActives,
      hint: 'Salles non réservables',
      icon: <ShieldAlert className="h-5 w-5" />,
      to: '/indisponibilites',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-brand-gradient p-6 shadow-soft">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Pilotage des services</p>
        <h2 className="mt-2 text-3xl font-extrabold text-white">Bonjour {user?.prenom}, voici l'état du campus</h2>
        <p className="mt-1 text-sm text-white/80">Suivez les signalements et les informations à partager avec la communauté.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => navigate('/gestion/annonces?nouveau=1')} leftIcon={<Megaphone className="h-4 w-4" />}>
            Informer le campus
          </Button>
          <Button variant="secondary" className="border-white/40 text-white hover:bg-white/10" onClick={() => navigate('/signalements')} leftIcon={<Flag className="h-4 w-4" />}>
            Voir les signalements
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

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

      {data && (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="rounded-2xl border border-border bg-white/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary">À traiter en priorité</h3>
                <p className="text-xs text-text-secondary">Signalements récents du campus</p>
              </div>
              <Link to="/signalements" className="text-sm text-brand-orange hover:text-[#ff8b4d]">Tous les signalements →</Link>
            </div>

            {data.aTraiter.length === 0 && <p className="text-sm text-text-secondary">Aucun signalement à traiter.</p>}

            {data.aTraiter.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(`/signalements?id=${s.id}`)}
                className="flex w-full items-center justify-between gap-3 border-t border-border py-3 text-left first:border-t-0 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/30 text-brand-orange">
                    <Flag className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">
                      {TYPE_SIGNALEMENT_LABEL[s.type]} <span className="text-xs font-medium text-text-secondary">· {s.salleNom}</span>
                    </p>
                    <p className="text-xs text-text-secondary">{formatRelativeDateTime(s.dateCreation)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SignalementStatutPill statut={s.statut} />
                  <ArrowRight className="h-4 w-4 text-text-secondary" />
                </div>
              </button>
            ))}
          </section>

          <div className="space-y-4">
            {[
              { title: 'Informer le campus', sub: 'Créer ou mettre à jour une annonce', icon: <Bell className="h-5 w-5" />, to: '/gestion/annonces?nouveau=1' },
              { title: 'Gérer les espaces', sub: 'Déclarer une indisponibilité', icon: <ShieldAlert className="h-5 w-5" />, to: '/indisponibilites' },
            ].map((a) => (
              <Link key={a.title} to={a.to} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white/5 p-5 transition-colors hover:border-brand-orange/50">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">{a.icon}</span>
                  <div>
                    <p className="font-bold text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-secondary">{a.sub}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
