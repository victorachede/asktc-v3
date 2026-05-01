import { useCallback, useState } from 'react'

interface SessionData {
  [key: string]: any
}

export function useSessionPersist<T extends SessionData>(
  sessionKey: string,
  initialState: T,
): [T, (data: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialState
    try {
      const stored = localStorage.getItem(`session_${sessionKey}`)
      if (!stored) return initialState
      const parsed = JSON.parse(stored)
      // Auto-expire after 24 hours
      if (parsed._timestamp && Date.now() - parsed._timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`session_${sessionKey}`)
        return initialState
      }
      const { _timestamp, ...rest } = parsed
      return rest as T
    } catch {
      return initialState
    }
  })

  const saveState = useCallback((data: T) => {
    setState(data)
    try {
      localStorage.setItem(`session_${sessionKey}`, JSON.stringify({ ...data, _timestamp: Date.now() }))
    } catch (err) {
      console.warn(`Failed to persist session data for ${sessionKey}:`, err)
    }
  }, [sessionKey])

  return [state, saveState]
}
