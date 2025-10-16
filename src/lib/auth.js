import { supabase } from './supabaseClient'

export async function getUser(){
  const r = await supabase.auth.getUser()
  return r.data?.user || null
}

export async function checkIsAdmin(){
  // ensure we read the current active session's user
  const sessionR = await supabase.auth.getSession()
  const user = sessionR.data?.session?.user || (await getUser())
  if(!user?.email) return false
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  const list = raw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
  return list.includes(user.email.toLowerCase())
}

export default { getUser, checkIsAdmin }

// Subscribe to Supabase auth state changes. Returns an unsubscribe function.
export function onAuthStateChange(cb){
  const sub = supabase.auth.onAuthStateChange((event, session) => cb(event, session))
  // supabase returns { data: { subscription } } in some versions
  const unsubscribe = sub?.data?.subscription?.unsubscribe || sub?.subscription?.unsubscribe || (()=>{})
  return unsubscribe
}
