import axios from 'axios'

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login' }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: { username: string; email?: string; password: string }) => api.post('/auth/register', data),
  login: (username: string, password: string) => api.post<{ access_token: string }>('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
}
export const assetsApi = {
  list: () => api.get('/assets'),
  create: (data: object) => api.post('/assets', data),
  update: (id: number, data: object) => api.put(`/assets/${id}`, data),
  delete: (id: number) => api.delete(`/assets/${id}`),
}
export const liabilitiesApi = {
  list: () => api.get('/liabilities'),
  create: (data: object) => api.post('/liabilities', data),
  update: (id: number, data: object) => api.put(`/liabilities/${id}`, data),
  delete: (id: number) => api.delete(`/liabilities/${id}`),
}
export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
  networthHistory: (days = 180) => api.get(`/dashboard/networth-history?days=${days}`),
  snapshot: () => api.post('/dashboard/snapshot'),
}
export const connectorsApi = {
  list: () => api.get('/connectors'),
  trInit: (phone_number: string) => api.post('/connectors/trade-republic/init', { phone_number }),
  trConfirmOTP: (phone_number: string, otp_code: string) => api.post('/connectors/trade-republic/confirm-otp', { phone_number, otp_code }),
  trSync: () => api.post('/connectors/trade-republic/sync'),
  trDisconnect: () => api.delete('/connectors/trade-republic'),
}
export default api
