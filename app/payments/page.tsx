'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { Payment, Member } from '@/types'
import { getPayments, getMembers } from '@/utils/database'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { exportPaymentsToExcel } from '@/utils/excelExport'
import { generatePaymentsQuotationPDF } from '@/utils/pdfExport'
import { toast } from '@/utils/toast'

export default function PaymentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [payments, setPayments] = useState<Payment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'membership' | 'training' | 'equipment' | 'other'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'cash' | 'card' | 'bank'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // Check for refresh parameter from edit page
  useEffect(() => {
    const refreshParam = searchParams.get('refresh')
    if (refreshParam === 'true') {
      loadData(true)
      // Clean up URL parameter
      router.replace('/payments', { scroll: false })
    }
  }, [searchParams, router])

  // Refresh data when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData()
      }
    }

    const handleFocus = () => {
      loadData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, typeFilter, methodFilter])

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    
    try {
      const paymentsData = await getPayments()
      const membersData = await getMembers()
      
      // Sort payments by date (newest first)
      const sortedPayments = paymentsData.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      setPayments(sortedPayments)
      setMembers(membersData)
      
      if (showRefreshIndicator) {
        toast.success('Data Refreshed', 'Payment information updated successfully', 2000)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Load Failed', 'Failed to load payment data. Please try again.', 3000)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadData(true)
  }

  const filterPayments = () => {
    let filtered = [...payments]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const member = members.find(m => m.id === payment.memberId)
        const memberName = member ? `${member.firstName} ${member.lastName}` : ''
        const memberNumber = member?.memberNumber || ''
        
        return (
          memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          memberNumber.includes(searchTerm) ||
          payment.id.includes(searchTerm) ||
          payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.type === typeFilter)
    }
    
    // Apply method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter)
    }
    
    setFilteredPayments(filtered)
  }

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'
  }

  const getMemberNumber = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.memberNumber || 'N/A'
  }

  const formatCurrency = (amount: number) => `${amount.toFixed(0)} OMR`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'membership':
        return <CreditCardIcon className="w-4 h-4" />
      case 'training':
        return <BanknotesIcon className="w-4 h-4" />
      case 'equipment':
        return <BuildingLibraryIcon className="w-4 h-4" />
      default:
        return <CreditCardIcon className="w-4 h-4" />
    }
  }

  const getPaymentTypeBadge = (type: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-medium rounded-full"
    
    switch (type) {
      case 'membership':
        return <span className={`${baseClasses} bg-warrior-light/20 text-warrior-dark`}>Membership</span>
      case 'training':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Training</span>
      case 'equipment':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Equipment</span>
      case 'other':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Other</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{type}</span>
    }
  }

  const getMethodBadge = (method: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-medium rounded-full"
    
    switch (method) {
      case 'cash':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Cash</span>
      case 'card':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Card</span>
      case 'bank':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Bank Transfer</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{method}</span>
    }
  }

  const handleExportPayments = async () => {
    setIsExporting(true)
    try {
      const paymentsToExport = searchTerm || typeFilter !== 'all' || methodFilter !== 'all' ? filteredPayments : payments
      const result = await exportPaymentsToExcel(paymentsToExport, members)
      
      if (result.success) {
        toast.success(
          'Payments Exported Successfully!', 
          `File saved as: ${result.filename}`,
          4000
        )
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error(
        'Export Failed', 
        'Failed to export payments. Please try again.',
        5000
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPaymentsPDF = async () => {
    setIsExportingPDF(true)
    try {
      const paymentsToExport = searchTerm || typeFilter !== 'all' || methodFilter !== 'all' ? filteredPayments : payments
      const result = generatePaymentsQuotationPDF({
        payments: paymentsToExport,
        members,
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
      console.error('PDF export error:', error)
      toast.error(
        'PDF Export Failed', 
        'Failed to generate PDF quotation. Please try again.',
        5000
      )
    } finally {
      setIsExportingPDF(false)
    }
  }

  // Calculate totals
  const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const todayRevenue = filteredPayments
    .filter(p => new Date(p.date).toDateString() === new Date().toDateString())
    .reduce((sum, payment) => sum + payment.amount, 0)
  const thisMonthRevenue = filteredPayments
    .filter(p => {
      const paymentDate = new Date(p.date)
      const now = new Date()
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, payment) => sum + payment.amount, 0)

  if (isLoading) {
    return (
      <DashboardLayout title="Payments" subtitle="Track all payment transactions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warrior-gold"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Payments" subtitle="Track all payment transactions">
      <div className="space-y-6">
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-warrior-light/20 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-warrior-gold" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonthRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCardIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Filtered</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="input w-auto"
            >
              <option value="all">All Types</option>
              <option value="membership">Membership</option>
              <option value="training">Training</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="input w-auto"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-secondary btn-md"
              title="Refresh payment data"
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleExportPayments}
              disabled={isExporting}
              className="btn btn-secondary btn-md"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
            <button
              onClick={handleExportPaymentsPDF}
              disabled={isExportingPDF}
              className="btn btn-secondary btn-md"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              {isExportingPDF ? 'Generating...' : 'Export PDF'}
            </button>
            <Link href="/payments/new" className="btn btn-primary btn-md">
              <PlusIcon className="w-5 h-5 mr-2" />
              Record Payment
            </Link>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Payment ID</th>
                  <th className="table-header">Member</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Description</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-cell text-center py-12 text-gray-500">
                      {searchTerm || typeFilter !== 'all' || methodFilter !== 'all'
                        ? 'No payments found matching your criteria'
                        : 'No payments recorded yet. Record your first payment to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="text-sm font-mono text-gray-900">
                          #{payment.id.slice(-6)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getMemberName(payment.memberId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{getMemberNumber(payment.memberId)}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm font-semibold text-warrior-gold">
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {getPaymentTypeIcon(payment.type)}
                          </div>
                          {getPaymentTypeBadge(payment.type)}
                        </div>
                      </td>
                      <td className="table-cell">
                        {getMethodBadge(payment.method)}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {formatDate(payment.date)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {payment.description || '-'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/payments/edit/${payment.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#c58542] bg-[#c58542]/10 rounded-md hover:bg-[#c58542]/20 transition-colors"
                          >
                            <PencilIcon className="w-3 h-3" />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">Payment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">By Payment Type</h4>
              <div className="space-y-2">
                {['membership', 'training', 'equipment', 'other'].map(type => {
                  const typePayments = filteredPayments.filter(p => p.type === type)
                  const typeTotal = typePayments.reduce((sum, p) => sum + p.amount, 0)
                  return (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{type}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(typeTotal)} ({typePayments.length})
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">By Payment Method</h4>
              <div className="space-y-2">
                {['cash', 'card', 'bank'].map(method => {
                  const methodPayments = filteredPayments.filter(p => p.method === method)
                  const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0)
                  return (
                    <div key={method} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {method === 'bank' ? 'Bank Transfer' : method}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(methodTotal)} ({methodPayments.length})
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

