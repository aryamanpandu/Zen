import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    const res = await fetch('http://localhost:4000/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})})
    const j = await res.json()
    if (j.token) {
      localStorage.setItem('zen_token', j.token)
      nav('/dashboard')
    } else {
      alert(j.error || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border" placeholder="username" value={username} onChange={e=>setUsername(e.target.value)}/>
        <input className="w-full p-2 border" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
      </form>
      <p className="mt-3">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
    </div>
  )
}
