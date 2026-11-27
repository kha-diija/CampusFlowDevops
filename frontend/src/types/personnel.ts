// src/types/personnel.ts
import type { Annonce } from '@/types/etudiant'

export type TypeOccupation = 'COURS' | 'RESERVATION' | 'INDISPONIBILITE'

export interface Occupation {
  type: TypeOccupation
  date: string
  heureDebut: string
  heureFin: string
  libelle: string
}

export interface DashboardPersonnel {
  totalSalles: number
  sallesLibres: number
  sallesOccupees: number
  coursAujourdhui: number
  nouvellesAnnonces: number
  alaUne: Annonce[]
}