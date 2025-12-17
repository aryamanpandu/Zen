import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'

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
  const [focusInput, setFocusInput] = useState('')
  const [ambientSound, setAmbientSound] = useState(null)
  const [ambientPlaying, setAmbientPlaying] = useState(false)
  const timerRef = useRef(null)
  const audioRef = useRef(null)

  // S3 URLs for ambient sounds - Replace these with your actual S3 URLs
  const SOUNDS = {
    brownNoise: 'https://zen-pomo-sounds.s3.us-east-1.amazonaws.com/smoothedBrownNoise.mp3',
    rainNoise: 'https://zen-pomo-sounds.s3.us-east-1.amazonaws.com/heavyRainWhiteNoise.mp3'
  }

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

  async function resetTimer(){
    setRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (session) {
      const rc = await (await authFetch('http://localhost:4000/api/configs')).json()
      const cfg = rc.find(c=>c.id === (id||'default')) || rc[0]
      setRemaining(cfg.focusMinutes * 60)
      setPhase('focus')
    }
  }

  async function saveFocusInput(){
    if (!session) return
    const res = await authFetch(`http://localhost:4000/api/session/${session.id}/input`,{method:'POST', body:{input:focusInput}})
    const j = await res.json()
    setSession(j)
  }

  function toggleAmbientSound(soundKey){
    if (ambientSound === soundKey && ambientPlaying) {
      audioRef.current?.pause()
      setAmbientPlaying(false)
      setAmbientSound(null)
    } else {
      if (audioRef.current) audioRef.current.pause()
      setAmbientSound(soundKey)
      setAmbientPlaying(true)
    }
  }

  useEffect(()=>{
    if (ambientPlaying && ambientSound && SOUNDS[ambientSound]) {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUNDS[ambientSound])
        audioRef.current.loop = true
        audioRef.current.volume = 0.3
      }
      audioRef.current.src = SOUNDS[ambientSound]
      audioRef.current.play().catch(e => console.warn('Audio play failed:', e))
    } else if (audioRef.current) {
      audioRef.current.pause()
    }
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [ambientPlaying, ambientSound])

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Main Content - Center */}
      <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
        {/* Timer & Focus Section - Main Content */}
        <div className="flex flex-col items-center justify-center">
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
            <button 
              onClick={resetTimer}
              className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-lg"
            >
              ↺
            </button>
          </div>

          {/* Focus Input - Single Line with Underline */}
          <div className="w-full max-w-md mb-8">
            <input 
              className="w-full bg-transparent border-b-2 border-white/30 text-white placeholder-gray-400 text-center text-lg font-medium focus:outline-none focus:border-blue-400 transition-all duration-200 py-2" 
              style={{
                boxShadow: document.activeElement?.classList?.contains('focus-input') ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
              }}
              value={focusInput} 
              onChange={e=>setFocusInput(e.target.value)}
              onBlur={saveFocusInput}
              placeholder="What are you working on?"
            />
          </div>

          {/* Ambient Sound Controls */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-gray-400 uppercase tracking-widest">Ambient Sound</div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAmbientSound('brownNoise')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  ambientSound === 'brownNoise' && ambientPlaying
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Brown Noise
              </button>
              <button
                onClick={() => toggleAmbientSound('rainNoise')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  ambientSound === 'rainNoise' && ambientPlaying
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Rain
              </button>
              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause()
                  setAmbientPlaying(false)
                  setAmbientSound(null)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  ambientSound === null
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                ✕ Off
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input:focus {
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  )
}
