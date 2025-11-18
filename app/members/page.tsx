'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Member } from '@/types'
import { getMembers, deleteMember } from '@/utils/database'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { exportMembersToExcel } from '@/utils/excelExport'
import { toast } from '@/utils/toast'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, statusFilter])

  const loadMembers = async () => {
    const membersData = await getMembers()
    setMembers(membersData)
    setIsLoading(false)
  }

  const filterMembers = () => {
    let filtered = [...members]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.memberNumber.includes(searchTerm) ||
        member.mobileNumber.includes(searchTerm)
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
      
      filtered = filtered.filter(member => {
        const expiryDate = new Date(member.expiryDate)
        
        switch (statusFilter) {
          case 'active':
            return member.status === 'active' && expiryDate >= today
          case 'expired':
            return member.status === 'expired' || expiryDate < today
          case 'expiring':
            return member.status === 'active' && expiryDate >= today && expiryDate <= thirtyDaysFromNow
          default:
            return true
        }
      })
    }
    
    setFilteredMembers(filtered)
  }

  const handleDeleteMember = async (memberId: string) => {
    if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      await deleteMember(memberId)
      loadMembers()
    }
  }

  const getStatusBadge = (member: Member) => {
    const today = new Date()
    const expiryDate = new Date(member.expiryDate)
    const isExpired = expiryDate < today
    const isExpiring = expiryDate >= today && expiryDate <= new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    if (isExpired || member.status === 'expired') {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>
    }
    
    if (isExpiring) {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Expiring</span>
    }
    
    if (member.status === 'active') {
      return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>
    }
    
    return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Suspended</span>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleExportMembers = async () => {
    setIsExporting(true)
    try {
      const membersToExport = searchTerm || statusFilter !== 'all' ? filteredMembers : members
      const result = await exportMembersToExcel(membersToExport)
      
      if (result.success) {
        toast.success(
          'Members Exported Successfully!', 
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
        'Failed to export members. Please try again.',
        5000
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Members" subtitle="Manage gym members">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warrior-gold"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Members" subtitle="Manage gym members">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input w-auto"
            >
              <option value="all">All Members</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportMembers}
              disabled={isExporting}
              className="btn btn-secondary btn-md"
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Excel'}
            </button>
            <Link href="/members/new" className="btn btn-primary btn-md">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Member
            </Link>
          </div>
        </div>

        {/* Members Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Member</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Membership</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-cell text-center py-12 text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No members found matching your criteria' 
                        : 'No members yet. Add your first member to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-warrior-gold rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {member.firstName[0]}{member.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">#{member.memberNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {member.mobileNumber}
                          </div>
                          {member.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {member.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {member.renewDuration.charAt(0).toUpperCase() + member.renewDuration.slice(1).replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires: {formatDate(member.expiryDate)}
                        </div>
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(member)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/members/${member.id}/edit`}
                            className="btn btn-secondary btn-sm"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="btn btn-danger btn-sm"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{members.length}</div>
            <div className="text-sm text-gray-500">Total Members</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status === 'active' && new Date(m.expiryDate) >= new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {members.filter(m => {
                const today = new Date()
                const expiryDate = new Date(m.expiryDate)
                const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
                return m.status === 'active' && expiryDate >= today && expiryDate <= thirtyDaysFromNow
              }).length}
            </div>
            <div className="text-sm text-gray-500">Expiring</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {members.filter(m => m.status === 'expired' || new Date(m.expiryDate) < new Date()).length}
            </div>
            <div className="text-sm text-gray-500">Expired</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

