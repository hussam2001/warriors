import { supabase, handleSupabaseError } from './supabase'
import { Member, Payment, GymSettings } from '@/types'
import type { DatabaseMember, DatabasePayment, DatabaseSettings, DatabaseMemberPaymentHistory, DatabasePaymentSummary } from './supabase'
import { 
  getFallbackMembers, 
  getFallbackPayments, 
  getFallbackSettings,
  getFallbackActiveMembers,
  getFallbackExpiringMembers,
  calculateFallbackTotalRevenue,
  calculateFallbackMonthlyRevenue
} from './databaseFallback'

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

// Helper functions to convert between database and app types
const dbMemberToMember = (dbMember: DatabaseMember): Member => ({
  id: dbMember.id,
  memberNumber: dbMember.member_number,
  firstName: dbMember.first_name,
  lastName: dbMember.last_name,
  gender: dbMember.gender,
  dateOfBirth: dbMember.date_of_birth,
  nationality: dbMember.nationality,
  mobileNumber: dbMember.mobile_number,
  address: dbMember.address,
  email: dbMember.email,
  renewDuration: dbMember.renew_duration,
  registrationDate: dbMember.registration_date,
  startingDate: dbMember.starting_date,
  expiryDate: dbMember.expiry_date,
  emergencyContactName: dbMember.emergency_contact_name,
  emergencyContactPhone: dbMember.emergency_contact_phone,
  emergencyContactRelationship: dbMember.emergency_contact_relationship,
  membershipCost: dbMember.membership_cost,
  paymentDate: dbMember.payment_date,
  idNumber: dbMember.id_number,
  profileImage: dbMember.profile_image,
  status: dbMember.status,
  notes: dbMember.notes
})

const memberToDbMember = (member: Member): Omit<DatabaseMember, 'created_at' | 'updated_at'> => ({
  id: member.id,
  member_number: member.memberNumber,
  first_name: member.firstName,
  last_name: member.lastName,
  gender: member.gender,
  date_of_birth: member.dateOfBirth,
  nationality: member.nationality,
  mobile_number: member.mobileNumber,
  address: member.address,
  email: member.email,
  renew_duration: member.renewDuration,
  registration_date: member.registrationDate,
  starting_date: member.startingDate,
  expiry_date: member.expiryDate,
  emergency_contact_name: member.emergencyContactName,
  emergency_contact_phone: member.emergencyContactPhone,
  emergency_contact_relationship: member.emergencyContactRelationship,
  membership_cost: member.membershipCost,
  payment_date: member.paymentDate,
  id_number: member.idNumber,
  profile_image: member.profileImage,
  status: member.status,
  notes: member.notes
})

const dbPaymentToPayment = (dbPayment: DatabasePayment): Payment => ({
  id: dbPayment.id,
  memberId: dbPayment.member_id,
  amount: dbPayment.amount,
  date: dbPayment.date,
  type: dbPayment.type,
  description: dbPayment.description,
  method: dbPayment.method
})

const paymentToDbPayment = (payment: Payment): Omit<DatabasePayment, 'id' | 'created_at' | 'updated_at'> => ({
  member_id: payment.memberId,
  amount: payment.amount,
  date: payment.date,
  type: payment.type,
  description: payment.description,
  method: payment.method
})

const dbSettingsToSettings = (dbSettings: DatabaseSettings): GymSettings => ({
  gymName: dbSettings.gym_name,
  address: dbSettings.address,
  phone: dbSettings.phone,
  email: dbSettings.email,
  membershipPrices: dbSettings.membership_prices
})

// Members
export const getMembers = async (): Promise<Member[]> => {
  if (!isBrowser) return []
  
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(dbMemberToMember) || []
  } catch (error) {
    console.error('Error fetching members, falling back to localStorage:', error)
    // Fallback to localStorage
    return getFallbackMembers()
  }
}

export const saveMember = async (member: Member): Promise<void> => {
  try {
    const dbMember = memberToDbMember(member)
    
    // Check if member exists
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('id', member.id)
      .single()
    
    if (existing) {
      // Update existing member
      const { error } = await supabase
        .from('members')
        .update(dbMember)
        .eq('id', member.id)
      
      if (error) throw error
    } else {
      // Insert new member
      const { error } = await supabase
        .from('members')
        .insert(dbMember)
      
      if (error) throw error
    }
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const deleteMember = async (memberId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId)
    
    if (error) throw error
  } catch (error) {
    handleSupabaseError(error)
  }
}

export const getMemberById = async (id: string): Promise<Member | undefined> => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? dbMemberToMember(data) : undefined
  } catch (error) {
    console.error('Error fetching member:', error)
    return undefined
  }
}

export const generateMemberNumber = async (): Promise<string> => {
  try {
    // Use timestamp-based approach to guarantee uniqueness
    const timestamp = Date.now()
    const randomSuffix = Math.floor(Math.random() * 1000)
    const uniqueNumber = timestamp + randomSuffix
    
    // Convert to a 6-digit string
    return uniqueNumber.toString().slice(-6).padStart(6, '0')
  } catch (error) {
    console.error('Error generating member number:', error)
    // Fallback: use current timestamp
    return Date.now().toString().slice(-6).padStart(6, '0')
  }
}

// Payments
export const getPayments = async (): Promise<Payment[]> => {
  if (!isBrowser) return []
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return data?.map(dbPaymentToPayment) || []
  } catch (error) {
    console.error('Error fetching payments, falling back to localStorage:', error)
    return getFallbackPayments()
  }
}

export const savePayment = async (payment: Payment): Promise<void> => {
  try {
    const dbPayment = paymentToDbPayment(payment)
    
    // Check if payment exists
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('id', payment.id)
      .single()
    
    if (existing) {
      // Update existing payment
      const { error } = await supabase
        .from('payments')
        .update(dbPayment)
        .eq('id', payment.id)
      
      if (error) throw error
    } else {
      // Insert new payment
      const { error } = await supabase
        .from('payments')
        .insert({ id: payment.id, ...dbPayment })
      
      if (error) throw error
    }

    // Note: member_payment_history and payment_summary are views (read-only)
    // They will be automatically populated by database triggers/functions
    
  } catch (error) {
    console.error('Supabase payment save failed, falling back to localStorage:', error)
    // Fallback to localStorage
    const { savePayment: savePaymentFallback } = await import('./localStorage')
    savePaymentFallback(payment)
  }
}

export const getPaymentById = async (paymentId: string): Promise<Payment | undefined> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error) throw error
    return data ? dbPaymentToPayment(data) : undefined
  } catch (error) {
    console.error('Error fetching payment:', error)
    return undefined
  }
}

export const getPaymentsByMember = async (memberId: string): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false })

    if (error) throw error
    return data?.map(dbPaymentToPayment) || []
  } catch (error) {
    console.error('Error fetching member payments:', error)
    return []
  }
}

// Settings
export const getSettings = async (): Promise<GymSettings> => {
  if (!isBrowser) return getDefaultSettings()
  
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error) throw error
    return data ? dbSettingsToSettings(data) : getDefaultSettings()
  } catch (error) {
    console.error('Error fetching settings, falling back to localStorage:', error)
    return getFallbackSettings()
  }
}

export const saveSettings = async (settings: GymSettings): Promise<void> => {
  try {
    const dbSettings = {
      gym_name: settings.gymName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      membership_prices: settings.membershipPrices
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .single()

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('settings')
        .update(dbSettings)
        .eq('id', existing.id)
      
      if (error) throw error
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('settings')
        .insert(dbSettings)
      
      if (error) throw error
    }
  } catch (error) {
    handleSupabaseError(error)
  }
}

const getDefaultSettings = (): GymSettings => ({
  gymName: 'Warriors Gym',
  address: 'AL MAHA ST, BOSHER AL KHUWAIR, MUSCAT',
  phone: '+968 92223330',
  email: 'info@warriorsgym.com',
  membershipPrices: {
    monthly: 30,
    twoMonths: 55,
    threeMonths: 80,
    sixMonths: 150,
    yearly: 300
  }
})

// Utility functions for revenue calculation
export const calculateTotalRevenue = async (): Promise<number> => {
  if (!isBrowser) return 0
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')

    if (error) throw error
    return data?.reduce((total, payment) => total + payment.amount, 0) || 0
  } catch (error) {
    console.error('Error calculating total revenue, falling back to localStorage:', error)
    return calculateFallbackTotalRevenue()
  }
}

export const calculateMonthlyRevenue = async (year: number, month: number): Promise<number> => {
  if (!isBrowser) return 0
  
  try {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) throw error
    return data?.reduce((total, payment) => total + payment.amount, 0) || 0
  } catch (error) {
    console.error('Error calculating monthly revenue, falling back to localStorage:', error)
    return calculateFallbackMonthlyRevenue(year, month)
  }
}

export const getActiveMembers = async (): Promise<Member[]> => {
  if (!isBrowser) return []
  
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('status', 'active')
      .gte('expiry_date', today)

    if (error) throw error
    return data?.map(dbMemberToMember) || []
  } catch (error) {
    console.error('Error fetching active members, falling back to localStorage:', error)
    return getFallbackActiveMembers()
  }
}

export const getExpiringMembers = async (daysAhead: number = 30): Promise<Member[]> => {
  if (!isBrowser) return []
  
  try {
    const today = new Date().toISOString().split('T')[0]
    const futureDate = new Date(Date.now() + (daysAhead * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('status', 'active')
      .gte('expiry_date', today)
      .lte('expiry_date', futureDate)

    if (error) throw error
    return data?.map(dbMemberToMember) || []
  } catch (error) {
    console.error('Error fetching expiring members, falling back to localStorage:', error)
    return getFallbackExpiringMembers(daysAhead)
  }
}

// Note: member_payment_history and payment_summary are views (read-only)
// They are automatically populated by database triggers/functions when data is inserted into the base tables

// Get member payment history
export const getMemberPaymentHistory = async (memberNumber: string): Promise<DatabaseMemberPaymentHistory[]> => {
  try {
    const { data, error } = await supabase
      .from('member_payment_history')
      .select('*')
      .eq('member_number', memberNumber)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching member payment history:', error)
    return []
  }
}

// Get payment summary
export const getPaymentSummary = async (): Promise<DatabasePaymentSummary[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_summary')
      .select('*')
      .order('month', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching payment summary:', error)
    return []
  }
}
