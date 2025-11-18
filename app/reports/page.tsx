'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Member, Payment } from '@/types'
import { getMembers, getPayments, calculateMonthlyRevenue } from '@/utils/database'
import {
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { exportToExcel } from '@/utils/excelExport'
import { toast } from '@/utils/toast'

interface MonthlyData {
  month: string
  revenue: number
  newMembers: number
  renewals: number
}

export default function ReportsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedYear])

  const loadData = async () => {
    try {
      const membersData = await getMembers()
      const paymentsData = await getPayments()
      
      setMembers(membersData)
      setPayments(paymentsData)
    
    // Calculate monthly data for the selected year
    const monthlyReport: MonthlyData[] = []
    
    // Get all revenue calculations at once to improve performance
    const revenuePromises = Array.from({ length: 12 }, (_, month) => 
      calculateMonthlyRevenue(selectedYear, month)
    )
    const monthlyRevenues = await Promise.all(revenuePromises)
    
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(selectedYear, month, 1).toLocaleDateString('en', { month: 'long' })
      const revenue = monthlyRevenues[month]
      
      // Count new members for this month
      const newMembers = membersData.filter(member => {
        const registrationDate = new Date(member.registrationDate)
        return registrationDate.getFullYear() === selectedYear && 
               registrationDate.getMonth() === month
      }).length
      
      // Count renewals for this month (payments that are not initial registrations)
      const renewals = paymentsData.filter(payment => {
        const paymentDate = new Date(payment.date)
        const member = membersData.find(m => m.id === payment.memberId)
        const registrationDate = member ? new Date(member.registrationDate) : null
        
        return paymentDate.getFullYear() === selectedYear && 
               paymentDate.getMonth() === month &&
               registrationDate &&
               registrationDate.toDateString() !== paymentDate.toDateString()
      }).length
      
      monthlyReport.push({
        month: monthName,
        revenue,
        newMembers,
        renewals
      })
    }
    
      setMonthlyData(monthlyReport)
    } catch (error) {
      console.error('Error loading reports data:', error)
      toast.error('Error Loading Data', 'Failed to load reports data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `${amount.toFixed(0)} OMR`

  // Calculate summary statistics
  const currentYearRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0)
  const currentYearNewMembers = monthlyData.reduce((sum, month) => sum + month.newMembers, 0)
  const currentYearRenewals = monthlyData.reduce((sum, month) => sum + month.renewals, 0)
  const averageMonthlyRevenue = currentYearRevenue / 12

  // Get current month data
  const currentMonth = new Date().getMonth()
  const currentMonthData = monthlyData[currentMonth] || { revenue: 0, newMembers: 0, renewals: 0 }

  // Calculate membership distribution
  const membershipDistribution = {
    monthly: members.filter(m => m.renewDuration === 'monthly').length,
    twoMonths: members.filter(m => m.renewDuration === 'twoMonths').length,
    threeMonths: members.filter(m => m.renewDuration === 'threeMonths').length,
    sixMonths: members.filter(m => m.renewDuration === 'sixMonths').length,
    yearly: members.filter(m => m.renewDuration === 'yearly').length,
  }

  // Calculate status distribution
  const today = new Date()
  const activeMembers = members.filter(m => m.status === 'active' && new Date(m.expiryDate) >= today).length
  const expiredMembers = members.filter(m => m.status === 'expired' || new Date(m.expiryDate) < today).length
  const suspendedMembers = members.filter(m => m.status === 'suspended').length

  const availableYears = Array.from(
    new Set([
      ...members.map(m => new Date(m.registrationDate).getFullYear()),
      ...payments.map(p => new Date(p.date).getFullYear()),
      new Date().getFullYear()
    ])
  ).sort((a, b) => b - a)

  const handleExportToExcel = async () => {
    setIsExporting(true)
    try {
      const result = await exportToExcel({
        members,
        payments,
        selectedYear
      })
      
      if (result.success) {
        toast.success(
          'Report Exported Successfully!', 
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
        'Failed to export report. Please try again.',
        5000
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Reports" subtitle="Revenue and membership analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warrior-gold"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Reports" subtitle="Revenue and membership analytics">
      <div className="space-y-6">
        {/* Year selector */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input w-auto"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleExportToExcel}
            disabled={isExporting}
            className="btn btn-primary btn-md"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-warrior-light/20 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-warrior-gold" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Year Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentYearRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageMonthlyRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Members</p>
                <p className="text-2xl font-bold text-gray-900">{currentYearNewMembers}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Renewals</p>
                <p className="text-2xl font-bold text-gray-900">{currentYearRenewals}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">Monthly Revenue - {selectedYear}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monthlyData.map((month, index) => {
                  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue))
                  const barWidth = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">{month.month}</span>
                        <span className="text-warrior-gold font-semibold">{formatCurrency(month.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-warrior-gold h-2 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Membership Distribution */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 font-display">Membership Distribution</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{expiredMembers}</p>
                  <p className="text-sm text-gray-600">Expired</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Duration Breakdown:</h4>
                {Object.entries(membershipDistribution).map(([duration, count]) => (
                  <div key={duration} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {duration.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Details Table */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 font-display">Monthly Breakdown - {selectedYear}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Month</th>
                  <th className="table-header">Revenue</th>
                  <th className="table-header">New Members</th>
                  <th className="table-header">Renewals</th>
                  <th className="table-header">Total Transactions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.map((month, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{month.month}</td>
                    <td className="table-cell">{formatCurrency(month.revenue)}</td>
                    <td className="table-cell">{month.newMembers}</td>
                    <td className="table-cell">{month.renewals}</td>
                    <td className="table-cell">{month.newMembers + month.renewals}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="table-cell font-bold">Total</td>
                  <td className="table-cell font-bold">{formatCurrency(currentYearRevenue)}</td>
                  <td className="table-cell font-bold">{currentYearNewMembers}</td>
                  <td className="table-cell font-bold">{currentYearRenewals}</td>
                  <td className="table-cell font-bold">{currentYearNewMembers + currentYearRenewals}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Current Month Highlight */}
        <div className="card p-6 bg-gradient-to-r from-warrior-gold/10 to-warrior-bronze/10">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })} Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-warrior-gold">{formatCurrency(currentMonthData.revenue)}</p>
              <p className="text-sm text-gray-600">Revenue This Month</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-warrior-bronze">{currentMonthData.newMembers}</p>
              <p className="text-sm text-gray-600">New Members</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-warrior-dark">{currentMonthData.renewals}</p>
              <p className="text-sm text-gray-600">Renewals</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
