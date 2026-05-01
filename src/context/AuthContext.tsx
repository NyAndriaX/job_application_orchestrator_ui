import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { User } from '../types'
import { clearStoredSession, loadStoredSession, saveStoredSession } from '../auth/authStorage'

interface AuthContextValue {
  user: User | null
  token: string | null
  signIn: (userData: User, token?: string | null) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(loadStoredSession)
  const user = session?.user ?? null
  const token = session?.token ?? null

  const signIn = useCallback((userData: User, nextToken?: string | null) => {
    const nextSession = { user: userData, token: nextToken }
    saveStoredSession(nextSession)
    setSession(nextSession)
  }, [])

  const signOut = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  return <AuthContext.Provider value={{ user, token, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
