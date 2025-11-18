'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { GymSettings } from '@/types'
import { getSettings, saveSettings } from '@/utils/database'
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [settings, setSettings] = useState<GymSettings>({
    gymName: '',
    address: '',
    phone: '',
    email: '',
    membershipPrices: {
      monthly: 30,
      twoMonths: 55,
      threeMonths: 80,
      sixMonths: 150,
      yearly: 300
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await getSettings()
      setSettings(loadedSettings)
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('price_')) {
      const priceType = name.replace('price_', '') as keyof typeof settings.membershipPrices
      setSettings(prev => ({
        ...prev,
        membershipPrices: {
          ...prev.membershipPrices,
          [priceType]: parseFloat(value) || 0
        }
      }))
    } else {
      setSettings(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await saveSettings(settings)
      setShowSavedMessage(true)
      setTimeout(() => setShowSavedMessage(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Settings" subtitle="Configure gym settings and pricing">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warrior-gold"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Settings" subtitle="Configure gym settings and pricing">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success message */}
        {showSavedMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <CheckIcon className="w-5 h-5 mr-2" />
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gym Information */}
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="w-6 h-6 text-warrior-gold mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 font-display">Gym Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label" htmlFor="gymName">Gym Name</label>
                <input
                  type="text"
                  id="gymName"
                  name="gymName"
                  value={settings.gymName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Warriors Gym"
                />
              </div>
              
              <div>
                <label className="label" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={settings.phone}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="+968 92223330"
                  />
                </div>
              </div>
              
              <div>
                <label className="label" htmlFor="email">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={settings.email}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="info@warriorsgym.com"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="label" htmlFor="address">Address</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    id="address"
                    name="address"
                    value={settings.address}
                    onChange={handleInputChange}
                    className="input pl-10"
                    rows={3}
                    placeholder="AL MAHA ST, BOSHER AL KHUWAIR, MUSCAT"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Membership Pricing */}
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <CurrencyDollarIcon className="w-6 h-6 text-warrior-gold mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 font-display">Membership Pricing</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="label" htmlFor="price_monthly">Monthly Membership</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">OMR</span>
                  <input
                    type="number"
                    id="price_monthly"
                    name="price_monthly"
                    value={settings.membershipPrices.monthly}
                    onChange={handleInputChange}
                    className="input pl-12"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label className="label" htmlFor="price_twoMonths">Two Months</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">OMR</span>
                  <input
                    type="number"
                    id="price_twoMonths"
                    name="price_twoMonths"
                    value={settings.membershipPrices.twoMonths}
                    onChange={handleInputChange}
                    className="input pl-12"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label className="label" htmlFor="price_threeMonths">Three Months</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">OMR</span>
                  <input
                    type="number"
                    id="price_threeMonths"
                    name="price_threeMonths"
                    value={settings.membershipPrices.threeMonths}
                    onChange={handleInputChange}
                    className="input pl-12"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label className="label" htmlFor="price_sixMonths">Six Months</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">OMR</span>
                  <input
                    type="number"
                    id="price_sixMonths"
                    name="price_sixMonths"
                    value={settings.membershipPrices.sixMonths}
                    onChange={handleInputChange}
                    className="input pl-12"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <label className="label" htmlFor="price_yearly">Yearly Membership</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">OMR</span>
                  <input
                    type="number"
                    id="price_yearly"
                    name="price_yearly"
                    value={settings.membershipPrices.yearly}
                    onChange={handleInputChange}
                    className="input pl-12"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Pricing Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-warrior-gold">{settings.membershipPrices.monthly} OMR</p>
                  <p className="text-gray-600">Monthly</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-warrior-gold">{settings.membershipPrices.twoMonths} OMR</p>
                  <p className="text-gray-600">2 Months</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-warrior-gold">{settings.membershipPrices.threeMonths} OMR</p>
                  <p className="text-gray-600">3 Months</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-warrior-gold">{settings.membershipPrices.sixMonths} OMR</p>
                  <p className="text-gray-600">6 Months</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-warrior-gold">{settings.membershipPrices.yearly} OMR</p>
                  <p className="text-gray-600">Yearly</p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary btn-lg"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* System Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-600">System Version</p>
              <p className="font-medium">Warriors Gym Management v1.0</p>
            </div>
            <div>
              <p className="text-gray-600">Data Storage</p>
              <p className="font-medium">Local Browser Storage</p>
            </div>
            <div>
              <p className="text-gray-600">Last Updated</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Technology</p>
              <p className="font-medium">React + TypeScript + Next.js</p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> All data is stored locally in your browser. 
                Make sure to backup your data regularly by exporting member information.
                Clearing browser data will remove all gym records.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  const data = {
                    members: JSON.parse(localStorage.getItem('warriors_gym_members') || '[]'),
                    payments: JSON.parse(localStorage.getItem('warriors_gym_payments') || '[]'),
                    settings: JSON.parse(localStorage.getItem('warriors_gym_settings') || '{}')
                  }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `warriors_gym_backup_${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="btn btn-secondary btn-md"
              >
                Export Data Backup
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (confirm('This will clear ALL data including members, payments, and settings. This action cannot be undone. Are you sure?')) {
                    localStorage.removeItem('warriors_gym_members')
                    localStorage.removeItem('warriors_gym_payments')
                    localStorage.removeItem('warriors_gym_settings')
                    localStorage.removeItem('warriors_gym_next_member_id')
                    alert('All data has been cleared. The page will now reload.')
                    window.location.reload()
                  }
                }}
                className="btn btn-danger btn-md"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

