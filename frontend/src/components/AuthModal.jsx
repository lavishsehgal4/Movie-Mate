import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

const API = '/api/v1/auth'

export default function AuthModal({ onClose }) {
  const { login } = useAuth()
  const [tab, setTab] = useState('login')   // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // login fields
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' })

  // signup fields
  const [signupForm, setSignupForm] = useState({
    firstName: '', lastName: '', email: '',
    phoneNumber: '', dateOfBirth: '', password: '',
  })

  const handleLoginChange = e =>
    setLoginForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSignupChange = e =>
    setSignupForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = `${API}/google`
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* close */}
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* logo */}
        <div className="modal-logo">Movie<span>Mate</span></div>

        {/* tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Login
          </button>
          <button
            className={`modal-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >
            Sign Up
          </button>
        </div>

        {/* error */}
        {error && <div className="modal-error">{error}</div>}

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form className="modal-form" onSubmit={handleLogin}>
            <div className="field">
              <label>Email or Phone</label>
              <input
                type="text"
                name="identifier"
                placeholder="Enter email or phone number"
                value={loginForm.identifier}
                onChange={handleLoginChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="modal-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* ── SIGNUP FORM ── */}
        {tab === 'signup' && (
          <form className="modal-form" onSubmit={handleSignup}>
            <div className="field-row">
              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  value={signupForm.firstName}
                  onChange={handleSignupChange}
                  required
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  value={signupForm.lastName}
                  onChange={handleSignupChange}
                />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={signupForm.email}
                onChange={handleSignupChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="10-digit phone number"
                value={signupForm.phoneNumber}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="field">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={signupForm.dateOfBirth}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={signupForm.password}
                onChange={handleSignupChange}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="modal-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* divider */}
        <div className="modal-divider"><span>or</span></div>

        {/* Google */}
        <button className="google-btn" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {tab === 'login' ? 'Login with Google' : 'Sign up with Google'}
        </button>

        {/* switch tab hint */}
        <p className="modal-switch">
          {tab === 'login'
            ? <>Don't have an account? <button onClick={() => { setTab('signup'); setError('') }}>Sign up</button></>
            : <>Already have an account? <button onClick={() => { setTab('login'); setError('') }}>Login</button></>
          }
        </p>

      </div>
    </div>
  )
}
