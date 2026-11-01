// src/components/etudiant/SalleCard.tsx
import { MapPin, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TYPE_SALLE_LABEL } from '@/lib/format'
import type { Salle } from '@/types/etudiant'

interface Props {
  salle: Salle
  periode?: { date: string; debut: string; fin: string }
}

export function SalleCard({ salle, periode }: Props) {
  const navigate = useNavigate()

  const reserver = () => {
    const params = new URLSearchParams({ salleId: String(salle.id), ...(periode ?? {}) })
    navigate(`/reservations/nouvelle?${params.toString()}`)
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">{salle.nom}</h3>
        {salle.disponible !== null && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              salle.disponible ? 'bg-green-500/15 text-success' : 'bg-red-500/15 text-[#ff5a52]'
            }`}
          >
            ● {salle.disponible ? 'Libre' : 'Occupée'}
          </span>
        )}
      </div>

      <p className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
        <MapPin className="h-4 w-4" /> Bâtiment {salle.batiment}
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
        <Users className="h-4 w-4" /> {salle.capacite} places · {TYPE_SALLE_LABEL[salle.type ?? ''] ?? salle.type}
      </p>
      {salle.equipements && <p className="mt-1 text-xs text-text-muted">{salle.equipements}</p>}

      <div className="mt-5">
        <Button size="sm" onClick={reserver} disabled={salle.disponible === false}>
          Réserver
        </Button>
      </div>
    </div>
  )
}