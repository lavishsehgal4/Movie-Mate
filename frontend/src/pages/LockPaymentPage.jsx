import './SeatBookingPage.css'

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}

export default function LockPaymentPage({ lock, onBack }) {
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
            <span>{lock.seat_count} seat{lock.seat_count !== 1 ? 's' : ''}</span>
            <span className="sbp-payment-amount">Locked</span>
          </div>
          <p className="sbp-payment-note">
            ⏳ Seats locked until {fmtTime(lock.lock_until)}. Complete payment to confirm.
          </p>
          <button className="sbp-pay-now-btn">Proceed to Payment</button>
        </div>
      </div>
    </div>
  )
}
