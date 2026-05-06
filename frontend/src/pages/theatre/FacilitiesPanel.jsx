import { useState, useEffect } from 'react'
import './FacilitiesPanel.css'

const BASE = 'http://localhost:5000/api/v1/theatre'

function abbr(name) {
  const w = name.trim().split(/\s+/)
  return w.length === 1 ? name.slice(0, 2).toUpperCase() : w.map(x => x[0]).join('').slice(0, 3).toUpperCase()
}

export default function FacilitiesPanel({ theatre }) {
  const [facilities, setFacilities] = useState([])   // [{ id, facility_name, facility_logo, is_selected }]
  const [selected,   setSelected]   = useState(new Set())
  const [original,   setOriginal]   = useState(new Set())
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [confirm,    setConfirm]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState('')

  useEffect(() => {
    if (!theatre?.theatreId) return
    let cancelled = false
    setLoading(true); setError('')
    fetch(`${BASE}/facilities?theatre_id=${theatre.theatreId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        if (!d.success) throw new Error(d.message)
        // response: { allFacilities: [...], selectedFacilities: [id, ...] }
        const { allFacilities, selectedFacilities } = d.data
        setFacilities(allFacilities)
        const sel = new Set(selectedFacilities.map(id => Number(id)))
        setSelected(sel)
        setOriginal(new Set(sel))
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [theatre?.theatreId])

  const toggle = id => {
    setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
    setMsg('')
  }

  const changed = () => {
    if (selected.size !== original.size) return true
    for (const id of selected) if (!original.has(id)) return true
    return false
  }

  const save = async () => {
    setSaving(true); setMsg('')
    try {
      const r = await fetch(`${BASE}/facilities/sync`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theatre_id: theatre.theatreId, facility_ids: [...selected] }),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      setOriginal(new Set(selected))
      setMsg('✓ Saved')
    } catch (e) {
      setMsg(`⚠️ ${e.message}`)
    } finally {
      setSaving(false); setConfirm(false)
    }
  }

  if (loading) return <div className="fp-state">Loading...</div>
  if (error)   return <div className="fp-state error">⚠️ {error}</div>

  return (
    <div className="fp-root">
      <div className="fp-header">
        <div>
          <h1 className="fp-title">Facilities</h1>
          <p className="fp-sub">Select facilities available at your theatre</p>
        </div>
        <button className="fp-save-btn" onClick={() => setConfirm(true)} disabled={!changed() || saving}>
          Save Changes
        </button>
      </div>

      {msg && <div className={`fp-msg ${msg.startsWith('✓') ? 'success' : 'error'}`}>{msg}</div>}

      <p className="fp-grid-label">AVAILABLE FACILITIES · SELECT ALL THAT APPLY</p>
      <div className="fp-grid">
        {facilities.map(f => {
          const on = selected.has(f.id)
          return (
            <button key={f.id} className={`fp-card ${on ? 'active' : ''}`} onClick={() => toggle(f.id)}>
              <div className="fp-card-left">
                {f.facility_logo
                  ? <img src={f.facility_logo} alt={f.facility_name} className="fp-card-img" onError={e => e.target.style.display='none'} />
                  : <span className="fp-card-abbr">{abbr(f.facility_name)}</span>
                }
                <span className="fp-card-name">{f.facility_name}</span>
              </div>
              <div className={`fp-toggle ${on ? 'on' : ''}`} />
            </button>
          )
        })}
      </div>

      {confirm && (
        <div className="fp-overlay" onClick={() => setConfirm(false)}>
          <div className="fp-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="fp-dialog-title">Confirm Changes</h3>
            <p className="fp-dialog-body">Save facility changes for <strong>{theatre.theatre_name}</strong>?</p>
            <div className="fp-dialog-summary">{selected.size} facilit{selected.size !== 1 ? 'ies' : 'y'} selected</div>
            <div className="fp-dialog-actions">
              <button className="fp-dialog-cancel" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="fp-dialog-confirm" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : 'Yes, Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
