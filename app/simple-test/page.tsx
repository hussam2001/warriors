'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  const handleClick = () => {
    console.log('Button clicked!')
    setCount(count + 1)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Text changed:', e.target.value)
    setText(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Simple React Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Input Test
            </label>
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type something..."
            />
            <p className="text-sm text-gray-600 mt-1">You typed: "{text}"</p>
          </div>
          
          <div>
            <button
              onClick={handleClick}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Click Me (Count: {count})
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>Test Results:</strong><br/>
              • Text input working: {text ? '✅' : '❌'}<br/>
              • Button clicks: {count}<br/>
              • Check console for logs
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
