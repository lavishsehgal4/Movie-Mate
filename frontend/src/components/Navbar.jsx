import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'
import AuthModal from './AuthModal'
import './Navbar.css'

const POPULAR_CITIES = [
  { name: 'Mumbai',     emoji: '🏙️' },
  { name: 'Delhi-NCR',  emoji: '🕌' },
  { name: 'Bengaluru',  emoji: '🌆' },
  { name: 'Hyderabad',  emoji: '🏯' },
  { name: 'Chandigarh', emoji: '🌸' },
  { name: 'Ahmedabad',  emoji: '🏛️' },
  { name: 'Pune',       emoji: '🎭' },
  { name: 'Chennai',    emoji: '🏖️' },
  { name: 'Kolkata',    emoji: '🌉' },
  { name: 'Kochi',      emoji: '🌴' },
  { name: 'Jaipur',     emoji: '🏰' },
  { name: 'Lucknow',    emoji: '🕍' },
  { name: 'Surat',      emoji: '💎' },
  { name: 'Indore',     emoji: '🌃' },
  { name: 'Bhopal',     emoji: '🏞️' },
  { name: 'Patna',      emoji: '🌊' },
  { name: 'Nagpur',     emoji: '🍊' },
  { name: 'Visakhapatnam', emoji: '⚓' },
  { name: 'Amritsar',   emoji: '✨' },
  { name: 'Ludhiana',   emoji: '🏭' },
]

export default function Navbar() {
  const { user, theatreAccess, logout } = useAuth()
  const { setPage } = useNavigation()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [authOpen,    setAuthOpen]    = useState(false)
  const [cityOpen,    setCityOpen]    = useState(false)
  const [citySearch,  setCitySearch]  = useState('')
  const [selectedCity, setSelectedCity] = useState('Chandigarh')
  const [showAll,     setShowAll]     = useState(false)
  const cityRef = useRef(null)

  const hasTheatre = theatreAccess?.hasTheatreAccess === true

  // close city dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false)
        setCitySearch('')
        setShowAll(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredCities = POPULAR_CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  const displayCities = showAll ? filteredCities : filteredCities.slice(0, 10)

  const handleSelectCity = (name) => {
    setSelectedCity(name)
    setCityOpen(false)
    setCitySearch('')
    setShowAll(false)
  }

  const handleLogout = async () => { await logout() }

  return (
    <>
      <nav className="navbar">
        <button className="nav-logo" onClick={() => setPage('home')}>
          Movie<span>Mate</span>
        </button>

        <div className="nav-right">
          <button className="nav-link">My Bookings</button>

          {/* city selector */}
          <div className="nav-city-wrap" ref={cityRef}>
            <button className="nav-city" onClick={() => setCityOpen(o => !o)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{selectedCity}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {cityOpen && (
              <div className="city-dropdown">
                {/* search */}
                <div className="city-search-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    autoFocus
                    placeholder="Search for your city"
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    className="city-search-input"
                  />
                </div>

                {/* detect location */}
                <button className="city-detect">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  </svg>
                  Detect my location
                </button>

                <div className="city-divider" />

                {/* popular cities */}
                <p className="city-section-label">Popular Cities</p>
                <div className="city-grid">
                  {displayCities.map(c => (
                    <button
                      key={c.name}
                      className={`city-item ${selectedCity === c.name ? 'active' : ''}`}
                      onClick={() => handleSelectCity(c.name)}
                    >
                      <span className="city-emoji">{c.emoji}</span>
                      <span className="city-name">{c.name}</span>
                    </button>
                  ))}
                </div>

                {!citySearch && !showAll && POPULAR_CITIES.length > 10 && (
                  <button className="city-view-all" onClick={() => setShowAll(true)}>
                    View All Cities
                  </button>
                )}
              </div>
            )}
          </div>

          {user && hasTheatre && (
            <button className="nav-my-theatre" onClick={() => setPage('my-theatre')}>
              🎬 My Theatre
            </button>
          )}

          {user ? (
            <div className="nav-user">
              <button className="nav-avatar-btn" onClick={() => setPage('profile')} aria-label="Open profile">
                {user.imageUrl
                  ? <img src={user.imageUrl} alt={user.firstName} className="nav-avatar" />
                  : <div className="nav-avatar-placeholder">{user.firstName?.[0]}</div>
                }
              </button>
              <span className="nav-username">{user.firstName}</span>
            </div>
          ) : (
            <button className="nav-login" onClick={() => setAuthOpen(true)}>
              Login / Sign Up
            </button>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* side menu */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)}>✕</button>
        <button className="side-logo" onClick={() => { setPage('home'); setMenuOpen(false) }}>Movie<span>Mate</span></button>

        <nav className="side-nav">
          {!user && (
            <button className="side-nav-item side-nav-auth" onClick={() => { setMenuOpen(false); setAuthOpen(true) }}>
              <span className="side-icon">👤</span><span>Login / Sign Up</span>
            </button>
          )}
          {user && (
            <div className="side-user-info">
              {user.imageUrl
                ? <img src={user.imageUrl} alt={user.firstName} className="side-avatar" />
                : <div className="side-avatar-placeholder">{user.firstName?.[0]}</div>
              }
              <span className="side-username">{user.firstName} {user.lastName}</span>
            </div>
          )}
          <div className="side-divider" />
          <button className="side-nav-item" onClick={() => { setPage('home'); setMenuOpen(false) }}>
            <span className="side-icon">🏠</span><span>Home</span>
          </button>
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">🎬</span><span>Movies</span>
          </button>
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">🎟️</span><span>Your Bookings</span>
          </button>
          {user && hasTheatre && (
            <button className="side-nav-item side-nav-theatre" onClick={() => { setPage('my-theatre'); setMenuOpen(false) }}>
              <span className="side-icon">🏟️</span><span>My Theatre</span>
            </button>
          )}
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">🔔</span><span>Notifications</span>
            <span className="side-badge">3</span>
          </button>
          <div className="side-divider" />
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">⚙️</span><span>Account & Settings</span>
          </button>
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">❓</span><span>Help & Support</span>
          </button>
          {user && (
            <>
              <div className="side-divider" />
              <button className="side-nav-item side-nav-logout" onClick={() => { handleLogout(); setMenuOpen(false) }}>
                <span className="side-icon">🚪</span><span>Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}
