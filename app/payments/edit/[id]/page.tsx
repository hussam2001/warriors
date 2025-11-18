'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Payment, Member } from '@/types'
import { getPaymentById, savePayment, getMembers } from '@/utils/database'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { toast } from '@/utils/toast'


export default function EditPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)

  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    type: 'membership' as 'membership' | 'training' | 'equipment' | 'other',
    method: 'cash' as 'cash' | 'card' | 'bank',
    description: '',
    date: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [paymentId])

  useEffect(() => {
    // Filter members based on search
    if (memberSearch.trim()) {
      const filtered = members.filter(member => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
        const memberNumber = member.memberNumber.toLowerCase()
        const search = memberSearch.toLowerCase()
        
        return fullName.includes(search) || memberNumber.includes(search)
      })
      setFilteredMembers(filtered)
    } else {
      setFilteredMembers(members)
    }
  }, [memberSearch, members])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load members
      const membersData = await getMembers()
      setMembers(membersData)
      
      // Load payment data
      const payment = await getPaymentById(paymentId)
      if (!payment) {
        toast.error('Payment Not Found', 'The payment you are trying to edit does not exist.')
        router.push('/payments')
        return
      }

      // Find the member for this payment
      const member = membersData.find(m => m.id === payment.memberId)
      if (member) {
        setMemberSearch(`${member.firstName} ${member.lastName} (#${member.memberNumber})`)
      }

      // Populate form with payment data
      setFormData({
        memberId: payment.memberId,
        amount: payment.amount.toString(),
        type: payment.type,
        method: payment.method,
        description: payment.description || '',
        date: payment.date
      })
      
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Load Failed', 'Failed to load payment data.')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.memberId) {
      newErrors.memberId = 'Please select a member'
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Validation Error', 'Please correct the errors and try again')
      return
    }

    setIsSaving(true)

    try {
      const updatedPayment: Payment = {
        id: paymentId, // Keep the original ID
        memberId: formData.memberId,
        amount: Number(formData.amount),
        type: formData.type,
        method: formData.method,
        description: formData.description.trim() || undefined,
        date: formData.date
      }

      await savePayment(updatedPayment)

      const member = members.find(m => m.id === formData.memberId)
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'Member'

      toast.success(
        'Payment Updated Successfully!',
        `Payment updated for ${memberName}`,
        4000
      )

      // Use router.replace with refresh parameter to ensure the payments page refreshes
      router.replace('/payments?refresh=true')
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error(
        'Update Failed',
        'Failed to update payment. Please try again.',
        5000
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleMemberSelect = (member: Member) => {
    setFormData(prev => ({ ...prev, memberId: member.id }))
    setMemberSearch(`${member.firstName} ${member.lastName} (#${member.memberNumber})`)
    setShowMemberDropdown(false)
    setErrors(prev => ({ ...prev, memberId: '' }))
  }

  const getSelectedMember = () => {
    return members.find(m => m.id === formData.memberId)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Payment">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c58542] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Edit Payment">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/payments"
            className="flex items-center gap-2 text-gray-600 hover:text-[#c58542] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Payments
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value)
                    setShowMemberDropdown(true)
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  placeholder="Search for a member..."
                  className={`input w-full ${errors.memberId ? 'border-red-500' : ''}`}
                />
                
                {showMemberDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleMemberSelect(member)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        >
                          <div className="font-medium">{member.firstName} {member.lastName}</div>
                          <div className="text-sm text-gray-500">#{member.memberNumber}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No members found</div>
                    )}
                  </div>
                )}
              </div>
              {errors.memberId && (
                <p className="mt-1 text-sm text-red-600">{errors.memberId}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (OMR) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`input w-full ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Type and Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="membership">Membership</option>
                  <option value="training">Training</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  id="method"
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="input w-full"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`input w-full ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input w-full"
                placeholder="Optional description..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/payments"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#c58542] text-white rounded-md hover:bg-[#a06b35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Updating...' : 'Update Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
