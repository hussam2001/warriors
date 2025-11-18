'use client'

import Sidebar from './Sidebar'
import { useAuth } from '@/utils/auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0 ml-0 flex flex-col overflow-hidden">
        {/* Header */}
        {(title || subtitle) && (
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="ml-12 lg:ml-0">
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Oswald, system-ui, sans-serif'}}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Warriors Gym</p>
                </div>
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
              </div>
            </div>
          </header>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
