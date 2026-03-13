import React, { useState, useEffect } from 'react'
import api from '../../services/api'

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
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Join Consultation Queue</h2>
        <p className="text-sm text-gray-500 mb-6">Fill in your details to get in the queue</p>

        {/* Step Progress */}
        {step < 4 && (
          <div className="flex items-center mb-8">
            {steps.map((label, idx) => {
              const stepNum = idx + 1
              const isActive = step === stepNum
              const isDone = step > stepNum
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      isDone
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-[-12px] ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Patient Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  placeholder="e.g. 30"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Visit Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {['checkup', 'followup'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, visitType: v }))}
                    className={`py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.visitType === v
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {v === 'checkup' ? '🩺 New Checkup' : '🔄 Follow-up'}
                  </button>
                ))}
              </div>
            </div>
            {form.visitType === 'followup' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Number of Previous Visits
                </label>
                <input
                  type="number"
                  name="previousVisits"
                  value={form.previousVisits}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 2"
                  className="input-field"
                />
              </div>
            )}
            <button type="button" onClick={nextStep} className="btn-primary w-full mt-2">
              Next: Symptoms →
            </button>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Chief Complaint / Symptoms *
              </label>
              <textarea
                name="symptoms"
                value={form.symptoms}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your main symptoms or reason for visit..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Emergency Level *
              </label>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, emergencyLevel: lvl }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-medium text-left transition-all ${
                      form.emergencyLevel === lvl
                        ? `${EMERGENCY_COLORS[lvl]} border-opacity-100`
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-current opacity-20 flex-shrink-0" />
                    {EMERGENCY_LABELS[lvl]}
                    {form.emergencyLevel === lvl && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* High emergency warning */}
            {(form.emergencyLevel === 4 || form.emergencyLevel === 5) && (
              <div className="p-4 bg-red-50 border-2 border-red-400 rounded-xl">
                <p className="text-red-700 font-semibold text-sm">
                  ⚠️ Warning: Select High Emergency only for severe cases. Misuse may result in a
                  fine or queue penalty.
                </p>
                <p className="text-red-600 text-xs mt-1">
                  High emergency is for life-threatening or critical conditions only (e.g., chest
                  pain, breathing difficulty, severe trauma).
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={prevStep} className="btn-secondary flex-1">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="btn-primary flex-1">
                Next: Consultation →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Consultation Settings */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Consultation Mode *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'video', icon: '📹', label: 'Video Call' },
                  { val: 'chat', icon: '💬', label: 'Chat' }
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, consultationMode: m.val }))}
                    className={`py-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.consultationMode === m.val
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.icon}</div>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Doctor Assignment
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'auto', icon: '🤖', label: 'Auto-Assign' },
                  { val: 'custom', icon: '👨‍⚕️', label: 'Choose Doctor' }
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, assignMode: m.val }))}
                    className={`py-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.assignMode === m.val
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.icon}</div>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {form.assignMode === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Select Doctor
                </label>
                {loadingDoctors ? (
                  <p className="text-sm text-gray-500">Loading doctors...</p>
                ) : (
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    required={form.assignMode === 'custom'}
                    className="input-field"
                  >
                    <option value="">-- Select a doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        Dr. {doc.name} — {doc.specialization} ({doc.queueLength || 0} waiting)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <h4 className="font-semibold text-gray-700 mb-2">Summary</h4>
              <ul className="space-y-1 text-gray-600">
                <li>👤 {form.name}, {form.age}y, {form.gender}</li>
                <li>🩺 {form.visitType} — Emergency Level {form.emergencyLevel}</li>
                <li>💬 {form.consultationMode} | {form.assignMode === 'auto' ? 'Auto-assign' : 'Custom doctor'}</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={prevStep} className="btn-secondary flex-1">
                ← Back
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Joining...' : '🚀 Join Queue'}
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && success && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-700 mb-2">You're in the queue!</h3>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-4 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Queue Position</span>
                <span className="text-2xl font-bold text-green-600">
                  #{success.data?.queuePosition || success.queuePosition || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estimated Wait</span>
                <span className="font-semibold text-gray-800">
                  {success.data?.estimatedWait || success.estimatedWait || '~15'} min
                </span>
              </div>
              {(success.data?.doctorName || success.doctorName) && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Assigned Doctor</span>
                  <span className="font-semibold text-gray-800">
                    Dr. {success.data?.doctorName || success.doctorName}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => { setStep(1); setSuccess(null); setForm({
                name: '', age: '', gender: '', visitType: 'checkup', previousVisits: '',
                symptoms: '', emergencyLevel: 1, consultationMode: 'video',
                assignMode: 'auto', doctorId: ''
              }) }}
              className="btn-secondary mt-6"
            >
              Join Another Queue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
