import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/authService'

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Veuillez saisir une adresse e-mail valide.'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const [sent, setSent] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const response = await authService.forgotPassword({ email: values.email })
      setSuccessMessage(response.message)
      setSent(true)
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Une erreur est survenue lors de l’envoi.',
      })
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-orange">
        <ArrowLeft className="h-4 w-4" /> Retour à la connexion
      </Link>

      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">Réinitialisation</p>
        <h2 className="mt-2 text-3xl font-extrabold text-text-primary">Mot de passe oublié</h2>
      </div>

      {errors.root && (
        <Alert variant="error" className="mb-5">
          {errors.root.message}
        </Alert>
      )}

      {sent ? (
        <Alert variant="info">{successMessage || 'Si cet e-mail existe, un lien vous a été envoyé.'}</Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="E-mail"
            type="email"
            placeholder="prenom.nom@campusflow.fr"
            icon={<Mail className="h-4 w-4" />}
            {...register('email')}
            error={errors.email?.message}
          />

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Envoyer le lien de réinitialisation
          </Button>
        </form>
      )}
    </div>
  )
}
