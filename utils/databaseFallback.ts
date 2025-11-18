import { Member, Payment, GymSettings } from '@/types'

// Fallback to localStorage when database is not available
const isBrowser = typeof window !== 'undefined'

const STORAGE_KEYS = {
  MEMBERS: 'warriors_gym_members',
  PAYMENTS: 'warriors_gym_payments',
  SETTINGS: 'warriors_gym_settings',
  NEXT_MEMBER_ID: 'warriors_gym_next_member_id'
}

const safeParseJSON = <T>(value: string | null, defaultValue: T): T => {
  if (!value) return defaultValue
  try {
    return JSON.parse(value)
  } catch {
    return defaultValue
  }
}

// Fallback functions that use localStorage
export const getFallbackMembers = (): Member[] => {
  if (!isBrowser) return []
  const membersData = localStorage.getItem(STORAGE_KEYS.MEMBERS)
  return safeParseJSON<Member[]>(membersData, [])
}

export const getFallbackPayments = (): Payment[] => {
  if (!isBrowser) return []
  const paymentsData = localStorage.getItem(STORAGE_KEYS.PAYMENTS)
  return safeParseJSON<Payment[]>(paymentsData, [])
}

export const getFallbackSettings = (): GymSettings => {
  if (!isBrowser) {
    return getDefaultSettings()
  }
  const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return safeParseJSON<GymSettings>(settingsData, getDefaultSettings())
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

export const getFallbackActiveMembers = (): Member[] => {
  const members = getFallbackMembers()
  const today = new Date()
  return members.filter(m => {
    const expiryDate = new Date(m.expiryDate)
    return expiryDate >= today && m.status === 'active'
  })
}

export const getFallbackExpiringMembers = (daysAhead: number = 30): Member[] => {
  const members = getFallbackMembers()
  const today = new Date()
  const futureDate = new Date(today.getTime() + (daysAhead * 24 * 60 * 60 * 1000))
  
  return members.filter(m => {
    const expiryDate = new Date(m.expiryDate)
    return expiryDate >= today && expiryDate <= futureDate && m.status === 'active'
  })
}

export const calculateFallbackTotalRevenue = (): number => {
  const payments = getFallbackPayments()
  return payments.reduce((total, payment) => total + payment.amount, 0)
}

export const calculateFallbackMonthlyRevenue = (year: number, month: number): number => {
  const payments = getFallbackPayments()
  return payments
    .filter(p => {
      const paymentDate = new Date(p.date)
      return paymentDate.getFullYear() === year && paymentDate.getMonth() === month
    })
    .reduce((total, payment) => total + payment.amount, 0)
}

