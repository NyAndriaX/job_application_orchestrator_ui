import { createContext, useCallback, useContext, useState } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'jao_session'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)

  const signIn = useCallback((userData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
