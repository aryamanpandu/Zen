import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    const res = await fetch('http://localhost:4000/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})})
    const j = await res.json()
    if (j.ok) nav('/login')
    else alert(j.error || 'Register failed')
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)}/>
        <input className="w-full p-2 border" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="px-4 py-2 bg-green-600 text-white rounded">Create account</button>
      </form>
    </div>
  )
}
