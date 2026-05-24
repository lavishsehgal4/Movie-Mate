import { useState, useEffect } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { useLocation } from '../context/LocationContext'
import './MovieDetailPage.css'

const BASE = 'http://localhost:5000/api/v1'
const LANG_MAP = { en:'English', hi:'Hindi', ta:'Tamil', te:'Telugu', kn:'Kannada', ml:'Malayalam', mr:'Marathi', bn:'Bengali', pa:'Punjabi' }

function fmt(iso) {
  if (!iso) return null
  try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) } catch { return iso }
}
function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })
}

export default function MovieDetailPage() {
  const { selectedMovie, setPage } = useNavigation()
  const { selected } = useLocation()

  const [movie,      setMovie]      = useState(null)
  const [shows,      setShows]      = useState([])
  const [loadingM,   setLoadingM]   = useState(true)
  const [loadingS,   setLoadingS]   = useState(true)
  const [errorM,     setErrorM]     = useState('')
  const [imgIdx,     setImgIdx]     = useState(0)
  const [expanded,   setExpanded]   = useState(false)  // click top to expand details

  const movieId = selectedMovie?.id

  // fetch movie details
  useEffect(() => {
    if (!movieId) { setPage('home'); return }
    fetch(`${BASE}/movies/movie-details?movie_id=${movieId}`)
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setMovie(d.data.movie) })
      .catch(e => setErrorM(e.message))
      .finally(() => setLoadingM(false))
  }, [movieId])

  // fetch shows based on location type
  useEffect(() => {
    if (!movieId || !selected) return
    setLoadingS(true)
    const isNearby = selected.isDetected && selected.latitude && selected.longitude

    const url  = isNearby ? `${BASE}/shows/movie-shows/nearby` : `${BASE}/shows/movie-shows/cities`
    const body = isNearby
      ? { movie_id: movieId, latitude: selected.latitude, longitude: selected.longitude }
      : { movie_id: movieId, cities: selected.cities }

    fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setShows(d.data.theatres || []) })
      .catch(() => setShows([]))
      .finally(() => setLoadingS(false))
  }, [movieId, selected])

  if (loadingM) return <div className="mdp-loading">Loading...</div>
  if (errorM)   return <div className="mdp-error">⚠️ {errorM} <button onClick={() => setPage('home')}>Go Home</button></div>
  if (!movie)   return null

  const images = [movie.poster_path, movie.backdrop_path].filter(Boolean)
  const curImg = images[imgIdx % Math.max(images.length, 1)]
  const genres = Array.isArray(movie.genres) ? movie.genres.map(g => typeof g === 'object' ? g.name : g).filter(Boolean) : []
  const cast   = Array.isArray(movie.cast) ? movie.cast : []
  const isUpcoming = movie.release_date && new Date(movie.release_date) > new Date()

  // group shows by date then theatre (response: theatres[{theatre, shows[]}])
  const showsByDate = {}
  shows.forEach(({ theatre, shows: thShows }) => {
    const thName = theatre.theatre_name
    thShows.forEach(s => {
      const date = new Date(s.start_time).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })
      if (!showsByDate[date]) showsByDate[date] = {}
      if (!showsByDate[date][thName]) showsByDate[date][thName] = { theatre, list: [] }
      showsByDate[date][thName].list.push(s)
    })
  })

  return (
    <div className="mdp-root">
      <button className="mdp-back" onClick={() => setPage('home')}>← Back</button>

      {/* ── HERO (always visible, click to expand) ── */}
      <div className="mdp-hero" onClick={() => setExpanded(e => !e)} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}>
        <div className="mdp-poster-wrap">
          {curImg
            ? <img src={curImg} alt={movie.title} className="mdp-poster-img" />
            : <div className="mdp-poster-ph">🎬</div>
          }
          {images.length > 1 && (
            <div className="mdp-img-dots" onClick={e => e.stopPropagation()}>
              {images.map((_, i) => (
                <button key={i} className={`mdp-dot ${i === imgIdx % images.length ? 'active' : ''}`}
                  onClick={() => setImgIdx(i)} />
              ))}
            </div>
          )}
        </div>

        <div className="mdp-hero-info">
          <div className="mdp-hero-badges">
            {movie.certification && <span className="mdp-cert">{movie.certification}</span>}
            <span className={`mdp-status ${isUpcoming ? 'upcoming' : 'now-playing'}`}>
              {isUpcoming ? 'Upcoming' : 'Now Playing'}
            </span>
          </div>

          <h1 className="mdp-title">{movie.title}</h1>

          <div className="mdp-meta-row">
            {movie.runtime > 0 && <span>⏱ {movie.runtime} min</span>}
            {movie.release_date && <span>📅 {fmt(movie.release_date)}</span>}
            {movie.original_language && <span>🌐 {LANG_MAP[movie.original_language] || movie.original_language.toUpperCase()}</span>}
          </div>

          {genres.length > 0 && (
            <div className="mdp-genres">
              {genres.map(g => <span key={g} className="mdp-genre">{g}</span>)}
            </div>
          )}

          <div className="mdp-scores">
            {movie.vote_average > 0 && (
              <div className="mdp-score-block">
                <span className="mdp-score-val">{Number(movie.vote_average).toFixed(1)}</span>
                <span className="mdp-score-label">TMDB Score</span>
                {movie.vote_count > 0 && <span className="mdp-vote-count">{movie.vote_count.toLocaleString()} votes</span>}
              </div>
            )}
            {movie.popularity > 0 && (
              <div className="mdp-score-block">
                <span className="mdp-score-val">{Number(movie.popularity).toFixed(1)}</span>
                <span className="mdp-score-label">Popularity</span>
              </div>
            )}
          </div>

          <div className="mdp-hero-actions" onClick={e => e.stopPropagation()}>
            <button className="mdp-book-btn">🎟 Book Tickets</button>
          </div>

          <p className="mdp-expand-hint">{expanded ? '▲ Hide details' : '▼ Show overview & cast'}</p>
        </div>
      </div>

      {/* ── EXPANDED: overview + cast + details ── */}
      {expanded && (
        <div className="mdp-expanded">
          <div className="mdp-exp-main">
            <div className="mdp-section">
              <h2 className="mdp-section-title">Overview</h2>
              <p className="mdp-overview">{movie.overview || 'No description available for this movie.'}</p>
            </div>

            {cast.length > 0 && (
              <div className="mdp-section">
                <h2 className="mdp-section-title">Cast</h2>
                <div className="mdp-cast-row">
                  {cast.map((p, i) => (
                    <div key={i} className="mdp-cast-item">
                      <div className="mdp-cast-avatar">
                        {p.profile_path ? <img src={p.profile_path} alt={p.name} /> : <span>{p.name?.[0] || '?'}</span>}
                      </div>
                      <p className="mdp-cast-name">{p.name}</p>
                      {p.character && <p className="mdp-cast-char">{p.character}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mdp-exp-sidebar">
            <h3 className="mdp-sidebar-title">Movie Details</h3>
            {movie.release_date && <DetailRow label="Release Date" val={fmt(movie.release_date)} />}
            {movie.runtime > 0  && <DetailRow label="Runtime"      val={`${movie.runtime} min`} />}
            {movie.original_language && <DetailRow label="Language" val={LANG_MAP[movie.original_language] || movie.original_language.toUpperCase()} />}
            {movie.certification && <DetailRow label="Certification" val={movie.certification} />}
            {movie.adult !== undefined && <DetailRow label="Adult" val={movie.adult ? 'Yes' : 'No'} />}
            {movie.vote_average > 0 && <DetailRow label="Rating" val={`${Number(movie.vote_average).toFixed(1)} / 10`} />}
          </div>
        </div>
      )}

      {/* ── SHOWS ── */}
      <div className="mdp-shows-section">
        <h2 className="mdp-shows-heading">
          {selected?.isDetected ? 'Shows Near Your Location' : `Shows in ${selected?.regionName || 'Your City'}`}
        </h2>

        {loadingS && <div className="mdp-shows-loading">Loading shows...</div>}

        {!loadingS && Object.keys(showsByDate).length === 0 && (
          <div className="mdp-no-shows">
            <span>🎬</span>
            <p>No shows found near you</p>
            <span>Try changing your location or city</span>
          </div>
        )}

        {!loadingS && Object.entries(showsByDate).map(([date, theatres]) => (
          <div key={date} className="mdp-date-block">
            <p className="mdp-date-label">{date}</p>
            {Object.entries(theatres).map(([thName, { theatre, list }]) => (
              <div key={thName} className="mdp-theatre-block">
                <div className="mdp-theatre-header">
                  <p className="mdp-theatre-name">{thName}</p>
                  <div className="mdp-theatre-meta">
                    {theatre.city && <span>{theatre.city}</span>}
                    {theatre.distance_km != null && <span>📍 {Number(theatre.distance_km).toFixed(1)} km</span>}
                  </div>
                </div>
                <div className="mdp-show-times">
                  {list.map(s => (
                    <div key={s.id} className="mdp-show-chip">
                      <span className="mdp-show-time">{fmtTime(s.start_time)}</span>
                      <span className="mdp-show-end">→ {fmtTime(s.end_time)}</span>
                      <div className="mdp-show-tags">
                        <span className="mdp-show-tag">{s.language}</span>
                        <span className="mdp-show-tag">{s.format}</span>
                      </div>
                      <span className="mdp-show-price">₹{s.base_price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailRow({ label, val }) {
  return (
    <div className="mdp-detail-row">
      <span className="mdp-detail-label">{label}</span>
      <span className="mdp-detail-val">{val}</span>
    </div>
  )
}
