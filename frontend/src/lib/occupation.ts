// src/lib/occupation.ts
import type { Occupation, TypeOccupation } from '@/types/personnel'

/** Plage horaire affichée dans le planning d'une salle (en minutes depuis minuit). */
export const DAY_START = 8 * 60
export const DAY_END = 20 * 60

const pad = (n: number) => String(n).padStart(2, '0')

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}

export const fromMinutes = (min: number) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`

export const OCCUPATION_LABEL: Record<TypeOccupation, string> = {
  COURS: 'Cours',
  RESERVATION: 'Réservation',
  INDISPONIBILITE: 'Indisponible',
}

export const OCCUPATION_STYLE: Record<TypeOccupation, { bar: string; pill: string }> = {
  COURS: { bar: 'bg-brand-orange', pill: 'bg-brand-orange/15 text-brand-orange' },
  RESERVATION: { bar: 'bg-[#D9C3AB]', pill: 'bg-[#D9C3AB]/15 text-[#D9C3AB]' },
  INDISPONIBILITE: { bar: 'bg-red-500', pill: 'bg-red-500/15 text-[#ff5a52]' },
}

/** Plages libres (≥ 15 min) entre DAY_START et DAY_END, en fusionnant les occupations qui se chevauchent. */
export function freeWindows(occupations: Occupation[]): { debut: string; fin: string }[] {
  const busy = occupations
    .map((o) => ({ d: Math.max(toMinutes(o.heureDebut), DAY_START), f: Math.min(toMinutes(o.heureFin), DAY_END) }))
    .filter((o) => o.f > o.d)
    .sort((a, b) => a.d - b.d)

  const windows: { debut: string; fin: string }[] = []
  let cursor = DAY_START
  for (const o of busy) {
    if (o.d - cursor >= 15) windows.push({ debut: fromMinutes(cursor), fin: fromMinutes(o.d) })
    cursor = Math.max(cursor, o.f)
  }
  if (DAY_END - cursor >= 15) windows.push({ debut: fromMinutes(cursor), fin: fromMinutes(DAY_END) })
  return windows
}