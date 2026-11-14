// src/types/habilite.ts
export type StatutSignalement = 'EN_ATTENTE' | 'EN_COURS' | 'RESOLU' | 'REJETE'
export type TypeSignalement = 'EQUIPEMENT_DEFECTUEUX' | 'SALLE_INUTILISABLE' | 'PROBLEME_DISPONIBILITE' | 'AUTRE'
export type StatutAnnonce = 'BROUILLON' | 'PUBLIEE' | 'ARCHIVEE'
export type StatutIndisponibilite = 'EN_COURS' | 'A_VENIR' | 'TERMINEE' | 'LEVEE'

export interface Commentaire {
  id: number
  texte: string
  auteur: string
  dateCreation: string
}

export interface Signalement {
  id: number
  salleId: number
  salleNom: string
  batiment: string
  type: TypeSignalement
  description: string
  statut: StatutSignalement
  dateCreation: string
  createur: string
  responsable: string | null
  commentaireTraitement: string | null
  motifRejet: string | null
  dateResolution: string | null
  indisponibiliteActive: boolean
  commentaires: Commentaire[]
}

export interface SignalementRequest {
  salleId: number
  type: TypeSignalement
  description: string
}

export interface SignalementStatutRequest {
  statut: StatutSignalement
  commentaire?: string
  motifRejet?: string
}

export interface AnnonceGestion {
  id: number
  titre: string
  contenu: string
  statut: StatutAnnonce
  datePublication: string | null
  dateModification: string | null
  auteur: string
}

export interface AnnonceRequest {
  titre: string
  contenu: string
  statut: StatutAnnonce
  datePublication?: string
}

export interface Indisponibilite {
  id: number
  salleId: number
  salleNom: string
  batiment: string
  dateDebut: string
  dateFin: string
  motif: string
  active: boolean
  statut: StatutIndisponibilite
  signalementId: number | null
  createur: string
  reservationsEnConflit: number
}

export interface IndisponibiliteRequest {
  salleId: number
  dateDebut: string
  dateFin: string
  motif: string
  signalementId?: number
}

export interface DashboardHabilite {
  signalementsEnAttente: number
  signalementsEnAttenteDepuisHier: number
  signalementsEnCours: number
  tempsMoyenTraitementJours: number | null
  annoncesPubliees: number
  annoncesCeMois: number
  indisponibilitesActives: number
  aTraiter: Signalement[]
}
