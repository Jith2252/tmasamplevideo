import { supabase } from './supabaseClient'

export async function getUser(){
  const r = await supabase.auth.getUser()
  return r.data?.user || null
}

export async function checkIsAdmin(){
  // Try server-side verification first (requires Authorization Bearer token)
  try{
    const sessionR = await supabase.auth.getSession()
    const token = sessionR.data?.session?.access_token
    if(token){
      try{
        const res = await fetch((window.__ADMIN_SERVER_URL||'/') + 'is-admin', {
          headers: { Authorization: 'Bearer ' + token }
        })
        if(res.ok){
          const json = await res.json()
          return !!json?.admin
        }
      }catch(e){ /* server check failed, fall back */ }
    }
  }catch(e){ /* ignore getSession errors and fall back */ }

  // Fallback: check client-side VITE_ADMIN_EMAILS list against signed-in user
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
