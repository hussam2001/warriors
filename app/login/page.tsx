'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { username, password }) // Debug log
    
    setIsLoading(true)
    setMessage('')
    
    if (!username || !password) {
      setMessage('Please enter both username and password')
      setIsLoading(false)
      return
    }

    // Simple hardcoded credentials for demo
    if (username === 'admin' && password === 'warriors2024') {
      try {
        console.log('Credentials correct, setting localStorage...') // Debug log
        
        // Set authentication data
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('username', username)
        
        setMessage('Login successful! Redirecting...')
        console.log('localStorage set, redirecting...') // Debug log
        
        // Navigate to dashboard
        setTimeout(() => {
          router.push('/dashboard-simple')
        }, 1000)
      } catch (error) {
        console.error('Login error:', error)
        setMessage('Login failed, please try again')
      }
    } else {
      console.log('Invalid credentials') // Debug log
      setMessage('Invalid credentials, please check your username and password')
    }
    
    setIsLoading(false)
  }

  const handleButtonClick = () => {
    console.log('Button clicked') // Debug log
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#0a101e'}}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2" style={{fontFamily: 'Oswald, system-ui, sans-serif', color: '#c58542'}}>
            Warriors Gym
          </h2>
          <p className="text-sm" style={{color: '#c58542'}}>
            Management System Login
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-2xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2" style={{color: '#c58542'}}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => {
                  console.log('Username changed:', e.target.value) // Debug log
                  setUsername(e.target.value)
                }}
                className="appearance-none block w-full px-3 py-3 border rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-all duration-200"
                style={{
                  borderColor: 'rgba(197, 133, 66, 0.3)'
                }}
                placeholder="Enter username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{color: '#c58542'}}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  console.log('Password changed:', e.target.value.length, 'characters') // Debug log
                  setPassword(e.target.value)
                }}
                className="appearance-none block w-full px-3 py-3 border rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-all duration-200"
                style={{
                  borderColor: 'rgba(197, 133, 66, 0.3)'
                }}
                placeholder="Enter password"
              />
            </div>

            {/* Message */}
            {message && (
              <div className="text-center">
                <p className="text-sm" style={{color: message.includes('successful') ? '#10b981' : '#ef4444'}}>
                  {message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleButtonClick}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50"
                style={{
                  backgroundColor: '#c58542',
                  color: '#0a101e'
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
          
          {/* Debug Info */}
          <div className="mt-4 text-center">
            <p className="text-xs" style={{color: 'rgba(197, 133, 66, 0.7)'}}>
              Debug: Username length: {username.length}, Password length: {password.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
