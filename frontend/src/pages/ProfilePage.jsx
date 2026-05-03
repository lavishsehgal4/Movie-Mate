import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'
import './ProfilePage.css'

const SIDEBAR_SECTIONS = [
  {
    label: 'PERSONAL',
    items: [
      { id: 'profile',  icon: '👤', label: 'My Profile', active: true },
      { id: 'settings', icon: '⚙️', label: 'Account Settings' },
      { id: 'privacy',  icon: '🔒', label: 'Privacy & Security' },
    ]
  },
  {
    label: 'MOVIE ACTIVITY',
    items: [
      { id: 'tickets',   icon: '🎟️', label: 'My Tickets',      badge: 3 },
      { id: 'liked',     icon: '❤️', label: 'Liked Movies',     badge: 12 },
      { id: 'reminders', icon: '🔔', label: 'Movie Reminders',  badge: 2 },
      { id: 'reviews',   icon: '⭐', label: 'My Reviews' },
    ]
  },
  {
    label: 'PERKS',
    items: [
      { id: 'wallet',    icon: '💳', label: 'Wallet & Payments' },
      { id: 'loyalty',   icon: '🏆', label: 'Loyalty Points' },
      { id: 'notifs',    icon: '🔔', label: 'Notifications' },
    ]
  },
  {
    label: 'PREFERENCES',
    items: [
      { id: 'appearance', icon: '🎨', label: 'Appearance' },
      { id: 'language',   icon: '🌐', label: 'Language' },
    ]
  },
]

const recentBookings = [
  { id: 1, title: 'Dune: Part Two',          venue: 'PVR Cinemas, Ludhiana', date: 'Apr 28, 2026 · 7:30 PM', format: 'IMAX', seats: 'A4, A5', status: 'Confirmed', icon: '🎬' },
  { id: 2, title: 'Interstellar Re-release',  venue: 'Carnival Cinemas',      date: 'May 3, 2026 · 9:00 PM',  format: '4DX',  seats: 'C7, C8', status: 'Upcoming', icon: '🎬' },
  { id: 3, title: 'KGF Chapter 3',            venue: 'Inox Cinemas',          date: 'Mar 15, 2026 · 6:00 PM', format: '',     seats: 'F2, F3', status: 'Watched',  icon: '🎟️' },
]

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return iso }
}

function formatMemberSince(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  } catch { return '' }
}

export default function ProfilePage() {
  const { user, setUser, theatreAccess, logout } = useAuth()
  const { setPage } = useNavigation()
  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState('')

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', dateOfBirth: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleLogout = async () => {
    await logout()
    setPage('home')
  }

  // fetch profile on mount
  useEffect(() => {
    let cancelled = false
    async function fetchProfile() {
      setLoadingProfile(true)
      setProfileError('')
      try {
        const res = await fetch('http://localhost:5000/api/v1/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
        if (cancelled) return
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('application/json')) throw new Error(`Unable to load profile (${res.status})`)
        const data = await res.json()
        if (!data.success) throw new Error(data.message || 'Failed to load profile')
        setProfile(data.data)
        setEditForm({
          firstName:   data.data.firstName   || '',
          lastName:    data.data.lastName    || '',
          dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.slice(0, 10) : '',
        })
      } catch (err) {
        if (cancelled) return
        const msg = err.message || 'Failed to load profile'
        setProfileError(msg.length > 120 ? 'Unable to load profile. Please try again.' : msg)
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [])

  const handleEditToggle = () => {
    if (editing) {
      setEditForm({
        firstName:   profile?.firstName   || '',
        lastName:    profile?.lastName    || '',
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
      })
      setSaveError('')
      setSaveSuccess(false)
    }
    setEditing(e => !e)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:   editForm.firstName,
          lastName:    editForm.lastName,
          dateOfBirth: editForm.dateOfBirth,
        }),
      })
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Update failed')

      // update local profile state
      setProfile(prev => ({ ...prev, ...data.data }))
      // update global auth state + sessionStorage
      const updated = { ...user, ...data.data }
      setUser(updated)
      try { sessionStorage.setItem('mm_user', JSON.stringify(updated)) } catch {}

      setSaveSuccess(true)
      setEditing(false)
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile?.firstName || user?.firstName || ''
  const displayInitial = displayName?.[0] || '?'

  return (
    <div className="pp-root">

      {/* ── TOP NAV ── */}
      <header className="pp-topnav">
        <button className="pp-logo" onClick={() => setPage('home')}>
          Movie<span>Mate</span>
        </button>
        <div className="pp-topnav-right">
          <button className="pp-tn-link">My Bookings</button>
          <div className="pp-tn-city">📍 Ludhiana</div>
          <div className="pp-tn-user">
            <div className="pp-tn-avatar">{displayInitial}</div>
            <span>{profile?.firstName || user?.firstName}</span>
          </div>
        </div>
      </header>

      <div className="pp-body">

        {/* ── SIDEBAR ── */}
        <aside className="pp-sidebar">
          {/* user card */}
          <div className="pp-sb-user">
            <div className="pp-sb-avatar">{displayInitial}</div>
            <div>
              <p className="pp-sb-name">{profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}</p>
              <p className="pp-sb-email">{profile?.email || '—'}</p>
              <span className="pp-gold-badge">★ Gold Member</span>
            </div>
          </div>

          {/* nav sections */}
          {SIDEBAR_SECTIONS.map(section => (
            <div key={section.label} className="pp-sb-section">
              <p className="pp-sb-section-label">{section.label}</p>
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`pp-sb-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="pp-sb-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="pp-sb-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}

          {/* bottom links */}
          <div className="pp-sb-bottom">
            {theatreAccess?.hasTheatreAccess
              ? (
                <button className="pp-sb-item pp-sb-partner" onClick={() => setPage('my-theatre')}>
                  <span className="pp-sb-icon">🏟️</span><span>Manage Your Theatres</span>
                </button>
              ) : (
                <button className="pp-sb-item pp-sb-partner" onClick={() => setPage('partner')}>
                  <span className="pp-sb-icon">✨</span><span>Become a Partner</span>
                </button>
              )
            }
            <button className="pp-sb-item">
              <span className="pp-sb-icon">❓</span><span>Help & Support</span>
            </button>
            <button className="pp-sb-item">
              <span className="pp-sb-icon">ℹ️</span><span>About Us</span>
            </button>
            <button className="pp-sb-item pp-sb-logout" onClick={handleLogout}>
              <span className="pp-sb-icon">🚪</span><span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="pp-main">
          {/* breadcrumb */}
          <div className="pp-breadcrumb">
            <button onClick={() => setPage('home')}>Home</button>
            <span>›</span>
            <span className="pp-bc-active">My Profile</span>
          </div>

          {/* welcome row */}
          <div className="pp-welcome-row">
            <div>
              <p className="pp-welcome-label">Welcome back,</p>
              <h1 className="pp-welcome-name">{profile?.firstName || user?.firstName} 👋</h1>
              <p className="pp-welcome-meta">Member since {formatMemberSince(profile?.createdAt)}</p>
            </div>
            <div className="pp-welcome-btns">
              <button className="pp-btn-outline">Edit Profile</button>
              <button className="pp-btn-solid">Book a Movie</button>
            </div>
          </div>

          {/* stats row */}
          <div className="pp-stats">
            <div className="pp-stat-card">
              <p className="pp-stat-label">MOVIES BOOKED</p>
              <p className="pp-stat-val">24</p>
              <p className="pp-stat-sub">+3 this month</p>
            </div>
            <div className="pp-stat-card">
              <p className="pp-stat-label">LOYALTY POINTS</p>
              <p className="pp-stat-val">1,840</p>
              <p className="pp-stat-sub">Gold tier · 160 to Platinum</p>
            </div>
            <div className="pp-stat-card">
              <p className="pp-stat-label">LIKED MOVIES</p>
              <p className="pp-stat-val">12</p>
              <p className="pp-stat-sub">In your watchlist</p>
            </div>
            <div className="pp-stat-card">
              <p className="pp-stat-label">UPCOMING SHOWS</p>
              <p className="pp-stat-val">2</p>
              <p className="pp-stat-sub">Reminders set</p>
            </div>
          </div>

          {/* personal info */}
          <h2 className="pp-section-title">Personal Information</h2>
          <div className="pp-info-card">
            <div className="pp-info-header">
              <div className="pp-info-avatar">{displayInitial}</div>
              <div>
                <p className="pp-info-name">{profile?.firstName} {profile?.lastName}</p>
                <p className="pp-info-since">Member since {formatMemberSince(profile?.createdAt)}</p>
                <span className="pp-gold-badge">★ Gold Member</span>
              </div>
              <button className="pp-update-btn" onClick={handleEditToggle}>
                {editing ? 'Cancel' : 'Update Profile'}
              </button>
            </div>

            {/* loading / error */}
            {loadingProfile && (
              <div className="pp-info-loading">
                <span className="pp-loading-dot" />
                Loading profile...
              </div>
            )}
            {profileError && (
              <div className="pp-info-error">
                <span>⚠️</span> {profileError}
              </div>
            )}

            {!loadingProfile && !profileError && (
              editing ? (
                /* ── EDIT MODE: only firstName, lastName, dob ── */
                <div>
                  <div className="pp-form-grid">
                    <div className="pp-field">
                      <label>FIRST NAME</label>
                      <input
                        value={editForm.firstName}
                        onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="pp-field">
                      <label>LAST NAME</label>
                      <input
                        value={editForm.lastName}
                        onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                      />
                    </div>
                    <div className="pp-field">
                      <label>DATE OF BIRTH</label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={e => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    {/* read-only fields shown as disabled */}
                    <div className="pp-field">
                      <label>EMAIL ADDRESS <span className="pp-readonly-tag">read-only</span></label>
                      <input value={profile?.email || '—'} disabled className="pp-disabled" />
                    </div>
                    <div className="pp-field">
                      <label>PHONE NUMBER <span className="pp-readonly-tag">read-only</span></label>
                      <input value={profile?.phoneNumber || '—'} disabled className="pp-disabled" />
                    </div>
                  </div>
                  <div className="pp-form-actions">
                    <button className="pp-cancel-btn" onClick={handleEditToggle}>Cancel</button>
                    <button className="pp-save-btn" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  {saveError   && <p className="pp-save-error">⚠️ {saveError}</p>}
                  {saveSuccess && <p className="pp-save-success">✓ Profile updated successfully</p>}
                </div>
              ) : (
                /* ── VIEW MODE: display as text ── */
                <div className="pp-info-display">
                  <div className="pp-info-row">
                    <div className="pp-info-field">
                      <span className="pp-info-label">FIRST NAME</span>
                      <span className="pp-info-val">{profile?.firstName || '—'}</span>
                    </div>
                    <div className="pp-info-field">
                      <span className="pp-info-label">LAST NAME</span>
                      <span className="pp-info-val">{profile?.lastName || '—'}</span>
                    </div>
                  </div>
                  <div className="pp-info-row">
                    <div className="pp-info-field">
                      <span className="pp-info-label">EMAIL ADDRESS</span>
                      <span className="pp-info-val">{profile?.email || '—'}</span>
                    </div>
                    <div className="pp-info-field">
                      <span className="pp-info-label">PHONE NUMBER</span>
                      <span className="pp-info-val">{profile?.phoneNumber || '—'}</span>
                    </div>
                  </div>
                  <div className="pp-info-row">
                    <div className="pp-info-field">
                      <span className="pp-info-label">DATE OF BIRTH</span>
                      <span className="pp-info-val">{formatDate(profile?.dateOfBirth)}</span>
                    </div>
                    <div className="pp-info-field">
                      <span className="pp-info-label">ROLE</span>
                      <span className="pp-info-val">{profile?.role || '—'}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* recent bookings */}
          <h2 className="pp-section-title">Recent Bookings</h2>
          <div className="pp-bookings">
            {recentBookings.map(b => (
              <div key={b.id} className="pp-booking-card">
                <div className="pp-booking-icon">{b.icon}</div>
                <div className="pp-booking-info">
                  <p className="pp-booking-title">{b.title}</p>
                  <p className="pp-booking-meta">{b.venue} · {b.date}</p>
                  {b.format && <p className="pp-booking-format">{b.format}</p>}
                </div>
                <div className="pp-booking-right">
                  <span className="pp-booking-seats">{b.seats}</span>
                  <span className={`pp-booking-status ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
