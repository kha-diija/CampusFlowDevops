// src/pages/ProfilPage.tsx
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader } from '@/components/etudiant/PageHeader'
import { authService } from '@/services/authService'
import { getErrorMessage } from '@/lib/apiError'
import { ROLE_LABEL, formatDateFr } from '@/lib/format'

export function ProfilPage() {
  const { data: user, error, isLoading } = useQuery({ queryKey: ['me'], queryFn: authService.getCurrentUser })

  const rows = user && [
    ['Nom', user.nom],
    ['Prénom', user.prenom],
    ['Adresse e-mail', user.email],
    ['Rôle', ROLE_LABEL[user.role] ?? user.role],
    ['Statut du compte', user.actif === false ? 'Inactif' : 'Actif'],
    ['Membre depuis', user.dateCreation ? formatDateFr(user.dateCreation.slice(0, 10)) : '—'],
  ]

  return (
    <div>
      <PageHeader eyebrow="Mon espace" title="Mon compte" subtitle="Informations liées à votre compte CampusFlow." />

      {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <p className="text-sm text-text-secondary">Chargement…</p>}

      {user && rows && (
        <section className="max-w-2xl rounded-2xl border border-border bg-white/5 p-6">
          <div className="mb-5 flex items-center gap-4">
            <Avatar name={`${user.prenom} ${user.nom}`} />
            <div>
              <p className="text-lg font-bold text-text-primary">{user.prenom} {user.nom}</p>
              <p className="text-sm text-text-secondary">{ROLE_LABEL[user.role] ?? user.role}</p>
            </div>
          </div>
          <dl>
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-t border-border py-3 text-sm">
                <dt className="text-text-secondary">{label}</dt>
                <dd className="font-medium text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}