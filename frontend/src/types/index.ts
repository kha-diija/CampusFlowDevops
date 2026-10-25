export type Role = 'ETUDIANT' | 'PERSONNEL' | 'PERSONNEL_HABILITE' | 'GESTIONNAIRE_EMPLOI_DU_TEMPS'

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: Role
  actif?: boolean
  autorisePublication?: boolean | null
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  nom: string
  prenom: string
  email: string
  password: string
  numeroEtudiant?: string
  filiere: string
  role?: Role
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface AuthState {
  user: User | null
  token: string | null
}
