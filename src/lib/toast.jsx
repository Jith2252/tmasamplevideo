import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, opts={type:'info', duration:4000})=>{
    const id = Math.random().toString(36).slice(2,9)
    setToasts(t => [...t, { id, msg, ...opts }])
    if(opts.duration !== 0){
      setTimeout(()=> setToasts(t => t.filter(x=>x.id!==id)), opts.duration)
    }
    return id
  },[])
  const remove = useCallback(id => setToasts(t => t.filter(x=>x.id!==id)), [])
  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-xs px-4 py-2 rounded shadow ${t.type==='error'?'bg-red-600 text-white':'bg-gray-800 text-white'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){ return useContext(ToastContext) }
