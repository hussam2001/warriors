# 🏋️ Warriors Gym Management System

A comprehensive gym management system for tracking members, payments, and generating reports.

## 🚀 Quick Start

### For End Users (Simple Setup)

1. **Download and Install Node.js**
   - Go to: https://nodejs.org/
   - Download the LTS version
   - Install and restart your computer

2. **Download Warriors Gym System**
   - Download this folder to your computer
   - Extract to a location like `C:\WarriorsGym\`

3. **Start the System**
   - Double-click `start.bat`
   - Wait for the system to start
   - Browser will open automatically

4. **Login**
   - Username: `admin`
   - Password: `warriors2024`

## 📋 Features

### Member Management
- ✅ Add new members with automatic payment creation
- ✅ View and edit member information
- ✅ Track membership status and expiry dates
- ✅ Emergency contact management

### Payment System
- ✅ Record payments automatically when adding members
- ✅ Manual payment entry and editing
- ✅ Multiple payment methods (Cash, Card, Bank Transfer)
- ✅ Payment history tracking

### Reports & Analytics
- ✅ Revenue statistics and trends
- ✅ Member analytics
- ✅ Payment summaries
- ✅ Excel and PDF export

### Database Integration
- ✅ Supabase cloud database
- ✅ Real-time data synchronization
- ✅ Automatic backup and recovery

## 🎯 System Requirements

- **Operating System**: Windows 10/11
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Internet**: Required for database connection

## 🔧 Technical Details

- **Frontend**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Client-side with localStorage
- **Export**: Excel and PDF generation

## 📚 User Guide

### Adding a New Member
1. Go to Members → Add New Member
2. Fill in personal details
3. Select membership duration and payment method
4. Click "Add Member"
5. Payment is automatically created

### Recording a Payment
1. Go to Payments → Record Payment
2. Select member from dropdown
3. Enter payment details
4. Click "Record Payment"

### Viewing Reports
1. Go to Reports page
2. View revenue statistics
3. Export data to Excel/PDF

## 🛠️ Troubleshooting

### Common Issues

**"npm is not recognized"**
- Install Node.js from https://nodejs.org/
- Restart computer after installation

**"Port 3000 is already in use"**
- Close other applications
- Or use: `npm run dev -- --port 3001`

**"Cannot access from other computers"**
- Check Windows Firewall settings
- Allow Node.js through firewall

### Getting Help
- Check browser console for errors (F12)
- Ensure internet connection is stable
- Verify all prerequisites are installed

## 🔒 Security

- **Default Login**: admin / warriors2024
- **Change Password**: Go to Settings after first login
- **Network Access**: Only enable on trusted networks
- **Data Backup**: Automatic via Supabase cloud

## 📞 Support

For technical issues:
1. Check this README first
2. Review error messages in browser console
3. Ensure all requirements are met

## 🎉 What's New in Version 1.0.0

- ✅ Complete member management system
- ✅ Automatic payment creation
- ✅ Real-time database synchronization
- ✅ Excel and PDF export functionality
- ✅ Responsive design for all devices
- ✅ Comprehensive reporting system

## 📦 Installation Files

- `start.bat` - Easy startup script for end users
- `DEPLOYMENT_GUIDE.md` - Detailed setup instructions
- `package.json` - Project dependencies
- `next.config.js` - Next.js configuration

## 🚀 Deployment Options

### Desktop App (Windows)
- Run `start.bat` on the target computer
- Access via http://localhost:3000
- See `ELECTRON_GUIDE.md` for Electron setup

### Network Access (Multiple Computers on Same Network)
- Run: `npm run dev -- --hostname 0.0.0.0`
- Access from other computers: `http://[your-ip]:3000`

### 🌐 Web Deployment (Access from Anywhere - Mobile & Desktop)
Deploy to the internet for access from any device:

1. **Quick Deploy (5 minutes):**
   - Upload code to GitHub
   - Deploy to Render.com (free)
   - Get a URL like `https://warriors-gym-system.onrender.com`

2. **Full instructions:** See `WEB_DEPLOYMENT_GUIDE.md`

**Benefits:**
- ✅ Access from any phone, tablet, or computer
- ✅ No installation required
- ✅ Automatic updates
- ✅ Free hosting
- ✅ Works alongside desktop version

**Cost:** $0/month (completely free)

### Production Deployment (Local Server)
- Use PM2 or similar process manager
- Set up as Windows service for automatic startup

---

**Warriors Gym Management System v1.0.0**  
*Built with Next.js, React, and Supabase*  
*Available as Desktop App and Web App*

For setup instructions, see:
- `DEPLOYMENT_GUIDE.md` - Desktop setup
- `WEB_DEPLOYMENT_GUIDE.md` - Web deployment