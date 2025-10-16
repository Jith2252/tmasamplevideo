require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())
app.use(express.json())

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE
const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.SERVICE_ADMIN_SECRET

if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in env')
  // Don't exit here on Heroku build step; keep running to allow static assets to be served if configured later
  // process.exit(1)
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE || '')

// Admin emails list (comma separated) - fallback to VITE_ADMIN_EMAILS if set
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)

// Ensure admin by verifying the Authorization Bearer token belongs to an admin email.
async function ensureAdmin(req,res,next){
  try{
    // First, allow server-to-server ADMIN_SECRET for backwards compatibility
    const headerSecret = req.headers['x-admin-secret']
    if(ADMIN_SECRET && headerSecret && headerSecret === ADMIN_SECRET) return next()

    const auth = req.headers['authorization'] || ''
    if(!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_token' })
    const token = auth.split(' ')[1]
    if(!token) return res.status(401).json({ error: 'missing_token' })

    // Use the service-role client to fetch user by access token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if(userErr || !userData?.user) return res.status(401).json({ error: 'invalid_token' })
    const user = userData.user
    const email = (user.email||'').toLowerCase()
    if(!ADMIN_EMAILS.includes(email)) return res.status(403).json({ error: 'forbidden' })

    // attach user info to request for audit logging
    req.adminUser = { id: user.id, email }
    next()
  }catch(e){ console.error('ensureAdmin err', e); return res.status(500).json({ error: 'server_error' }) }
}

app.post('/delete-video', ensureAdmin, async (req,res)=>{
  try{
    const { id, storage_path } = req.body
    let success = true
    let errMsg = null
    try{
      if(storage_path){
        const { error: rmErr } = await supabase.storage.from('videos').remove([storage_path])
        if(rmErr){ console.error('storage remove err', rmErr); success = false; errMsg = rmErr.message }
      }
      if(id){
        const { error: dbErr } = await supabase.from('videos').delete().eq('id', id)
        if(dbErr){ console.error('db delete err', dbErr); success = false; errMsg = dbErr.message }
      }
    }catch(inner){ success = false; errMsg = inner.message || String(inner); console.error('delete inner err', inner) }

    // write audit row to deletions table (best-effort)
    try{
      const adminIdent = (req.adminUser && req.adminUser.email) || (req.headers['x-admin-secret'] ? 'shared-secret' : 'unknown')
      await supabase.from('deletions').insert([{
        video_id: id || null,
        storage_path: storage_path || null,
        admin: adminIdent,
        success: success,
        error_message: errMsg || null,
      }])
    }catch(logErr){ console.error('audit insert failed', logErr) }

    if(!success) return res.status(500).json({ error: errMsg || 'delete failed' })
    return res.json({ ok: true })
  }catch(e){
    console.error(e)
    return res.status(500).json({ error: e.message||String(e) })
  }
})

// return deletion audit rows (recent first)
app.get('/deletions', ensureAdmin, async (req,res)=>{
  try{
    const { data, error } = await supabase.from('deletions').select('*').order('created_at', { ascending: false }).limit(200)
    if(error) return res.status(500).json({ error: error.message })
    return res.json({ data })
  }catch(e){
    console.error('deletions err', e)
    return res.status(500).json({ error: e.message||String(e) })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=> console.log('Admin server running on', PORT))

// Serve frontend production build if present
const distPath = path.join(__dirname, '..', 'dist')
if (require('fs').existsSync(distPath)) {
  console.log('Serving static files from', distPath)
  app.use(express.static(distPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}
