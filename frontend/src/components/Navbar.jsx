import { useState } from 'react'
import './Navbar.css'

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata']

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [city, setCity] = useState('Mumbai')

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <div className="nav-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">CineBook</span>
        </div>

        {/* Search */}
        <div className="nav-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search movies, events..." />
        </div>

        {/* Location */}
        <div className="nav-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <select value={city} onChange={e => setCity(e.target.value)}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Sign In */}
        <button className="nav-signin">Sign In</button>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* Overlay */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      {/* Slide-in Menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <div className="side-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">CineBook</span>
        </div>
        <nav className="side-nav">
          <a href="#">Home</a>
          <a href="#">Movies</a>
          <a href="#">Events</a>
          <a href="#">Plays</a>
          <a href="#">Sports</a>
          <a href="#">My Bookings</a>
        </nav>
        <button className="side-signin">Sign In / Register</button>
      </div>
    </>
  )
}
