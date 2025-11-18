'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Member, Payment, RevenueStats } from '@/types'
import {
  getMembers,
  getPayments,
  getActiveMembers,
  getExpiringMembers,
  calculateTotalRevenue,
  calculateMonthlyRevenue
} from '@/utils/database'
import {
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    activeMembers: 0,
    expiringMembers: 0,
    newMembersThisMonth: 0,
    averageMonthlyRevenue: 0
  })
  const [recentMembers, setRecentMembers] = useState<Member[]>([])
  const [expiringMembers, setExpiringMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load all data in parallel for better performance
        const [members, payments, activeMembers, expiring] = await Promise.all([
          getMembers(),
          getPayments(),
          getActiveMembers(),
          getExpiringMembers(30)
        ])
        
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
      
        // Calculate revenues in parallel
        const [monthlyRevenue, totalRevenue] = await Promise.all([
          calculateMonthlyRevenue(currentYear, currentMonth),
          calculateTotalRevenue()
        ])
        
        // Calculate yearly revenue
        const yearlyPayments = payments.filter(p => {
          const paymentDate = new Date(p.date)
          return paymentDate.getFullYear() === currentYear
        })
        const yearlyRevenue = yearlyPayments.reduce((sum, p) => sum + p.amount, 0)
        
        // Calculate new members this month
        const newMembersThisMonth = members.filter(m => {
          const registrationDate = new Date(m.registrationDate)
          return registrationDate.getMonth() === currentMonth && 
                 registrationDate.getFullYear() === currentYear
        }).length
        
        // Calculate average monthly revenue (last 12 months) in parallel
        const monthlyRevenuePromises = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(currentYear, currentMonth - i, 1)
          return calculateMonthlyRevenue(date.getFullYear(), date.getMonth())
        })
        const monthlyRevenues = await Promise.all(monthlyRevenuePromises)
        const averageMonthlyRevenue = monthlyRevenues.reduce((sum, rev) => sum + rev, 0) / 12
        
        setStats({
          totalRevenue,
          monthlyRevenue,
          yearlyRevenue,
          activeMembers: activeMembers.length,
          expiringMembers: expiring.length,
          newMembersThisMonth,
          averageMonthlyRevenue
        })
        
        // Get 5 most recent members
        const sortedMembers = [...members].sort((a, b) => 
          new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
        )
        setRecentMembers(sortedMembers.slice(0, 5))
        
        setExpiringMembers(expiring.slice(0, 5))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Still show the dashboard with empty data rather than crashing
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} OMR`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Welcome to Warriors Gym Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warrior-gold"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome to Warriors Gym Management">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <UsersIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringMembers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Members */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-display">Recent Members</h3>
                <Link href="/members" className="text-sm text-yellow-600 hover:text-yellow-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No members yet</p>
              ) : (
                <div className="space-y-4">
                  {recentMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">#{member.memberNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3 inline mr-1" />
                          {formatDate(member.registrationDate)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expiring Memberships */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-display">Expiring Soon</h3>
                <Link href="/members?filter=expiring" className="text-sm text-yellow-600 hover:text-yellow-700">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {expiringMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expiring memberships</p>
              ) : (
                <div className="space-y-4">
                  {expiringMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <ClockIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">#{member.memberNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-red-600 font-medium">
                          Expires: {formatDate(member.expiryDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.ceil((new Date(member.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/members/new" className="btn btn-primary btn-lg justify-center">
              Add New Member
            </Link>
            <Link href="/payments/new" className="btn btn-secondary btn-lg justify-center">
              Record Payment
            </Link>
            <Link href="/reports" className="btn btn-secondary btn-lg justify-center">
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
