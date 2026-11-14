// src/lib/habilite.ts
import type { StatutAnnonce, StatutIndisponibilite, StatutSignalement, TypeSignalement } from '@/types/habilite'

export const TYPE_SIGNALEMENT_LABEL: Record<TypeSignalement, string> = {
  EQUIPEMENT_DEFECTUEUX: 'Équipement défectueux',
  SALLE_INUTILISABLE: 'Salle inutilisable',
  PROBLEME_DISPONIBILITE: 'Problème de disponibilité',
  AUTRE: 'Autre problème',
}

export const STATUT_SIGNALEMENT_LABEL: Record<StatutSignalement, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  REJETE: 'Rejeté',
}

export const STATUT_ANNONCE_LABEL: Record<StatutAnnonce, string> = {
  BROUILLON: 'Brouillon',
  PUBLIEE: 'Publiée',
  ARCHIVEE: 'Archivée',
}

export const STATUT_INDISPONIBILITE_LABEL: Record<StatutIndisponibilite, string> = {
  EN_COURS: 'En cours',
  A_VENIR: 'À venir',
  TERMINEE: 'Terminée',
  LEVEE: 'Levée',
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Valeur compatible avec <input type="datetime-local">. */
export const toInputDateTime = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

export const formatDateTimeFr = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** « Aujourd'hui · 09:42 », « Hier · 16:18 » ou « 16 juin · 11:03 ». */
export const formatRelativeDateTime = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000)
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (days === 0) return `Aujourd'hui · ${time}`
  if (days === 1) return `Hier · ${time}`
  return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · ${time}`
}
