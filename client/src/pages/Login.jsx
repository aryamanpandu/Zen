import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LoginIcon from '@mui/icons-material/Login'

export default function Login(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    const res = await fetch('http://localhost:4000/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})})
    const j = await res.json()
    setLoading(false)
    if (j.token) {
      localStorage.setItem('zen_token', j.token)
      nav('/session')
    } else {
      alert(j.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl hover:border-white/30 transition-all duration-300">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-gray-400 text-center mb-8">Log in to your Zen account</p>
          
          <form onSubmit={submit} className="space-y-4">
            <div className="group">
              <label className="text-sm font-semibold text-gray-300 block mb-2">Username</label>
              <input 
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/30" 
                placeholder="Enter your username" 
                value={username} 
                onChange={e=>setUsername(e.target.value)}
              />
            </div>
            
            <div className="group">
              <label className="text-sm font-semibold text-gray-300 block mb-2">Password</label>
              <input 
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/30" 
                placeholder="Enter your password" 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : <>Login</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
