import { useState, useEffect } from 'react'
import SeatLayoutEditor from './SeatLayoutEditor'
import './ScreenDetailPage.css'

const API = 'http://localhost:5000/api/v1/seats'

// ── shared seat grid ──────────────────────────────────────
function SeatGrid({ layout, inactiveSet, onSeatClick, clickable }) {
  return (
    <div className="sdp-preview-wrap">
      <div className="sdp-preview-grid">
        {layout?.rows?.map((row, ri) => {
          if (!row.hasSeats && !row.hasText) return <div key={ri} className="sdp-empty-row" />
          if (row.hasText) return <div key={ri} className="sdp-text-row">{row.text}</div>
          if (!row.seats?.some(s => s.type === 1)) return null
          return (
            <div key={ri} className="sdp-seat-row">
              <span className="sdp-row-label">{row.rowName}</span>
              <div className="sdp-seats">
                {row.seats.map((s, ci) => {
                  if (s.type === 0) return <div key={ci} className="sdp-gap" />
                  const key = `${row.rowName}-${s.displayNumber}`
                  const inactive = inactiveSet.has(key)
                  return (
                    <div key={ci}
                      className={`sdp-seat ${clickable ? 'ssm-seat' : ''} ${inactive ? 'inactive' : ''}`}
                      onClick={clickable ? () => onSeatClick(row.rowName, s.displayNumber) : undefined}
                      title={`${row.rowName}${s.displayNumber} · ${s.seat_type}${inactive ? ' · INACTIVE' : ''}`}
                    >
                      {inactive ? '✕' : s.displayNumber}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CurvedScreen() {
  return (
    <div className="sdp-screen-curve-wrap">
      <div className="sdp-screen-curve"><span>SCREEN</span></div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────
export default function ScreenDetailPage({ screen, theatre, onBack }) {
  const [layoutData, setLayoutData] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [statusMode, setStatusMode] = useState(false)

  const load = () => {
    setLoading(true); setError('')
    fetch(`${API}/layout?screen_id=${screen.id}&theatre_id=${theatre.theatreId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setLayoutData(d.data.screen) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [screen.id])

  const handleSaveLayout = async (layoutJson) => {
    try {
      const layout = JSON.parse(layoutJson)
      const r = await fetch(`${API}/create`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screen_id: screen.id, theatre_id: theatre.theatreId, seat_layout: layout }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setShowEditor(false); load()
    } catch (e) { alert(`Failed to save: ${e.message}`) }
  }

  if (showEditor) return (
    <SeatLayoutEditor
      screenName={screen.screen_name}
      existingLayout={layoutData?.seat_layout || null}
      onBack={() => setShowEditor(false)}
      onSave={handleSaveLayout}
    />
  )

  if (statusMode) return (
    <SeatStatusManager
      screen={screen}
      theatre={theatre}
      layoutData={layoutData}
      onBack={() => { setStatusMode(false); load() }}
    />
  )

  const layout        = layoutData?.seat_layout
  const inactiveSeats = layoutData?.seats || []
  const inactiveSet   = new Set(inactiveSeats.map(s => `${s.row_label}-${s.seat_number}`))
  const capacity      = layout?.rows?.reduce((a, r) => a + (r.hasSeats ? r.seats.filter(s => s.type === 1).length : 0), 0) ?? null

  return (
    <div className="sdp-root">
      <button className="sdp-back" onClick={onBack}>← Back to Screens</button>

      <div className="sdp-section-label">SCREEN INFO</div>
      <div className="sdp-info-cards">
        {[
          { label: 'SCREEN NAME', val: screen.screen_name, cls: 'orange', sub: layout ? 'Layout configured' : 'Normal format' },
          { label: 'CAPACITY',    val: loading ? '...' : (capacity ?? '—'), sub: capacity ? 'Total seats' : 'No layout yet' },
          { label: 'GRID SIZE',   val: layout ? `${layout.gridRows}×${layout.gridCols}` : '—', sub: layout ? 'Rows × Columns' : 'Not configured' },
          { label: 'INACTIVE',    val: inactiveSeats.length, sub: inactiveSeats.length > 0 ? 'Seats deactivated' : 'All seats active' },
        ].map(c => (
          <div key={c.label} className="sdp-info-card">
            <p className="sdp-info-label">{c.label}</p>
            <p className={`sdp-info-val ${c.cls || ''}`}>{c.val}</p>
            <p className="sdp-info-sub">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="sdp-section-label">SEAT LAYOUT</div>

      {loading && <div className="sdp-loading">Loading layout...</div>}
      {error   && <div className="sdp-error">⚠️ {error}</div>}

      {!loading && !layout && (
        <div className="sdp-no-layout">
          <div className="sdp-no-layout-icon">🪑</div>
          <h2>No seat layout configured</h2>
          <p>This screen doesn't have a seat layout yet. Create one to start scheduling shows and accepting bookings on this screen.</p>
          <button className="sdp-create-btn" onClick={() => setShowEditor(true)}>⊞ Create Seat Layout</button>
          <p className="sdp-hint">You won't be able to add shows to this screen until a layout is saved.</p>
        </div>
      )}

      {!loading && layout && (
        <div className="sdp-layout-view">
          <div className="sdp-layout-header">
            <div>
              <p className="sdp-layout-title">Current Layout</p>
              <p className="sdp-layout-sub">{capacity} seats · {inactiveSeats.length} inactive</p>
            </div>
            <button className="sdp-edit-btn" onClick={() => setShowEditor(true)}>Edit Layout</button>
          </div>

          {/* seats — centered */}
          <SeatGrid layout={layout} inactiveSet={inactiveSet} clickable={false} />

          {/* screen box — inside card, below seats */}
          <CurvedScreen />
        </div>
      )}

      {/* manage seat status — outside card, below */}
      {!loading && layout && (
        <div className="sdp-below-screen">
          <button className="sdp-manage-status-btn" onClick={() => setStatusMode(true)}>
            ⚙ Manage Seat Status
          </button>
        </div>
      )}
    </div>
  )
}

// ── seat status manager ───────────────────────────────────
function SeatStatusManager({ screen, theatre, layoutData, onBack }) {
  const layout        = layoutData?.seat_layout
  const inactiveSeats = layoutData?.seats || []   // [{ id, row_label, seat_number }]

  // id map for currently inactive seats
  const idMap = {}
  inactiveSeats.forEach(s => { idMap[`${s.row_label}-${s.seat_number}`] = s.id })

  const [inactive, setInactive] = useState(() => new Set(Object.keys(idMap)))
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState(null)   // { text, type }

  const toggle = (rowName, seatNum) => {
    const key = `${rowName}-${seatNum}`
    setInactive(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
    setMsg(null)
  }

  const origSet = new Set(Object.keys(idMap))
  const hasChanges = () => {
    if (inactive.size !== origSet.size) return true
    for (const k of inactive) if (!origSet.has(k)) return true
    return false
  }

  const save = async () => {
    // Build changes: compare current inactive set vs original
    const toActivate   = [...origSet].filter(k => !inactive.has(k))   // was inactive, now active
    const toDeactivate = [...inactive].filter(k => !origSet.has(k))   // was active, now inactive

    if (!toActivate.length && !toDeactivate.length) {
      setMsg({ text: 'No changes to save.', type: 'info' }); return
    }

    setSaving(true); setMsg(null)

    const callStatus = async (keys, is_active) => {
      const seats = keys.map(k => {
        const idx = k.lastIndexOf('-')
        return { row_label: k.slice(0, idx), seat_number: Number(k.slice(idx + 1)) }
      })
      const r = await fetch(`${API}/status`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screen_id:  screen.id,
          theatre_id: theatre.theatreId,
          seats,
          is_active,
        }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
    }

    try {
      if (toActivate.length)   await callStatus(toActivate, true)
      if (toDeactivate.length) await callStatus(toDeactivate, false)
      setMsg({ text: `✓ ${toActivate.length + toDeactivate.length} seat(s) updated successfully.`, type: 'success' })
    } catch (e) {
      setMsg({ text: `⚠️ ${e.message}`, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const totalSeats = layout?.rows?.reduce((a, r) => a + (r.hasSeats ? r.seats.filter(s => s.type === 1).length : 0), 0) || 0

  return (
    <div className="ssm-root">
      <div className="ssm-header">
        <div>
          <button className="sdp-back" onClick={onBack}>← Back to Screen</button>
          <h2 className="ssm-title">Manage Seat Status</h2>
          <p className="ssm-sub">{screen.screen_name} · Click any seat to toggle active / inactive</p>
        </div>
        <button className="ssm-save-btn" onClick={save} disabled={!hasChanges() || saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {msg && <div className={`ssm-msg ${msg.type}`}>{msg.text}</div>}

      <div className="ssm-legend">
        <span className="ssm-legend-item"><span className="ssm-dot active" />Active</span>
        <span className="ssm-legend-item"><span className="ssm-dot inactive" />Inactive</span>
        <span className="ssm-legend-sep" />
        <span className="ssm-count">{totalSeats - inactive.size} active · {inactive.size} inactive</span>
      </div>

      {/* seat grid — clickable */}
      <div className="ssm-grid-wrap">
        <SeatGrid
          layout={layout}
          inactiveSet={inactive}
          clickable={true}
          onSeatClick={toggle}
        />
      </div>

      {/* curved screen at bottom */}
      <CurvedScreen />

      <p className="ssm-summary">{totalSeats - inactive.size} active · {inactive.size} inactive</p>
    </div>
  )
}
