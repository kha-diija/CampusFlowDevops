import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

const TITLES: Record<string, string> = {
  '/dashboard': 'Vue d\'ensemble',
  '/salles': 'Salles',
  '/disponibilites': 'Disponibilités',
  '/reservations': 'Mes réservations',
  '/reservations/nouvelle': 'Nouvelle réservation',
  '/annonces': 'Annonces',
}

export function MainLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-bg text-text-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={TITLES[pathname] ?? 'CampusFlow'} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}