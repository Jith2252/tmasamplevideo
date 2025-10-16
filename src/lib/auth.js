import { supabase } from './supabaseClient'

export async function getUser(){
  const r = await supabase.auth.getUser()
  return r.data?.user || null
}

export async function checkIsAdmin(){
  const user = await getUser()
  if(!user?.email) return false
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  const list = raw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  return list.includes(user.email.toLowerCase())
}

export default { getUser, checkIsAdmin }
