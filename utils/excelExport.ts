import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Member, Payment } from '@/types'

interface ExportData {
  members: Member[]
  payments: Payment[]
  selectedYear: number
}

interface MemberExportRow {
  'Member Number': string
  'First Name': string
  'Last Name': string
  'Email': string
  'Phone': string
  'Registration Date': string
  'Expiry Date': string
  'Status': string
  'Membership Duration': string
  'Fee Amount': string
  'Days Remaining': string
}

interface PaymentExportRow {
  'Payment ID': string
  'Member Number': string
  'Member Name': string
  'Amount (OMR)': number
  'Payment Date': string
  'Payment Method': string
  'Duration': string
  'Month': string
}

interface MonthlyReportRow {
  'Month': string
  'Revenue (OMR)': number
  'New Members': number
  'Renewals': number
  'Total Transactions': number
}

export const exportToExcel = ({ members, payments, selectedYear }: ExportData) => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // 1. Members Sheet
    const membersData: MemberExportRow[] = members.map(member => {
      const expiryDate = new Date(member.expiryDate)
      const today = new Date()
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        'Member Number': member.memberNumber,
        'First Name': member.firstName,
        'Last Name': member.lastName,
        'Email': member.email,
        'Phone': member.mobileNumber,
        'Registration Date': new Date(member.registrationDate).toLocaleDateString('en-GB'),
        'Expiry Date': new Date(member.expiryDate).toLocaleDateString('en-GB'),
        'Status': member.status.charAt(0).toUpperCase() + member.status.slice(1),
        'Membership Duration': formatDuration(member.renewDuration),
        'Fee Amount': `${member.membershipCost} OMR`,
        'Days Remaining': daysRemaining > 0 ? daysRemaining.toString() : 'Expired'
      }
    })

    const membersSheet = XLSX.utils.json_to_sheet(membersData)
    XLSX.utils.book_append_sheet(workbook, membersSheet, 'Members')

    // 2. Payments Sheet
    const paymentsData: PaymentExportRow[] = payments
      .filter(payment => new Date(payment.date).getFullYear() === selectedYear)
      .map(payment => {
        const member = members.find(m => m.id === payment.memberId)
        const paymentDate = new Date(payment.date)
        
        return {
          'Payment ID': payment.id,
          'Member Number': member?.memberNumber || 'N/A',
          'Member Name': member ? `${member.firstName} ${member.lastName}` : 'N/A',
          'Amount (OMR)': payment.amount,
          'Payment Date': paymentDate.toLocaleDateString('en-GB'),
          'Payment Method': payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
          'Duration': member ? formatDuration(member.renewDuration) : 'N/A',
          'Month': paymentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })
        }
      })

    const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData)
    XLSX.utils.book_append_sheet(workbook, paymentsSheet, `${selectedYear} Payments`)

    // 3. Monthly Report Sheet
    const monthlyReportData: MonthlyReportRow[] = []
    let yearTotal = { revenue: 0, newMembers: 0, renewals: 0 }

    for (let month = 0; month < 12; month++) {
      const monthName = new Date(selectedYear, month, 1).toLocaleDateString('en', { month: 'long' })
      
      // Calculate revenue for this month
      const monthlyRevenue = payments
        .filter(payment => {
          const paymentDate = new Date(payment.date)
          return paymentDate.getFullYear() === selectedYear && paymentDate.getMonth() === month
        })
        .reduce((sum, payment) => sum + payment.amount, 0)

      // Count new members for this month
      const newMembers = members.filter(member => {
        const registrationDate = new Date(member.registrationDate)
        return registrationDate.getFullYear() === selectedYear && 
               registrationDate.getMonth() === month
      }).length

      // Count renewals for this month
      const renewals = payments.filter(payment => {
        const paymentDate = new Date(payment.date)
        const member = members.find(m => m.id === payment.memberId)
        const registrationDate = member ? new Date(member.registrationDate) : null
        
        return paymentDate.getFullYear() === selectedYear && 
               paymentDate.getMonth() === month &&
               registrationDate &&
               registrationDate.toDateString() !== paymentDate.toDateString()
      }).length

      const totalTransactions = newMembers + renewals

      monthlyReportData.push({
        'Month': monthName,
        'Revenue (OMR)': monthlyRevenue,
        'New Members': newMembers,
        'Renewals': renewals,
        'Total Transactions': totalTransactions
      })

      // Add to year totals
      yearTotal.revenue += monthlyRevenue
      yearTotal.newMembers += newMembers
      yearTotal.renewals += renewals
    }

    // Add year total row
    monthlyReportData.push({
      'Month': 'TOTAL',
      'Revenue (OMR)': yearTotal.revenue,
      'New Members': yearTotal.newMembers,
      'Renewals': yearTotal.renewals,
      'Total Transactions': yearTotal.newMembers + yearTotal.renewals
    })

    const monthlySheet = XLSX.utils.json_to_sheet(monthlyReportData)
    XLSX.utils.book_append_sheet(workbook, monthlySheet, `${selectedYear} Monthly Report`)

    // 4. Summary Sheet
    const summaryData = [
      { 'Metric': 'Report Generated', 'Value': new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB') },
      { 'Metric': 'Total Members', 'Value': members.length },
      { 'Metric': 'Active Members', 'Value': members.filter(m => m.status === 'active').length },
      { 'Metric': 'Expired Members', 'Value': members.filter(m => m.status === 'expired').length },
      { 'Metric': 'Suspended Members', 'Value': members.filter(m => m.status === 'suspended').length },
      { 'Metric': `${selectedYear} Total Revenue`, 'Value': `${yearTotal.revenue} OMR` },
      { 'Metric': `${selectedYear} Average Monthly Revenue`, 'Value': `${(yearTotal.revenue / 12).toFixed(2)} OMR` },
      { 'Metric': `${selectedYear} New Members`, 'Value': yearTotal.newMembers },
      { 'Metric': `${selectedYear} Total Renewals`, 'Value': yearTotal.renewals },
      { 'Metric': 'System', 'Value': 'Warriors Gym Management System' }
    ]

    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Style the workbook (set column widths)
    Object.keys(workbook.Sheets).forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName]
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
      
      // Auto-fit columns
      const colWidths: number[] = []
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxWidth = 10
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
          const cell = sheet[cellAddress]
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length
            maxWidth = Math.max(maxWidth, cellLength + 2)
          }
        }
        colWidths[col] = Math.min(maxWidth, 50) // Cap at 50 characters
      }
      sheet['!cols'] = colWidths.map(width => ({ wch: width }))
    })

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `Warriors_Gym_Report_${selectedYear}_${timestamp}.xlsx`

    // Write and download the file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Export error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

const formatDuration = (duration: string): string => {
  const durationMap: { [key: string]: string } = {
    'monthly': '1 Month',
    'twoMonths': '2 Months',
    'threeMonths': '3 Months',
    'sixMonths': '6 Months',
    'yearly': '1 Year'
  }
  return durationMap[duration] || duration
}

// Export function for member list only
export const exportMembersToExcel = (members: Member[]) => {
  try {
    const workbook = XLSX.utils.book_new()
    
    const membersData: MemberExportRow[] = members.map(member => {
      const expiryDate = new Date(member.expiryDate)
      const today = new Date()
      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        'Member Number': member.memberNumber,
        'First Name': member.firstName,
        'Last Name': member.lastName,
        'Email': member.email,
        'Phone': member.mobileNumber,
        'Registration Date': new Date(member.registrationDate).toLocaleDateString('en-GB'),
        'Expiry Date': new Date(member.expiryDate).toLocaleDateString('en-GB'),
        'Status': member.status.charAt(0).toUpperCase() + member.status.slice(1),
        'Membership Duration': formatDuration(member.renewDuration),
        'Fee Amount': `${member.membershipCost} OMR`,
        'Days Remaining': daysRemaining > 0 ? daysRemaining.toString() : 'Expired'
      }
    })

    const membersSheet = XLSX.utils.json_to_sheet(membersData)
    
    // Auto-fit columns
    const range = XLSX.utils.decode_range(membersSheet['!ref'] || 'A1')
    const colWidths: number[] = []
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 10
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = membersSheet[cellAddress]
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length
          maxWidth = Math.max(maxWidth, cellLength + 2)
        }
      }
      colWidths[col] = Math.min(maxWidth, 50)
    }
    membersSheet['!cols'] = colWidths.map(width => ({ wch: width }))

    XLSX.utils.book_append_sheet(workbook, membersSheet, 'Members')

    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `Warriors_Gym_Members_${timestamp}.xlsx`

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Members export error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Export function for payments only
export const exportPaymentsToExcel = (payments: Payment[], members: Member[], year?: number) => {
  try {
    const workbook = XLSX.utils.book_new()
    
    const filteredPayments = year 
      ? payments.filter(payment => new Date(payment.date).getFullYear() === year)
      : payments

    const paymentsData: PaymentExportRow[] = filteredPayments.map(payment => {
      const member = members.find(m => m.id === payment.memberId)
      const paymentDate = new Date(payment.date)
      
      return {
        'Payment ID': payment.id,
        'Member Number': member?.memberNumber || 'N/A',
        'Member Name': member ? `${member.firstName} ${member.lastName}` : 'N/A',
        'Amount (OMR)': payment.amount,
        'Payment Date': paymentDate.toLocaleDateString('en-GB'),
        'Payment Method': payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
        'Duration': member ? formatDuration(member.renewDuration) : 'N/A',
        'Month': paymentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })
      }
    })

    const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData)
    
    // Auto-fit columns
    const range = XLSX.utils.decode_range(paymentsSheet['!ref'] || 'A1')
    const colWidths: number[] = []
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 10
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = paymentsSheet[cellAddress]
        if (cell && cell.v) {
          const cellLength = cell.v.toString().length
          maxWidth = Math.max(maxWidth, cellLength + 2)
        }
      }
      colWidths[col] = Math.min(maxWidth, 50)
    }
    paymentsSheet['!cols'] = colWidths.map(width => ({ wch: width }))

    XLSX.utils.book_append_sheet(workbook, paymentsSheet, year ? `${year} Payments` : 'All Payments')

    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `Warriors_Gym_Payments_${year || 'All'}_${timestamp}.xlsx`

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, filename)

    return { success: true, filename }
  } catch (error) {
    console.error('Payments export error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

