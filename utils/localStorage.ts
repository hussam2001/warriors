import { Member, Payment, GymSettings } from '@/types';

const STORAGE_KEYS = {
  MEMBERS: 'warriors_gym_members',
  PAYMENTS: 'warriors_gym_payments',
  SETTINGS: 'warriors_gym_settings',
  NEXT_MEMBER_ID: 'warriors_gym_next_member_id'
};

// Helper function to safely parse JSON from localStorage
const safeParseJSON = <T>(value: string | null, defaultValue: T): T => {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
};

// Members
export const getMembers = (): Member[] => {
  if (typeof window === 'undefined') return [];
  const membersData = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  return safeParseJSON<Member[]>(membersData, []);
};

export const saveMember = (member: Member): void => {
  if (typeof window === 'undefined') return;
  const members = getMembers();
  const existingIndex = members.findIndex(m => m.id === member.id);
  
  if (existingIndex >= 0) {
    members[existingIndex] = member;
  } else {
    members.push(member);
  }
  
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
};

export const deleteMember = (memberId: string): void => {
  if (typeof window === 'undefined') return;
  const members = getMembers();
  const filteredMembers = members.filter(m => m.id !== memberId);
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMembers));
};

export const getMemberById = (id: string): Member | undefined => {
  const members = getMembers();
  return members.find(m => m.id === id);
};

export const generateMemberNumber = (): string => {
  if (typeof window === 'undefined') return '0001';
  const nextId = localStorage.getItem(STORAGE_KEYS.NEXT_MEMBER_ID);
  const currentId = safeParseJSON<number>(nextId, 1);
  const memberNumber = currentId.toString().padStart(4, '0');
  localStorage.setItem(STORAGE_KEYS.NEXT_MEMBER_ID, JSON.stringify(currentId + 1));
  return memberNumber;
};

// Payments
export const getPayments = (): Payment[] => {
  if (typeof window === 'undefined') return [];
  const paymentsData = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return safeParseJSON<Payment[]>(paymentsData, []);
};

export const savePayment = (payment: Payment): void => {
  if (typeof window === 'undefined') return;
  const payments = getPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);
  
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const getPaymentsByMember = (memberId: string): Payment[] => {
  const payments = getPayments();
  return payments.filter(p => p.memberId === memberId);
};

// Settings
export const getSettings = (): GymSettings => {
  if (typeof window === 'undefined') {
    return getDefaultSettings();
  }
  const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return safeParseJSON<GymSettings>(settingsData, getDefaultSettings());
};

export const saveSettings = (settings: GymSettings): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

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
});

// Utility functions for revenue calculation
export const calculateTotalRevenue = (): number => {
  const payments = getPayments();
  return payments.reduce((total, payment) => total + payment.amount, 0);
};

export const calculateMonthlyRevenue = (year: number, month: number): number => {
  const payments = getPayments();
  return payments
    .filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
    })
    .reduce((total, payment) => total + payment.amount, 0);
};

export const getActiveMembers = (): Member[] => {
  const members = getMembers();
  const today = new Date();
  return members.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    return expiryDate >= today && m.status === 'active';
  });
};

export const getExpiringMembers = (daysAhead: number = 30): Member[] => {
  const members = getMembers();
  const today = new Date();
  const futureDate = new Date(today.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
  
  return members.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    return expiryDate >= today && expiryDate <= futureDate && m.status === 'active';
  });
};

