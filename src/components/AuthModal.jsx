import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/toast.jsx'

export default function AuthModal({ onClose, onSuccess }){
  const [mode, setMode] = useState('signin') // or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2">{mode === 'signin' ? 'Sign in' : 'Create account'}</h3>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full px-3 py-2 border rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="w-full px-3 py-2 border rounded" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
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
  )
}
