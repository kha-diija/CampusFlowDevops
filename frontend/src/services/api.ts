import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const getStoredToken = () => {
  const localToken = localStorage.getItem('campusflow-token')
  if (localToken) {
    return localToken
  }

  return sessionStorage.getItem('campusflow-token')
}

const clearStoredAuth = () => {
  localStorage.removeItem('campusflow-token')
  localStorage.removeItem('campusflow-user')
  sessionStorage.removeItem('campusflow-token')
  sessionStorage.removeItem('campusflow-user')
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken()

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const requestUrl = error.config?.url ?? ''
    const isLoginRequest = requestUrl.includes('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      clearStoredAuth()
      window.location.assign('/login')
    }

    return Promise.reject(error)
  },
)

export default api
