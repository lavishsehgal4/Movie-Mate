import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mm_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [authLoading, setAuthLoading] = useState(true)

  // On mount: try to restore session from cookie (handles Google OAuth redirect)
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch('http://localhost:5000/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
        if (!res.ok) throw new Error('not authenticated')
        const data = await res.json()
        if (data.success && data.data) {
          setUser(data.data)
          localStorage.setItem('mm_user', JSON.stringify(data.data))
        }
      } catch {
        // not logged in — leave user as null
      } finally {
        setAuthLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('mm_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mm_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
