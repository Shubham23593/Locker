import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />
  }

  try {
    const user = JSON.parse(userRaw)
    if (role && user.role !== role) {
      // Redirect to appropriate dashboard
      if (user.role === 'patient') return <Navigate to="/patient" replace />
      if (user.role === 'doctor') return <Navigate to="/doctor" replace />
      if (user.role === 'admin') return <Navigate to="/admin" replace />
      return <Navigate to="/login" replace />
    }
    return children
  } catch {
    return <Navigate to="/login" replace />
  }
}
