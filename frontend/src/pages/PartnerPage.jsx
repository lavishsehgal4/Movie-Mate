import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import './PartnerPage.css'

const STEPS = ['Identity', 'Location', 'Operations', 'Review']

const CHAINS = [
  { name: 'PVR',             logo: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Pvrcinemas_logo.jpg' },
  { name: 'INOX',            logo: 'https://play-lh.googleusercontent.com/YVRYEMlLLzjT8beaXzH1HgmFiX5GkydblLjGi7mtTAZqdfPWQwojqF30rMfEZmcXHhs' },
  { name: 'Cinepolis',       logo: 'data:image/png;base64,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' },
  { name: 'Carnival Cinemas', logo: 'https://images-platform.99static.com/0gem64jiBm9SWZ7VKqlxozP9cYk=/500x500/top/smart/99designs-contests-attachments/17/17837/attachment_17837494' },
  { name: 'Wave Cinemas',     logo: 'https://cdn.district.in/movies-assets/images/cinema/Wave-logo-2fba9450-e7ad-11ef-92d2-15600bedb040.png?im=Resize,width=320' },
  { name: 'SRS Cinemas',      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEq9pl_58U6pVfWupPz5TynNxOqB6bTKA_jw&s' },
  { name: 'Others',           logo: 'https://cdn-icons-png.flaticon.com/512/1040/1040967.png' },
]

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
]

export default function PartnerPage() {
  const { setPage } = useNavigation()
  const { theatreAccess, refreshTheatreAccess } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [identity, setIdentity] = useState({ theatreName: '', chainName: '', chainLogoUrl: '', totalScreens: '', customChainName: '' })
  const [location, setLocation] = useState({ state: '', city: '', address: '', pincode: '', landmark: '', mapsUrl: '' })
  const [operations, setOperations] = useState({ contact: '', email: '', opensAt: '09:00 AM', closesAt: '11:30 PM' })

  const next = () => setStep(s => Math.min(s + 1, 4))
  const back = () => setStep(s => Math.max(s - 1, 1))

  // convert "09:00 AM" → ISO date string (today's date with that time)
  function timeToISO(timeStr) {
    const [time, ampm] = timeStr.split(' ')
    let [h, m] = time.split(':').map(Number)
    if (ampm === 'PM' && h !== 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const chainName = identity.chainName === 'Others' ? identity.customChainName : identity.chainName
      const payload = {
        theatre_name:   identity.theatreName,
        chain_name:     chainName,
        chain_logo:     identity.chainLogoUrl,
        total_screens:  identity.totalScreens ? Number(identity.totalScreens) : null,
        state:          location.state,
        city:           location.city,
        address:        location.address,
        pincode:        location.pincode ? Number(location.pincode) : null,
        landmark:       location.landmark || null,
        google_map_url: location.mapsUrl || null,
        contact_no:     operations.contact.replace(/\D/g, '').slice(-10), // strip to 10 digits
        email:          operations.email,
        opening_time:   timeToISO(operations.opensAt),
        closing_time:   timeToISO(operations.closesAt),
      }

      const res = await fetch('http://localhost:5000/api/v1/theatre/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) throw new Error(`Server error (${res.status})`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed to create theatre')

      // refresh has-access and store in sessionStorage
      await refreshTheatreAccess()

      setPage('profile')
    } catch (err) {
      setSubmitError(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="partner-root">
      <header className="partner-topbar">
        <button className="partner-logo" onClick={() => setPage('home')}>Movie<span>Mate</span></button>
        <button className="partner-back-link" onClick={() => setPage('profile')}>← Back to Profile</button>
      </header>

      <div className="partner-body">
        <div className="partner-badge">🎬 THEATRE PARTNER PROGRAM</div>
        <h1 className="partner-heading">
          List your <span className="partner-heading-italic">Theatre</span> on MovieMate
        </h1>
        <p className="partner-subheading">
          Join hundreds of cinema partners across India. Reach more<br />
          moviegoers and manage bookings in one place.
        </p>

        <div className="partner-stepper">
          {STEPS.map((label, i) => {
            const num = i + 1
            const done = num < step
            const active = num === step
            return (
              <div key={label} className="partner-step-wrap">
                <div className={`partner-step-circle ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                  {done ? '✓' : num}
                </div>
                <span className={`partner-step-label ${active ? 'active' : ''} ${done ? 'done' : ''}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`partner-step-line ${done ? 'done' : ''}`} />}
              </div>
            )
          })}
        </div>

        <div className="partner-card">
          {step === 1 && <StepIdentity data={identity} setData={setIdentity} onNext={next} />}
          {step === 2 && <StepLocation data={location} setData={setLocation} onNext={next} onBack={back} />}
          {step === 3 && <StepOperations data={operations} setData={setOperations} onNext={next} onBack={back} />}
          {step === 4 && <StepReview identity={identity} location={location} operations={operations} onBack={back} onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />}
        </div>
      </div>
    </div>
  )
}

/* ── STEP 1: IDENTITY ── */
function StepIdentity({ data, setData, onNext }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const handleChainSelect = (e) => {
    const selected = e.target.value
    const chain = CHAINS.find(c => c.name === selected)
    set('chainName', selected)
    set('chainLogoUrl', chain ? chain.logo : '')
    if (selected !== 'Others') set('customChainName', '')
  }

  const displayName = data.chainName === 'Others' ? data.customChainName : data.chainName
  const logoUrl = data.chainLogoUrl

  return (
    <div>
      <p className="step-tag">STEP 1 OF 4</p>
      <h2 className="step-title">Theatre Identity</h2>
      <p className="step-sub">Tell us about your theatre — name, brand, and how it looks.</p>

      <div className="form-group">
        <label>THEATRE NAME <span className="req">*</span></label>
        <input placeholder="e.g. PVR Ludhiana Central" value={data.theatreName} onChange={e => set('theatreName', e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>CHAIN / BRAND NAME <span className="req">*</span></label>
          <select value={data.chainName} onChange={handleChainSelect}>
            <option value="">Select chain</option>
            {CHAINS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          {data.chainName === 'Others' && (
            <input
              style={{ marginTop: 8 }}
              placeholder="Enter your chain / brand name"
              value={data.customChainName}
              onChange={e => set('customChainName', e.target.value)}
            />
          )}
        </div>
        <div className="form-group">
          <label>TOTAL SCREENS</label>
          <input type="number" placeholder="e.g. 6" value={data.totalScreens} onChange={e => set('totalScreens', e.target.value)} />
        </div>
      </div>

      {/* logo preview from URL */}
      {logoUrl && (
        <div className="form-group">
          <label>CHAIN LOGO</label>
          <div className="chain-logo-preview">
            <img src={logoUrl} alt={displayName} onError={e => e.target.style.display='none'} />
            <span className="chain-logo-name">{displayName}</span>
          </div>
        </div>
      )}

      <div className="step-footer">
        <p className="req-note">Fields marked <span className="req">*</span> are required</p>
        <button className="btn-next" onClick={onNext}>Continue →</button>
      </div>
    </div>
  )
}

/* ── STEP 2: LOCATION ── */
function StepLocation({ data, setData, onNext, onBack }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const isMapUrl = data.mapsUrl.includes('google.com/maps') || data.mapsUrl.includes('goo.gl')

  return (
    <div>
      <p className="step-tag">STEP 2 OF 4</p>
      <h2 className="step-title">Location Details</h2>
      <p className="step-sub">Where is your theatre located? Be precise so moviegoers can find you easily.</p>

      <div className="form-row">
        <div className="form-group">
          <label>STATE <span className="req">*</span></label>
          <select value={data.state} onChange={e => set('state', e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>CITY <span className="req">*</span></label>
          <input placeholder="e.g. Ludhiana" value={data.city} onChange={e => set('city', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>FULL ADDRESS <span className="req">*</span></label>
        <input placeholder="Building, Street, Area" value={data.address} onChange={e => set('address', e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>PINCODE</label>
          <input placeholder="e.g. 141001" value={data.pincode} onChange={e => set('pincode', e.target.value)} />
        </div>
        <div className="form-group">
          <label>LANDMARK</label>
          <input placeholder="e.g. Near Railway Station" value={data.landmark} onChange={e => set('landmark', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>GOOGLE MAPS URL</label>
        <input placeholder="Paste your Google Maps link here..." value={data.mapsUrl} onChange={e => set('mapsUrl', e.target.value)} />
      </div>

      <div className="form-group">
        <label>MAP PREVIEW</label>
        <div className="map-preview-box">
          {isMapUrl
            ? <p className="map-preview-ok">📍 Map link added</p>
            : <><span className="map-pin">📍</span><p className="map-preview-hint">Paste a Google Maps link above to preview</p></>
          }
        </div>
      </div>

      <div className="step-footer">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <button className="btn-next" onClick={onNext}>Continue →</button>
      </div>
    </div>
  )
}

/* ── STEP 3: OPERATIONS ── */
function StepOperations({ data, setData, onNext, onBack }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const times = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h % 12 === 0 ? 12 : h % 12
      const mm = m === 0 ? '00' : '30'
      const ampm = h < 12 ? 'AM' : 'PM'
      times.push(`${String(hh).padStart(2,'0')}:${mm} ${ampm}`)
    }
  }

  return (
    <div>
      <p className="step-tag">STEP 3 OF 4</p>
      <h2 className="step-title">Contact & Operations</h2>
      <p className="step-sub">How can moviegoers and our team reach you? When are you open?</p>

      <div className="info-banner">
        ℹ️ These contact details will be shown to moviegoers on your theatre's public listing. Make sure they're accurate and actively monitored.
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>CONTACT NUMBER <span className="req">*</span></label>
          <input placeholder="+91 XXXXX XXXXX" value={data.contact} onChange={e => set('contact', e.target.value)} />
        </div>
        <div className="form-group">
          <label>EMAIL ADDRESS <span className="req">*</span></label>
          <input placeholder="theatre@example.com" value={data.email} onChange={e => set('email', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>OPENING TIME <span className="req">*</span></label>
          <select value={data.opensAt} onChange={e => set('opensAt', e.target.value)}>
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>CLOSING TIME <span className="req">*</span></label>
          <select value={data.closesAt} onChange={e => set('closesAt', e.target.value)}>
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="step-footer">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <button className="btn-next" onClick={onNext}>Review & Submit →</button>
      </div>
    </div>
  )
}

/* ── STEP 4: REVIEW ── */
function StepReview({ identity, location, operations, onBack, onSubmit, submitting, submitError }) {
  const displayChain = identity.chainName === 'Others' ? identity.customChainName : identity.chainName

  return (
    <div>
      <p className="step-tag">STEP 4 OF 4</p>
      <h2 className="step-title">Review & Submit</h2>
      <p className="step-sub">Double-check your details before submitting. You can always edit later.</p>

      <div className="review-section">
        <p className="review-section-title">THEATRE IDENTITY</p>
        <div className="review-grid">
          <div><span className="review-label">THEATRE NAME</span><span className="review-val">{identity.theatreName || '—'}</span></div>
          <div><span className="review-label">CHAIN NAME</span><span className="review-val">{displayChain || '—'}</span></div>
          <div><span className="review-label">TOTAL SCREENS</span><span className="review-val">{identity.totalScreens || 'Not specified'}</span></div>
          <div>
            <span className="review-label">LOGO</span>
            {identity.chainLogoUrl
              ? <div className="review-logo-wrap">
                  <img src={identity.chainLogoUrl} alt={displayChain} className="review-logo-img" onError={e => e.target.style.display='none'} />
                  <span className="review-logo-url">{identity.chainLogoUrl}</span>
                </div>
              : <span className="review-val">Not selected</span>
            }
          </div>
        </div>
      </div>

      <div className="review-section">
        <p className="review-section-title">LOCATION</p>
        <div className="review-grid">
          <div><span className="review-label">CITY</span><span className="review-val">{location.city || '—'}</span></div>
          <div><span className="review-label">STATE</span><span className="review-val">{location.state || '—'}</span></div>
          <div className="review-full"><span className="review-label">ADDRESS</span><span className="review-val">{location.address || '—'}</span></div>
          <div><span className="review-label">PINCODE</span><span className="review-val">{location.pincode || '—'}</span></div>
          <div><span className="review-label">LANDMARK</span><span className="review-val">{location.landmark || '—'}</span></div>
        </div>
      </div>

      <div className="review-section">
        <p className="review-section-title">CONTACT & OPERATIONS</p>
        <div className="review-grid">
          <div><span className="review-label">CONTACT</span><span className="review-val">{operations.contact || '—'}</span></div>
          <div><span className="review-label">EMAIL</span><span className="review-val">{operations.email || '—'}</span></div>
          <div><span className="review-label">OPENS AT</span><span className="review-val">{operations.opensAt}</span></div>
          <div><span className="review-label">CLOSES AT</span><span className="review-val">{operations.closesAt}</span></div>
        </div>
      </div>

      <div className="verification-box">
        <span className="verification-icon">🛡️</span>
        <div>
          <p className="verification-title">Verification Required</p>
          <p className="verification-desc">After submission our team will review your details within 24–48 hours. You'll receive an email once your theatre is verified and live on MovieMate.</p>
        </div>
      </div>

      <div className="step-footer">
        <button className="btn-back" onClick={onBack} disabled={submitting}>← Edit Details</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {submitError && <p style={{ fontSize: 12, color: '#ff6b7a', margin: 0 }}>⚠️ {submitError}</p>}
          <button className="btn-submit" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Verification ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
