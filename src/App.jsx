import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import CardGrid from './components/CardGrid'
import WatchPage from './components/WatchPage'
import Upload from './pages/Upload'
import Profile from './pages/Profile'
import AdminDeletions from './pages/AdminDeletions'

export default function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen text-gray-900 dark:text-gray-100">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/deletions" element={<AdminDeletions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function Home(){
  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Discover videos people love</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">A modern, responsive UI scaffold — start uploading and sharing.</p>
      </section>
      <CardGrid />
    </>
  )
}
