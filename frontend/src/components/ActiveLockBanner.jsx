import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import './ActiveLockBanner.css'

const BASE = 'http://localhost:5000/api/v1'

function useCountdown(lockUntil) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    if (!lockUntil) return
    const calc = () => Math.max(0, Math.floor((new Date(lockUntil) - Date.now()) / 1000))
    setSecs(calc())
    const id = setInterval(() => { const s = calc(); setSecs(s); if (s === 0) clearInterval(id) }, 1000)
    return () => clearInterval(id)
  }, [lockUntil])
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return { display: `${m}:${s}`, expired: secs === 0 }
}

function LockItem({ lock, onContinue }) {
  const { display, expired } = useCountdown(lock.lock_until)
  if (expired) return null
  return (
    <div className="alb-item">
      <div className="alb-item-left">
        {lock.theatre?.chain_logo && (
          <img src={lock.theatre.chain_logo} alt="" className="alb-logo" onError={e => e.target.style.display='none'} />
        )}
        <div className="alb-item-info">
          <p className="alb-movie">{lock.movie?.title}</p>
          <p className="alb-theatre">{lock.theatre?.theatre_name} · {lock.theatre?.city}</p>
          <p className="alb-seats">{lock.seat_count} seat{lock.seat_count !== 1 ? 's' : ''} locked</p>
        </div>
      </div>
      <div className="alb-item-right">
        <div className={`alb-timer ${parseInt(display) < 2 ? 'urgent' : ''}`}>
          ⏳ {display}
        </div>
        <button className="alb-continue-btn" onClick={() => onContinue(lock)}>
          Continue Booking →
        </button>
      </div>
    </div>
  )
}

export default function ActiveLockBanner({ onContinue }) {
  const { user } = useAuth()
  const [locks, setLocks] = useState([])
  const [dismissed, setDismissed] = useState(false)
  const intervalRef = useRef(null)

  const fetchLocks = () => {
    if (!user) return
    fetch(`${BASE}/showSeat/active-seat-locks`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setLocks(d.data.active_locks || []) })
      .catch(() => {})
  }

  useEffect(() => {
    if (!user) { setLocks([]); return }
    fetchLocks()
    intervalRef.current = setInterval(fetchLocks, 30000)
    return () => clearInterval(intervalRef.current)
  }, [user])

  const activeLocks = locks.filter(l => new Date(l.lock_until) > Date.now())

  if (!user || activeLocks.length === 0 || dismissed) return null

  return (
    <div className="alb-root">
      <button className="alb-dismiss" onClick={() => setDismissed(true)} title="Dismiss">✕</button>
      <div className="alb-header">
        <span className="alb-pulse" />
        <span className="alb-header-text">You have {activeLocks.length} pending booking{activeLocks.length > 1 ? 's' : ''}</span>
      </div>
      <div className="alb-list">
        {activeLocks.map((lock, i) => (
          <LockItem key={i} lock={lock} onContinue={onContinue} />
        ))}
      </div>
    </div>
  )
}
