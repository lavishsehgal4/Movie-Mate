import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'
import './ProfilePage.css'

const NAV_ITEMS = [
  { id: 'profile',   icon: '👤', label: 'User Info' },
  { id: 'bookings',  icon: '🎟️', label: 'My Bookings' },
  { id: 'settings',  icon: '⚙️', label: 'Account & Settings' },
  { id: 'chat',      icon: '💬', label: 'Chat With Us' },
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { setPage } = useNavigation()
  const [active, setActive] = useState('profile')

  const handleLogout = () => {
    logout()
    setPage('home')
  }

  return (
    <div className="profile-page">

      {/* ── SIDEBAR ── */}
      <aside className="profile-sidebar">
        <button className="sidebar-back" onClick={() => setPage('home')}>
          ← Back
        </button>

        <div className="sidebar-logo">Movie<span>Mate</span></div>

        {/* user mini card */}
        <div className="sidebar-user">
          {user?.imageUrl
            ? <img src={user.imageUrl} alt={user.firstName} className="sidebar-avatar" />
            : <div className="sidebar-avatar-placeholder">{user?.firstName?.[0]}</div>
          }
          <div>
            <p className="sidebar-name">{user?.firstName} {user?.lastName}</p>
            <p className="sidebar-tag">Member</p>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* nav items */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${active === item.id ? 'active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <button className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="profile-main">
        {active === 'profile'   && <UserInfoPanel user={user} />}
        {active === 'bookings'  && <BookingsPanel />}
        {active === 'settings'  && <SettingsPanel />}
        {active === 'chat'      && <ChatPanel />}
      </main>
    </div>
  )
}

/* ── USER INFO ── */
function UserInfoPanel({ user }) {
  return (
    <div className="panel">
      {/* welcome banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <p className="welcome-greeting">Welcome back,</p>
          <h1 className="welcome-name">{user?.firstName} <span>{user?.lastName}</span> 👋</h1>
          <p className="welcome-sub">Great to see you again. Ready to book your next movie?</p>
        </div>
        <div className="welcome-avatar-wrap">
          {user?.imageUrl
            ? <img src={user.imageUrl} alt={user.firstName} className="welcome-avatar" />
            : (
              <div className="welcome-avatar-placeholder">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )
          }
          <div className="avatar-glow" />
        </div>
      </div>

      {/* info cards */}
      <h2 className="section-heading">Your Information</h2>
      <div className="info-grid">
        <div className="info-card">
          <span className="info-label">First Name</span>
          <span className="info-value">{user?.firstName || '—'}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Last Name</span>
          <span className="info-value">{user?.lastName || '—'}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Member ID</span>
          <span className="info-value mono">#{user?.id?.slice(0, 8) || '—'}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Account Type</span>
          <span className="info-value">
            <span className="badge-member">Member</span>
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── BOOKINGS ── */
function BookingsPanel() {
  return (
    <div className="panel">
      <h1 className="panel-title">My Bookings</h1>
      <p className="panel-sub">Your upcoming and past movie tickets.</p>
      <div className="empty-state">
        <span className="empty-icon">🎟️</span>
        <p>No bookings yet</p>
        <span>Book your first movie to see it here</span>
      </div>
    </div>
  )
}

/* ── SETTINGS ── */
function SettingsPanel() {
  return (
    <div className="panel">
      <h1 className="panel-title">Account & Settings</h1>
      <p className="panel-sub">Manage your preferences and account details.</p>
      <div className="settings-list">
        {[
          { icon: '🔒', label: 'Change Password', desc: 'Update your account password' },
          { icon: '🔔', label: 'Notifications', desc: 'Manage email and push notifications' },
          { icon: '🌐', label: 'Language & Region', desc: 'Set your preferred language and city' },
          { icon: '🗑️', label: 'Delete Account', desc: 'Permanently remove your account', danger: true },
        ].map(item => (
          <div key={item.label} className={`settings-item ${item.danger ? 'danger' : ''}`}>
            <span className="settings-icon">{item.icon}</span>
            <div>
              <p className="settings-label">{item.label}</p>
              <p className="settings-desc">{item.desc}</p>
            </div>
            <span className="settings-arrow">›</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── CHAT ── */
function ChatPanel() {
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Hi there! How can we help you today?' }
  ])

  const send = () => {
    if (!msg.trim()) return
    setMessages(m => [
      ...m,
      { from: 'user', text: msg },
      { from: 'support', text: "Thanks for reaching out! Our team will get back to you shortly." }
    ])
    setMsg('')
  }

  return (
    <div className="panel chat-panel">
      <h1 className="panel-title">Chat With Us</h1>
      <p className="panel-sub">We typically reply within a few minutes.</p>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Type your message..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="chat-input"
        />
        <button className="chat-send" onClick={send}>Send</button>
      </div>
    </div>
  )
}
