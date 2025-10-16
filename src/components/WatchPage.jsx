import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
 import { useToast } from '../lib/toast.jsx'
import ConfirmModal from './ConfirmModal'
import SecretModal from './SecretModal'

function fmtDate(iso){
  try{
    const d = new Date(iso)
    return d.toLocaleDateString()
  }catch(e){ return '' }
}

export default function WatchPage(){
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    supabase.auth.getUser().then(r=>{ if(mounted) setUser(r.data.user||null) })

    const load = async ()=>{
      try{
        if(!id) return
        const { data: vdata, error: verror } = await supabase.from('videos').select('*').eq('id', id).single()
        if(verror) console.error('load video', verror)
        else if(mounted) setVideo(vdata)

        const { data: cdata, error: cerror } = await supabase.from('comments').select('*').eq('video_id', id).order('created_at', {ascending:false})
        if(cerror) console.error('comments load', cerror)
        else if(mounted) setComments(cdata||[])
      }catch(e){
        console.error('watch load', e)
      }finally{
        if(mounted) setLoading(false)
      }
    }
    load()
    return ()=>{ mounted = false }
  },[id])

  const toast = useToast()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  async function post(){
    if(!user){ toast.push('Please sign in to post comments', { type: 'error' }); return }
    if(!text.trim()) return
    const insert = { video_id: id, user_email: user.email, content: text.trim() }
    const { error } = await supabase.from('comments').insert([insert])
    if(error){
      console.error('comment insert', error)
      if(/row-level security/i.test(error.message||'') || error.status===403) toast.push('Server requires sign-in to post comments', { type: 'error' })
      else toast.push('Failed to post: '+(error.message||error), { type: 'error' })
    } else {
      setText('')
      // refresh comments from server to get created_at and id
      const { data } = await supabase.from('comments').select('*').eq('video_id', id).order('created_at', {ascending:false})
      setComments(data||[])
    }
  }

  if(loading) return <div className="text-center text-gray-500">Loading...</div>

  const src = video?.url || ''
  const poster = video?.thumbnail || ''
  const views = video?.views ?? 0

  async function handleDelete(){
    setShowConfirm(true)
  }

  async function doDelete(){
    setShowConfirm(false)
    try{
      let path = null
      if(video?.url){
        const m = video.url.match(/\/public\/videos\/(.+)$/)
        if(m) path = decodeURIComponent(m[1])
      }

      let secret = sessionStorage.getItem('admin_secret')
      if(!secret){
        // show secret modal to collect admin secret
        setShowSecret(true)
        // wait for user to fill secret modal; it stores to sessionStorage
        return
      }

      const res = await fetch((window.__ADMIN_SERVER_URL||'http://localhost:5000') + '/delete-video', {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ id, storage_path: path })
      })
      const json = await res.json()
      if(!res.ok) throw new Error(json?.error || res.statusText)
      toast.push('Deleted', { type: 'info' })
      window.location.href = '/'
    }catch(err){ console.error('delete', err); alert('Delete failed: '+(err.message||err)) }
  }

  // called after SecretModal saves to sessionStorage
  async function afterSecretSaved(){
    setShowSecret(false)
    // retry delete flow
    await doDelete()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black rounded-lg aspect-video mb-4 overflow-hidden">
        {src? (
          <video className="w-full h-full object-cover" src={src} controls poster={poster} />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-gray-400">No preview available</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{video?.title || 'Video title'}</h2>
          <p className="text-sm text-gray-500">Uploaded on {video?.created_at? fmtDate(video.created_at) : '—'} • {views.toLocaleString()} views</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{(video?.user_id||'U').charAt(0).toUpperCase()}</div>
          <div className="text-sm text-gray-300">{video?.user_id ? video.user_id.slice(0,8) : 'Uploader'}</div>
        </div>
      </div>

      <section className="mt-6">
        <h3 className="font-semibold">Comments</h3>
        <div className="mt-2">
          {user? (
            <div>
              <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full border p-2 rounded" rows={3}></textarea>
              <div className="mt-2"><button onClick={post} className="px-4 py-2 bg-indigo-600 text-white rounded">Post</button></div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Login to post comments.</div>
          )}

          <ul className="mt-4 space-y-3">
            {comments.length===0? <li className="text-gray-500">No comments yet.</li> : comments.map((c)=> (
              <li key={c.id||c.created_at} className="border rounded p-2 bg-white dark:bg-gray-800">{c.content}<div className="text-xs text-gray-500 mt-1">{c.user_email}</div></li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
