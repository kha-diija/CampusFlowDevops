// src/lib/apiError.ts
import type { AxiosError } from 'axios'

export function getErrorMessage(error: unknown): string {
  const e = error as AxiosError<{ message?: string }>
  if (e?.code === 'ERR_NETWORK') return 'Impossible de joindre le serveur.'
  return e?.response?.data?.message ?? 'Une erreur est survenue.'
}