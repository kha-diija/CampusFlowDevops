import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/authService'

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères.')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule.')
      .regex(/[0-9]/, 'Le mot de passe doit contenir un chiffre.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [success, setSuccess] = useState(false)
  const hasToken = Boolean(token)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const password = useWatch({ control, name: 'newPassword' })
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)]
  const score = checks.filter(Boolean).length
  const passwordStrength =
    !password
      ? { label: 'Aucune', score: 0 }
      : score <= 1
        ? { label: 'Faible', score }
        : score === 2
          ? { label: 'Moyen', score }
          : { label: 'Fort', score }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!hasToken) {
      setError('root', {
        type: 'manual',
        message: 'Le token de réinitialisation est manquant ou invalide. Vérifiez le lien reçu par e-mail.',
      })
      return
    }

    try {
      await authService.resetPassword({ token, newPassword: values.newPassword })
      setSuccess(true)
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Le lien de réinitialisation est invalide ou expiré.',
      })
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand-orange">
        <ArrowLeft className="h-4 w-4" /> Retour à la connexion
      </Link>

      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary">Sécurité</p>
        <h2 className="mt-2 text-3xl font-extrabold text-text-primary">Nouveau mot de passe</h2>
      </div>

      {errors.root && (
        <Alert variant="error" className="mb-5">
          {errors.root.message}
        </Alert>
      )}

      {!hasToken && !success ? (
        <Alert variant="error" className="mb-5">
          Le token de réinitialisation est manquant ou invalide. Vérifiez le lien reçu par e-mail.
        </Alert>
      ) : null}

      {success ? (
        <div className="space-y-4 rounded-2xl border border-border bg-white/5 p-5">
          <div className="flex items-center gap-3 text-success">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Votre mot de passe a été mis à jour.</span>
          </div>
          <Link to="/login">
            <Button className="w-full">Retour à la connexion</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            {...register('newPassword')}
            error={errors.newPassword?.message}
          />

          <div className="rounded-xl border border-border bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-text-secondary">
              <span>Force du mot de passe</span>
              <span className="font-semibold text-brand-orange">{passwordStrength.label}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-error via-warning to-success transition-all"
                style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
              />
            </div>
            <ul className="mt-3 space-y-1 text-xs text-text-secondary">
              <li>• 8 caractères minimum</li>
              <li>• Au moins une majuscule</li>
              <li>• Au moins un chiffre</li>
            </ul>
          </div>

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting} disabled={!hasToken}>
            Réinitialiser le mot de passe
          </Button>
        </form>
      )}
    </div>
  )
}
