import {
  Bell,
  Building2,
  CalendarCheck2,
  CalendarSearch,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Mon espace',
    items: [{ label: "Vue d'ensemble", to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Espaces',
    items: [
      { label: 'Salles', to: '/salles', icon: Building2 },
      { label: 'Disponibilités', to: '/disponibilites', icon: CalendarSearch },
    ],
  },
  {
    title: 'Réservations',
    items: [
      { label: 'Nouvelle réservation', to: '/reservations/nouvelle', icon: Plus },
      { label: 'Mes réservations', to: '/reservations', icon: CalendarCheck2, end: true },
    ],
  },
  {
    title: 'Vie universitaire',
    items: [{ label: 'Annonces', to: '/annonces', icon: Bell }],
  },
]

const ROLE_LABEL: Record<string, string> = {
  ETUDIANT: 'Étudiant',
  PERSONNEL: 'Personnel',
  PERSONNEL_HABILITE: 'Personnel habilité',
  GESTIONNAIRE_EMPLOI_DU_TEMPS: 'Gestionnaire',
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const fullName = user ? `${user.prenom} ${user.nom}` : 'Utilisateur'

  return (
    <aside className="sticky top-0 flex h-screen w-[270px] shrink-0 flex-col overflow-y-auto border-r border-border bg-[#090909] p-4">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-white/5 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-lg font-bold text-white">
          C
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary">CampusFlow</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">ENSA</p>
        </div>
      </div>

      <nav className="space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white/5 text-text-primary ring-1 ring-brand-orange/40'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/30">
                        <Icon className={cn('h-4 w-4', isActive && 'text-brand-orange')} />
                      </span>
                      {label}
                      {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-brand-orange" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <Button variant="secondary" className="w-full justify-between rounded-xl">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Sécurité
          </span>
        </Button>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/5 p-3">
          <Avatar name={fullName} />
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-semibold text-text-primary">{fullName}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-text-secondary">
              {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
            </p>
          </div>
        </div>

        <Button variant="ghost" className="w-full justify-start gap-2 rounded-xl text-text-secondary" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}