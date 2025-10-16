import React, { useEffect, useState } from 'react'
import Card from './Card'
import { supabase } from '../lib/supabaseClient'

export default function CardGrid(){
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    const load = async () => {
      try{
        const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
        if(error) console.error('load videos', error)
        else if(mounted) setVideos(data || [])
      }catch(e){
        console.error('fetch videos', e)
      }finally{
        if(mounted) setLoading(false)
      }
    }
    load()
    return ()=>{ mounted = false }
  },[])

  if(loading) return <div className="text-center text-gray-500">Loading videos...</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map(v=> <Card key={v.id} id={v.id} title={v.title} thumb={v.thumbnail || v.url} views={v.views} />)}
    </div>
  )
}
