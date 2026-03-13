import React from 'react'

const EMERGENCY_STYLES = {
  1: { bg: 'bg-green-100 text-green-700', label: 'L1', dot: 'bg-green-500' },
  2: { bg: 'bg-lime-100 text-lime-700', label: 'L2', dot: 'bg-lime-500' },
  3: { bg: 'bg-yellow-100 text-yellow-700', label: 'L3', dot: 'bg-yellow-500' },
  4: { bg: 'bg-orange-100 text-orange-700', label: 'L4', dot: 'bg-orange-500' },
  5: { bg: 'bg-red-100 text-red-700', label: 'L5', dot: 'bg-red-600' }
}

export default function DoctorQueue({
  queue,
  loading,
  currentPatient,
  isActive,
  onStartSession,
  onRefresh
}) {
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        <div className="animate-spin text-3xl mb-2">⏳</div>
        <p className="text-sm">Loading queue...</p>
      </div>
    )
  }

  if (!isActive) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3">🔴</div>
        <p className="text-gray-600 font-medium">You're currently offline</p>
        <p className="text-gray-400 text-sm mt-1">
          Toggle your status to Active to see and manage the queue
        </p>
      </div>
    )
  }

  if (!queue || queue.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-3">✅</div>
        <p className="text-gray-600 font-medium">Queue is empty</p>
        <p className="text-gray-400 text-sm mt-1">No patients waiting right now</p>
        <button onClick={onRefresh} className="btn-secondary mt-4 text-sm">
          🔄 Refresh
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">
          {queue.length} patient{queue.length !== 1 ? 's' : ''} in queue
        </h3>
        <button onClick={onRefresh} className="text-sm text-blue-600 hover:text-blue-800">
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-3">
        {queue.map((patient, idx) => {
          const emergency = patient.emergencyLevel || 1
          const style = EMERGENCY_STYLES[emergency] || EMERGENCY_STYLES[1]
          const isCurrent = currentPatient &&
            (currentPatient._id === patient._id ||
             currentPatient.patientId === patient._id ||
             currentPatient.patientId === patient.patientId)

          return (
            <div
              key={patient._id || idx}
              className={`border rounded-xl p-4 transition-all ${
                isCurrent
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  {/* Position badge */}
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-800">
                        {patient.patientName || patient.name}
                      </h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        Emergency {style.label}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          🔴 In Session
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                      {patient.symptoms || patient.chiefComplaint || 'No symptoms noted'}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                      <span>
                        {patient.consultationMode === 'video' ? '📹' : '💬'}{' '}
                        {patient.consultationMode}
                      </span>
                      <span>⏱ ~{patient.estimatedWait || '?'} min wait</span>
                      {patient.priorityScore !== undefined && (
                        <span>⚡ Priority: {patient.priorityScore}</span>
                      )}
                      {patient.age && <span>Age: {patient.age}</span>}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col gap-2">
                  {idx === 0 && !currentPatient && (
                    <button
                      onClick={() => onStartSession(patient._id || patient.patientId)}
                      className="btn-success text-sm px-4"
                    >
                      ▶ Start Session
                    </button>
                  )}
                  {isCurrent && (
                    <span className="text-xs text-green-600 font-medium text-center">
                      Active now
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
