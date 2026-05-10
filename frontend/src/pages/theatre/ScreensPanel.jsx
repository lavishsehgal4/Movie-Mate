import { useState, useEffect } from 'react'
import { useNavigation } from '../../context/NavigationContext'
import './ScreensPanel.css'

const BASE = 'http://localhost:5000/api/v1/screens'

export default function ScreensPanel({ theatre }) {
  const { goToScreen } = useNavigation()
  const theatreId = theatre?.theatreId
  const canEdit   = theatre?.role === 'OWNER' || theatre?.role === 'MANAGER'

  const [screens,  setScreens]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [showAdd,  setShowAdd]  = useState(false)
  const [editId,   setEditId]   = useState(null)

  const load = () => {
    setLoading(true); setError('')
    fetch(`${BASE}?theatre_id=${theatreId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.success) throw new Error(d.message); setScreens(d.data.screens) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (theatreId) load() }, [theatreId])

  return (
    <div className="sp-root">
      <div className="sp-header">
        <div>
          <h1 className="sp-title">Screens</h1>
          <p className="sp-sub">Manage screens at this theatre</p>
        </div>
        {canEdit && (
          <button className="sp-add-btn" onClick={() => setShowAdd(true)}>+ Add Screen</button>
        )}
      </div>

      {!canEdit && <div className="sp-role-note">👁 View only — your role ({theatre?.role}) cannot add or edit screens.</div>}
      {error    && <div className="sp-error">⚠️ {error}</div>}
      {loading  && <div className="sp-loading">Loading screens...</div>}

      {!loading && (
        <div className="sp-grid">
          {screens.map(s => (
            <ScreenCard
              key={s.id}
              screen={s}
              canEdit={canEdit}
              theatre={theatre}
              onEdit={e => { e.stopPropagation(); setEditId(s.id) }}
              onClick={() => goToScreen({ ...s, theatre })}
            />
          ))}
          {canEdit && (
            <button className="sp-add-card" onClick={() => setShowAdd(true)}>
              <div className="sp-add-circle">+</div>
              <span>Add new screen</span>
            </button>
          )}
        </div>
      )}

      {showAdd && (
        <ScreenModal
          title="Add New Screen"
          theatreId={theatreId}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); load() }}
        />
      )}

      {editId && (
        <ScreenModal
          title={`Edit ${screens.find(s => s.id === editId)?.screen_name}`}
          theatreId={theatreId}
          screen={screens.find(s => s.id === editId)}
          onClose={() => setEditId(null)}
          onSuccess={() => { setEditId(null); load() }}
        />
      )}
    </div>
  )
}

function ScreenCard({ screen, canEdit, theatre, onEdit, onClick }) {
  return (
    <div className="sp-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div className="sp-card-top">
        <h3 className="sp-card-name">{screen.screen_name}</h3>
      </div>

      <div className="sp-card-stats">
        <div>
          <p className="sp-stat-label">ADDED ON</p>
          <p className="sp-stat-val">
            {screen.created_at
              ? new Date(screen.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—'}
          </p>
        </div>
      </div>

      <div className="sp-card-actions" onClick={e => e.stopPropagation()}>
        {canEdit && (
          <button className="sp-card-btn edit" onClick={onEdit}>Edit</button>
        )}
        <button
          className="sp-card-btn delete"
          onClick={() => alert('Delete API not available yet.')}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function ScreenModal({ title, theatreId, screen, onClose, onSuccess }) {
  const [name,   setName]   = useState(screen?.screen_name || '')
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const submit = async () => {
    if (!name.trim()) { setErr('Screen name is required'); return }
    setSaving(true); setErr('')
    try {
      const isEdit = !!screen
      const url    = isEdit ? `${BASE}/${screen.id}` : `${BASE}/create`
      const method = isEdit ? 'PATCH' : 'POST'
      const body   = isEdit
        ? { screen_name: name.trim(), theatre_id: theatreId }
        : { theatre_id: theatreId, screen_name: name.trim() }

      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!d.success) throw new Error(d.message)
      onSuccess()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>
        <h3 className="sp-modal-title">{title}</h3>
        <div className="sp-field">
          <label>Screen Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Screen 1, IMAX Hall"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>
        {err && <p className="sp-modal-err">⚠️ {err}</p>}
        <div className="sp-modal-actions">
          <button className="sp-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="sp-modal-confirm" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : (screen ? 'Save Changes' : 'Add Screen')}
          </button>
        </div>
      </div>
    </div>
  )
}
