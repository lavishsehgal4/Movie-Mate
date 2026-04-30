import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'
import AuthModal from './AuthModal'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { setPage } = useNavigation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <nav className="navbar">
        <button className="nav-logo" onClick={() => setPage('home')}>
          Movie<span>Mate</span>
        </button>

        <div className="nav-right">
          <button className="nav-link" onClick={() => {}}>My Bookings</button>

          <div className="nav-city">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Select City</span>
          </div>

          {user ? (
            <div className="nav-user">
              <button className="nav-avatar-btn" onClick={() => setPage('profile')} aria-label="Open profile">
                {user.imageUrl
                  ? <img src={user.imageUrl} alt={user.firstName} className="nav-avatar" />
                  : <div className="nav-avatar-placeholder">{user.firstName?.[0]}</div>
                }
              </button>
              <span className="nav-username">{user.firstName}</span>
              <button className="nav-logout" onClick={logout}>Logout</button>
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
          {/* account section — show login/signup if not logged in */}
          {!user && (
            <button
              className="side-nav-item side-nav-auth"
              onClick={() => { setMenuOpen(false); setAuthOpen(true) }}
            >
              <span className="side-icon">👤</span>
              <span>Login / Sign Up</span>
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
            <span className="side-icon">🏠</span>
            <span>Home</span>
          </button>
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">🎬</span>
            <span>Movies</span>
          </button>
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">🎟️</span>
            <span>Your Bookings</span>
          </button>
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">🔔</span>
            <span>Notifications</span>
            <span className="side-badge">3</span>
          </button>

          <div className="side-divider" />

          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">⚙️</span>
            <span>Account & Settings</span>
          </button>
          <button className="side-nav-item" onClick={() => setMenuOpen(false)}>
            <span className="side-icon">❓</span>
            <span>Help & Support</span>
          </button>

          {user && (
            <>
              <div className="side-divider" />
              <button
                className="side-nav-item side-nav-logout"
                onClick={() => { logout(); setMenuOpen(false) }}
              >
                <span className="side-icon">🚪</span>
                <span>Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* auth modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}
