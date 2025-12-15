import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
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

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && (
        <header className="bg-white shadow p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="font-bold text-xl"><Link to="/dashboard">Zen</Link></h1>
            <nav className="space-x-4">
              <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
              <Link to="/session" className="hover:text-indigo-600">Session</Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('zen_token')
                  window.location.href = '/'
                }}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </nav>
          </div>
        </header>
      )}
      <main className={!isAuthPage ? "container mx-auto p-4" : ""}>
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
        </Routes>
      </main>
    </div>
  )
}
