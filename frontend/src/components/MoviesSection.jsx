import { useState, useEffect } from 'react'
import { useLocation } from '../context/LocationContext'
import { useNavigation } from '../context/NavigationContext'
import './MoviesSection.css'

const BASE = 'http://localhost:5000/api/v1'

export default function MoviesSection() {
  const { selected } = useLocation()
  const { setPage, setSelectedMovie } = useNavigation()
  const [movies,  setMovies]  = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [mode,    setMode]    = useState('city') // 'city' | 'nearby'

  const isNearby = selected?.isDetected

  useEffect(() => {
    if (!selected) return
    if (selected.isDetected && selected.latitude && selected.longitude) {
      fetchNearby(selected.latitude, selected.longitude)
    } else if (selected.cities?.length) {
      fetchByCity(selected.cities)
    }
  }, [selected])

  const fetchByCity = async (cities) => {
    setLoading(true); setError(''); setMode('city')
    try {
      const r = await fetch(`${BASE}/shows/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cities }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setMovies(d.data.movies || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const fetchNearby = async (lat, lng) => {
    setLoading(true); setError(''); setMode('nearby')
    try {
      const r = await fetch(`${BASE}/shows/movies/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng, distance: 30 }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setMovies(d.data.movies || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const openMovie = (movie) => {
    setSelectedMovie(movie)
    setPage('movie-detail')
  }

  const heading = mode === 'nearby'
    ? 'Movies Near Your Location'
    : `Movies in ${selected?.regionName || 'Your City'}`

  return (
    <section className="ms-section">
      <div className="ms-inner">
        <div className="ms-header">
          <div className="ms-title-wrap">
            <div className="ms-accent" />
            <h2 className="ms-title">{heading}</h2>
          </div>
        </div>

        {loading && <div className="ms-loading">Loading movies...</div>}
        {error   && <div className="ms-error">⚠️ {error}</div>}

        {!loading && !error && movies.length === 0 && (
          <div className="ms-empty">
            <span>🎬</span>
            <p>No movies found near you</p>
            <span>Try changing your location or city</span>
          </div>
        )}

        {!loading && movies.length > 0 && (
          <div className="ms-grid">
            {movies.map(m => (
              <div key={m.id} className="ms-card" onClick={() => openMovie(m)}>
                <div className="ms-poster">
                  {m.poster_path
                    ? <img src={m.poster_path} alt={m.title} loading="lazy" />
                    : <div className="ms-poster-ph">🎬</div>
                  }
                  <div className="ms-overlay">
                    <button className="ms-book-btn">Book Now</button>
                  </div>
                  {m.vote_average > 0 && (
                    <div className="ms-rating">★ {Number(m.vote_average).toFixed(1)}</div>
                  )}
                </div>
                <div className="ms-info">
                  <h3 className="ms-movie-title">{m.title}</h3>
                  <div className="ms-tags">
                    {m.original_language && <span className="ms-tag">{m.original_language.toUpperCase()}</span>}
                    {m.certification && <span className="ms-tag">{m.certification}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
