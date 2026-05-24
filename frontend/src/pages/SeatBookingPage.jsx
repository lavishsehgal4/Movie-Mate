import { useState, useEffect } from 'react'
import './SeatBookingPage.css'

const BASE = 'http://localhost:5000/api/v1'
const MAX_SEATS = 5

const TYPE_COLOR = {
  STANDARD:   '#4a5168',
  PREMIUM:    '#7c6af7',
  RECLINER:   '#06b6d4',
  VIP:        '#f59e0b',
  WHEELCHAIR: '#4ade80',
}

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}

export default function SeatBookingPage({ show, theatre, movie, onBack }) {
  const [layout,   setLayout]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [selected, setSelected] = useState(new Set())

  useEffect(() => {
    fetch(`${BASE}/shows/show-seat-layout?show_id=${show.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setLayout(d.data) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [show.id])

  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key); return next }
      if (next.size >= MAX_SEATS) return prev
      next.add(key)
      return next
    })
  }

  const seatLayout    = layout?.seat_layout
  const inactiveSeats = layout?.seats || []
  const inactiveSet   = new Set(inactiveSeats.map(s => `${s.row_label}-${s.seat_number}`))

  // trim empty edge columns
  const activeCols = (() => {
    if (!seatLayout?.rows) return { start: 0, end: 19 }
    const seatRows = seatLayout.rows.filter(r => r.hasSeats)
    if (!seatRows.length) return { start: 0, end: 19 }
    let start = 999, end = -1
    seatRows.forEach(r => r.seats?.forEach((s, ci) => {
      if (s.type === 1) { start = Math.min(start, ci); end = Math.max(end, ci) }
    }))
    return end === -1 ? { start: 0, end: 19 } : { start, end }
  })()

  const totalPrice = selected.size * (show.base_price || 0)

  return (
    <div className="sbp-root">

      {/* ── TOP NAV ── */}
      <div className="sbp-topnav">
        <button className="sbp-back" onClick={onBack}>← Back</button>
        <span className="sbp-brand">Movie<span>Mate</span></span>
        <div style={{ width: 60 }} />
      </div>

      {/* ── MOVIE + SHOW INFO ── */}
      <div className="sbp-movie-info">
        <h1 className="sbp-movie-title">{movie?.title}</h1>
        <div className="sbp-show-meta">
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8895B" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            {theatre?.theatre_name}
          </span>
          <span className="sbp-meta-sep">·</span>
          <span className="sbp-meta-item">Screen {show.screen_id}</span>
          <span className="sbp-meta-sep">|</span>
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8895B" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            {fmtDate(show.start_time)}
          </span>
          <span className="sbp-meta-sep">|</span>
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8895B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {fmtTime(show.start_time)} – {fmtTime(show.end_time)}
          </span>
          <span className="sbp-meta-sep">|</span>
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8895B" strokeWidth="2"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {show.language}
          </span>
          <span className="sbp-meta-sep">|</span>
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8895B" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l5 5-5 5"/><path d="M7 2L2 7l5 5"/></svg>
            {show.format}
          </span>
        </div>
      </div>

      {/* ── LEGEND ── */}
      <div className="sbp-legend">
        <span className="sbp-leg-item"><span className="sbp-leg-box avail" />Available</span>
        <span className="sbp-leg-item"><span className="sbp-leg-box sel" />Selected</span>
        <span className="sbp-leg-item"><span className="sbp-leg-box booked" />Booked</span>
        <span className="sbp-leg-item"><span className="sbp-leg-box damaged" />Damaged</span>
      </div>

      {loading && <div className="sbp-loading">Loading seats...</div>}
      {error   && <div className="sbp-error">⚠️ {error}</div>}

      {/* ── SEAT GRID CARD ── */}
      {!loading && seatLayout && (
        <div className="sbp-card-wrap">
          <div className="sbp-card">
            <div className="sbp-grid-scroll">
              <div className="sbp-grid">
                {seatLayout.rows?.map((row, ri) => {
                  if (!row.hasSeats && !row.hasText) return <div key={ri} className="sbp-empty-row" />
                  if (row.hasText) return <div key={ri} className="sbp-text-row">{row.text}</div>
                  const vis = row.seats?.slice(activeCols.start, activeCols.end + 1) || []
                  return (
                    <div key={ri} className="sbp-seat-row">
                      <span className="sbp-row-label">{row.rowName}</span>
                      <div className="sbp-seats">
                        {vis.map((s, ci) => {
                          if (s.type === 0) return <div key={ci} className="sbp-gap" />
                          const key = `${row.rowName}-${s.displayNumber}`
                          const isInactive = inactiveSet.has(key)
                          const isSel = selected.has(key)
                          const typeColor = TYPE_COLOR[s.seat_type] || TYPE_COLOR.STANDARD
                          return (
                            <button key={ci}
                              className={`sbp-seat ${isInactive ? 'booked' : ''} ${isSel ? 'selected' : ''}`}
                              disabled={isInactive}
                              onClick={() => toggle(key)}
                              title={`${row.rowName}${s.displayNumber}${isInactive ? ' · Booked' : ''}`}
                            >
                              {s.displayNumber}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* screen label */}
            <div className="sbp-screen-label">
              <div className="sbp-screen-bar">SCREEN THIS WAY</div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      <div className="sbp-bottom">
        <div className="sbp-bottom-left">
          <span className="sbp-sel-label">Selected: <strong>{selected.size} seat{selected.size !== 1 ? 's' : ''}</strong></span>
          <span className="sbp-price">₹{totalPrice}</span>
        </div>
        <button
          className={`sbp-pay-btn ${selected.size === 0 ? 'disabled' : ''}`}
          disabled={selected.size === 0}
        >
          🎟 Proceed to Pay
        </button>
      </div>
    </div>
  )
}
