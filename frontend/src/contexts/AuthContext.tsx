import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../lib/api'
import { User } from '../types'

interface AuthContextType { user: User | null; loading: boolean; login: (u: string, p: string) => Promise<void>; logout: () => void; register: (u: string, p: string, e?: string) => Promise<void> }
const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.me().then((r) => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])

  const login = async (username: string, password: string) => {
    const r = await authApi.login(username, password)
    localStorage.setItem('token', r.data.access_token)
    const me = await authApi.me()
    setUser(me.data)
  }
  const logout = () => { localStorage.removeItem('token'); setUser(null) }
  const register = async (username: string, password: string, email?: string) => {
    await authApi.register({ username, password, email })
    await login(username, password)
  }
  return <AuthContext.Provider value={{ user, loading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
