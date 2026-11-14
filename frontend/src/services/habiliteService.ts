// src/services/habiliteService.ts
import api from '@/services/api'
import type {
  AnnonceGestion,
  AnnonceRequest,
  DashboardHabilite,
  Indisponibilite,
  IndisponibiliteRequest,
  Signalement,
  SignalementRequest,
  SignalementStatutRequest,
  StatutAnnonce,
} from '@/types/habilite'

export const habiliteService = {
  async getDashboard() {
    return (await api.get<DashboardHabilite>('/dashboard/personnel-habilite')).data
  },

  // Annonces
  async getAnnonces() {
    return (await api.get<AnnonceGestion[]>('/gestion/annonces')).data
  },
  async creerAnnonce(body: AnnonceRequest) {
    return (await api.post<AnnonceGestion>('/gestion/annonces', body)).data
  },
  async modifierAnnonce(id: number, body: AnnonceRequest) {
    return (await api.put<AnnonceGestion>(`/gestion/annonces/${id}`, body)).data
  },
  async changerStatutAnnonce(id: number, statut: StatutAnnonce) {
    return (await api.patch<AnnonceGestion>(`/gestion/annonces/${id}/statut`, { statut })).data
  },

  // Signalements
  async getSignalements() {
    return (await api.get<Signalement[]>('/signalements')).data
  },
  async getSignalement(id: number) {
    return (await api.get<Signalement>(`/signalements/${id}`)).data
  },
  async creerSignalement(body: SignalementRequest) {
    return (await api.post<Signalement>('/signalements', body)).data
  },
  async changerStatutSignalement(id: number, body: SignalementStatutRequest) {
    return (await api.patch<Signalement>(`/signalements/${id}/statut`, body)).data
  },
  async commenterSignalement(id: number, texte: string) {
    return (await api.post<Signalement>(`/signalements/${id}/commentaires`, { texte })).data
  },

  // Indisponibilités
  async getIndisponibilites() {
    return (await api.get<Indisponibilite[]>('/indisponibilites')).data
  },
  async creerIndisponibilite(body: IndisponibiliteRequest) {
    return (await api.post<Indisponibilite>('/indisponibilites', body)).data
  },
  async leverIndisponibilite(id: number) {
    return (await api.patch<Indisponibilite>(`/indisponibilites/${id}/lever`)).data
  },
}
