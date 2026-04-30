import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <nav className="navbar">
        <a href="#" className="nav-logo">
          Movie<span>Mate</span>
        </a>

        <div className="nav-right">
          <a href="#" className="nav-link">My Bookings</a>

          <div className="nav-city">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Select City</span>
          </div>

          {user ? (
            <div className="nav-user">
              {user.imageUrl
                ? <img src={user.imageUrl} alt={user.firstName} className="nav-avatar" />
                : <div className="nav-avatar-placeholder">{user.firstName?.[0]}</div>
              }
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
        <a href="#" className="side-logo">Movie<span>Mate</span></a>
        <nav className="side-nav">
          <a href="#">Home</a>
          <a href="#">Movies</a>
          <a href="#">My Bookings</a>
          <a href="#">Select City</a>
        </nav>
        {user ? (
          <button className="side-login" onClick={() => { logout(); setMenuOpen(false) }}>
            Logout
          </button>
        ) : (
          <button className="side-login" onClick={() => { setMenuOpen(false); setAuthOpen(true) }}>
            Login / Sign Up
          </button>
        )}
      </div>

      {/* auth modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  )
}
