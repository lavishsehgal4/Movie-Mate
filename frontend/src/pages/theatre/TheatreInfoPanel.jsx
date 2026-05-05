import { useState, useEffect } from 'react'
import './TheatreInfoPanel.css'

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch { return iso }
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return iso }
}

export default function TheatreInfoPanel({ theatre: selectedTheatre }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!selectedTheatre?.theatreId) return
    let cancelled = false

    async function fetch_() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/theatre/by-id?theatre_id=${selectedTheatre.theatreId}`,
          { credentials: 'include' }
        )
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`)
        const json = await res.json()
        if (!json.success) throw new Error(json.message || 'Failed to load theatre info')
        if (!cancelled) setData(json.data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetch_()
    return () => { cancelled = true }
  }, [selectedTheatre?.theatreId])

  if (loading) return <div className="ti-state">Loading theatre info...</div>
  if (error)   return <div className="ti-state error">⚠️ {error}</div>
  if (!data)   return null

  const t = data.theatre
  const role = data.role

  return (
    <div className="ti-root">
      {/* page header */}
      <div className="ti-header">
        <div className="ti-header-left">
          {t.chain_logo && (
            <div className="ti-logo-wrap">
              <img src={t.chain_logo} alt={t.chain_name} onError={e => e.target.style.display='none'} />
            </div>
          )}
          <div>
            <h1 className="ti-title">{t.theatre_name}</h1>
            <p className="ti-sub">{t.chain_name} · {t.city}, {t.state}</p>
          </div>
        </div>
        <div className="ti-header-badges">
          <span className={`ti-badge ${t.is_verified ? 'verified' : 'pending'}`}>
            {t.is_verified ? '✓ Verified' : '⏳ Pending Verification'}
          </span>
          <span className={`ti-badge ${t.is_active ? 'active' : 'inactive'}`}>
            {t.is_active ? '● Active' : '○ Inactive'}
          </span>
          <span className={`ti-badge role ${role?.toLowerCase()}`}>{role}</span>
        </div>
      </div>

      {/* info sections */}
      <div className="ti-sections">

        {/* Basic Info */}
        <div className="ti-section">
          <p className="ti-section-title">Basic Information</p>
          <div className="ti-grid">
            <InfoField label="Theatre Name"   value={t.theatre_name} />
            <InfoField label="Chain / Brand"  value={t.chain_name} />
            <InfoField label="Total Screens"  value={t.total_screens ?? '—'} />
            <InfoField label="Rating"         value={t.rating ? `${t.rating} ★` : 'Not rated yet'} />
            <InfoField label="Registered On"  value={formatDate(t.created_at)} />
          </div>
        </div>

        {/* Location */}
        <div className="ti-section">
          <p className="ti-section-title">Location</p>
          <div className="ti-grid">
            <InfoField label="City"    value={t.city} />
            <InfoField label="State"   value={t.state} />
            <InfoField label="Address" value={t.address} wide />
          </div>
        </div>

        {/* Contact */}
        <div className="ti-section">
          <p className="ti-section-title">Contact & Operations</p>
          <div className="ti-grid">
            <InfoField label="Contact Number" value={t.contact_no} />
            <InfoField label="Email Address"  value={t.email} />
            <InfoField label="Opening Time"   value={formatTime(t.opening_time)} />
            <InfoField label="Closing Time"   value={formatTime(t.closing_time)} />
          </div>
        </div>

      </div>

      <p className="ti-readonly-note">ℹ️ This information is read-only. Contact support to request changes.</p>
    </div>
  )
}

function InfoField({ label, value, wide }) {
  return (
    <div className={`ti-field ${wide ? 'wide' : ''}`}>
      <span className="ti-field-label">{label}</span>
      <span className="ti-field-value">{value || '—'}</span>
    </div>
  )
}
