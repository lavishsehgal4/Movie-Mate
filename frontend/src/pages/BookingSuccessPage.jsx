import { useNavigation } from '../context/NavigationContext'
import './BookingSuccessPage.css'

export default function BookingSuccessPage({ bookingId, totalAmount, movie, theatre, show, seats }) {
  const { setPage } = useNavigation()

  return (
    <div className="bsp-root">
      <div className="bsp-card">
        <div className="bsp-icon">✅</div>
        <h1 className="bsp-title">Booking Confirmed!</h1>
        <p className="bsp-booking-id">Booking ID: <strong>#{bookingId}</strong></p>
        {totalAmount && <p className="bsp-booking-id">Amount Paid: <strong>₹{totalAmount}</strong></p>}

        <div className="bsp-details">
          <p className="bsp-movie">{movie?.title}</p>
          <p className="bsp-meta">{theatre?.theatre_name}</p>
          {show?.start_time && (
            <p className="bsp-meta">
              {new Date(show.start_time).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}
              {' · '}
              {new Date(show.start_time).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}
            </p>
          )}
          {seats?.length > 0 && (
            <div className="bsp-seats">
              {seats.map((s, i) => <span key={i} className="bsp-seat-chip">{s}</span>)}
            </div>
          )}
        </div>

        <p className="bsp-note">🎉 Your tickets have been confirmed. Check your email for details.</p>

        <div className="bsp-actions">
          <button className="bsp-home-btn" onClick={() => setPage('home')}>Back to Home</button>
        </div>
      </div>
    </div>
  )
}
