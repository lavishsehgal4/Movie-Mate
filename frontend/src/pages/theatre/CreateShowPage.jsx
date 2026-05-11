import { useState, useEffect } from 'react'
import './CreateShowPage.css'

const BASE = 'http://localhost:5000/api/v1'
const TMDB_IMG = 'https://image.tmdb.org/t/p/w92'

const LANGS = ['English','Hindi','Tamil','Telugu','Kannada','Malayalam','Marathi','Bengali','Punjabi']
const FORMATS = ['2D','3D','IMAX','4DX','IMAX 3D','Dolby Atmos']

function getDateLabel(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  if (offset === 0) return { label: 'Today', date: d }
  if (offset === 1) return { label: 'Tomorrow', date: d }
  return { label: d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' }), date: d }
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10)
}

function addMinutes(timeStr, mins) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m + mins
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`
}

function buildISO(dateObj, timeStr, startTimeStr) {
  const d = new Date(dateObj)
  const [h, m] = timeStr.split(':').map(Number)
  d.setHours(h, m, 0, 0)

  // overnight: if end time <= start time, end is next day
  if (startTimeStr) {
    const [sh, sm] = startTimeStr.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins   = h  * 60 + m
    if (endMins <= startMins) {
      d.setDate(d.getDate() + 1)
    }
  }

  return d.toISOString()
}

export default function CreateShowPage({ movie, theatre, onBack }) {
  const [screens,  setScreens]  = useState([])
  const [selScreen, setSelScreen] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState(null)

  // shows per day: { 0: [{start,end,lang,format,price}], 1: [...], 2: [...] }
  const [dayShows, setDayShows] = useState({ 0: [], 1: [], 2: [] })

  const days = [0, 1, 2].map(getDateLabel)

  useEffect(() => {
    fetch(`${BASE}/screens?theatre_id=${theatre.theatreId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setScreens(d.data.screens)
          if (d.data.screens.length) setSelScreen(d.data.screens[0])
        }
      })
      .catch(() => {})
  }, [theatre.theatreId])

  const addShow = (dayOffset) => {
    setDayShows(prev => ({
      ...prev,
      [dayOffset]: [...prev[dayOffset], { start: '10:00', end: addMinutes('10:00', movie.runtime || 120), lang: 'Hindi', format: '2D', price: '200' }]
    }))
  }

  const removeShow = (dayOffset, idx) => {
    setDayShows(prev => ({
      ...prev,
      [dayOffset]: prev[dayOffset].filter((_, i) => i !== idx)
    }))
  }

  const updateShow = (dayOffset, idx, field, value) => {
    setDayShows(prev => {
      const updated = prev[dayOffset].map((s, i) => {
        if (i !== idx) return s
        const next = { ...s, [field]: value }
        if (field === 'start') next.end = addMinutes(value, movie.runtime || 120)
        return next
      })
      return { ...prev, [dayOffset]: updated }
    })
  }

  const handleSave = async () => {
    if (!selScreen) { setMsg({ text: 'Select a screen first', type: 'error' }); return }

    const now = new Date()
    const allShows = []
    const warnings = []

    days.forEach(({ date }, offset) => {
      dayShows[offset].forEach((s, idx) => {
        const startISO = buildISO(date, s.start)
        const endISO   = buildISO(date, s.end, s.start)
        const startDt  = new Date(startISO)

        // warn if start is in the past (only for today)
        if (offset === 0 && startDt < now) {
          warnings.push(`Day ${offset + 1} show #${idx + 1} (${s.start}) start time is in the past`)
        }

        allShows.push({
          start_time: startISO,
          end_time:   endISO,
          language:   s.lang,
          format:     s.format,
          base_price: Number(s.price),
          _isPast:    offset === 0 && startDt < now,
        })
      })
    })

    if (!allShows.length) { setMsg({ text: 'Add at least one show', type: 'error' }); return }

    // show warnings but still allow submission
    if (warnings.length) {
      setMsg({ text: `⚠️ Note: ${warnings.length} show(s) have past start times and will be rejected by the server.`, type: 'warn' })
    }

    setSaving(true)
    try {
      const payload = allShows.map(({ _isPast, ...s }) => s)
      const r = await fetch(`${BASE}/shows/create`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie_id:   movie.id,
          theatre_id: theatre.theatreId,
          screen_id:  selScreen.id,
          city:       theatre.city,
          shows:      payload,
        }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setMsg({ text: `✓ ${d.data.shows.length} show(s) created successfully!`, type: 'success' })
      setDayShows({ 0: [], 1: [], 2: [] })
    } catch (e) {
      setMsg({ text: `⚠️ ${e.message}`, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="csp-root">
      {/* header */}
      <div className="csp-header">
        <button className="csp-back" onClick={onBack}>← Back to Movies</button>
        <h2 className="csp-title">Create Shows</h2>
      </div>

      {/* movie card */}
      <div className="csp-movie-card">
        {movie.poster_path
          ? <img src={`${TMDB_IMG}${movie.poster_path}`} alt={movie.title} className="csp-poster" />
          : <div className="csp-poster-ph">🎬</div>
        }
        <div>
          <p className="csp-movie-title">{movie.title}</p>
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="csp-movie-orig">{movie.original_title}</p>
          )}
          <div className="csp-movie-meta">
            {movie.runtime && <span>⏱ {movie.runtime} min</span>}
            {movie.original_language && <span>🌐 {movie.original_language.toUpperCase()}</span>}
          </div>
        </div>
      </div>

      {/* screen selector */}
      <div className="csp-section">
        <p className="csp-section-label">SELECT SCREEN</p>
        <div className="csp-screens">
          {screens.map(s => (
            <button
              key={s.id}
              className={`csp-screen-btn ${selScreen?.id === s.id ? 'active' : ''}`}
              onClick={() => setSelScreen(s)}
            >
              {s.screen_name}
            </button>
          ))}
        </div>
      </div>

      {/* shows per day */}
      {days.map(({ label, date }, offset) => (
        <div key={offset} className="csp-day-section">
          <div className="csp-day-header">
            <span className="csp-day-label">{label} — {toDateStr(date)}</span>
            <button className="csp-add-show-btn" onClick={() => addShow(offset)}>+ Add Show</button>
          </div>

          {dayShows[offset].length === 0 && (
            <p className="csp-no-shows">No shows added for this day</p>
          )}

          {dayShows[offset].map((s, idx) => {
            const now = new Date()
            const startDt = new Date(days[offset].date)
            const [sh, sm] = s.start.split(':').map(Number)
            startDt.setHours(sh, sm, 0, 0)
            const isPast = offset === 0 && startDt < now

            return (
            <div key={idx} className={`csp-show-row ${isPast ? 'past' : ''}`}>
              <div className="csp-show-field">
                <label>Start</label>
                <input type="time" value={s.start}
                  onChange={e => updateShow(offset, idx, 'start', e.target.value)} />
              </div>
              <div className="csp-show-field">
                <label>End</label>
                <input type="time" value={s.end}
                  onChange={e => updateShow(offset, idx, 'end', e.target.value)} />
              </div>
              <div className="csp-show-field">
                <label>Language</label>
                <select value={s.lang} onChange={e => updateShow(offset, idx, 'lang', e.target.value)}>
                  {LANGS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="csp-show-field">
                <label>Format</label>
                <select value={s.format} onChange={e => updateShow(offset, idx, 'format', e.target.value)}>
                  {FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="csp-show-field">
                <label>Base Price (₹)</label>
                <input type="number" value={s.price} min="1"
                  onChange={e => updateShow(offset, idx, 'price', e.target.value)} />
              </div>
              <button className="csp-remove-btn" onClick={() => removeShow(offset, idx)}>✕</button>
              {isPast && <span className="csp-past-badge">⚠ Past</span>}
            </div>
            )
          })}
        </div>
      ))}

      {msg && <div className={`csp-msg ${msg.type}`}>{msg.text}</div>}

      <div className="csp-footer">
        <button className="csp-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Creating...' : 'Create Shows'}
        </button>
      </div>
    </div>
  )
}
