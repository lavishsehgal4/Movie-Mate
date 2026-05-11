import { useState, useEffect } from 'react'
import './ManageShowsPanel.css'

const BASE = 'http://localhost:5000/api/v1'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92'

function getDateLabel(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow'
    : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  return { label, iso: d.toISOString().slice(0, 10), date: d }
}

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function ManageShowsPanel({ theatre }) {
  const [screens,    setScreens]    = useState([])
  const [selScreen,  setSelScreen]  = useState(null)
  const [selDay,     setSelDay]     = useState(0)
  const [shows,      setShows]      = useState([])
  const [movies,     setMovies]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const days = [0, 1, 2].map(getDateLabel)

  // fetch screens
  useEffect(() => {
    fetch(`${BASE}/screens?theatre_id=${theatre.theatreId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.screens.length) {
          setScreens(d.data.screens)
          setSelScreen(d.data.screens[0])
        }
      })
      .catch(() => {})
  }, [theatre.theatreId])

  // fetch shows when screen or day changes
  useEffect(() => {
    if (!selScreen) return
    setLoading(true); setError('')
    const date = days[selDay].iso
    fetch(`${BASE}/shows/screen?screen_id=${selScreen.id}&date=${date}&theatre_id=${theatre.theatreId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.message)
        setShows(d.data.shows || [])
        setMovies(d.data.movies || {})
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selScreen, selDay])

  // group shows by movie_id
  const showsByMovie = {}
  shows.forEach(s => {
    if (!showsByMovie[s.movie_id]) showsByMovie[s.movie_id] = []
    showsByMovie[s.movie_id].push(s)
  })

  return (
    <div className="msp-root">
      <h1 className="msp-title">Manage Shows</h1>
      <p className="msp-sub">{theatre.theatre_name}</p>

      {/* screen tabs */}
      <div className="msp-screens">
        {screens.map(s => (
          <button
            key={s.id}
            className={`msp-screen-tab ${selScreen?.id === s.id ? 'active' : ''}`}
            onClick={() => setSelScreen(s)}
          >
            {s.screen_name}
          </button>
        ))}
      </div>

      {/* day tabs */}
      <div className="msp-days">
        {days.map(({ label, iso }, offset) => (
          <button
            key={offset}
            className={`msp-day-tab ${selDay === offset ? 'active' : ''}`}
            onClick={() => setSelDay(offset)}
          >
            <span className="msp-day-name">{label}</span>
            <span className="msp-day-date">{iso}</span>
          </button>
        ))}
      </div>

      {error   && <div className="msp-error">⚠️ {error}</div>}
      {loading && <div className="msp-loading">Loading shows...</div>}

      {!loading && !error && Object.keys(showsByMovie).length === 0 && (
        <div className="msp-empty">
          <span>🎬</span>
          <p>No shows scheduled for this day</p>
        </div>
      )}

      {/* shows grouped by movie */}
      {!loading && Object.entries(showsByMovie).map(([movieId, movieShows]) => {
        const movie = movies[movieId]
        return (
          <div key={movieId} className="msp-movie-block">
            {/* movie info row — clickable but no action */}
            <div className="msp-movie-row">
              {movie?.poster_path
                ? <img src={`${TMDB_IMG}${movie.poster_path}`} alt={movie.title} className="msp-movie-poster" />
                : <div className="msp-movie-poster-ph">🎬</div>
              }
              <div>
                <p className="msp-movie-name">{movie?.title || `Movie #${movieId}`}</p>
                <div className="msp-movie-meta">
                  {movie?.runtime && <span>⏱ {movie.runtime} min</span>}
                  {movie?.certification && <span className="msp-cert">{movie.certification}</span>}
                </div>
              </div>
            </div>

            {/* shows grid */}
            <div className="msp-shows-grid">
              {movieShows.map(show => (
                <div key={show.id} className={`msp-show-card ${show.show_status}`}>
                  <div className="msp-show-times">
                    <span className="msp-show-start">{fmtTime(show.start_time)}</span>
                    <span className="msp-show-sep">→</span>
                    <span className="msp-show-end">{fmtTime(show.end_time)}</span>
                  </div>
                  <div className="msp-show-tags">
                    <span className="msp-tag lang">{show.language}</span>
                    <span className="msp-tag format">{show.format}</span>
                  </div>
                  <div className="msp-show-footer">
                    <span className="msp-show-price">₹{show.base_price}</span>
                    <span className={`msp-status ${show.show_status}`}>{show.show_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
