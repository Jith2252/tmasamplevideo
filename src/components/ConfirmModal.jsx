import React from 'react'

export default function ConfirmModal({ message='Are you sure?', onConfirm, onCancel }){
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  )
}
