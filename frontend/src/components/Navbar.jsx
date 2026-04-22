import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          {/* Logo */}
          <a href="#" className="nav-logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-name">Cinemark</span>
          </a>

          {/* Nav Links */}
          <ul className="nav-links">
            <li><a href="#" className="active">Movies</a></li>
            <li><a href="#">Cinemas</a></li>
            <li><a href="#">Offers</a></li>
            <li><a href="#">Profile</a></li>
          </ul>

          {/* Search */}
          <div className="nav-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search" />
          </div>

          {/* Login */}
          <button className="nav-login">Login</button>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Slide-in menu */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)}>✕</button>
        <a href="#" className="nav-logo" style={{ marginBottom: 24 }}>
          <span className="logo-icon">🎬</span>
          <span className="logo-name">Cinemark</span>
        </a>
        <nav className="side-nav">
          <a href="#">Movies</a>
          <a href="#">Cinemas</a>
          <a href="#">Offers</a>
          <a href="#">Profile</a>
          <a href="#">My Bookings</a>
        </nav>
        <button className="side-login">Login / Register</button>
      </div>
    </>
  )
}
