import React, { useState, useEffect } from 'react'
import api from '../../services/api'

function getDateOptions() {
  const options = []
  const labels = ['Today', 'Tomorrow', 'Day After Tomorrow']
  for (let i = 0; i < 3; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    options.push({
      label: labels[i],
      value: d.toISOString().split('T')[0],
      display: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    })
  }
  return options
}

function getTimeSlots() {
  const slots = []
  for (let h = 9; h < 17; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return slots
}

export default function BookAppointmentForm() {
  const [doctors, setDoctors] = useState([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const dateOptions = getDateOptions()
  const timeSlots = getTimeSlots()

  const [form, setForm] = useState({
    date: dateOptions[0].value,
    time: '09:00',
    doctorId: '',
    reason: '',
    consultationMode: 'video'
  })

  useEffect(() => {
    api.get('/doctors/active')
      .then((res) => setDoctors(res.data?.data || res.data || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDoctors(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.doctorId) {
      setError('Please select a doctor.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/consultation/book', {
        doctorId: form.doctorId,
        scheduledDate: form.date,
        scheduledTime: form.time,
        reason: form.reason,
        consultationMode: form.consultationMode
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-10">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-green-700 mb-2">Appointment Booked!</h3>
          <p className="text-gray-500 mb-2">
            {dateOptions.find((d) => d.value === form.date)?.label} at{' '}
            {form.time}
          </p>
          <p className="text-gray-500 mb-6">
            with Dr. {doctors.find((d) => d._id === form.doctorId)?.name}
          </p>
          <button
            onClick={() => {
              setSuccess(false)
              setForm({ date: dateOptions[0].value, time: '09:00', doctorId: '', reason: '', consultationMode: 'video' })
            }}
            className="btn-secondary"
          >
            Book Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Book an Appointment</h2>
        <p className="text-sm text-gray-500 mb-6">Schedule a consultation at your preferred time</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Date *</label>
            <div className="grid grid-cols-3 gap-3">
              {dateOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, date: opt.value }))}
                  className={`py-3 px-2 rounded-lg border-2 text-center transition-colors ${
                    form.date === opt.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs mt-0.5 opacity-70">{opt.display}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Select Time Slot *</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, time: slot }))}
                  className={`py-2 px-1 rounded-lg border text-xs font-medium transition-colors ${
                    form.time === slot
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Select Doctor *</label>
            {loadingDoctors ? (
              <p className="text-sm text-gray-500">Loading doctors...</p>
            ) : (
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">-- Choose a doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    Dr. {doc.name} — {doc.specialization}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Consultation Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Consultation Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'video', icon: '📹', label: 'Video Call' },
                { val: 'chat', icon: '💬', label: 'Chat' }
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, consultationMode: m.val }))}
                  className={`py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    form.consultationMode === m.val
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Reason for Visit
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of your concern..."
              className="input-field resize-none"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Booking...' : '📅 Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}
