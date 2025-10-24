import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/dashboard/Dashboard'
import Sidebar from './components/sidebar/Sidebar'
import Perfis from './pages/Perfis'

function RequireAuth({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const token = localStorage.getItem('token')
  return (
    <div className="d-flex">
      {token && <Sidebar />}
      <main className="flex-grow-1 p-3 container-fluid">
        {!token && (
          <div className="pb-3">
            <div className="container-fluid">
              <span className="fw-bold">DAC_COENEL</span>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/perfis" element={<RequireAuth><Perfis /></RequireAuth>} />
        </Routes>
      </main>
    </div>
  )
}
