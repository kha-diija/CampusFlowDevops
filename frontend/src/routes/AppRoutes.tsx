import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { EtudiantDashboardPage } from '@/pages/etudiant/EtudiantDashboardPage'
import { SallesPage } from '@/pages/etudiant/SallesPage'
import { DisponibilitesPage } from '@/pages/etudiant/DisponibilitesPage'
import { NouvelleReservationPage } from '@/pages/etudiant/NouvelleReservationPage'
import { MesReservationsPage } from '@/pages/etudiant/MesReservationsPage'
import { AnnoncesPage } from '@/pages/etudiant/AnnoncesPage'
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { RoleGuard } from '@/routes/RoleGuard'
import { useAuth } from '@/hooks/useAuth'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function Auth({ children }: { children: ReactNode }) {
  return (
    <PublicOnlyRoute>
      <AuthLayout>{children}</AuthLayout>
    </PublicOnlyRoute>
  )
}

function StudentPage({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>
        <RoleGuard role="ETUDIANT">{children}</RoleGuard>
      </MainLayout>
    </ProtectedRoute>
  )
}

function DashboardByRole() {
  const { user } = useAuth()
  return user?.role === 'ETUDIANT' ? <EtudiantDashboardPage /> : <DashboardPage />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Auth><LoginPage /></Auth>} />
      <Route path="/forgot-password" element={<Auth><ForgotPasswordPage /></Auth>} />
      <Route path="/reset-password" element={<Auth><ResetPasswordPage /></Auth>} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardByRole />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/salles" element={<StudentPage><SallesPage /></StudentPage>} />
      <Route path="/disponibilites" element={<StudentPage><DisponibilitesPage /></StudentPage>} />
      <Route path="/reservations" element={<StudentPage><MesReservationsPage /></StudentPage>} />
      <Route path="/reservations/nouvelle" element={<StudentPage><NouvelleReservationPage /></StudentPage>} />
      <Route path="/annonces" element={<StudentPage><AnnoncesPage /></StudentPage>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}