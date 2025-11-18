export interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  nationality: string;
  mobileNumber: string;
  address: string;
  email: string;
  renewDuration: 'monthly' | 'twoMonths' | 'threeMonths' | 'sixMonths' | 'yearly';
  registrationDate: string;
  startingDate: string;
  expiryDate: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  membershipCost: number;
  paymentDate: string;
  idNumber: string;
  profileImage?: string;
  status: 'active' | 'expired' | 'suspended';
  notes?: string;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  type: 'membership' | 'training' | 'equipment' | 'other';
  description?: string;
  method: 'cash' | 'card' | 'bank';
}

export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  activeMembers: number;
  expiringMembers: number;
  newMembersThisMonth: number;
  averageMonthlyRevenue: number;
}

export interface GymSettings {
  gymName: string;
  address: string;
  phone: string;
  email: string;
  membershipPrices: {
    monthly: number;
    twoMonths: number;
    threeMonths: number;
    sixMonths: number;
    yearly: number;
  };
}

