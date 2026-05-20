import { useState, useEffect } from 'react'
import { useNavigation } from '../context/NavigationContext'
import './MovieDetailPage.css'

const BASE = 'http://localhost:5000/api/v1'
const LANG_MAP = { en:'English', hi:'Hindi', ta:'Tamil', te:'Telugu', kn:'Kannada', ml:'Malayalam', mr:'Marathi', bn:'Bengali', pa:'Punjabi' }

function fmt(iso) {
  if (!iso) return null
  try { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) } catch { return iso }
}

export default function MovieDetailPage() {
  const { selectedMovie, setPage } = useNavigation()
  const [movie,   setMovie]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [imgIdx,  setImgIdx]  = useState(0)  // 0=poster, 1=backdrop

  useEffect(() => {
    if (!selectedMovie?.id) { setPage('home'); return }
    fetch(`${BASE}/movies/movie-details?movie_id=${selectedMovie.id}`)
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setMovie(d.data.movie) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedMovie?.id])

  if (loading) return <div className="mdp-loading">Loading...</div>
  if (error)   return <div className="mdp-error">⚠️ {error} <button onClick={() => setPage('home')}>Go Home</button></div>
  if (!movie)  return null

  const images = [movie.poster_path, movie.backdrop_path].filter(Boolean)
  const currentImg = images[imgIdx % images.length]

  const genres = Array.isArray(movie.genres)
    ? movie.genres.map(g => typeof g === 'object' ? g.name : g).filter(Boolean)
    : []

  const cast = Array.isArray(movie.cast) ? movie.cast : []

  return (
    <div className="mdp-root">
      <button className="mdp-back" onClick={() => setPage('home')}>← Back</button>

      {/* hero */}
      <div className="mdp-hero">
        {/* image slider */}
        <div className="mdp-img-wrap">
          {currentImg
            ? <img src={currentImg} alt={movie.title} className="mdp-img" />
            : <div className="mdp-img-ph">🎬</div>
          }
          {images.length > 1 && (
            <div className="mdp-img-dots">
              {images.map((_, i) => (
                <button key={i} className={`mdp-dot ${i === imgIdx % images.length ? 'active' : ''}`} onClick={() => setImgIdx(i)} />
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div className="mdp-info">
          {movie.certification && <span className="mdp-cert">{movie.certification}</span>}
          {movie.release_date && (
            <span className={`mdp-status-badge ${new Date(movie.release_date) > new Date() ? 'upcoming' : 'now-playing'}`}>
              {new Date(movie.release_date) > new Date() ? 'Upcoming' : 'Now Playing'}
            </span>
          )}

          <h1 className="mdp-title">{movie.title}</h1>
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="mdp-orig">Original: {movie.original_title}</p>
          )}

          <div className="mdp-meta-row">
            {movie.runtime > 0 && <span className="mdp-meta-item">⏱ {movie.runtime} min</span>}
            {movie.release_date && <span className="mdp-meta-item">📅 {fmt(movie.release_date)}</span>}
            {movie.original_language && <span className="mdp-meta-item">🌐 {LANG_MAP[movie.original_language] || movie.original_language.toUpperCase()}</span>}
          </div>

          {genres.length > 0 && (
            <div className="mdp-genres">
              {genres.map(g => <span key={g} className="mdp-genre">{g}</span>)}
            </div>
          )}

          {(movie.vote_average > 0 || movie.popularity > 0) && (
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
          )}

          <button className="mdp-book-btn">🎟 Book Tickets</button>
        </div>
      </div>

      <div className="mdp-body">
        <div className="mdp-main">
          {/* overview */}
          <div className="mdp-section">
            <h2 className="mdp-section-title">Overview</h2>
            <p className="mdp-overview">{movie.overview || 'No description available for this movie.'}</p>
          </div>

          {/* cast */}
          {cast.length > 0 && (
            <div className="mdp-section">
              <h2 className="mdp-section-title">Cast</h2>
              <div className="mdp-cast-row">
                {cast.map((p, i) => (
                  <div key={i} className="mdp-cast-item">
                    <div className="mdp-cast-avatar">
                      {p.profile_path
                        ? <img src={p.profile_path} alt={p.name} />
                        : <span>{p.name?.[0] || '?'}</span>
                      }
                    </div>
                    <p className="mdp-cast-name">{p.name}</p>
                    {p.character && <p className="mdp-cast-char">{p.character}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* details sidebar */}
        <div className="mdp-sidebar">
          <h3 className="mdp-sidebar-title">Movie Details</h3>
          <div className="mdp-details">
            {movie.release_date && <DetailRow label="Release Date" val={fmt(movie.release_date)} />}
            {movie.runtime > 0  && <DetailRow label="Runtime"      val={`${movie.runtime} minutes`} />}
            {movie.original_language && <DetailRow label="Language" val={LANG_MAP[movie.original_language] || movie.original_language.toUpperCase()} />}
            {movie.certification && <DetailRow label="Certification" val={movie.certification} />}
            {movie.adult !== undefined && <DetailRow label="Adult Content" val={movie.adult ? 'Yes' : 'No'} />}
            {movie.vote_average > 0 && <DetailRow label="TMDB Rating" val={`${Number(movie.vote_average).toFixed(1)} / 10`} />}
          </div>
        </div>
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
