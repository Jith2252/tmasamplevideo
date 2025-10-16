import React, { useState } from 'react'

export default function SecretModal({ onClose }){
  const [val, setVal] = useState('')
  function save(){
    if(!val) return
    sessionStorage.setItem('admin_secret', val)
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-2">Enter admin secret</h3>
        <input value={val} onChange={e=>setVal(e.target.value)} className="w-full border p-2 rounded mb-4" placeholder="Admin secret" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={save} className="px-3 py-2 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}
