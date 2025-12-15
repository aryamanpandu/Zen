import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DeleteIcon from '@mui/icons-material/Delete'
import LockIcon from '@mui/icons-material/Lock'
import SettingsIcon from '@mui/icons-material/Settings'

function authFetch(url, opts={}){
  const token = localStorage.getItem('zen_token')
  return fetch(url, { headers: Object.assign({'content-type':'application/json', 'authorization': token ? `Bearer ${token}` : ''}, opts.headers||{}), method: opts.method||'GET', body: opts.body ? JSON.stringify(opts.body) : undefined })
}

export default function Dashboard(){
  const [configs, setConfigs] = useState([])
  const [form, setForm] = useState({name:'',focusMinutes:25,shortBreakMinutes:5,longBreakMinutes:15,sessionsPerLongBreak:4})
  const [loading, setLoading] = useState(false)

  async function load(){
    const res = await authFetch('http://localhost:4000/api/configs')
    const j = await res.json()
    setConfigs(j)
  }

  useEffect(()=>{ load() }, [])

  async function add(e){
    e.preventDefault()
    setLoading(true)
    const res = await authFetch('http://localhost:4000/api/configs',{method:'POST', body:form})
    const j = await res.json()
    setLoading(false)
    if (j.id) {
      setConfigs(s=>[...s,j])
      setForm({name:'',focusMinutes:25,shortBreakMinutes:5,longBreakMinutes:15,sessionsPerLongBreak:4})
    }
    else alert(j.error||'Failed')
  }

  async function remove(id){
    if(!confirm('Delete this configuration?')) return
    const res = await authFetch(`http://localhost:4000/api/configs/${id}`,{method:'DELETE'})
    const j = await res.json()
    if (j.ok) setConfigs(s=>s.filter(x=>x.id!==id))
    else alert(j.error||'Failed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
            <h1 className="text-4xl font-bold text-slate-900">Pomodoro Configurations</h1>
          </div>
          <p className="text-gray-600 ml-11">Customize your focus and break intervals</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Config Card */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <AddIcon sx={{ fontSize: 24, color: '#10b981' }} />
                <h3 className="text-xl font-bold text-slate-900">New Configuration</h3>
              </div>
              
              <form onSubmit={add} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Name</label>
                  <input 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    placeholder="e.g., Quick Focus" 
                    value={form.name} 
                    onChange={e=>setForm({...form,name:e.target.value})}
                    required 
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Focus Duration (min)</label>
                  <input 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    type="number" 
                    min="1"
                    value={form.focusMinutes} 
                    onChange={e=>setForm({...form,focusMinutes: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Short Break (min)</label>
                  <input 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    type="number" 
                    min="1"
                    value={form.shortBreakMinutes} 
                    onChange={e=>setForm({...form,shortBreakMinutes: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Long Break (min)</label>
                  <input 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    type="number" 
                    min="1"
                    value={form.longBreakMinutes} 
                    onChange={e=>setForm({...form,longBreakMinutes: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Sessions per Long Break</label>
                  <input 
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                    type="number" 
                    min="1"
                    value={form.sessionsPerLongBreak} 
                    onChange={e=>setForm({...form,sessionsPerLongBreak: Number(e.target.value)})}
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <AddIcon sx={{ fontSize: 20 }} />
                  {loading ? 'Creating...' : 'Create Config'}
                </button>
              </form>
            </div>
          </div>

          {/* Configs List */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-3">
              {configs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow p-8 text-center">
                  <p className="text-gray-500">No configurations yet. Create one to get started!</p>
                </div>
              ) : (
                configs.map((c, idx) => (
                  <div 
                    key={c.id} 
                    className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-slate-300 group animate-slide-up"
                    style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-slate-900">{c.name}</h4>
                          {c.id === 'default' && (
                            <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                              <LockIcon sx={{ fontSize: 14 }} />
                              Default
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 font-semibold">Focus</p>
                            <p className="text-xl font-bold text-blue-600">{c.focusMinutes}m</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 font-semibold">Short Break</p>
                            <p className="text-xl font-bold text-green-600">{c.shortBreakMinutes}m</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 font-semibold">Long Break</p>
                            <p className="text-xl font-bold text-purple-600">{c.longBreakMinutes}m</p>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 font-semibold">Sessions</p>
                            <p className="text-xl font-bold text-orange-600">{c.sessionsPerLongBreak}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-col md:flex-row">
                        <a 
                          href={`/session/${c.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <PlayArrowIcon sx={{ fontSize: 20 }} />
                          Start
                        </a>
                        {c.id !== 'default' && (
                          <button 
                            onClick={() => remove(c.id)}
                            className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
