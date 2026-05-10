import { useNavigation } from '../context/NavigationContext'
import './ScreenDetailPage.css'

export default function ScreenDetailPage() {
  const { setPage, selectedScreen, selectedTheatre } = useNavigation()
  const s = selectedScreen
  const t = selectedTheatre

  if (!s) {
    return (
      <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex', alignItems:'center', justifyContent:'center', color:'#A0A7B5' }}>
        No screen selected.
        <button onClick={() => setPage('theatre-dashboard')} style={{ marginLeft:8, color:'#E8895B', background:'none', border:'none', cursor:'pointer' }}>
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="sd-root">
      {/* navbar */}
      <header className="sd-navbar">
        <button className="sd-logo" onClick={() => setPage('home')}>Movie<span>Mate</span></button>
        <div className="sd-nav-right">
          <button className="sd-nav-link">My Bookings</button>
          <button className="sd-nav-theatre" onClick={() => setPage('my-theatre')}>🎬 My Theatre</button>
        </div>
      </header>

      <div className="sd-body">
        {/* breadcrumb */}
        <div className="sd-breadcrumb">
          <button onClick={() => setPage('my-theatre')}>My Theatres</button>
          <span>›</span>
          <button onClick={() => setPage('theatre-dashboard')}>{t?.theatre_name}</button>
          <span>›</span>
          <button onClick={() => setPage('theatre-dashboard')}>Screens</button>
          <span>›</span>
          <span className="sd-bc-active">{s.screen_name}</span>
        </div>

        {/* page header */}
        <div className="sd-header">
          <div>
            <h1 className="sd-title">{s.screen_name}</h1>
            <p className="sd-sub">{t?.theatre_name} · {t?.city}, {t?.state}</p>
          </div>
          <button className="sd-back-btn" onClick={() => setPage('theatre-dashboard')}>← Back to Screens</button>
        </div>

        {/* info cards */}
        <div className="sd-info-grid">
          <div className="sd-info-card">
            <p className="sd-info-label">SCREEN ID</p>
            <p className="sd-info-val">#{s.id}</p>
          </div>
          <div className="sd-info-card">
            <p className="sd-info-label">SCREEN NAME</p>
            <p className="sd-info-val">{s.screen_name}</p>
          </div>
          <div className="sd-info-card">
            <p className="sd-info-label">ADDED ON</p>
            <p className="sd-info-val">
              {s.created_at
                ? new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
          <div className="sd-info-card">
            <p className="sd-info-label">LAST UPDATED</p>
            <p className="sd-info-val">
              {s.updated_at
                ? new Date(s.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>

        {/* placeholder sections */}
        <div className="sd-sections">
          <div className="sd-section">
            <p className="sd-section-title">TODAY'S SHOWS</p>
            <div className="sd-placeholder">
              <span>📅</span>
              <p>No shows scheduled yet</p>
              <span>Shows for this screen will appear here</span>
            </div>
          </div>

          <div className="sd-section">
            <p className="sd-section-title">UPCOMING SHOWS</p>
            <div className="sd-placeholder">
              <span>🎬</span>
              <p>No upcoming shows</p>
              <span>Schedule shows from the Manage Shows section</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
