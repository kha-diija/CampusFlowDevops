// src/services/etudiantService.ts
import api from '@/services/api'
import type {
  Annonce,
  DashboardData,
  Reservation,
  ReservationRequest,
  Salle,
  SalleSearch,
} from '@/types/etudiant'

const clean = <T extends object>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null))

export const etudiantService = {
  async getDashboard() {
    return (await api.get<DashboardData>('/dashboard/etudiant')).data
  },
  async getSalles(params: SalleSearch = {}) {
    return (await api.get<Salle[]>('/salles', { params: clean(params) })).data
  },
  async getMesReservations() {
    return (await api.get<Reservation[]>('/reservations/mes')).data
  },
  async creerReservation(body: ReservationRequest) {
    return (await api.post<Reservation>('/reservations', body)).data
  },
  async annulerReservation(id: number) {
    return (await api.patch<Reservation>(`/reservations/${id}/annuler`)).data
  },
  async getAnnonces(q?: string) {
    return (await api.get<Annonce[]>('/annonces', { params: clean({ q }) })).data
  },
}