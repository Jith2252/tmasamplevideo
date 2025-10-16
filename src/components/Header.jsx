import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { checkIsAdmin } from '../lib/auth'

export default function Header(){
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const s = supabase.auth.onAuthStateChange((_event, session)=>{
      setUser(session?.user || null)
    })
    // check initial
    supabase.auth.getUser().then(r=>setUser(r.data.user||null))
    checkIsAdmin().then(v=>setIsAdmin(!!v))
    return ()=> s?.subscription?.unsubscribe && s.subscription.unsubscribe()
  },[])

  const [isAdmin, setIsAdmin] = React.useState(false)

  async function signIn(){
    // Redirect to provider (github) or show modal — keep simple: magic link prompt
    const email = prompt('Enter email to sign in (magic link)')
    if(!email) return
    await supabase.auth.signInWithOtp({ email })
    alert('Magic link sent to '+email)
  }
  async function signOut(){ await supabase.auth.signOut(); setUser(null) }

  return (
    <header className="bg-white dark:bg-gray-800/80 backdrop-blur sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold">TMA</div>
          <div>
            <div className="text-lg font-semibold">Tma Adda</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sample Videos Of Files</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input placeholder="Search videos" className="hidden md:block w-64 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 focus:outline-none" />
          {isAdmin && <button onClick={()=>navigate('/upload')} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Upload</button>}
          {isAdmin && <button onClick={()=>navigate('/admin/deletions')} className="px-3 py-1 border rounded">Deletions</button>}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-700 dark:text-gray-200">{user.email}</div>
              <button onClick={()=>navigate('/profile')} className="px-3 py-1 border rounded">Profile</button>
              <button onClick={signOut} className="px-3 py-1 border rounded">Sign out</button>
            </div>
          ) : (
            <button onClick={signIn} className="px-3 py-1 border rounded">Sign in</button>
          )}
        </div>
      </div>
    </header>
  )
}
