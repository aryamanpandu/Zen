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
  const [distraction, setDistraction] = useState('')
  const [focusInput, setFocusInput] = useState('')
  const timerRef = useRef(null)

  useEffect(()=>{
    async function start(){
      const res = await authFetch('http://localhost:4000/api/session/start',{method:'POST', body:{configId: id || 'default'}})
      const j = await res.json()
      setSession(j)
      // load config durations quickly from /api/configs
      const rc = await (await authFetch('http://localhost:4000/api/configs')).json()
      const cfg = rc.find(c=>c.id === (id||'default')) || rc[0]
      setRemaining(cfg.focusMinutes * 60)
    }
    start()
    return ()=>{ if (timerRef.current) clearInterval(timerRef.current) }
  }, [id])

  function playSound(type){
    // simple beep using WebAudio
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
          // play sound depending on phase
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
    if (!session) return
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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Focus Session</h2>
      <div className="text-center text-4xl font-mono">{formatTime(remaining)}</div>
      <div className="flex gap-2">
        <button onClick={startTimer} className="px-4 py-2 bg-green-600 text-white rounded">Start</button>
        <button onClick={stopTimer} className="px-4 py-2 bg-red-600 text-white rounded">Stop</button>
      </div>

      <div>
        <h3 className="font-semibold">Distraction List</h3>
        <div className="flex gap-2 mt-2">
          <input className="flex-1 p-2 border" value={distraction} onChange={e=>setDistraction(e.target.value)} placeholder="Write distractions here" />
          <button onClick={addDistraction} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
        <ul className="mt-2 space-y-1">
          {(session?.distractions||[]).map((d,i)=>(<li key={i} className="text-sm text-gray-700">{new Date(d.at).toLocaleTimeString()}: {d.text}</li>))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Focus Input</h3>
        <textarea className="w-full p-2 border mt-2" value={focusInput} onChange={e=>setFocusInput(e.target.value)} />
        <div className="mt-2"><button onClick={saveFocusInput} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button></div>
      </div>
    </div>
  )
}
