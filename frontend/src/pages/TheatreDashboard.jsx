import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import MoviesPanel from './theatre/MoviesPanel'
import './TheatreDashboard.css'

const SIDEBAR_SECTIONS = [
  {
    label: 'DASHBOARD',
    items: [
      { id: 'overview', icon: '⊞', label: 'Overview' },
    ],
  },
  {
    label: 'MOVIES & SHOWS',
    items: [
      { id: 'movies',        icon: '⊟', label: 'Movies' },
      { id: 'manage-shows',  icon: '📅', label: 'Manage Shows' },
    ],
  },
  {
    label: 'INFRASTRUCTURE',
    items: [
      { id: 'screens',    icon: '🖥', label: 'Screens' },
      { id: 'facilities', icon: '⬡', label: 'Facilities' },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'staff',        icon: '👥', label: 'Staff Members' },
      { id: 'theatre-info', icon: '✏️', label: 'Theatre Info' },
    ],
  },
]

const dummyShows = [
  { movie: 'Dune: Part Two',  screen: 'Screen 1', time: '10:00 AM', format: 'IMAX',   lang: 'English', status: 'Scheduled' },
  { movie: 'KGF Chapter 3',   screen: 'Screen 3', time: '01:30 PM', format: 'Normal', lang: 'Hindi',   status: 'Scheduled' },
  { movie: 'Interstellar',    screen: 'Screen 2', time: '04:00 PM', format: 'IMAX',   lang: 'English', status: 'Scheduled' },
  { movie: 'Animal',          screen: 'Screen 5', time: '07:30 PM', format: 'Normal', lang: 'Hindi',   status: 'Cancelled' },
]

export default function TheatreDashboard() {
  const { setPage, selectedTheatre } = useNavigation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const t = selectedTheatre

  if (!t) {
    return (
      <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center', color:'#A0A7B5' }}>
        No theatre selected.
        <button onClick={() => setPage('my-theatre')} style={{ marginLeft:8, color:'#7c6af7', background:'none', border:'none', cursor:'pointer' }}>
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="td-root">

      {/* ── NAVBAR ── */}
      <header className="td-navbar">
        <button className="td-nav-logo" onClick={() => setPage('home')}>Movie<span>Mate</span></button>
        <div className="td-nav-right">
          <button className="td-nav-link">My Bookings</button>
          <button className="td-nav-link">Select City</button>
          <button className="td-nav-theatre" onClick={() => setPage('my-theatre')}>
            🎬 My Theatre
          </button>
          <div className="td-nav-sep" />
          <button className="td-nav-avatar" onClick={() => setPage('profile')}>
            {user?.imageUrl
              ? <img src={user.imageUrl} alt={user?.firstName} />
              : <span>{user?.firstName?.[0]}</span>
            }
          </button>
          <span className="td-nav-name">{user?.firstName}</span>
        </div>
      </header>

      <div className="td-layout">

        {/* ── SIDEBAR ── */}
        <aside className="td-sidebar">
          {/* back + theatre identity */}
          <div className="td-sb-identity">
            <button className="td-sb-back" onClick={() => setPage('my-theatre')}>‹ All theatres</button>
            <p className="td-sb-theatre-name">{t.theatre_name}</p>
            <p className="td-sb-theatre-loc">{t.city}, {t.state}</p>
            <span className={`td-sb-role ${t.role?.toLowerCase()}`}>{t.role}</span>
          </div>

          {/* grouped nav */}
          <nav className="td-sb-nav">
            {SIDEBAR_SECTIONS.map(section => (
              <div key={section.label} className="td-sb-section">
                <p className="td-sb-section-label">{section.label}</p>
                {section.items.map(item => (
                  <button
                    key={item.id}
                    className={`td-sb-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="td-sb-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="td-main">
          <div className="td-content">
            {activeTab === 'overview'  && <OverviewPanel theatre={t} shows={dummyShows} />}
            {activeTab === 'movies'    && <MoviesPanel theatre={t} />}
            {activeTab !== 'overview' && activeTab !== 'movies' && (
              <PlaceholderPanel label={SIDEBAR_SECTIONS.flatMap(s => s.items).find(i => i.id === activeTab)?.label} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── OVERVIEW ── */
function OverviewPanel({ theatre, shows }) {
  return (
    <div className="td-overview">
      <div className="td-page-header">
        <div>
          <h1 className="td-page-title">Overview</h1>
          <p className="td-page-sub">{theatre.theatre_name} · Today's snapshot</p>
        </div>
        <button className="td-add-btn">+ Add Movie</button>
      </div>

      <div className="td-stats">
        <div className="td-stat-card">
          <p className="td-stat-label">TODAY'S SHOWS</p>
          <p className="td-stat-val">24</p>
          <p className="td-stat-sub">Across {theatre.total_screens || '—'} screens</p>
        </div>
        <div className="td-stat-card">
          <p className="td-stat-label">TODAY'S BOOKINGS</p>
          <p className="td-stat-val">312</p>
          <p className="td-stat-sub">+18% vs yesterday</p>
        </div>
        <div className="td-stat-card highlight">
          <p className="td-stat-label">OCCUPANCY</p>
          <p className="td-stat-val accent">74%</p>
          <p className="td-stat-sub">Avg across shows</p>
        </div>
        <div className="td-stat-card">
          <p className="td-stat-label">TODAY'S REVENUE</p>
          <p className="td-stat-val accent">₹72,400</p>
          <p className="td-stat-sub">Owner visible only</p>
        </div>
      </div>

      <p className="td-table-label">UPCOMING SHOWS TODAY</p>
      <div className="td-table-wrap">
        <table className="td-table">
          <thead>
            <tr>
              <th>MOVIE</th><th>SCREEN</th><th>TIME</th>
              <th>FORMAT</th><th>LANGUAGE</th><th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((s, i) => (
              <tr key={i}>
                <td className="td-movie-name">{s.movie}</td>
                <td>{s.screen}</td>
                <td>{s.time}</td>
                <td><span className={`td-fmt ${s.format.toLowerCase()}`}>{s.format}</span></td>
                <td>{s.lang}</td>
                <td><span className={`td-status ${s.status.toLowerCase()}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlaceholderPanel({ label }) {
  return (
    <div className="td-placeholder">
      <span className="td-ph-icon">🚧</span>
      <p>{label}</p>
      <span>Coming soon</span>
    </div>
  )
}
