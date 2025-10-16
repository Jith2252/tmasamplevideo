import React, { useEffect, useState } from 'react'

export default function AdminDeletions(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const secret = sessionStorage.getItem('admin_secret')
        if(!secret){ const s = prompt('Enter admin secret to view deletions'); if(!s) return }
        const res = await fetch((window.__ADMIN_SERVER_URL||'http://localhost:5000') + '/deletions', { headers: { 'x-admin-secret': sessionStorage.getItem('admin_secret') || secret }})
        if(!res.ok){ const j = await res.json(); throw new Error(j?.error||res.statusText) }
        const j = await res.json()
        setRows(j.data||[])
      }catch(e){ alert('Failed to load deletions: '+(e.message||e)) }
      finally{ setLoading(false) }
    }
    load()
  },[])

  if(loading) return <div className="text-center text-gray-500">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Deletion Audit</h1>
      <div className="overflow-auto">
        <table className="w-full table-auto text-sm">
          <thead><tr className="text-left"><th>Time</th><th>Video ID</th><th>Storage Path</th><th>Admin</th><th>Success</th><th>Error</th></tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t"><td>{new Date(r.created_at).toLocaleString()}</td><td className="font-mono">{r.video_id}</td><td>{r.storage_path}</td><td>{r.admin}</td><td>{r.success? 'yes':'no'}</td><td>{r.error_message}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
