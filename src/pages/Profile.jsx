import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Card from '../components/Card'

export default function Profile(){
  const [user, setUser] = useState(null)
  const [videos, setVideos] = useState([])

  useEffect(()=>{
    let mounted = true
    supabase.auth.getUser().then(r=>{ if(mounted) setUser(r.data.user||null) })
    const load = async ()=>{
      try{
        const { data } = await supabase.from('videos').select('*').order('created_at', {ascending:false})
        if(mounted) setVideos(data||[])
      }catch(e){ console.error(e) }
    }
    load()
    return ()=>{ mounted = false }
  },[])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{(user?.email||'U').charAt(0).toUpperCase()}</div>
        <div>
          <div className="text-lg font-semibold">{user?.email || 'User'}</div>
          <div className="text-sm text-gray-500">Member</div>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4">Your uploads</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v=> <Card key={v.id} id={v.id} title={v.title} thumb={v.thumbnail || v.url} views={v.views} />)}
      </div>
    </div>
  )
}
