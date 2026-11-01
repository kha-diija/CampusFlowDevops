// src/types/etudiant.ts
export type StatutReservation = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'REFUSEE'

export interface Salle {
  id: number
  nom: string
  batiment: string
  capacite: number
  type: string | null
  equipements: string | null
  disponible: boolean | null
}

export interface Reservation {
  id: number
  reference: string
  salleId: number
  salleNom: string
  batiment: string
  date: string
  heureDebut: string
  heureFin: string
  motif: string
  statut: StatutReservation
}

export interface ReservationRequest {
  salleId: number
  date: string
  heureDebut: string
  heureFin: string
  motif: string
}

export interface Annonce {
  id: number
  titre: string
  contenu: string
  datePublication: string | null
  auteur: string
}

export interface DashboardData {
  reservationsAVenir: number
  reservationsSemaine: number
  nouvellesAnnonces: number
  prochainesReservations: Reservation[]
  alaUne: Annonce[]
}

export interface SalleSearch {
  q?: string
  batiment?: string
  capaciteMin?: number
  date?: string
  debut?: string
  fin?: string
  seulementLibres?: boolean
}