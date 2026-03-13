import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/PatientDashboard';
import JoinQueue from './pages/patient/JoinQueue';
import ScheduleAppointment from './pages/patient/ScheduleAppointment';
import Consultation from './pages/patient/Consultation';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/join-queue" element={<JoinQueue />} />
        <Route path="/patient/schedule" element={<ScheduleAppointment />} />
        <Route path="/patient/consultation/:id" element={<Consultation />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
