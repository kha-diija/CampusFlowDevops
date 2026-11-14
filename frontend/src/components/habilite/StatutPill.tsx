// src/components/habilite/StatutPill.tsx
import { cn } from '@/lib/utils'
import {
  STATUT_ANNONCE_LABEL,
  STATUT_INDISPONIBILITE_LABEL,
  STATUT_SIGNALEMENT_LABEL,
} from '@/lib/habilite'
import type { StatutAnnonce, StatutIndisponibilite, StatutSignalement } from '@/types/habilite'

const TONES = {
  success: 'bg-green-500/15 text-success',
  warning: 'bg-orange-500/15 text-warning',
  danger: 'bg-red-500/15 text-[#ff5a52]',
  neutral: 'bg-white/10 text-text-muted',
} as const

function Pill({ tone, label }: { tone: keyof typeof TONES; label: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', TONES[tone])}>
      ● {label}
    </span>
  )
}

const SIGNALEMENT_TONE: Record<StatutSignalement, keyof typeof TONES> = {
  EN_ATTENTE: 'warning',
  EN_COURS: 'warning',
  RESOLU: 'success',
  REJETE: 'neutral',
}

export function SignalementStatutPill({ statut }: { statut: StatutSignalement }) {
  return <Pill tone={SIGNALEMENT_TONE[statut]} label={STATUT_SIGNALEMENT_LABEL[statut]} />
}

const ANNONCE_TONE: Record<StatutAnnonce, keyof typeof TONES> = {
  PUBLIEE: 'success',
  BROUILLON: 'warning',
  ARCHIVEE: 'neutral',
}

export function AnnonceStatutPill({ statut }: { statut: StatutAnnonce }) {
  return <Pill tone={ANNONCE_TONE[statut]} label={STATUT_ANNONCE_LABEL[statut]} />
}

const INDISPO_TONE: Record<StatutIndisponibilite, keyof typeof TONES> = {
  EN_COURS: 'danger',
  A_VENIR: 'warning',
  TERMINEE: 'neutral',
  LEVEE: 'success',
}

export function IndisponibiliteStatutPill({ statut }: { statut: StatutIndisponibilite }) {
  return <Pill tone={INDISPO_TONE[statut]} label={STATUT_INDISPONIBILITE_LABEL[statut]} />
}
