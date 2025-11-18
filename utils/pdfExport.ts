import jsPDF from 'jspdf'
import { Payment, Member } from '@/types'

interface QuotationData {
  payment: Payment
  member: Member
  gymSettings?: {
    gymName: string
    address: string
    phone: string
    email: string
  }
}

interface PaymentQuotationData {
  payments: Payment[]
  members: Member[]
  gymSettings?: {
    gymName: string
    address: string
    phone: string
    email: string
  }
}

export const generatePaymentQuotationPDF = (data: QuotationData) => {
  try {
    const { payment, member, gymSettings } = data
    const doc = new jsPDF()
    
    // Set default gym settings if not provided
    const gym = gymSettings || {
      gymName: 'Warriors Gym',
      address: 'Muscat, Sultanate of Oman',
      phone: '+968 92223330',
      email: 'info@warriorsgym.com'
    }

    // Custom colors from user request
    const warriorGold = [197, 133, 66] // #c58542
    const warriorDark = [10, 16, 30] // #0a101e
    const lightGray = [248, 250, 252] // Light background
    const darkGray = [55, 65, 81] // Dark text

    // Page dimensions
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)

    // Header with gradient effect
    doc.setFillColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    // Warriors Logo placeholder (text-based)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('WARRIORS', margin, 25)
    
    // Gym name
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text(gym.gymName, margin, 35)
    
    // Subtitle
    doc.setFontSize(12)
    doc.text('Payment Receipt & Quotation', margin, 45)

    // Gym Details (right side of header)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(gym.address, pageWidth - margin - 60, 20)
    doc.text(gym.phone, pageWidth - margin - 60, 25)
    doc.text(gym.email, pageWidth - margin - 60, 30)

    // Receipt Number and Date section
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.rect(margin, 60, contentWidth, 15, 'F')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Receipt #${payment.id.slice(-8)}`, margin + 5, 70)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${new Date(payment.date).toLocaleDateString('en-GB')}`, pageWidth - margin - 50, 70)

    // Member Information section
    doc.setFillColor(255, 255, 255)
    doc.rect(margin, 85, contentWidth, 30, 'F')
    doc.setDrawColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.setLineWidth(0.5)
    doc.rect(margin, 85, contentWidth, 30, 'S')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Member Information', margin + 5, 95)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${member.firstName} ${member.lastName}`, margin + 5, 102)
    doc.text(`Member #: ${member.memberNumber}`, margin + 5, 108)
    doc.text(`Phone: ${member.mobileNumber}`, margin + 100, 102)
    doc.text(`Email: ${member.email}`, margin + 100, 108)

    // Payment Details section
    doc.setFillColor(255, 255, 255)
    doc.rect(margin, 125, contentWidth, 40, 'F')
    doc.setDrawColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.rect(margin, 125, contentWidth, 40, 'S')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Payment Details', margin + 5, 135)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Payment type
    const paymentTypeLabels = {
      membership: 'Membership Fee',
      training: 'Personal Training',
      equipment: 'Equipment/Gear',
      other: 'Other Services'
    }
    
    doc.text(`Type: ${paymentTypeLabels[payment.type as keyof typeof paymentTypeLabels] || payment.type}`, margin + 5, 145)
    doc.text(`Method: ${payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}`, margin + 100, 145)
    
    // Amount with highlight
    doc.setFillColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.rect(margin + 5, 150, 100, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Amount: ${payment.amount.toFixed(0)} OMR`, margin + 8, 158)
    
    // Description if available
    if (payment.description) {
      doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Description: ${payment.description}`, margin + 5, 175)
    }

    // Terms and Conditions section
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.rect(margin, 185, contentWidth, 50, 'F')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Terms & Conditions', margin + 5, 195)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const terms = [
      '• This receipt serves as proof of payment for the above services.',
      '• All payments are non-refundable unless otherwise specified.',
      '• Please keep this receipt for your records.',
      '• For any queries, please contact us at the above details.',
      '• Membership includes access to all gym facilities and equipment.',
      '• Personal training sessions are available at additional cost.'
    ]
    
    terms.forEach((term, index) => {
      doc.text(term, margin + 5, 205 + (index * 4))
    })

    // Footer - positioned at the bottom
    const footerY = pageHeight - 25
    doc.setFillColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.rect(0, footerY, pageWidth, 25, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Thank you for choosing Warriors Gym!', margin, footerY + 8)
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, margin, footerY + 15)
    
    // Add decorative elements
    doc.setDrawColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.setLineWidth(1)
    doc.line(margin, 50, pageWidth - margin, 50) // Line under header
    doc.line(margin, 75, pageWidth - margin, 75) // Line under receipt info

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `Warriors_Payment_Receipt_${member.memberNumber}_${timestamp}.pdf`

    // Save the PDF
    doc.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('PDF generation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const generatePaymentsQuotationPDF = (data: PaymentQuotationData) => {
  try {
    const { payments, members, gymSettings } = data
    const doc = new jsPDF()
    
    // Set default gym settings if not provided
    const gym = gymSettings || {
      gymName: 'Warriors Gym',
      address: 'Muscat, Sultanate of Oman',
      phone: '+968 92223330',
      email: 'info@warriorsgym.com'
    }

    // Custom colors from user request
    const warriorGold = [197, 133, 66] // #c58542
    const warriorDark = [10, 16, 30] // #0a101e
    const lightGray = [248, 250, 252] // Light background
    const darkGray = [55, 65, 81] // Dark text

    // Page dimensions
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)

    // Header with gradient effect
    doc.setFillColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    // Warriors Logo placeholder (text-based)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('WARRIORS', margin, 25)
    
    // Gym name
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text(gym.gymName, margin, 35)
    
    // Subtitle
    doc.setFontSize(12)
    doc.text('Payments Summary Report', margin, 45)

    // Gym Details (right side of header)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(gym.address, pageWidth - margin - 60, 20)
    doc.text(gym.phone, pageWidth - margin - 60, 25)
    doc.text(gym.email, pageWidth - margin - 60, 30)

    // Report Details section
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.rect(margin, 60, contentWidth, 20, 'F')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-GB')}`, margin + 5, 70)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Payments: ${payments.length}`, margin + 5, 77)
    
    // Calculate totals
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const todayPayments = payments.filter(p => 
      new Date(p.date).toDateString() === new Date().toDateString()
    )
    const todayAmount = todayPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    doc.text(`Total Amount: ${totalAmount.toFixed(0)} OMR`, margin + 100, 70)
    doc.text(`Today's Revenue: ${todayAmount.toFixed(0)} OMR`, margin + 100, 77)

    // Payments Table Header
    doc.setFillColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.rect(margin, 90, contentWidth, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Payment ID', margin + 5, 97)
    doc.text('Member', margin + 40, 97)
    doc.text('Amount', margin + 100, 97)
    doc.text('Date', margin + 130, 97)
    doc.text('Type', margin + 160, 97)

    // Payments Table Rows
    let yPosition = 105
    const paymentsPerPage = 20
    let currentPage = 1

    payments.forEach((payment, index) => {
      // Check if we need a new page
      if (index > 0 && index % paymentsPerPage === 0) {
        doc.addPage()
        currentPage++
        yPosition = 20
        
        // Add header to new page
        doc.setFillColor(warriorDark[0], warriorDark[1], warriorDark[2])
        doc.rect(0, 0, pageWidth, 50, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('WARRIORS', margin, 25)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`Payments Summary Report - Page ${currentPage}`, margin, 35)
        
        // Table header on new page
        doc.setFillColor(warriorGold[0], warriorGold[1], warriorGold[2])
        doc.rect(margin, 50, contentWidth, 10, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Payment ID', margin + 5, 57)
        doc.text('Member', margin + 40, 57)
        doc.text('Amount', margin + 100, 57)
        doc.text('Date', margin + 130, 57)
        doc.text('Type', margin + 160, 57)
        
        yPosition = 65
      }

      const member = members.find(m => m.id === payment.memberId)
      const memberName = member ? `${member.firstName} ${member.lastName}` : 'Unknown'
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255)
      } else {
        doc.setFillColor(248, 250, 252)
      }
      doc.rect(margin, yPosition - 3, contentWidth, 5, 'F')
      
      doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      
      // Payment ID (shortened)
      doc.text(`#${payment.id.slice(-6)}`, margin + 5, yPosition)
      
      // Member name (truncated if too long)
      const truncatedName = memberName.length > 15 ? memberName.substring(0, 15) + '...' : memberName
      doc.text(truncatedName, margin + 40, yPosition)
      
      // Amount
      doc.text(`${payment.amount.toFixed(0)} OMR`, margin + 100, yPosition)
      
      // Date
      doc.text(new Date(payment.date).toLocaleDateString('en-GB'), margin + 130, yPosition)
      
      // Type
      const typeLabels = {
        membership: 'Mem',
        training: 'Train',
        equipment: 'Equip',
        other: 'Other'
      }
      doc.text(typeLabels[payment.type as keyof typeof typeLabels] || payment.type, margin + 160, yPosition)
      
      yPosition += 5
    })

    // Summary Section
    if (yPosition < 200) {
      yPosition = Math.max(yPosition + 10, 200)
    } else {
      doc.addPage()
      yPosition = 20
    }

    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.rect(margin, yPosition, contentWidth, 15, 'F')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary by Payment Type', margin + 5, yPosition + 10)
    
    yPosition += 20
    
    // Payment type breakdown
    const typeBreakdown = payments.reduce((acc, payment) => {
      acc[payment.type] = (acc[payment.type] || 0) + payment.amount
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(typeBreakdown).forEach(([type, amount]) => {
      const typeLabels = {
        membership: 'Membership Fees',
        training: 'Personal Training',
        equipment: 'Equipment/Gear',
        other: 'Other Services'
      }
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`${typeLabels[type as keyof typeof typeLabels] || type}:`, margin + 5, yPosition)
      doc.text(`${amount.toFixed(0)} OMR`, margin + 100, yPosition)
      yPosition += 5
    })

    // Footer - positioned at the bottom
    const footerY = pageHeight - 25
    doc.setFillColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.rect(0, footerY, pageWidth, 25, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Warriors Gym Management System', margin, footerY + 8)
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, margin, footerY + 15)
    
    // Add decorative elements
    doc.setDrawColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.setLineWidth(1)
    doc.line(margin, 50, pageWidth - margin, 50) // Line under header
    doc.line(margin, 80, pageWidth - margin, 80) // Line under report info

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `Warriors_Payments_Summary_${timestamp}.pdf`

    // Save the PDF
    doc.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('PDF generation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const generateMemberQuotationPDF = (member: Member, gymSettings?: {
  gymName: string
  address: string
  phone: string
  email: string
}) => {
  try {
    const doc = new jsPDF()
    
    // Set default gym settings if not provided
    const gym = gymSettings || {
      gymName: 'Warriors Gym',
      address: 'Muscat, Sultanate of Oman',
      phone: '+968 92223330',
      email: 'info@warriorsgym.com'
    }

    // Custom colors from user request
    const warriorGold = [197, 133, 66] // #c58542
    const warriorDark = [10, 16, 30] // #0a101e
    const lightGray = [248, 250, 252] // Light background
    const darkGray = [55, 65, 81] // Dark text

    // Page dimensions
    const pageWidth = 210
    const pageHeight = 297
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)

    // Header with gradient effect
    doc.setFillColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    // Warriors Logo placeholder (text-based)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('WARRIORS', margin, 25)
    
    // Gym name
    doc.setFontSize(16)
    doc.setFont('helvetica', 'normal')
    doc.text(gym.gymName, margin, 35)
    
    // Subtitle
    doc.setFontSize(12)
    doc.text('Membership Quotation', margin, 45)

    // Gym Details (right side of header)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(gym.address, pageWidth - margin - 60, 20)
    doc.text(gym.phone, pageWidth - margin - 60, 25)
    doc.text(gym.email, pageWidth - margin - 60, 30)

    // Member Information section
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.rect(margin, 60, contentWidth, 20, 'F')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Membership Details', margin + 5, 70)
    
    doc.setFillColor(255, 255, 255)
    doc.rect(margin, 85, contentWidth, 40, 'F')
    doc.setDrawColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.setLineWidth(0.5)
    doc.rect(margin, 85, contentWidth, 40, 'S')
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Member: ${member.firstName} ${member.lastName}`, margin + 5, 95)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Member Number: ${member.memberNumber}`, margin + 5, 102)
    doc.text(`Phone: ${member.mobileNumber}`, margin + 5, 108)
    doc.text(`Email: ${member.email}`, margin + 100, 102)
    doc.text(`Registration Date: ${new Date(member.registrationDate).toLocaleDateString('en-GB')}`, margin + 100, 108)

    // Membership Details section
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Membership Information', margin, 135)
    
    doc.setFillColor(255, 255, 255)
    doc.rect(margin, 140, contentWidth, 30, 'F')
    doc.setDrawColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.rect(margin, 140, contentWidth, 30, 'S')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Duration: ${member.renewDuration.replace(/([A-Z])/g, ' $1')}`, margin + 5, 150)
    doc.text(`Status: ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}`, margin + 5, 157)
    doc.text(`Expiry Date: ${new Date(member.expiryDate).toLocaleDateString('en-GB')}`, margin + 5, 164)
    
    // Fee Information with highlight
    doc.setFillColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.rect(margin + 5, 175, 100, 15, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`Membership Fee: ${member.membershipCost.toFixed(0)} OMR`, margin + 8, 185)

    // Terms and Conditions section
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
    doc.rect(margin, 200, contentWidth, 50, 'F')
    
    doc.setTextColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Terms & Conditions', margin + 5, 210)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const terms = [
      '• This quotation is valid for 30 days from the date of issue.',
      '• Payment must be made in full before membership activation.',
      '• Membership includes access to all gym facilities and equipment.',
      '• Personal training sessions are available at additional cost.',
      '• Please bring this quotation when making payment.',
      '• For any queries, please contact us at the above details.'
    ]
    
    terms.forEach((term, index) => {
      doc.text(term, margin + 5, 220 + (index * 4))
    })

    // Footer - positioned at the bottom
    const footerY = pageHeight - 25
    doc.setFillColor(warriorDark[0], warriorDark[1], warriorDark[2])
    doc.rect(0, footerY, pageWidth, 25, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Thank you for choosing Warriors Gym!', margin, footerY + 8)
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString('en-GB')}`, margin, footerY + 15)
    
    // Add decorative elements
    doc.setDrawColor(warriorGold[0], warriorGold[1], warriorGold[2])
    doc.setLineWidth(1)
    doc.line(margin, 50, pageWidth - margin, 50) // Line under header
    doc.line(margin, 80, pageWidth - margin, 80) // Line under member info

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `Warriors_Membership_Quotation_${member.memberNumber}_${timestamp}.pdf`

    // Save the PDF
    doc.save(filename)
    
    return { success: true, filename }
  } catch (error) {
    console.error('PDF generation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
