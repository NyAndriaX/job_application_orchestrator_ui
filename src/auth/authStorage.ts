import type { User } from '../types'

const AUTH_STORAGE_KEY = 'jao_auth'

export interface StoredAuthSession {
  user: User
  token?: string | null
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function loadStoredSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredAuthSession
  } catch {
    return null
  }
}

export function saveStoredSession(session: StoredAuthSession) {
  if (!canUseStorage()) return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  if (!canUseStorage()) return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getStoredToken(): string | null {
  return loadStoredSession()?.token ?? null
}
