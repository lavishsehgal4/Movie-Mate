import { useState } from 'react'
import { useNavigation } from '../context/NavigationContext'
import './PartnerPage.css'

const STEPS = ['Identity', 'Location', 'Operations', 'Review']

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
]

export default function PartnerPage() {
  const { setPage } = useNavigation()
  const [step, setStep] = useState(1)

  const [identity, setIdentity] = useState({ theatreName: '', chainName: '', totalScreens: '', logo: null, logoPreview: null })
  const [location, setLocation] = useState({ state: '', city: '', address: '', pincode: '', landmark: '', mapsUrl: '' })
  const [operations, setOperations] = useState({ contact: '', email: '', opensAt: '09:00 AM', closesAt: '11:30 PM' })

  const next = () => setStep(s => Math.min(s + 1, 4))
  const back = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div className="partner-root">
      {/* top bar */}
      <header className="partner-topbar">
        <button className="partner-logo" onClick={() => setPage('home')}>Movie<span>Mate</span></button>
        <button className="partner-back-link" onClick={() => setPage('profile')}>← Back to Profile</button>
      </header>

      <div className="partner-body">
        {/* badge */}
        <div className="partner-badge">🎬 THEATRE PARTNER PROGRAM</div>

        {/* heading */}
        <h1 className="partner-heading">
          List your <span className="partner-heading-italic">Theatre</span> on MovieMate
        </h1>
        <p className="partner-subheading">
          Join hundreds of cinema partners across India. Reach more<br />
          moviegoers and manage bookings in one place.
        </p>

        {/* stepper */}
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
                {i < STEPS.length - 1 && (
                  <div className={`partner-step-line ${done ? 'done' : ''}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* form card */}
        <div className="partner-card">
          {step === 1 && <StepIdentity data={identity} setData={setIdentity} onNext={next} />}
          {step === 2 && <StepLocation data={location} setData={setLocation} onNext={next} onBack={back} />}
          {step === 3 && <StepOperations data={operations} setData={setOperations} onNext={next} onBack={back} />}
          {step === 4 && <StepReview identity={identity} location={location} operations={operations} onBack={back} onSubmit={() => setPage('profile')} />}
        </div>
      </div>
    </div>
  )
}

/* ── STEP 1: IDENTITY ── */
function StepIdentity({ data, setData, onNext }) {
  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    set('logo', file)
    set('logoPreview', URL.createObjectURL(file))
  }

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
          <input placeholder="e.g. PVR Cinemas, INOX, Carnival" value={data.chainName} onChange={e => set('chainName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>TOTAL SCREENS</label>
          <input type="number" placeholder="e.g. 6" value={data.totalScreens} onChange={e => set('totalScreens', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label>CHAIN LOGO <span className="req">*</span></label>
        <label className="upload-box" htmlFor="logo-upload">
          {data.logoPreview
            ? <img src={data.logoPreview} alt="logo preview" className="logo-preview" />
            : <>
                <span className="upload-icon">🖼️</span>
                <p><span className="upload-link">Click to upload</span> or drag and drop</p>
                <p className="upload-hint">PNG, JPG, SVG · Max 2MB · Recommended 200×200px</p>
              </>
          }
        </label>
        <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
      </div>

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
function StepReview({ identity, location, operations, onBack, onSubmit }) {
  return (
    <div>
      <p className="step-tag">STEP 4 OF 4</p>
      <h2 className="step-title">Review & Submit</h2>
      <p className="step-sub">Double-check your details before submitting. You can always edit later.</p>

      <div className="review-section">
        <p className="review-section-title">THEATRE IDENTITY</p>
        <div className="review-grid">
          <div><span className="review-label">THEATRE NAME</span><span className="review-val">{identity.theatreName || '—'}</span></div>
          <div><span className="review-label">CHAIN NAME</span><span className="review-val">{identity.chainName || '—'}</span></div>
          <div><span className="review-label">TOTAL SCREENS</span><span className="review-val">{identity.totalScreens || 'Not specified'}</span></div>
          <div><span className="review-label">LOGO</span><span className="review-val">{identity.logo ? identity.logo.name : 'Not uploaded'}</span></div>
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
        <button className="btn-back" onClick={onBack}>← Edit Details</button>
        <button className="btn-submit" onClick={onSubmit}>Submit for Verification ✓</button>
      </div>
    </div>
  )
}
