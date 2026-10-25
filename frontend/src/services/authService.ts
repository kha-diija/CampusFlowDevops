import api from '@/services/api'
import type { ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterRequest, ResetPasswordRequest, User } from '@/types'

export const authService = {
  async register(payload: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/auth/register', payload)
    return response.data
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email: payload.email,
      password: payload.password,
    })

    return response.data
  },

  async forgotPassword(payload: ForgotPasswordRequest) {
    await api.post('/auth/forgot-password', payload)
  },

  async resetPassword(payload: ResetPasswordRequest) {
    await api.post('/auth/reset-password', payload)
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('campusflow-token')
    localStorage.removeItem('campusflow-user')
    sessionStorage.removeItem('campusflow-token')
    sessionStorage.removeItem('campusflow-user')
  },
}
