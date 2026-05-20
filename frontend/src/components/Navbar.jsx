import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'
import { useLocation } from '../context/LocationContext'
import AuthModal from './AuthModal'
import './Navbar.css'

export default function Navbar() {
  const { user, theatreAccess, logout } = useAuth()
  const { setPage } = useNavigation()
  const { locationData, selected, selectRegion, selectSubRegion, selectDetected } = useLocation()

  const [menuOpen,   setMenuOpen]   = useState(false)
  const [authOpen,   setAuthOpen]   = useState(false)
  const [cityOpen,   setCityOpen]   = useState(false)
  const [search,     setSearch]     = useState('')
  const [showOther,  setShowOther]  = useState(false)
  const [detecting,  setDetecting]  = useState(false)
  const cityRef = useRef(null)

  const hasTheatre = theatreAccess?.hasTheatreAccess === true

  // close on outside click
  useEffect(() => {
    const h = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false); setSearch(''); setShowOther(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const topCities   = locationData?.TopCities   || []
  const otherCities = [...(locationData?.OtherCities || [])].sort((a, b) =>
    a.RegionName.localeCompare(b.RegionName)
  )

  const searchLower = search.toLowerCase().trim()

  // when searching: search both top + other + subregions
  const filteredTop = searchLower
    ? topCities.filter(c =>
        c.RegionName.toLowerCase().includes(searchLower) ||
        c.Alias?.some(a => a.toLowerCase().includes(searchLower)) ||
        c.SubRegions?.some(s => s.SubRegionName.toLowerCase().includes(searchLower))
      )
    : topCities

  const filteredOther = searchLower
    ? otherCities.filter(c =>
        c.RegionName.toLowerCase().includes(searchLower) ||
        c.Alias?.some(a => a.toLowerCase().includes(searchLower))
      )
    : otherCities

  // detect location using browser geolocation
  const handleDetect = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const d = await r.json()
          const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || 'Your Location'
          selectDetected(city, latitude, longitude)
        } catch {
          selectDetected('Your Location', latitude, longitude)
        }
        setDetecting(false)
        setCityOpen(false)
      },
      () => setDetecting(false)
    )
  }

  const handleSelectRegion = (region) => {
    selectRegion(region)
    setCityOpen(false); setSearch(''); setShowOther(false)
  }

  const handleSelectSub = (sub, parent) => {
    selectSubRegion(sub, parent)
    setCityOpen(false); setSearch(''); setShowOther(false)
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

          {/* city button */}
          <div className="nav-city-wrap" ref={cityRef}>
            <button className="nav-city" onClick={() => setCityOpen(o => !o)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{selected.regionName}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
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
            <button className="nav-login" onClick={() => setAuthOpen(true)}>Login / Sign Up</button>
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

      {/* city modal — rendered at root level to avoid clipping */}
      {cityOpen && (
        <>
          <div className="city-backdrop" onClick={() => { setCityOpen(false); setSearch(''); setShowOther(false) }} />
          <div className="city-modal" ref={cityRef}>
            <div className="city-search-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input autoFocus className="city-search-input" placeholder="Search for your city"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <button className="city-detect" onClick={handleDetect} disabled={detecting}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
              {detecting ? 'Detecting...' : 'Detect my location'}
            </button>

            <div className="city-hr" />

            {filteredTop.length > 0 && (
              <>
                <p className="city-section-title">Popular Cities</p>
                <div className="city-top-grid">
                  {filteredTop.map(c => {
                    const isActive = selected.regionCode === c.RegionCode && !selected.isSubRegion
                    return (
                      <button key={c.RegionCode}
                        className={`city-top-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleSelectRegion(c)}
                      >
                        <div className="city-top-icon">
                          {c.Image?.NotSelected
                            ? <img src={isActive ? c.Image.Selected : c.Image.NotSelected} alt={c.RegionName} />
                            : <span className="city-top-emoji">🏙️</span>
                          }
                        </div>
                        <span className="city-top-name">{c.RegionName}</span>
                      </button>
                    )
                  })}
                </div>
                {searchLower && filteredTop.map(c =>
                  c.SubRegions?.filter(s => s.SubRegionName.toLowerCase().includes(searchLower))
                    .map(s => (
                      <button key={s.SubRegionCode}
                        className={`city-sub-item ${selected.regionCode === s.SubRegionCode && selected.isSubRegion ? 'active' : ''}`}
                        onClick={() => handleSelectSub(s, c)}
                      >
                        <span className="city-sub-parent">{c.RegionName}</span>
                        <span>›</span>
                        <span className="city-sub-name">{s.SubRegionName}</span>
                      </button>
                    ))
                )}
              </>
            )}

            {(showOther || searchLower) && filteredOther.length > 0 && (
              <>
                <div className="city-hr" />
                <p className="city-section-title">Other Cities</p>
                <div className="city-other-grid">
                  {filteredOther.map(c => (
                    <button key={c.RegionCode}
                      className={`city-other-item ${selected.regionCode === c.RegionCode ? 'active' : ''}`}
                      onClick={() => handleSelectRegion(c)}
                    >
                      {c.RegionName}
                    </button>
                  ))}
                </div>
              </>
            )}

            {!searchLower && (
              <button className="city-toggle-all" onClick={() => setShowOther(o => !o)}>
                {showOther ? 'Hide all cities' : 'View All Cities'}
              </button>
            )}
          </div>
        </>
      )}
    </>
  )
}
