'use client'

import { useState } from 'react'

export default function FormTestPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!')
    console.log('Username:', username)
    console.log('Password:', password)
    
    if (username === 'admin' && password === 'warriors2024') {
      setMessage('SUCCESS: Credentials are correct!')
    } else {
      setMessage('FAILED: Wrong credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Form Test</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Test Login
          </button>
        </form>
        
        {message && (
          <div className="mt-4 p-3 rounded-md" style={{
            backgroundColor: message.includes('SUCCESS') ? '#d1fae5' : '#fee2e2',
            color: message.includes('SUCCESS') ? '#065f46' : '#991b1b'
          }}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Test with: admin / warriors2024
          </p>
        </div>
      </div>
    </div>
  )
}
