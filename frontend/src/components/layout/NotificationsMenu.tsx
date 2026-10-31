import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { etudiantService } from '@/services/etudiantService'

const SEEN_KEY = 'campusflow-notif-seen'
const WEEK_MS = 7 * 24 * 3600 * 1000

const readSeen = (): number => {
  const v = Number(localStorage.getItem(SEEN_KEY))
  return Number.isFinite(v) && v > 0 ? v : Date.now() - WEEK_MS
}

const timeOf = (iso: string | null) => (iso ? new Date(iso).getTime() : 0)

export function NotificationsMenu() {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(readSeen)

  const { data } = useQuery({
    queryKey: ['annonces', 'notifications'],
    queryFn: () => etudiantService.getAnnonces(),
    refetchInterval: 60_000,
  })

  const items = (data ?? []).slice(0, 6)
  const unread = (data ?? []).filter((a) => timeOf(a.datePublication) > seen).length

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const toggle = () => {
    if (open) {
      const now = Date.now()
      localStorage.setItem(SEEN_KEY, String(now))
      setSeen(now)
    }
    setOpen((o) => !o)
  }

  return (
    <div ref={ref} className="relative">
      <Button variant="secondary" size="sm" className="relative rounded-full px-3" onClick={toggle} aria-label="Notifications">
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-[var(--surface)] shadow-2xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary">Notifications</p>
            <p className="text-sm font-semibold text-text-primary">Dernières annonces</p>
          </div>

          {items.length === 0 && <p className="px-4 py-6 text-center text-sm text-text-secondary">Aucune annonce.</p>}

          {items.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setOpen(false)
                navigate('/annonces')
              }}
              className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-[var(--surface-alt)]"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${timeOf(a.datePublication) > seen ? 'bg-brand-orange' : 'bg-transparent'}`}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text-primary">{a.titre}</span>
                <span className="block text-xs text-text-secondary">{a.datePublication?.slice(0, 10)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}