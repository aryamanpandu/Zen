import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TimerIcon from '@mui/icons-material/Timer'
import NotesIcon from '@mui/icons-material/Notes'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import SaveIcon from '@mui/icons-material/Save'

export default function Landing(){
  const nav = useNavigate()
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('zen_token')
    if (token) {
      setIsAuth(true)
      nav('/dashboard')
    }
  }, [nav])

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center overflow-hidden" style={{ backgroundImage: `url(/landingPageBackground.jpg)` }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative text-center text-white px-6 z-10 max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-7xl font-bold mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">Zen</h1>
          <p className="text-3xl font-light mb-4 text-gray-100">Master Your Focus with the Pomodoro Technique</p>
        </div>
        
        <p className="text-lg mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed text-gray-200 animate-slide-up">
          Zen helps you stay focused by breaking work into manageable intervals. Customize your focus and break times, 
          track distractions, and maintain your momentum with guided sessions and notifications.
        </p>
        
        <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-2xl mx-auto border border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl">
            <ul className="text-left space-y-4">
              <li className="flex items-center group hover:translate-x-2 transition-transform">
                <TimerIcon className="mr-4 flex-shrink-0" sx={{ fontSize: 28, color: '#60a5fa' }} />
                <span className="text-gray-100 group-hover:text-white transition-colors">Customizable focus and break intervals</span>
              </li>
              <li className="flex items-center group hover:translate-x-2 transition-transform">
                <NotesIcon className="mr-4 flex-shrink-0" sx={{ fontSize: 28, color: '#34d399' }} />
                <span className="text-gray-100 group-hover:text-white transition-colors">Track distractions during sessions</span>
              </li>
              <li className="flex items-center group hover:translate-x-2 transition-transform">
                <NotificationsActiveIcon className="mr-4 flex-shrink-0" sx={{ fontSize: 28, color: '#fbbf24' }} />
                <span className="text-gray-100 group-hover:text-white transition-colors">Smart notifications when breaks end</span>
              </li>
              <li className="flex items-center group hover:translate-x-2 transition-transform">
                <SaveIcon className="mr-4 flex-shrink-0" sx={{ fontSize: 28, color: '#c084fc' }} />
                <span className="text-gray-100 group-hover:text-white transition-colors">Save your focus goals and progress</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={() => nav('/login')}
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Login
          </button>
          <button 
            onClick={() => nav('/register')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-white text-white font-semibold rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
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
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
