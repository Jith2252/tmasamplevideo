import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/toast.jsx'

export default function AuthModal({ onClose, onSuccess }){
  const [mode, setMode] = useState('signin') // or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const emailRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(()=>{
    // lock body scroll while modal open
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // reset modal scroll and focus email so the top of the form is visible
    setTimeout(()=>{
      try{ modalRef.current?.scrollTo?.({ top: 0 }) }catch(e){}
      emailRef.current?.focus()
    }, 50)
    function onKey(e){ if(e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return ()=>{ window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  },[])

  function validEmail(e){
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)
  }

  const MIN_PASS = 8

  async function submit(e){
    e.preventDefault()
  setError('')
  if(!email || !password){ setError('Email and password are required'); return }
  if(!validEmail(email)){ setError('Please enter a valid email address'); return }
  if(password.length < MIN_PASS){ setError('Password must be at least '+MIN_PASS+' characters'); return }
    setLoading(true)
    try{
      if(mode === 'signin'){
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if(error) throw error
        onSuccess && onSuccess(data.user)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if(error) throw error
        onSuccess && onSuccess(data.user)
        toast.push('Signed up. You may need to confirm your email depending on project settings.', { type: 'info' })
      }
      onClose()
    }catch(err){
      setError(err.message || JSON.stringify(err))
    }finally{ setLoading(false) }
  }

  async function forgot(){
    if(!email){ setError('Enter the email to reset password'); return }
    if(!validEmail(email)){ setError('Please enter a valid email address'); return }
    setLoading(true)
    try{
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
      if(error) throw error
      toast.push('Password reset email sent. Check your inbox.', { type: 'info' })
      setMode('signin')
    }catch(err){ setError(err.message || JSON.stringify(err)) }
    finally{ setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex min-h-screen items-start sm:items-center justify-center px-4 py-6 sm:py-0" onClick={onClose} aria-modal="true" role="dialog">
      <div className="w-full max-w-md">
        <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full transform transition-all duration-150 scale-95 opacity-0 animate-modal-in max-h-[80vh] overflow-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">✕</button>
        </div>
        <h3 className="text-lg font-semibold mb-2">{mode === 'signin' ? 'Sign in' : 'Create account'}</h3>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input id="auth-email" ref={emailRef} className="w-full mt-1 px-3 py-2 border rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} aria-label="Email" />
          </div>
          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input id="auth-password" type="password" className="w-full mt-1 px-3 py-2 border rounded text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} aria-label="Password" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{mode === 'signin' ? 'Need an account?' : 'Have an account?'}</div>
            <div className="flex items-center gap-3">
              {mode === 'signin' && <button type="button" onClick={forgot} className="text-sm text-gray-500">Forgot?</button>}
              <button type="button" onClick={()=>setMode(mode==='signin'?'signup':'signin')} className="text-sm text-indigo-600">{mode==='signin'?'Create':'Sign in'}</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading? 'Please wait...' : (mode==='signin'?'Sign in':'Sign up')}</button>
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
