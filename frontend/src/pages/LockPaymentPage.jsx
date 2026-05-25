import { useState } from 'react'
import BookingSuccessPage from './BookingSuccessPage'
import './SeatBookingPage.css'

const BASE = 'http://localhost:5000/api/v1'

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
}

export default function LockPaymentPage({ lock, onBack }) {
  const [booking, setBooking] = useState(false)
  const [msg,     setMsg]     = useState('')
  const [success, setSuccess] = useState(null)

  const handleConfirm = async () => {
    setBooking(true); setMsg('')
    try {
      const r = await fetch(`${BASE}/booking/confirm-booking`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_id: lock.show_id, seat_ids: lock.seat_ids }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setSuccess({ bookingId: d.data.booking_id, totalAmount: d.data.total_amount })
    } catch (e) {
      setMsg(`⚠️ ${e.message}`)
    } finally {
      setBooking(false)
    }
  }

  if (success) {
    return (
      <BookingSuccessPage
        bookingId={success.bookingId}
        totalAmount={success.totalAmount}
        movie={lock.movie}
        theatre={lock.theatre}
        seats={lock.seat_ids?.map(id => `Seat #${id}`) || []}
      />
    )
  }

  return (
    <div className="sbp-root">
      <div className="sbp-topnav">
        <button className="sbp-back" onClick={onBack}>← Back</button>
        <span className="sbp-brand">Movie<span>Mate</span></span>
        <div style={{ width: 60 }} />
      </div>
      <div className="sbp-payment-page">
        <div className="sbp-payment-card">
          <div className="sbp-payment-icon">🎟</div>
          <h2 className="sbp-payment-title">Confirm Booking</h2>
          <p className="sbp-payment-movie">{lock.movie?.title}</p>
          <p className="sbp-payment-meta">
            {lock.theatre?.theatre_name} · {lock.theatre?.city}
          </p>
          <div className="sbp-payment-seats">
            {lock.seat_ids?.map(id => (
              <span key={id} className="sbp-payment-seat-chip">Seat #{id}</span>
            ))}
          </div>
          <div className="sbp-payment-total">
            <span>{lock.seat_count} seat{lock.seat_count !== 1 ? 's' : ''} locked</span>
            <span className="sbp-payment-amount">Locked</span>
          </div>
          <p className="sbp-payment-note">
            ⏳ Seats locked until {fmtTime(lock.lock_until)}. Click below to confirm.
          </p>
          {msg && <p style={{ fontSize: 12, color: '#ff6b7a', marginBottom: 12 }}>{msg}</p>}
          <button className="sbp-pay-now-btn" onClick={handleConfirm} disabled={booking}>
            {booking ? '⏳ Confirming...' : '🎟 Book Ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}
