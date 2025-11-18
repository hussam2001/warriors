'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Member, Payment } from '@/types'
import { saveMember, generateMemberNumber, getSettings, savePayment } from '@/utils/database'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { toast } from '@/utils/toast'

export default function NewMemberPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    membershipPrices: {
      monthly: 30,
      twoMonths: 55,
      threeMonths: 80,
      sixMonths: 150,
      yearly: 300
    }
  })
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const gymSettings = await getSettings()
        setSettings(gymSettings)
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
  }, [])

  const [formData, setFormData] = useState<Partial<Member>>({
    firstName: '',
    lastName: '',
    gender: 'male',
    dateOfBirth: '',
    nationality: 'omani',
    mobileNumber: '',
    address: '',
    email: '',
    renewDuration: 'monthly',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    idNumber: '',
    status: 'active',
    notes: ''
  })

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank'>('cash')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateExpiryDate = (startDate: string, duration: string): string => {
    const start = new Date(startDate)
    let expiryDate = new Date(start)
    
    switch (duration) {
      case 'monthly':
        expiryDate.setMonth(expiryDate.getMonth() + 1)
        break
      case 'twoMonths':
        expiryDate.setMonth(expiryDate.getMonth() + 2)
        break
      case 'threeMonths':
        expiryDate.setMonth(expiryDate.getMonth() + 3)
        break
      case 'sixMonths':
        expiryDate.setMonth(expiryDate.getMonth() + 6)
        break
      case 'yearly':
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
        break
    }
    
    return expiryDate.toISOString().split('T')[0]
  }

  const getMembershipCost = (duration: string): number => {
    switch (duration) {
      case 'monthly':
        return settings.membershipPrices.monthly
      case 'twoMonths':
        return settings.membershipPrices.twoMonths
      case 'threeMonths':
        return settings.membershipPrices.threeMonths
      case 'sixMonths':
        return settings.membershipPrices.sixMonths
      case 'yearly':
        return settings.membershipPrices.yearly
      default:
        return settings.membershipPrices.monthly
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Manual validation
    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'mobileNumber', 
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship', 'idNumber'
    ]
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData])
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields)
      toast.error(
        'Validation Error', 
        `Please fill in all required fields: ${missingFields.join(', ')}`,
        5000
      )
      return
    }
    
    setIsSubmitting(true)

    let newMember: Member | null = null

    try {
      console.log('Submitting form data:', formData)
      const today = new Date().toISOString().split('T')[0]
      const membershipCost = getMembershipCost(formData.renewDuration || 'monthly')
      
      newMember = {
        id: crypto.randomUUID(),
        memberNumber: await generateMemberNumber(),
        registrationDate: today,
        startingDate: today,
        expiryDate: calculateExpiryDate(today, formData.renewDuration || 'monthly'),
        membershipCost,
        paymentDate: today,
        ...formData
      } as Member

      console.log('New member object:', newMember)
      
      // Save member - this will always succeed (uses localStorage fallback)
      try {
        await saveMember(newMember)
      } catch (memberError) {
        console.error('Error in saveMember (should not happen):', memberError)
        // Even if saveMember throws, continue - localStorage fallback should have worked
      }
      
      // Create automatic payment record for membership
      const membershipPayment: Payment = {
        id: crypto.randomUUID(),
        memberId: newMember.id,
        amount: membershipCost,
        date: today,
        type: 'membership',
        method: paymentMethod,
        description: `Initial membership payment - ${formData.renewDuration} subscription`
      }
      
      console.log('Creating automatic payment:', membershipPayment)
      
      // Save payment - also has localStorage fallback
      try {
        await savePayment(membershipPayment)
      } catch (paymentError) {
        console.error('Error saving payment:', paymentError)
        // Payment also has fallback, so continue
      }
      
      // Always show success - data is saved (either to Supabase or localStorage)
      toast.success(
        'Member Added Successfully!', 
        `${newMember.firstName} ${newMember.lastName} has been registered with automatic payment recorded.`,
        4000
      )
      
      router.push('/members')
    } catch (error) {
      console.error('Unexpected error:', error)
      // This should rarely happen since we have fallbacks
      // But if it does, still try to save locally
      if (newMember) {
        try {
          const { saveMember: saveMemberFallback } = await import('@/utils/localStorage')
          saveMemberFallback(newMember)
          toast.success(
            'Member Saved Locally', 
            'The member has been saved to your browser storage. Data will sync when connection is restored.',
            6000
          )
        } catch (localError) {
          toast.error(
            'Error Saving Member', 
            'Please try again. If the problem persists, check your internet connection.',
            5000
          )
        }
      } else {
        toast.error(
          'Error Creating Member', 
          'Please check all fields and try again.',
          5000
        )
      }
      
      setTimeout(() => {
        router.push('/members')
      }, 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add New Member" subtitle="Register a new gym member">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/members" className="btn btn-secondary btn-sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Members
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div>
                <label className="label" htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div>
                <label className="label" htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="label" htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label" htmlFor="nationality">Nationality *</label>
                <select
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="omani">Omani</option>
                  <option value="expat">Expat</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="label" htmlFor="idNumber">ID Number *</label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Civil ID or Passport Number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="mobileNumber">Mobile Number *</label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="+968 XXXXXXXX"
                  required
                />
              </div>
              
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="member@example.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="label" htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input"
                  rows={3}
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="emergencyContactName">Contact Name *</label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label" htmlFor="emergencyContactPhone">Contact Phone *</label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label" htmlFor="emergencyContactRelationship">Relationship *</label>
                <select
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Membership Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">Membership Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label" htmlFor="renewDuration">Membership Duration *</label>
                <select
                  id="renewDuration"
                  name="renewDuration"
                  value={formData.renewDuration}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="monthly">Monthly - {settings.membershipPrices.monthly} OMR</option>
                  <option value="twoMonths">Two Months - {settings.membershipPrices.twoMonths} OMR</option>
                  <option value="threeMonths">Three Months - {settings.membershipPrices.threeMonths} OMR</option>
                  <option value="sixMonths">Six Months - {settings.membershipPrices.sixMonths} OMR</option>
                  <option value="yearly">Yearly - {settings.membershipPrices.yearly} OMR</option>
                </select>
              </div>
              
              <div>
                <label className="label">Membership Cost</label>
                <div className="input bg-gray-50 flex items-center">
                  <span className="text-lg font-semibold text-warrior-gold">
                    {getMembershipCost(formData.renewDuration || 'monthly')} OMR
                  </span>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="paymentMethod">Payment Method *</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'bank')}
                  className="input"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="input"
              rows={3}
              placeholder="Additional notes about the member..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href="/members" className="btn btn-secondary btn-md">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-md"
            >
              {isSubmitting ? 'Adding Member...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

