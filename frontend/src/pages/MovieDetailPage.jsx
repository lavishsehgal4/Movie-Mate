import { useState, useEffect } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { useLocation } from '../context/LocationContext'
import { useAuth } from '../context/AuthContext'
import SeatBookingPage from './SeatBookingPage'
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
  const { user } = useAuth()

  const [movie,      setMovie]      = useState(null)
  const [shows,      setShows]      = useState([])
  const [loadingM,   setLoadingM]   = useState(true)
  const [loadingS,   setLoadingS]   = useState(true)
  const [errorM,     setErrorM]     = useState('')
  const [imgIdx,     setImgIdx]     = useState(0)
  const [expanded,   setExpanded]   = useState(false)
  const [openFacTh,  setOpenFacTh]  = useState(null)  // theatre object for popup
  const [selectedShow, setSelectedShow] = useState(null)  // { show, theatre }

  const movieId = selectedMovie?.id

  useEffect(() => {
    if (!movieId) { setPage('home'); return }
    fetch(`${BASE}/movies/movie-details?movie_id=${movieId}`)
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setMovie(d.data.movie) })
      .catch(e => setErrorM(e.message))
      .finally(() => setLoadingM(false))
  }, [movieId])

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

  if (selectedShow) {
    return <SeatBookingPage show={selectedShow.show} theatre={selectedShow.theatre} movie={movie} onBack={() => setSelectedShow(null)} />
  }

  if (loadingM) return <div className="mdp-loading">Loading...</div>
  if (errorM)   return <div className="mdp-error">⚠️ {errorM} <button onClick={() => setPage('home')}>Go Home</button></div>
  if (!movie)   return null

  const images = [movie.poster_path, movie.backdrop_path].filter(Boolean)
  const curImg = images[imgIdx % Math.max(images.length, 1)]
  const genres = Array.isArray(movie.genres) ? movie.genres.map(g => typeof g === 'object' ? g.name : g).filter(Boolean) : []
  const cast   = Array.isArray(movie.cast) ? movie.cast : []
  const isUpcoming = movie.release_date && new Date(movie.release_date) > new Date()

  // group by date
  const showsByDate = {}
  shows.forEach(({ theatre, shows: thShows }) => {
    thShows.forEach(s => {
      const date = new Date(s.start_time).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })
      if (!showsByDate[date]) showsByDate[date] = []
      // find or create theatre entry for this date
      let entry = showsByDate[date].find(e => e.theatre.id === theatre.id)
      if (!entry) { entry = { theatre, list: [] }; showsByDate[date].push(entry) }
      entry.list.push(s)
    })
  })

  return (
    <div className="mdp-root">
      <button className="mdp-back" onClick={() => setPage('home')}>← Back</button>

      {/* HERO */}
      <div className="mdp-hero" onClick={() => setExpanded(e => !e)} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}>
        <div className="mdp-poster-wrap">
          {curImg ? <img src={curImg} alt={movie.title} className="mdp-poster-img" /> : <div className="mdp-poster-ph">🎬</div>}
          {images.length > 1 && (
            <div className="mdp-img-dots" onClick={e => e.stopPropagation()}>
              {images.map((_, i) => <button key={i} className={`mdp-dot ${i === imgIdx % images.length ? 'active' : ''}`} onClick={() => setImgIdx(i)} />)}
            </div>
          )}
        </div>
        <div className="mdp-hero-info">
          <div className="mdp-hero-badges">
            {movie.certification && <span className="mdp-cert">{movie.certification}</span>}
            <span className={`mdp-status ${isUpcoming ? 'upcoming' : 'now-playing'}`}>{isUpcoming ? 'Upcoming' : 'Now Playing'}</span>
          </div>
          <h1 className="mdp-title">{movie.title}</h1>
          <div className="mdp-meta-row">
            {movie.runtime > 0 && <span>⏱ {movie.runtime} min</span>}
            {movie.release_date && <span>📅 {fmt(movie.release_date)}</span>}
            {movie.original_language && <span>🌐 {LANG_MAP[movie.original_language] || movie.original_language.toUpperCase()}</span>}
          </div>
          {genres.length > 0 && <div className="mdp-genres">{genres.map(g => <span key={g} className="mdp-genre">{g}</span>)}</div>}
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
          <div onClick={e => e.stopPropagation()}>
            <button className="mdp-book-btn">🎟 Book Tickets</button>
          </div>
          <p className="mdp-expand-hint">{expanded ? '▲ Hide details' : '▼ Show overview & cast'}</p>
        </div>
      </div>

      {/* EXPANDED */}
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

      {/* SHOWS */}
      <div className="mdp-shows-section">
        <h2 className="mdp-shows-heading">
          {selected?.isDetected ? 'Shows Near Your Location' : `Shows in ${selected?.regionName || 'Your City'}`}
        </h2>

        {loadingS && <div className="mdp-shows-loading">Loading shows...</div>}

        {!loadingS && Object.keys(showsByDate).length === 0 && (
          <div className="mdp-no-shows">
            <span>🎬</span><p>No shows found near you</p><span>Try changing your location or city</span>
          </div>
        )}

        {!loadingS && Object.entries(showsByDate).map(([date, entries]) => (
          <div key={date} className="mdp-date-block">
            <p className="mdp-date-label">{date}</p>
            {entries.map(({ theatre, list }) => (
              <div key={theatre.id} className="mdp-theatre-card">
                <div className="mdp-th-row">
                  <div className="mdp-th-logo-wrap">
                    {theatre.chain_logo
                      ? <img src={theatre.chain_logo} alt={theatre.chain_name} className="mdp-th-logo" onError={e => e.target.style.display='none'} />
                      : <span className="mdp-th-logo-ph">{theatre.chain_name?.[0] || '🎬'}</span>
                    }
                  </div>
                  <div className="mdp-th-info">
                    <p className="mdp-th-name">{theatre.theatre_name}</p>
                    <p className="mdp-th-addr">{theatre.address}{theatre.city ? `, ${theatre.city}` : ''}</p>
                    <div className="mdp-th-bottom">
                      {theatre.distance_km != null && <p className="mdp-th-dist">📍 {Number(theatre.distance_km).toFixed(1)} km away</p>}
                      <button className="mdp-th-info-btn" onClick={() => setOpenFacTh(theatre)}>ℹ Info</button>
                    </div>
                  </div>
                </div>
                <div className="mdp-show-chips">
                  {list.map(s => (
                    <button key={s.id} className="mdp-show-chip"
                      onClick={() => { if (!user) { alert('Please login to book seats'); return }; setSelectedShow({ show: s, theatre }) }}
                    >
                      <span className="mdp-chip-time">{fmtTime(s.start_time)}</span>
                      <span className="mdp-chip-format">{s.language} · {s.format}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ── THEATRE FACILITIES POPUP ── */}
      {openFacTh && (
        <div className="mdp-popup-backdrop" onClick={() => setOpenFacTh(null)}>
          <div className="mdp-popup" onClick={e => e.stopPropagation()}>
            <button className="mdp-popup-close" onClick={() => setOpenFacTh(null)}>✕</button>
            <div className="mdp-popup-header">
              <div className="mdp-popup-logo-wrap">
                {openFacTh.chain_logo
                  ? <img src={openFacTh.chain_logo} alt={openFacTh.chain_name} onError={e => e.target.style.display='none'} />
                  : <span>{openFacTh.chain_name?.[0]}</span>
                }
              </div>
              <div>
                <p className="mdp-popup-name">{openFacTh.theatre_name}</p>
                <p className="mdp-popup-addr">{openFacTh.address}{openFacTh.city ? `, ${openFacTh.city}` : ''}</p>
                {openFacTh.distance_km != null && (
                  <p className="mdp-popup-dist">📍 {Number(openFacTh.distance_km).toFixed(1)} km away</p>
                )}
              </div>
            </div>
            <div className="mdp-popup-facilities">
              {(openFacTh.theatreFacilities || []).map(f => f.facility).filter(Boolean).map(f => (
                <div key={f.id} className="mdp-popup-fac">
                  {f.facility_logo
                    ? <img src={f.facility_logo} alt={f.facility_name} className="mdp-popup-fac-icon" onError={e => e.target.style.display='none'} />
                    : <span className="mdp-popup-fac-icon-ph">✓</span>
                  }
                  <span className="mdp-popup-fac-name">{f.facility_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
