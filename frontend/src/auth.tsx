import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, clearToken, currentUserId, setToken, setUnauthorizedHandler } from './api'

type AuthState = {
  userId: number | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(currentUserId())

  const logout = () => {
    clearToken()
    setUserId(null)
  }

  // If any request comes back 401 (e.g. the token expired), log out
  useEffect(() => setUnauthorizedHandler(logout), [])

  const login = async (email: string, password: string) => {
    const { access_token } = await api.login(email, password)
    setToken(access_token)
    setUserId(currentUserId())
  }

  return <AuthContext.Provider value={{ userId, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
