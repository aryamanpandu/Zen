import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Session from './pages/Session'

function ProtectedRoute({ children }) {
  const nav = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('zen_token')
    if (!token) {
      nav('/login')
    }
    setIsLoading(false)
  }, [nav])

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-slate-900"><div className="text-white text-lg">Loading...</div></div>
  return children
}

export default function App(){
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('zen_token'))
  const location = useLocation()

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('zen_token'))
  }, [location])

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/'

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAuthPage && (
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/session" className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">Zen</Link>
            <nav className="flex items-center gap-6">
              <Link to="/session" className="text-gray-300 hover:text-white font-medium transition-colors">Session</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white font-medium transition-colors">Configurations</Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('zen_token')
                  window.location.href = '/'
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 font-medium rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
                Logout
              </button>
            </nav>
          </div>
        </header>
      )}
      <main className={!isAuthPage && location.pathname !== '/session' && !location.pathname.startsWith('/session/') ? "max-w-6xl mx-auto" : ""}>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard/>
            </ProtectedRoute>
          } />
          <Route path="/session/:id?" element={
            <ProtectedRoute>
              <Session/>
            </ProtectedRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <Session/>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}
