import React, { useEffect, useState } from 'react'

function authFetch(url, opts={}){
  const token = localStorage.getItem('zen_token')
  return fetch(url, { headers: Object.assign({'content-type':'application/json', 'authorization': token ? `Bearer ${token}` : ''}, opts.headers||{}), method: opts.method||'GET', body: opts.body ? JSON.stringify(opts.body) : undefined })
}

export default function Dashboard(){
  const [configs, setConfigs] = useState([])
  const [form, setForm] = useState({name:'',focusMinutes:25,shortBreakMinutes:5,longBreakMinutes:15,sessionsPerLongBreak:4})

  async function load(){
    const res = await authFetch('http://localhost:4000/api/configs')
    const j = await res.json()
    setConfigs(j)
  }

  useEffect(()=>{ load() }, [])

  async function add(e){
    e.preventDefault()
    const res = await authFetch('http://localhost:4000/api/configs',{method:'POST', body:form})
    const j = await res.json()
    if (j.id) setConfigs(s=>[...s,j])
    else alert(j.error||'Failed')
  }

  async function remove(id){
    if(!confirm('Delete config?')) return
    const res = await authFetch(`http://localhost:4000/api/configs/${id}`,{method:'DELETE'})
    const j = await res.json()
    if (j.ok) setConfigs(s=>s.filter(x=>x.id!==id))
    else alert(j.error||'Failed')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Configurations</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Add Config</h3>
          <form onSubmit={add} className="space-y-2 mt-2">
            <input className="w-full p-2 border" placeholder="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input className="p-2 border" placeholder="focus minutes" type="number" value={form.focusMinutes} onChange={e=>setForm({...form,focusMinutes: Number(e.target.value)})} />
              <input className="p-2 border" placeholder="short break" type="number" value={form.shortBreakMinutes} onChange={e=>setForm({...form,shortBreakMinutes: Number(e.target.value)})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="p-2 border" placeholder="long break" type="number" value={form.longBreakMinutes} onChange={e=>setForm({...form,longBreakMinutes: Number(e.target.value)})} />
              <input className="p-2 border" placeholder="sessions per long break" type="number" value={form.sessionsPerLongBreak} onChange={e=>setForm({...form,sessionsPerLongBreak: Number(e.target.value)})} />
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Your Configs</h3>
          <ul className="mt-2 space-y-2">
            {configs.map(c=> (
              <li key={c.id} className="p-2 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{c.name} {c.id==='default' ? <span className="text-sm text-gray-500">(default)</span> : null}</div>
                  <div className="text-sm text-gray-600">Focus {c.focusMinutes}m • Short {c.shortBreakMinutes}m • Long {c.longBreakMinutes}m • {c.sessionsPerLongBreak} sessions</div>
                </div>
                <div className="space-x-2">
                  <a className="text-blue-600" href={`/session/${c.id}`}>Start</a>
                  {c.id==='default' ? null : <button onClick={()=>remove(c.id)} className="text-red-600">Delete</button>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
