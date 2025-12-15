import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { PlaylistAdd } from '@mui/icons-material'

function authFetch(url, opts={}){
  const token = localStorage.getItem('zen_token')
  return fetch(url, { headers: Object.assign({'content-type':'application/json', 'authorization': token ? `Bearer ${token}` : ''}, opts.headers||{}), method: opts.method||'GET', body: opts.body ? JSON.stringify(opts.body) : undefined })
}

function formatTime(s){
  const m = Math.floor(s/60)
  const sec = s%60
  return `${m}:${sec.toString().padStart(2,'0')}`
}

export default function Session(){
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('focus')
  const [distraction, setDistraction] = useState('')
  const [focusInput, setFocusInput] = useState('')
  const timerRef = useRef(null)

  useEffect(()=>{
    async function start(){
      const res = await authFetch('http://localhost:4000/api/session/start',{method:'POST', body:{configId: id || 'default'}})
      const j = await res.json()
      setSession(j)
      const rc = await (await authFetch('http://localhost:4000/api/configs')).json()
      const cfg = rc.find(c=>c.id === (id||'default')) || rc[0]
      setRemaining(cfg.focusMinutes * 60)
    }
    start()
    return ()=>{ if (timerRef.current) clearInterval(timerRef.current) }
  }, [id])

  function playSound(type){
    try{
      const ctx = new (window.AudioContext||window.webkitAudioContext)()
      const o = ctx.createOscillator()
      o.type = type === 'focus' ? 'sine' : type === 'short' ? 'triangle' : 'square'
      o.frequency.value = type === 'focus' ? 880 : type === 'short' ? 660 : 440
      o.connect(ctx.destination)
      o.start()
      setTimeout(()=>{ o.stop(); ctx.close() }, 600)
    }catch(e){ console.warn('sound failed', e) }
  }

  function startTimer(){
    if (running) return
    setRunning(true)
    timerRef.current = setInterval(()=>{
      setRemaining(r=>{
        if (r<=1){
          clearInterval(timerRef.current)
          setRunning(false)
          if (phase === 'focus') playSound('focus')
          else if (phase === 'short') playSound('short')
          else playSound('long')
          return 0
        }
        return r-1
      })
    }, 1000)
  }

  function stopTimer(){
    setRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function addDistraction(){
    if (!session || !distraction.trim()) return
    const res = await authFetch(`http://localhost:4000/api/session/${session.id}/distraction`,{method:'POST', body:{text:distraction}})
    const j = await res.json()
    setSession(j)
    setDistraction('')
  }

  async function saveFocusInput(){
    if (!session) return
    const res = await authFetch(`http://localhost:4000/api/session/${session.id}/input`,{method:'POST', body:{input:focusInput}})
    const j = await res.json()
    setSession(j)
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Timer & Focus Section - Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Timer with Progress Circle */}
        <div className="relative w-80 h-80 mb-12">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
            {/* Background circle */}
            <circle cx="160" cy="160" r="150" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
            {/* Progress circle */}
            <circle 
              cx="160" 
              cy="160" 
              r="150" 
              fill="none" 
              stroke="url(#timerGradient)" 
              strokeWidth="3"
              strokeDasharray={`${(remaining / (25 * 60)) * 942} 942`}
              strokeLinecap="round"
              transform="rotate(-90 160 160)"
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-mono font-bold text-white">{formatTime(remaining)}</div>
            <div className="text-lg text-gray-300 font-semibold uppercase tracking-widest mt-4">{phase}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={startTimer} 
            disabled={running}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 text-lg"
          >
            ▶
          </button>
          <button 
            onClick={stopTimer} 
            disabled={!running}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 text-lg"
          >
            ⏸
          </button>
        </div>

        {/* Focus Input - Single Line */}
        <div className="w-full max-w-md">
          <input 
            className="w-full px-6 py-3 bg-white/10 border-b border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all text-center text-lg" 
            value={focusInput} 
            onChange={e=>setFocusInput(e.target.value)}
            onBlur={saveFocusInput}
            placeholder="What are you working on?"
          />
        </div>
      </div>

      {/* Distraction List - Compact Bottom Section */}
      <div className="flex-shrink-0 bg-white/5 border-t border-white/10 px-6 py-4 max-h-32 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-white"><PlaylistAdd /></span>
          <h3 className="text-white font-semibold text-sm">DISTRACTIONS ({session?.distractions?.length || 0})</h3>
        </div>
        
        <div className="flex gap-2 mb-2">
          <input 
            className="flex-1 px-3 py-1 bg-white/5 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-sm" 
            value={distraction} 
            onChange={e=>setDistraction(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDistraction()}
            placeholder="Quick note..."
          />
          <button 
            onClick={addDistraction}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-all hover:scale-105 active:scale-95"
          >
            +
          </button>
        </div>

        {/* Distraction Items - Horizontal List */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(session?.distractions||[]).length === 0 ? (
            <p className="text-gray-500 text-xs">Stay focused</p>
          ) : (
            (session?.distractions||[]).map((d, i) => (
              <div key={i} className="flex-shrink-0 bg-white/10 px-3 py-1 rounded border border-white/10 text-xs text-gray-200 whitespace-nowrap">
                {d.text}
              </div>
            ))
          )}
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
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
