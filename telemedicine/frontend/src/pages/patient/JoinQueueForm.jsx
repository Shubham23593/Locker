import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import './JoinQueueForm.css'

const SPECIALIZATIONS = [
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Orthopedist',
  'General Physician',
  'Pulmonologist',
  'Gastroenterologist'
]

const EMERGENCY_COLORS = {
  1: 'bg-green-100 text-green-700 border-green-300',
  2: 'bg-lime-100 text-lime-700 border-lime-300',
  3: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  4: 'bg-orange-100 text-orange-700 border-orange-300',
  5: 'bg-red-100 text-red-700 border-red-300'
}

const EMERGENCY_LABELS = {
  1: 'Level 1 — Very Low',
  2: 'Level 2 — Low',
  3: 'Level 3 — Moderate',
  4: 'Level 4 — High',
  5: 'Level 5 — Critical'
}

export default function JoinQueueForm() {
  const [step, setStep] = useState(1)
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    // Step 1
    name: '',
    age: '',
    gender: '',
    visitType: 'checkup',
    previousVisits: '',
    // Step 2
    symptoms: '',
    emergencyLevel: 1,
    // Step 3
    consultationMode: 'video',
    assignMode: 'auto',
    doctorId: ''
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  async function fetchDoctors() {
    setLoadingDoctors(true)
    try {
      const res = await api.get('/doctors/active')
      setDoctors(res.data?.data || res.data || [])
    } catch {
      setDoctors([])
    } finally {
      setLoadingDoctors(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function nextStep() {
    if (step === 1) {
      if (!form.name || !form.age || !form.gender) {
        setError('Please fill all required fields.')
        return
      }
    }
    if (step === 2) {
      if (!form.symptoms) {
        setError('Please describe your symptoms.')
        return
      }
    }
    setError('')
    setStep((s) => s + 1)
  }

  function prevStep() {
    setError('')
    setStep((s) => s - 1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const payload = {
      patientName: form.name,
      age: Number(form.age),
      gender: form.gender,
      visitType: form.visitType,
      previousVisits: form.visitType === 'followup' ? Number(form.previousVisits) || 0 : 0,
      symptoms: form.symptoms,
      chiefComplaint: form.symptoms,
      emergencyLevel: Number(form.emergencyLevel),
      consultationMode: form.consultationMode,
      assignMode: form.assignMode,
      doctorId: form.assignMode === 'custom' ? form.doctorId : undefined
    }

    try {
      const res = await api.post('/consultation/join', payload)
      setSuccess(res.data)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Progress indicator
  const steps = ['Patient Info', 'Symptoms', 'Consultation']

  return (
    <div className="join-queue">
      <div className="join-card">
        <h2>Join Consultation Queue</h2>
        <p className="join-subtitle">Fill in your details to get in the queue</p>

        {step < 4 && (
          <div className="step-progress">
            {steps.map((label, idx) => {
              const stepNum = idx + 1
              const isActive = step === stepNum
              const isDone = step > stepNum
              return (
                <React.Fragment key={label}>
                  <div className="step-item">
                    <div className={`step-circle ${isDone ? 'step-circle--done' : isActive ? 'step-circle--active' : 'step-circle--pending'}`}>
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span className={`step-label ${isActive ? 'step-label--active' : isDone ? 'step-label--done' : 'step-label--pending'}`}>
                      {label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`step-connector ${isDone ? 'step-connector--done' : 'step-connector--pending'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {error && <div className="join-error">{error}</div>}

        {step === 1 && (
          <div className="step-content">
            <div className="jq-form-group">
              <label className="jq-label">Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="jq-input" />
            </div>
            <div className="jq-grid-2">
              <div className="jq-form-group">
                <label className="jq-label">Age *</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} min="1" max="120" placeholder="e.g. 30" className="jq-input" />
              </div>
              <div className="jq-form-group">
                <label className="jq-label">Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="jq-input">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="jq-label">Visit Type *</label>
              <div className="visit-type-grid" style={{marginTop:'4px'}}>
                {['checkup', 'followup'].map((v) => (
                  <button key={v} type="button" onClick={() => setForm((p) => ({ ...p, visitType: v }))}
                    className={`visit-type-btn${form.visitType === v ? ' visit-type-btn--active' : ''}`}>
                    {v === 'checkup' ? '🩺 New Checkup' : '🔄 Follow-up'}
                  </button>
                ))}
              </div>
            </div>
            {form.visitType === 'followup' && (
              <div className="jq-form-group">
                <label className="jq-label">Number of Previous Visits</label>
                <input type="number" name="previousVisits" value={form.previousVisits} onChange={handleChange} min="1" placeholder="e.g. 2" className="jq-input" />
              </div>
            )}
            <button type="button" onClick={nextStep} className="jq-btn-primary" style={{marginTop:'8px'}}>Next: Symptoms →</button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div className="jq-form-group">
              <label className="jq-label">Chief Complaint / Symptoms *</label>
              <textarea name="symptoms" value={form.symptoms} onChange={handleChange} rows={4} placeholder="Describe your main symptoms..." className="jq-input" style={{resize:'none'}} />
            </div>
            <div>
              <label className="jq-label">Emergency Level *</label>
              <div className="emergency-list" style={{marginTop:'4px'}}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button key={lvl} type="button"
                    onClick={() => setForm((p) => ({ ...p, emergencyLevel: lvl }))}
                    className={`emergency-btn${form.emergencyLevel === lvl ? ` selected-${lvl}` : ''}`}>
                    <span className={`emergency-dot emergency-dot--${lvl}`} />
                    {EMERGENCY_LABELS[lvl]}
                    {form.emergencyLevel === lvl && <span className="emergency-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            {(form.emergencyLevel === 4 || form.emergencyLevel === 5) && (
              <div className="emergency-warning">
                <p>⚠️ Warning: Select High Emergency only for severe cases. Misuse may result in a fine or queue penalty.</p>
                <p>High emergency is for life-threatening or critical conditions only.</p>
              </div>
            )}
            <div className="btn-row">
              <button type="button" onClick={prevStep} className="jq-btn-secondary">← Back</button>
              <button type="button" onClick={nextStep} className="jq-btn-primary">Next: Consultation →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="step-content">
            <div>
              <label className="jq-label">Consultation Mode *</label>
              <div className="mode-grid" style={{marginTop:'4px'}}>
                {[{val:'video',icon:'📹',label:'Video Call'},{val:'chat',icon:'💬',label:'Chat'}].map((m) => (
                  <button key={m.val} type="button"
                    onClick={() => setForm((p) => ({ ...p, consultationMode: m.val }))}
                    className={`mode-btn${form.consultationMode === m.val ? ' mode-btn--active' : ''}`}>
                    <span className="mode-icon">{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="jq-label">Doctor Assignment</label>
              <div className="mode-grid" style={{marginTop:'4px'}}>
                {[{val:'auto',icon:'🤖',label:'Auto-Assign'},{val:'custom',icon:'👨‍⚕️',label:'Choose Doctor'}].map((m) => (
                  <button key={m.val} type="button"
                    onClick={() => setForm((p) => ({ ...p, assignMode: m.val }))}
                    className={`mode-btn${form.assignMode === m.val ? ' mode-btn--active' : ''}`}>
                    <span className="mode-icon">{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>
            {form.assignMode === 'custom' && (
              <div className="jq-form-group">
                <label className="jq-label">Select Doctor</label>
                {loadingDoctors ? <p style={{fontSize:'0.875rem',color:'#6b7280'}}>Loading doctors...</p> : (
                  <select name="doctorId" value={form.doctorId} onChange={handleChange} required={form.assignMode === 'custom'} className="jq-input">
                    <option value="">-- Select a doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>Dr. {doc.name} — {doc.specialization} ({doc.queueLength || 0} waiting)</option>
                    ))}
                  </select>
                )}
              </div>
            )}
            <div className="join-summary">
              <h4>Summary</h4>
              <ul>
                <li>👤 {form.name}, {form.age}y, {form.gender}</li>
                <li>🩺 {form.visitType} — Emergency Level {form.emergencyLevel}</li>
                <li>💬 {form.consultationMode} | {form.assignMode === 'auto' ? 'Auto-assign' : 'Custom doctor'}</li>
              </ul>
            </div>
            <div className="btn-row">
              <button type="button" onClick={prevStep} className="jq-btn-secondary">← Back</button>
              <button type="submit" disabled={submitting} className="jq-btn-primary">{submitting ? 'Joining...' : '🚀 Join Queue'}</button>
            </div>
          </form>
        )}

        {step === 4 && success && (
          <div className="join-success">
            <div className="success-icon">✅</div>
            <h3>You're in the queue!</h3>
            <div className="join-success-box">
              <div className="join-success-row">
                <span className="label">Queue Position</span>
                <span className="value-big">#{success.data?.queuePosition || success.queuePosition || '—'}</span>
              </div>
              <div className="join-success-row">
                <span className="label">Estimated Wait</span>
                <span className="value">{success.data?.estimatedWait || success.estimatedWait || '~15'} min</span>
              </div>
              {(success.data?.doctorName || success.doctorName) && (
                <div className="join-success-row">
                  <span className="label">Assigned Doctor</span>
                  <span className="value">Dr. {success.data?.doctorName || success.doctorName}</span>
                </div>
              )}
            </div>
            <button onClick={() => { setStep(1); setSuccess(null); setForm({ name:'',age:'',gender:'',visitType:'checkup',previousVisits:'',symptoms:'',emergencyLevel:1,consultationMode:'video',assignMode:'auto',doctorId:'' }) }} className="join-success-btn">
              Join Another Queue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
