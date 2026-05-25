import { useState, useEffect } from 'react'
import BookingSuccessPage from './BookingSuccessPage'
import './SeatBookingPage.css'

const BASE = 'http://localhost:5000/api/v1'
const MAX_SEATS = 5

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}

export default function SeatBookingPage({ show, theatre, movie, onBack }) {
  const [layoutData,     setLayoutData]     = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [selected,       setSelected]       = useState(new Map()) // key → { id, price }
  const [locking,        setLocking]        = useState(false)
  const [booking,        setBooking]        = useState(false)
  const [msg,            setMsg]            = useState('')
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [lockedData,     setLockedData]     = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(null)

  useEffect(() => {
    fetch(`${BASE}/shows/show-seat-layout?show_id=${show.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setLayoutData(d.data) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [show.id])

  if (loading) return <div className="sbp-loading">Loading seats...</div>
  if (error)   return <div className="sbp-error">⚠️ {error}</div>
  if (!layoutData) return null

  const seatLayout       = layoutData.seat_layout
  const basePrice        = layoutData.base_price || show.base_price || 0
  const allSeats         = layoutData.all_seats || []
  const unavailableSeats = layoutData.unavailable_seats || []

  const seatMap = {}
  allSeats.forEach(s => { seatMap[`${s.row_label}-${s.seat_number}`] = s })

  const unavailableSet = new Set(
    unavailableSeats.map(s => `${s.seat.row_label}-${s.seat.seat_number}`)
  )

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

  const toggle = (key, seatData) => {
    setSelected(prev => {
      const next = new Map(prev)
      if (next.has(key)) { next.delete(key); return next }
      if (next.size >= MAX_SEATS) return prev
      next.set(key, seatData)
      return next
    })
    setMsg('')
  }

  const totalPrice  = [...selected.values()].reduce((sum, s) => sum + s.price, 0)
  const selectedIds = [...selected.values()].map(s => s.id).filter(Boolean)

  // Step 1: Lock seats → show confirmation
  const handleProceed = async () => {
    if (selected.size === 0) return
    setLocking(true); setMsg('')
    try {
      const r = await fetch(`${BASE}/showSeat/seat-lock`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_id: show.id, seat_ids: selectedIds, action: 'LOCK' }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setLockedData({ seats: [...selected.entries()].map(([k, v]) => ({ key: k, ...v })), total: totalPrice })
      setShowConfirm(true)
    } catch (e) {
      setMsg(`⚠️ ${e.message}`)
    } finally {
      setLocking(false)
    }
  }

  // Step 2: Confirm booking directly
  const handleConfirmBooking = async () => {
    setBooking(true); setMsg('')
    try {
      const r = await fetch(`${BASE}/booking/confirm-booking`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_id: show.id, seat_ids: selectedIds }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setBookingSuccess({ bookingId: d.data.booking_id, totalAmount: d.data.total_amount })
    } catch (e) {
      setMsg(`⚠️ ${e.message}`)
    } finally {
      setBooking(false)
    }
  }

  // Success page
  if (bookingSuccess) {
    return (
      <BookingSuccessPage
        bookingId={bookingSuccess.bookingId}
        totalAmount={bookingSuccess.totalAmount}
        movie={movie}
        theatre={theatre}
        show={show}
        seats={lockedData?.seats?.map(s => s.key) || []}
      />
    )
  }

  // Confirmation page (after lock)
  if (showConfirm && lockedData) {
    return (
      <div className="sbp-root">
        <div className="sbp-topnav">
          <button className="sbp-back" onClick={() => setShowConfirm(false)}>← Back to Seats</button>
          <span className="sbp-brand">Movie<span>Mate</span></span>
          <div style={{ width: 60 }} />
        </div>
        <div className="sbp-payment-page">
          <div className="sbp-payment-card">
            <div className="sbp-payment-icon">🎟</div>
            <h2 className="sbp-payment-title">Confirm Booking</h2>
            <p className="sbp-payment-movie">{movie?.title}</p>
            <p className="sbp-payment-meta">{theatre?.theatre_name} · {fmtDate(show.start_time)} · {fmtTime(show.start_time)}</p>
            <div className="sbp-payment-seats">
              {lockedData.seats.map(s => (
                <span key={s.key} className="sbp-payment-seat-chip">{s.key}</span>
              ))}
            </div>
            <div className="sbp-payment-total">
              <span>Total Amount</span>
              <span className="sbp-payment-amount">₹{lockedData.total}</span>
            </div>
            <p className="sbp-payment-note">⏳ Seats locked for 10 minutes. Click below to confirm your booking.</p>
            {msg && <p style={{ fontSize: 12, color: '#ff6b7a', marginBottom: 12 }}>{msg}</p>}
            <button className="sbp-pay-now-btn" onClick={handleConfirmBooking} disabled={booking}>
              {booking
                ? <span className="sbp-btn-loading">⏳ Confirming...</span>
                : `🎟 Book Ticket · ₹${lockedData.total}`
              }
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Seat selection page
  return (
    <div className="sbp-root">
      <div className="sbp-topnav">
        <button className="sbp-back" onClick={onBack}>← Back</button>
        <span className="sbp-brand">Movie<span>Mate</span></span>
        <button className="sbp-refresh" title="Refresh">↻</button>
      </div>

      <div className="sbp-movie-info">
        <h1 className="sbp-movie-title">{movie?.title}</h1>
        <div className="sbp-show-meta">
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8813a" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            {theatre?.theatre_name}
          </span>
          <span className="sbp-meta-sep">|</span>
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8813a" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            {fmtDate(show.start_time)}
          </span>
          <span className="sbp-meta-sep">|</span>
          <span className="sbp-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8813a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {fmtTime(show.start_time)} – {fmtTime(show.end_time)}
          </span>
          <span className="sbp-meta-sep">|</span>
          <span className="sbp-meta-item">{show.language} · {show.format}</span>
        </div>
      </div>

      <div className="sbp-legend">
        <span className="sbp-leg-item"><span className="sbp-leg-box avail" />Available</span>
        <span className="sbp-leg-item"><span className="sbp-leg-box sel" />Selected</span>
        <span className="sbp-leg-item"><span className="sbp-leg-box booked" />Booked</span>
        <span className="sbp-leg-item"><span className="sbp-leg-box damaged" />Damaged</span>
      </div>

      {seatLayout && (
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
                          const key       = `${row.rowName}-${s.displayNumber}`
                          const dbSeat    = seatMap[key]
                          const isDamaged = dbSeat && !dbSeat.is_active
                          const isBooked  = unavailableSet.has(key)
                          const isSel     = selected.has(key)
                          const price     = dbSeat ? Math.round(basePrice * (dbSeat.price_multiplier || 1)) : basePrice
                          const cls       = isDamaged ? 'damaged' : isBooked ? 'booked' : isSel ? 'selected' : ''
                          return (
                            <button key={ci}
                              className={`sbp-seat ${cls}`}
                              disabled={isDamaged || isBooked}
                              onClick={() => !isDamaged && !isBooked && toggle(key, { id: dbSeat?.id, price })}
                              title={`${row.rowName}${s.displayNumber}${dbSeat ? ` · ${dbSeat.seat_type} · ₹${price}` : ''}${isDamaged ? ' · Damaged' : isBooked ? ' · Booked' : ''}`}
                            >
                              {isDamaged ? '' : s.displayNumber}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="sbp-screen-label">
              <div className="sbp-screen-bar">SCREEN THIS WAY</div>
            </div>
          </div>
        </div>
      )}

      <div className="sbp-bottom">
        <div className="sbp-bottom-left">
          <span className="sbp-sel-label">Selected: <strong>{selected.size} seat{selected.size !== 1 ? 's' : ''}</strong></span>
          {msg && <span style={{ fontSize: 11, color: '#ff6b7a' }}>{msg}</span>}
          <span className="sbp-price">₹{totalPrice}</span>
        </div>
        <button
          className={`sbp-pay-btn ${selected.size === 0 ? 'disabled' : ''}`}
          disabled={selected.size === 0 || locking}
          onClick={handleProceed}
        >
          {locking ? '⏳ Locking...' : '🎟 Proceed to Book'}
        </button>
      </div>
    </div>
  )
}
