import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'mm_user'
const THEATRE_KEY = 'mm_theatre_access'

function readSession()   { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY))  } catch { return null } }
function writeSession(d) { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(d))  } catch {} }
function readTheatre()   { try { return JSON.parse(sessionStorage.getItem(THEATRE_KEY))  } catch { return null } }
function writeTheatre(d) { try { sessionStorage.setItem(THEATRE_KEY, JSON.stringify(d))  } catch {} }
function clearSession()  { try { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(THEATRE_KEY) } catch {} }

async function fetchHasAccess() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/theatre/has-access', { credentials: 'include' })
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) return null
    const data = await res.json()
    return data.success ? data.data : null
  } catch { return null }
}

async function fetchMe() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/me', { credentials: 'include' })
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) return null
    const data = await res.json()
    return data.success ? data.data : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(() => readSession())
  const [theatreAccess, setTheatreAccess] = useState(() => readTheatre())
  const [authLoading,   setAuthLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const cached = readSession()

      if (cached) {
        // sessionStorage has data — user already known, skip /auth/me
        // still check theatre access if not cached
        if (!readTheatre()) {
          const access = await fetchHasAccess()
          if (!cancelled && access !== null) {
            setTheatreAccess(access)
            writeTheatre(access)
          }
        }
        if (!cancelled) setAuthLoading(false)
        return
      }

      // no sessionStorage data — could be Google OAuth redirect or fresh load
      // call /auth/me to check if cookie exists
      const me = await fetchMe()
      if (cancelled) return

      if (me) {
        // cookie valid — restore user
        setUser(me)
        writeSession(me)

        // now fetch has-access
        const access = await fetchHasAccess()
        if (!cancelled && access !== null) {
          setTheatreAccess(access)
          writeTheatre(access)
        }
      } else {
        // not logged in
        setUser(null)
        clearSession()
      }

      if (!cancelled) setAuthLoading(false)
    }

    init()
    return () => { cancelled = true }
  }, [])

  // Login: store user, then call has-access
  const login = async (userData) => {
    setUser(userData)
    writeSession(userData)
    const access = await fetchHasAccess()
    if (access !== null) {
      setTheatreAccess(access)
      writeTheatre(access)
    }
  }

  // Logout: call API, clear everything
  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    setUser(null)
    setTheatreAccess(null)
    clearSession()
  }

  return (
    <AuthContext.Provider value={{ user, setUser, theatreAccess, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
