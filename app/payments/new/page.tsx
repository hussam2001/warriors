'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Member, Payment, GymSettings } from '@/types'
import { getMembers, savePayment, getSettings } from '@/utils/database'
import { toast } from '@/utils/toast'
import { generatePaymentQuotationPDF } from '@/utils/pdfExport'
import {
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function RecordPaymentPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [settings, setSettings] = useState<GymSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)

  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    type: 'membership' as 'membership' | 'training' | 'equipment' | 'other',
    method: 'cash' as 'cash' | 'card' | 'bank',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

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

  useEffect(() => {
    // Auto-fill amount based on membership type and duration
    if (formData.type === 'membership' && formData.memberId && settings) {
      const member = members.find(m => m.id === formData.memberId)
      if (member) {
        const membershipCost = settings.membershipPrices[member.renewDuration]
        setFormData(prev => ({ ...prev, amount: membershipCost.toString() }))
      }
    }
  }, [formData.type, formData.memberId, members, settings])

  const loadData = async () => {
    const membersData = await getMembers()
    const settingsData = await getSettings()
    
    // Sort members by name
    const sortedMembers = membersData.sort((a, b) => 
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    )
    
    setMembers(sortedMembers)
    setFilteredMembers(sortedMembers)
    setSettings(settingsData)
    setIsLoading(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.memberId) {
      newErrors.memberId = 'Please select a member'
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
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
      const payment: Payment = {
        id: crypto.randomUUID(),
        memberId: formData.memberId,
        amount: Number(formData.amount),
        type: formData.type,
        method: formData.method,
        description: formData.description.trim() || undefined,
        date: formData.date
      }

      await savePayment(payment)

      const member = members.find(m => m.id === formData.memberId)
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'Member'

      toast.success(
        'Payment Recorded Successfully!',
        `${formData.amount} OMR payment recorded for ${memberName}`,
        4000
      )

      // Reset form or redirect
      router.push('/payments')
    } catch (error) {
      console.error('Error saving payment:', error)
      toast.error(
        'Save Failed',
        'Failed to record payment. Please try again.',
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

  const handleGeneratePDFQuotation = async () => {
    if (!formData.memberId || !formData.amount) {
      toast.error('Validation Error', 'Please select a member and enter an amount before generating PDF')
      return
    }

    setIsGeneratingPDF(true)
    try {
      const selectedMember = getSelectedMember()
      if (!selectedMember) {
        throw new Error('Selected member not found')
      }

      // Create a mock payment object for the PDF
      const mockPayment: Payment = {
        id: `QUOTE_${Date.now()}`,
        memberId: formData.memberId,
        amount: Number(formData.amount),
        type: formData.type,
        method: formData.method,
        description: formData.description.trim() || undefined,
        date: formData.date
      }

      const result = generatePaymentQuotationPDF({
        payment: mockPayment,
        member: selectedMember,
        gymSettings: {
          gymName: 'Warriors Gym',
          address: 'Muscat, Sultanate of Oman',
          phone: '+968 92223330',
          email: 'info@warriorsgym.com'
        }
      })
      
      if (result.success) {
        toast.success(
          'PDF Quotation Generated Successfully!', 
          `File saved as: ${result.filename}`,
          4000
        )
      } else {
        throw new Error(result.error || 'PDF generation failed')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error(
        'PDF Generation Failed', 
        'Failed to generate PDF quotation. Please try again.',
        5000
      )
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const formatCurrency = (amount: number) => `${amount.toFixed(0)} OMR`

  if (isLoading) {
    return (
      <DashboardLayout title="Record Payment" subtitle="Add a new payment transaction">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warrior-gold"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Record Payment" subtitle="Add a new payment transaction">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/payments" 
            className="inline-flex items-center text-gray-600 hover:text-warrior-gold transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Payments
          </Link>
        </div>

        {/* Payment Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Select Member *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search member by name or number..."
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value)
                    setShowMemberDropdown(true)
                    if (!e.target.value) {
                      setFormData(prev => ({ ...prev, memberId: '' }))
                    }
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  className={`input ${errors.memberId ? 'border-red-500' : ''}`}
                />
                
                {showMemberDropdown && filteredMembers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleMemberSelect(member)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 focus:outline-none focus:bg-warrior-light/10"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{member.memberNumber} • {member.mobileNumber}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              member.status === 'active' ? 'bg-green-100 text-green-800' :
                              member.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {member.status}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.memberId && (
                <p className="text-red-500 text-sm mt-1">{errors.memberId}</p>
              )}
            </div>

            {/* Selected Member Info */}
            {getSelectedMember() && (
              <div className="bg-warrior-light/10 border border-warrior-light/30 rounded-lg p-4">
                <h4 className="font-medium text-warrior-dark mb-2">Selected Member</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">
                      {getSelectedMember()?.firstName} {getSelectedMember()?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Member #:</span>
                    <span className="ml-2 font-medium">#{getSelectedMember()?.memberNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      getSelectedMember()?.status === 'active' ? 'bg-green-100 text-green-800' :
                      getSelectedMember()?.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getSelectedMember()?.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Membership:</span>
                    <span className="ml-2 font-medium capitalize">
                      {getSelectedMember()?.renewDuration.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCardIcon className="w-4 h-4 inline mr-1" />
                Payment Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as any,
                  // Reset amount when type changes from membership
                  amount: e.target.value === 'membership' ? prev.amount : ''
                }))}
                className="input"
              >
                <option value="membership">Membership Fee</option>
                <option value="training">Personal Training</option>
                <option value="equipment">Equipment/Gear</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BanknotesIcon className="w-4 h-4 inline mr-1" />
                Amount (OMR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={`input ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
              
              {/* Suggested amounts for membership */}
              {formData.type === 'membership' && settings && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Suggested amounts:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(settings.membershipPrices).map(([duration, price]) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, amount: price.toString() }))}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-warrior-light/20 rounded-full transition-colors"
                      >
                        {duration.replace(/([A-Z])/g, ' $1')}: {formatCurrency(price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'cash', label: 'Cash', icon: BanknotesIcon },
                  { value: 'card', label: 'Card', icon: CreditCardIcon },
                  { value: 'bank', label: 'Bank Transfer', icon: CreditCardIcon }
                ].map((method) => {
                  const Icon = method.icon
                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, method: method.value as 'cash' | 'card' | 'bank' }))
                        setErrors(prev => ({ ...prev, method: '' }))
                      }}
                      className={`p-3 border-2 rounded-lg text-center transition-all focus:outline-none focus:ring-2 focus:ring-warrior-gold ${
                        formData.method === method.value
                          ? 'border-warrior-gold bg-warrior-light/10 text-warrior-dark'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm font-medium">{method.label}</div>
                    </button>
                  )
                })}
              </div>
              {/* Show current selection */}
              <div className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium capitalize">
                  {formData.method === 'bank' ? 'Bank Transfer' : formData.method}
                </span>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`input ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                Description (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Additional notes about this payment..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/payments"
                className="btn btn-secondary btn-lg flex-1 text-center"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleGeneratePDFQuotation}
                disabled={isGeneratingPDF || !formData.memberId || !formData.amount}
                className="btn btn-secondary btn-lg flex-1"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Generate PDF
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary btn-lg flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Summary Card */}
        {formData.memberId && formData.amount && (
          <div className="card p-4 mt-6 bg-green-50 border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Payment Summary</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>Member: {getSelectedMember() && `${getSelectedMember()?.firstName} ${getSelectedMember()?.lastName}`}</div>
              <div>Amount: {formatCurrency(Number(formData.amount) || 0)}</div>
              <div>Type: {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}</div>
              <div>Method: {formData.method === 'bank' ? 'Bank Transfer' : formData.method.charAt(0).toUpperCase() + formData.method.slice(1)}</div>
              <div>Date: {new Date(formData.date).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
