import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pudbrqbiupinkrezaebd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZGJycWJpdXBpbmtyZXphZWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzM5NDcsImV4cCI6MjA3MjIwOTk0N30.YgXiRStB2ZIJ-T_MR8vQfu3tsJ6Yva88W7tJo5_C_Sg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions with error handling
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  throw new Error(error?.message || 'Database operation failed')
}

// Database Types matching your current interfaces
export interface DatabaseMember {
  id: string
  member_number: string
  first_name: string
  last_name: string
  gender: 'male' | 'female'
  date_of_birth: string
  nationality: string
  mobile_number: string
  address: string
  email: string
  renew_duration: 'monthly' | 'twoMonths' | 'threeMonths' | 'sixMonths' | 'yearly'
  registration_date: string
  starting_date: string
  expiry_date: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  membership_cost: number
  payment_date: string
  id_number: string
  profile_image?: string
  status: 'active' | 'expired' | 'suspended'
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface DatabasePayment {
  id: string
  member_id: string
  amount: number
  date: string
  type: 'membership' | 'training' | 'equipment' | 'other'
  description?: string
  method: 'cash' | 'card' | 'bank'
  created_at?: string
  updated_at?: string
}

export interface DatabaseMemberPaymentHistory {
  member_number: string
  first_name: string
  last_name: string
  amount: number
  date: string
  type: string
  method: string
  description: string
}

export interface DatabasePaymentSummary {
  month: string
  type: string
  method: string
  payment_count: number
  total_amount: number
  average_amount: number
}

export interface DatabaseSettings {
  id: string
  gym_name: string
  address: string
  phone: string
  email: string
  membership_prices: {
    monthly: number
    twoMonths: number
    threeMonths: number
    sixMonths: number
    yearly: number
  }
  created_at?: string
  updated_at?: string
}
