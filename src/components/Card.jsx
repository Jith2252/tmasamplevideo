import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { checkIsAdmin } from '../lib/auth'
import { useToast } from '../lib/toast.jsx'
import ConfirmModal from './ConfirmModal'
import SecretModal from './SecretModal'

function isImageUrl(url){
  if(!url) return false
  return /\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url)
}

function isVideoUrl(url){
  if(!url) return false
  return /\.(mp4|webm|ogg|mkv|mov)(\?|$)/i.test(url)
}

export default function Card({id,title,thumb,views}){
  const [copied, setCopied] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(()=>{ checkIsAdmin().then(v=>setIsAdmin(!!v)) },[])
  const toast = useToast()
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const source = thumb || ''
  const fallbackImg = `https://picsum.photos/seed/video${id}/640/360`

  const showImage = isImageUrl(source)
  const showVideo = !showImage && isVideoUrl(source)

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group">
      <div className="relative bg-gray-800">
        {showImage ? (
          <img src={source} alt={title} className="w-full h-44 object-cover" />
        ) : showVideo ? (
          <video className="w-full h-44 object-cover" src={source} muted autoPlay loop playsInline />
        ) : (
          // visual fallback: neutral block with title overlay
          <div className="w-full h-44 bg-gray-700 flex items-end p-4">
            <div className="w-full text-left">
              <div className="h-28 w-full bg-gradient-to-b from-transparent to-black/40" />
              <img src={fallbackImg} alt={title} className="sr-only" />
            </div>
          </div>
        )}

        <Link to={`/watch/${id}`} className="absolute inset-0 z-0" aria-label={`Open ${title}`} />
        {isAdmin && (
          <>
            <button
              onClick={(e)=>{ e.stopPropagation(); e.preventDefault(); setShowConfirm(true) }}
              className="absolute top-3 left-3 z-20 bg-red-500/90 text-white p-2 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition"
              aria-label={`Delete ${title}`}>
              Delete
            </button>
            {showConfirm && (
              <ConfirmModal
                message={'Delete this video? This will remove the DB row and storage object.'}
                onCancel={()=>setShowConfirm(false)}
                onConfirm={async ()=>{
                  setShowConfirm(false)
                  // begin delete flow
                  try{
                    setIsDeleting(true)
                    // compute storage path (if any) from public URL
                    const url = thumb || ''
                    let path = null
                    if(url){
                      const m = url.match(/\/public\/videos\/(.+)$/)
                      if(m) path = decodeURIComponent(m[1])
                    }

                    let secret = sessionStorage.getItem('admin_secret')
                    if(!secret){
                      setShowSecret(true)
                      setIsDeleting(false)
                      return
                    }

                    const res = await fetch((window.__ADMIN_SERVER_URL||'http://localhost:5000') + '/delete-video', {
                      method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-secret': secret },
                      body: JSON.stringify({ id, storage_path: path })
                    })
                    const json = await res.json()
                    if(!res.ok) throw new Error(json?.error || res.statusText)
                    toast.push('Deleted', { type: 'info' })
                    window.location.reload()
                  }catch(err){
                    console.error('delete', err)
                    toast.push('Delete failed: '+(err.message||err), { type: 'error' })
                  }finally{ setIsDeleting(false) }
                }}
              />
            )}
            {showSecret && <SecretModal onClose={()=>{ setShowSecret(false); /* after saving secret retry delete by opening confirm again */ setShowConfirm(true) }} />}
          </>
        )}
        <button
          onClick={async (e)=>{
            e.stopPropagation()
            e.preventDefault()
            const url = `${window.location.origin}/watch/${id}`
            try{
              if(navigator.clipboard && navigator.clipboard.writeText){
                await navigator.clipboard.writeText(url)
              } else {
                // fallback
                const tmp = document.createElement('input')
                tmp.value = url
                document.body.appendChild(tmp)
                tmp.select()
                document.execCommand('copy')
                document.body.removeChild(tmp)
              }
              setCopied(true)
              setTimeout(()=>setCopied(false),2000)
            }catch(err){
              console.error('copy failed', err)
              toast.push('Could not copy link — '+url, { type: 'error' })
            }
          }}
          className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-gray-900/80 p-2 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition"
          aria-label={`Share ${title}`}>
          {copied? 'Copied' : 'Share'}
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{title || 'Untitled'}</h3>
        <p className="text-sm text-gray-500 mt-1">{views??0} views</p>
      </div>
    </article>
  )
}
