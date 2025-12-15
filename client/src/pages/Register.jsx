import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

export default function Register(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    const res = await fetch('http://localhost:4000/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})})
    const j = await res.json()
    setLoading(false)
    if (j.ok) nav('/login')
    else alert(j.error || 'Register failed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl hover:border-white/30 transition-all duration-300">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-full">
              <PersonAddIcon sx={{ fontSize: 32, color: 'white' }} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Join Zen</h2>
          <p className="text-gray-400 text-center mb-8">Create your account to get started</p>
          
          <form onSubmit={submit} className="space-y-4">
            <div className="group">
              <label className="text-sm font-semibold text-gray-300 block mb-2">Username</label>
              <input 
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/30" 
                placeholder="Choose a username" 
                value={username} 
                onChange={e=>setUsername(e.target.value)}
              />
            </div>
            
            <div className="group">
              <label className="text-sm font-semibold text-gray-300 block mb-2">Password</label>
              <input 
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:bg-white/10 transition-all duration-300 group-hover:border-white/30" 
                placeholder="Create a password" 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-400 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                Login
              </a>
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
