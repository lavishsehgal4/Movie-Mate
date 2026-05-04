import { useState, useEffect } from 'react'
import { useNavigation } from '../context/NavigationContext'
import './MyTheatrePage.css'

// dummy revenue — kept static since no revenue API yet
const revenueBreakdown = [
  { name: 'PVR: Ludhiana Central',   sub: 'Ludhiana · 8 screens',   amount: '₹72,400', pct: 100 },
  { name: 'Carnival: Chandigarh',    sub: 'Chandigarh · 6 screens', amount: '₹54,200', pct: 75  },
  { name: 'INOX: Amritsar Mall',     sub: 'Amritsar · 5 screens',   amount: '₹38,900', pct: 54  },
  { name: 'MovieMate: Patiala',      sub: 'Pending Verification',    amount: '—',       pct: 0   },
]

export default function MyTheatrePage() {
  const { setPage } = useNavigation()

  const [theatres, setTheatres]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchTheatres() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('http://localhost:5000/api/v1/theatre/my', {
          credentials: 'include',
        })
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message || 'Failed to load theatres')
        if (!cancelled) setTheatres(data.data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTheatres()
    return () => { cancelled = true }
  }, [])

  const totalScreens = theatres.reduce((s, t) => s + (t.total_screens || 0), 0)
  const uniqueCities = new Set(theatres.map(t => t.city)).size

  return (
    <div className="mt-root">

      {/* ── TOP NAV ── */}
      <header className="mt-topnav">
        <button className="mt-logo" onClick={() => setPage('home')}>Movie<span>Mate</span></button>
        <div className="mt-topnav-right">
          <button className="mt-tn-link">My Bookings</button>
          <button className="mt-tn-link">Select City</button>
          <button className="mt-tn-theatre active">🎬 My Theatre</button>
        </div>
      </header>

      <div className="mt-body">
        <button className="mt-back" onClick={() => setPage('profile')}>‹ Back to profile</button>

        {/* page header */}
        <div className="mt-page-header">
          <div>
            <h1 className="mt-title">My Theatres</h1>
            <p className="mt-subtitle">
              {loading ? 'Loading...' : `Managing ${theatres.length} theatre${theatres.length !== 1 ? 's' : ''} across ${uniqueCities} ${uniqueCities !== 1 ? 'cities' : 'city'}`}
            </p>
          </div>
          <button className="mt-add-btn" onClick={() => setPage('partner')}>+ Add Theatre</button>
        </div>

        {/* stat cards */}
        <div className="mt-stats">
          <div className="mt-stat-card">
            <p className="mt-stat-label">TOTAL THEATRES</p>
            <p className="mt-stat-val orange">{loading ? '—' : theatres.length}</p>
            <p className="mt-stat-sub">Across {uniqueCities} {uniqueCities !== 1 ? 'cities' : 'city'}</p>
          </div>
          <div className="mt-stat-card">
            <p className="mt-stat-label">TOTAL SCREENS</p>
            <p className="mt-stat-val orange">{loading ? '—' : totalScreens || '—'}</p>
            <p className="mt-stat-sub">All theatres combined</p>
          </div>
          <div className="mt-stat-card">
            <p className="mt-stat-label">TODAY'S BOOKINGS</p>
            <p className="mt-stat-val orange">—</p>
            <p className="mt-stat-sub">Across all theatres</p>
          </div>
          <div className="mt-stat-card">
            <p className="mt-stat-label">TODAY'S REVENUE</p>
            <p className="mt-stat-val orange">—</p>
            <p className="mt-stat-sub">Combined total</p>
          </div>
        </div>

        {/* error */}
        {error && (
          <div className="mt-error">⚠️ {error}</div>
        )}

        {/* two-column layout */}
        <div className="mt-columns">

          {/* LEFT: theatre cards */}
          <div className="mt-left">
            <p className="mt-col-label">YOUR THEATRES</p>

            {loading && (
              <div className="mt-loading">Loading your theatres...</div>
            )}

            {!loading && (
              <div className="mt-theatre-list">
                {theatres.map(t => (
                  <div
                    key={t.theatreId}
                    className={`mt-theatre-card ${selected === t.theatreId ? 'selected' : ''}`}
                    onClick={() => setSelected(t.theatreId === selected ? null : t.theatreId)}
                  >
                    <div className="mt-card-top">
                      <div className="mt-card-logo-wrap">
                        {t.logo
                          ? <img src={t.logo} alt={t.chain_name} className="mt-card-logo" onError={e => e.target.style.display='none'} />
                          : <span className="mt-card-logo-fallback">🎬</span>
                        }
                      </div>
                      <div className="mt-card-info">
                        <h3 className="mt-card-name">{t.theatre_name}</h3>
                        <p className="mt-card-loc">{t.city}, {t.state}</p>
                        <div className="mt-card-badges">
                          <span className={`mt-badge role ${t.role?.toLowerCase()}`}>{t.role}</span>
                          {t.is_verified
                            ? <span className="mt-badge verified">Verified</span>
                            : <span className="mt-badge pending">Pending Verification</span>
                          }
                        </div>
                      </div>
                      <button className="mt-card-info-btn" aria-label="Info">ℹ</button>
                    </div>

                    {/* card stats — only real fields */}
                    <div className="mt-card-stats">
                      <div>
                        <p className="mt-cs-label">CHAIN</p>
                        <p className="mt-cs-val">{t.chain_name || '—'}</p>
                      </div>
                      <div>
                        <p className="mt-cs-label">SCREENS</p>
                        <p className="mt-cs-val">{t.total_screens ?? '—'}</p>
                      </div>
                      <div>
                        <p className="mt-cs-label">RATING</p>
                        <p className="mt-cs-val">{t.rating ? `${t.rating} ★` : '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* add another */}
                <button className="mt-add-card" onClick={() => setPage('partner')}>
                  <span className="mt-add-icon">⊕</span>
                  <span>Add another theatre</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: revenue breakdown (static for now) */}
          <div className="mt-right">
            <div className="mt-revenue-card">
              <div className="mt-revenue-header">
                <div>
                  <p className="mt-col-label">REVENUE TODAY — DESCENDING</p>
                  <h3 className="mt-revenue-title">Daily Revenue Breakdown</h3>
                  <p className="mt-revenue-total">Combined total: <span>₹1,66,600</span></p>
                </div>
                <p className="mt-revenue-date">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="mt-revenue-list">
                {revenueBreakdown.map((r, i) => (
                  <div key={r.name} className="mt-revenue-row">
                    <span className="mt-rev-rank">{i + 1}</span>
                    <div className="mt-rev-info">
                      <p className="mt-rev-name">{r.name}</p>
                      <p className="mt-rev-sub">{r.sub}</p>
                      <div className="mt-rev-bar-wrap">
                        <div className="mt-rev-bar" style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                    <span className={`mt-rev-amount ${r.amount === '—' ? 'muted' : ''}`}>{r.amount}</span>
                  </div>
                ))}
              </div>

              <div className="mt-revenue-footer">
                <span className="mt-rev-summary">
                  {theatres.filter(t => t.is_verified).length} active · {theatres.filter(t => !t.is_verified).length} pending
                </span>
                <span className="mt-rev-total-label">Total ₹1,66,600</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
