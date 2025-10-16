import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/toast.jsx'
import { useNavigate } from 'react-router-dom'
import { checkIsAdmin } from '../lib/auth'

export default function Upload(){
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(null)
  const navigate = useNavigate()

  React.useEffect(()=>{
    checkIsAdmin().then(v=>setIsAdmin(!!v))
  },[])

  const toast = useToast()

  if(isAdmin===false) return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload video</h1>
      <div className="p-4 bg-yellow-50 border rounded">Uploads are restricted to admins. Please sign in with an admin account.</div>
    </div>
  )

  async function submit(e){
    e.preventDefault()
  if(!file) return toast.push('Select a file', { type: 'error' })
    setLoading(true)
    try{
      // upload to storage
      const path = `${Date.now()}_${file.name}`
        const uploadRes = await supabase.storage.from('videos').upload(path, file)
        if(uploadRes.error){
          console.error('upload', uploadRes.error)
          toast.push('Upload failed: '+uploadRes.error.message, { type: 'error' })
          setLoading(false)
          return
        }
        const filePath = uploadRes.data?.path || path
        // get public URL
        const urlRes = supabase.storage.from('videos').getPublicUrl(filePath)
        const url = urlRes.data?.publicUrl || ''

    // get current user
    const userRes = await supabase.auth.getUser()
    const userId = userRes.data?.user?.id || null

      // insert into videos table (thumbnail left empty for now)
      // videos table expects user_id (uuid)
      const insert = { title: title || file.name, url, thumbnail: '', user_id: userId }
      // request the created row back so we have the id
      const { data: created, error: dbErr } = await supabase.from('videos').insert([insert]).select('*').single()
      if(dbErr){
        console.error('db insert', dbErr)
        // rollback storage to avoid orphaned file
        try{ await supabase.storage.from('videos').remove([filePath]) }catch(e){ console.error('rollback remove', e) }
        toast.push('Saved to storage but failed to create video record: '+(dbErr.message||dbErr), { type: 'error' })
        setLoading(false)
        return
      }

      toast.push('Upload successful', { type: 'info' })
      // navigate to the new video's watch page if we got an id
      if(created?.id) navigate(`/watch/${created.id}`)
      else navigate('/')
    }catch(e){
      console.error(e)
      toast.push('Upload failed', { type: 'error' })
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload video</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">File</label>
          <input type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="w-full border p-2 rounded" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>{loading? 'Uploading...' : 'Upload'}</button>
        </div>
      </form>
    </div>
  )
}
