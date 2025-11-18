'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleDashboard() {
  const router = useRouter()
  const [username, setUsername] = useState('')

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    const storedUsername = localStorage.getItem('username')
    
    if (authStatus !== 'true' || !storedUsername) {
      router.push('/login')
      return
    }
    
    setUsername(storedUsername)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('username')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Warriors Gym Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {username}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Content</h2>
              <p className="text-gray-600">This is a simplified dashboard to test authentication.</p>
              <p className="text-gray-600 mt-2">You are logged in as: <strong>{username}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
