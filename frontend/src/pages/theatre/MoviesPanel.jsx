import { useState, useEffect, useCallback } from 'react'
import './MoviesPanel.css'

const TMDB_IMG = 'https://image.tmdb.org/t/p/w92'

const LANG_MAP = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
  kn: 'Kannada', ml: 'Malayalam', mr: 'Marathi',
  bn: 'Bengali', pa: 'Punjabi', or: 'Odia',
}

const LANG_OPTIONS = Object.entries(LANG_MAP) // [['en','English'], ...]

const QUICK_FILTERS = [
  { label: 'Now Playing', type: 'type',     value: 'now_playing' },
  { label: 'Upcoming',    type: 'type',     value: 'upcoming'    },
  { label: 'English',     type: 'language', value: 'en'          },
  { label: 'Hindi',       type: 'language', value: 'hi'          },
  { label: 'Tamil',       type: 'language', value: 'ta'          },
  { label: 'Telugu',      type: 'language', value: 'te'          },
]

function buildQuery(filters, page) {
  const p = new URLSearchParams()
  if (filters.search)   p.set('search',   filters.search)
  if (filters.type)     p.set('type',     filters.type)
  if (filters.language) p.set('language', filters.language)
  if (filters.sort)     p.set('sort',     filters.sort)
  p.set('page',  page)
  p.set('limit', 10)
  return p.toString()
}

export default function MoviesPanel() {
  const [filters, setFilters] = useState({ search: '', type: '', language: '', sort: 'popularity_desc' })
  const [applied, setApplied] = useState({ search: '', type: '', language: '', sort: 'popularity_desc' })
  const [movies,  setMovies]  = useState([])
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const totalPages = Math.ceil(total / 10) || 1

  const fetchMovies = useCallback(async (f, pg) => {
    setLoading(true)
    setError('')
    try {
      const qs = buildQuery(f, pg)
      const res = await fetch(`http://localhost:5000/api/v1/movies?${qs}`, { credentials: 'include' })
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed to fetch movies')
      setMovies(data.data)
      // backend doesn't return total count yet — estimate from results
      if (data.data.length < 10 && pg === 1) setTotal(data.data.length)
      else setTotal(prev => Math.max(prev, pg * 10 + (data.data.length === 10 ? 10 : 0)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMovies(applied, page) }, [applied, page, fetchMovies])

  const handleSearch = () => {
    setApplied({ ...filters })
    setPage(1)
  }

  const handleReset = () => {
    const clean = { search: '', type: '', language: '', sort: 'popularity_desc' }
    setFilters(clean)
    setApplied(clean)
    setPage(1)
  }

  const handleQuickFilter = (qf) => {
    const next = { ...applied }
    if (qf.type === 'type') {
      next.type = next.type === qf.value ? '' : qf.value
    } else {
      next.language = next.language === qf.value ? '' : qf.value
    }
    setFilters(next)
    setApplied(next)
    setPage(1)
  }

  const isQFActive = (qf) =>
    qf.type === 'type' ? applied.type === qf.value : applied.language === qf.value

  // pagination pages to show
  const pageNums = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="mp-root">
      {/* header */}
      <div className="mp-header">
        <div>
          <h1 className="mp-title">Movies</h1>
          <p className="mp-sub">Search, browse and manage movies to create shows.</p>
        </div>
        <button className="mp-add-btn">+ Add Movie</button>
      </div>

      {/* filter bar */}
      <div className="mp-filter-bar">
        <div className="mp-filter-group">
          <label>Search</label>
          <div className="mp-search-wrap">
            <span className="mp-search-icon">🔍</span>
            <input
              placeholder="Search by title..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className="mp-filter-group">
          <label>Type</label>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="now_playing">Now Playing</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        <div className="mp-filter-group">
          <label>Language</label>
          <select value={filters.language} onChange={e => setFilters(f => ({ ...f, language: e.target.value }))}>
            <option value="">All Languages</option>
            {LANG_OPTIONS.map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <div className="mp-filter-group">
          <label>Sort By</label>
          <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}>
            <option value="popularity_desc">Popularity (High to Low)</option>
            <option value="release_date_desc">Release Date (Newest)</option>
            <option value="rating_desc">Rating (High to Low)</option>
          </select>
        </div>

        <div className="mp-filter-actions">
          <button className="mp-search-btn" onClick={handleSearch}>🔍 Search</button>
          <button className="mp-reset-btn" onClick={handleReset}>Reset</button>
        </div>
      </div>

      {/* quick filters */}
      <div className="mp-quick-filters">
        <span className="mp-qf-label">Quick Filters:</span>
        {QUICK_FILTERS.map(qf => (
          <button
            key={qf.label}
            className={`mp-qf-btn ${isQFActive(qf) ? 'active' : ''}`}
            onClick={() => handleQuickFilter(qf)}
          >
            {qf.label}
          </button>
        ))}
      </div>

      {/* error */}
      {error && <div className="mp-error">⚠️ {error}</div>}

      {/* table */}
      <div className="mp-table-wrap">
        <table className="mp-table">
          <thead>
            <tr>
              <th>MOVIE</th>
              <th>TYPE</th>
              <th>LANGUAGE</th>
              <th>RELEASE DATE</th>
              <th>POPULARITY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="mp-loading-row">Loading movies...</td></tr>
            )}
            {!loading && movies.length === 0 && (
              <tr><td colSpan={6} className="mp-empty-row">No movies found</td></tr>
            )}
            {!loading && movies.map(m => {
              const now = new Date()
              const rel = m.release_date ? new Date(m.release_date) : null
              const isUpcoming = rel && rel > now
              const langName = LANG_MAP[m.original_language] || m.original_language

              return (
                <tr key={m.id}>
                  <td>
                    <div className="mp-movie-cell">
                      {m.poster_path
                        ? <img src={`${TMDB_IMG}${m.poster_path}`} alt={m.title} className="mp-poster" />
                        : <div className="mp-poster-placeholder">🎬</div>
                      }
                      <div>
                        <p className="mp-movie-title">{m.title}</p>
                        {m.original_title && m.original_title !== m.title && (
                          <p className="mp-movie-orig">{m.original_title}</p>
                        )}
                        {m.adult && <span className="mp-adult-tag">18+</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`mp-type-badge ${isUpcoming ? 'upcoming' : 'now-playing'}`}>
                      {isUpcoming ? 'Upcoming' : 'Now Playing'}
                    </span>
                  </td>
                  <td>{langName}</td>
                  <td>{rel ? rel.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</td>
                  <td>
                    <span className="mp-pop">
                      🔥 {m.popularity ? m.popularity.toFixed(1) : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="mp-actions">
                      <button className="mp-action-btn" title="View">👁</button>
                      <button className="mp-action-btn" title="Edit">✏️</button>
                      <button className="mp-action-btn" title="More">⋯</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="mp-pagination">
        <span className="mp-showing">
          Showing {movies.length === 0 ? 0 : (page - 1) * 10 + 1} to {(page - 1) * 10 + movies.length} movies
        </span>
        <div className="mp-pages">
          <button className="mp-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {pageNums().map((p, i) =>
            p === '...'
              ? <span key={`e${i}`} className="mp-ellipsis">...</span>
              : <button
                  key={p}
                  className={`mp-page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
          )}
          <button className="mp-page-btn" onClick={() => setPage(p => p + 1)} disabled={movies.length < 10}>›</button>
        </div>
      </div>
    </div>
  )
}
