import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url(/landingPageBackground.jpg)` }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative text-center text-white px-6 z-10">
        <h1 className="text-6xl font-bold mb-4">Zen</h1>
        <p className="text-2xl mb-8 opacity-90">Master Your Focus with the Pomodoro Technique</p>
        <p className="text-lg mb-12 max-w-2xl opacity-80">
          Zen helps you stay focused by breaking work into manageable intervals. Customize your focus and break times, 
          track distractions, and maintain your momentum with guided sessions and notifications.
        </p>
        
        <div className="space-y-3">
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-6 max-w-md mx-auto mb-8">
            <ul className="text-left space-y-3">
              <li className="flex items-center">
                <span className="text-2xl mr-3">⏱️</span>
                <span>Customizable focus and break intervals</span>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">📝</span>
                <span>Track distractions during sessions</span>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">🔔</span>
                <span>Smart notifications when breaks end</span>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">💾</span>
                <span>Save your focus goals and progress</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => nav('/login')}
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Login
          </button>
          <button 
            onClick={() => nav('/register')}
            className="px-8 py-3 bg-indigo-800 border-2 border-white text-white font-semibold rounded-lg hover:bg-indigo-900 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}
