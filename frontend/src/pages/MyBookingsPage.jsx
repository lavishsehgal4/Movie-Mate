import { useState, useEffect } from 'react'
import { useNavigation } from '../context/NavigationContext'
import './MyBookingsPage.css'

const BASE = 'http://localhost:5000/api/v1'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
}
function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
}

export default function MyBookingsPage() {
  const { setPage } = useNavigation()
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    fetch(`${BASE}/booking/my-bookings`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setBookings(d.data.bookings || []) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mbp-root">
      {/* header */}
      <div className="mbp-header">
        <button className="mbp-back" onClick={() => setPage('home')}>← Back</button>
        <h1 className="mbp-title">My Bookings</h1>
      </div>

      {loading && <div className="mbp-loading">Loading bookings...</div>}
      {error   && <div className="mbp-error">⚠️ {error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="mbp-empty">
          <span>🎟️</span>
          <p>No bookings yet</p>
          <span>Book your first movie to see it here</span>
          <button className="mbp-browse-btn" onClick={() => setPage('home')}>Browse Movies</button>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="mbp-list">
          {bookings.map(b => (
            <div key={b.booking_id} className="mbp-card">
              <div className="mbp-card-left">
                <div className="mbp-movie-name">{b.movie?.title || '—'}</div>
                <div className="mbp-theatre">{b.theatre?.theatre_name || '—'}</div>
                <div className="mbp-show-time">
                  {b.show?.start_time && (
                    <>{fmtDate(b.show.start_time)} · {fmtTime(b.show.start_time)}</>
                  )}
                </div>
                <div className="mbp-seats">
                  {(b.seats || []).map((s, i) => (
                    <span key={i} className="mbp-seat-chip">{s.row_label}{s.seat_number}</span>
                  ))}
                </div>
              </div>
              <div className="mbp-card-right">
                <span className="mbp-booking-id">#{b.booking_id}</span>
                <span className="mbp-amount">₹{b.total_amount}</span>
                <span className="mbp-confirmed">✓ Confirmed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
