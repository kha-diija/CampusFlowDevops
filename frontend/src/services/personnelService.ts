// src/services/personnelService.ts
import api from '@/services/api'
import type { DashboardPersonnel, Occupation } from '@/types/personnel'

export const personnelService = {
  async getDashboard() {
    return (await api.get<DashboardPersonnel>('/dashboard/personnel')).data
  },
  async getOccupations(salleId: number, date: string) {
    return (await api.get<Occupation[]>(`/salles/${salleId}/occupations`, { params: { date } })).data
  },
}