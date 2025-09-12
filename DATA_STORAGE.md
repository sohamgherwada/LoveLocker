# 📊 LoveLocker Data Storage Guide

This document explains where and how all user data is stored in the LoveLocker application.

## 🏠 **Current Storage: Browser LocalStorage**

LoveLocker currently uses **browser localStorage** to store all data locally on the user's device. This means:

### ✅ **Advantages:**
- **Complete Privacy**: No data sent to external servers
- **Fast Performance**: Instant data access
- **No Server Costs**: No backend infrastructure needed
- **User Control**: Users own their data completely

### ⚠️ **Limitations:**
- **Device-Specific**: Data only available on the same browser/device
- **No Backup**: Data lost if browser data is cleared
- **No Sync**: Can't access from multiple devices
- **No Recovery**: Lost data cannot be recovered

## 📍 **Where Data is Stored**

### **1. User Accounts**
**Location**: `localStorage['loveLockerUsers']`
**Data Structure**:
```javascript
[
  {
    id: "1234567890",
    name: "John Doe",
    email: "john@example.com",
    age: 25,
    password: "hashed_password",
    connectionCode: "ABC123",
    partnerId: "0987654321",
    resetToken: "abc123...",
    resetTokenExpiry: 1234567890,
    notificationSettings: {
      email: true,
      browser: false
    },
    createdAt: "2024-01-01T00:00:00.000Z"
  }
]
```

### **2. Love Letters**
**Location**: `localStorage['loveLockerLetters']`
**Data Structure**:
```javascript
[
  {
    id: "letter123",
    title: "Our Anniversary Letter",
    content: "Dear love...",
    secretCode: "A7K9M2X4",
    unlockDate: "2024-12-25",
    createdAt: "2024-01-01T00:00:00.000Z",
    authorId: "1234567890",
    recipientId: "0987654321",
    isUnlocked: false,
    notificationSent: false
  }
]
```

### **3. Current User Session**
**Location**: `localStorage['loveLockerCurrentUser']`
**Data**: Currently logged-in user object

### **4. Partner Information**
**Location**: `localStorage['loveLockerPartner']`
**Data**: Connected partner's user object

## 🔍 **How to View Stored Data**

### **Method 1: Browser Developer Tools**
1. Open your LoveLocker app
2. Press `F12` or right-click → "Inspect"
3. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Expand "Local Storage"
5. Click on your domain
6. Look for keys starting with "loveLocker"

### **Method 2: Console Commands**
```javascript
// View all users
console.log(JSON.parse(localStorage.getItem('loveLockerUsers')));

// View all letters
console.log(JSON.parse(localStorage.getItem('loveLockerLetters')));

// View current user
console.log(JSON.parse(localStorage.getItem('loveLockerCurrentUser')));

// View partner
console.log(JSON.parse(localStorage.getItem('loveLockerPartner')));
```

## 🔐 **Security Considerations**

### **Password Storage**
- Passwords are stored in **plain text** (not recommended for production)
- For production, passwords should be hashed using libraries like bcrypt

### **Data Privacy**
- All data stays on the user's device
- No data is transmitted to external servers (except for email notifications)
- Users can clear their data anytime by clearing browser storage

### **Reset Tokens**
- Password reset tokens are stored with 24-hour expiration
- Tokens are 32-character random strings
- Tokens are cleared after successful password reset

## 🚀 **Upgrading to Server Storage**

For a production app, consider these options:

### **Option 1: Firebase**
```javascript
// Example Firebase integration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

### **Option 2: Supabase**
```javascript
// Example Supabase integration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);
```

### **Option 3: Custom Backend**
- Node.js + Express + MongoDB/PostgreSQL
- Python + Django/FastAPI + Database
- Any backend technology you prefer

## 📱 **Data Migration**

### **Export Data**
```javascript
// Export all data to JSON file
const exportData = {
  users: JSON.parse(localStorage.getItem('loveLockerUsers') || '[]'),
  letters: JSON.parse(localStorage.getItem('loveLockerLetters') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('loveLockerCurrentUser') || 'null'),
  partner: JSON.parse(localStorage.getItem('loveLockerPartner') || 'null')
};

const dataStr = JSON.stringify(exportData, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'love-locker-backup.json';
link.click();
```

### **Import Data**
```javascript
// Import data from JSON file
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    localStorage.setItem('loveLockerUsers', JSON.stringify(data.users));
    localStorage.setItem('loveLockerLetters', JSON.stringify(data.letters));
    localStorage.setItem('loveLockerCurrentUser', JSON.stringify(data.currentUser));
    localStorage.setItem('loveLockerPartner', JSON.stringify(data.partner));
    location.reload();
  };
  reader.readAsText(file);
};
fileInput.click();
```

## 🛠️ **Development vs Production**

### **Current Setup (Development)**
- ✅ Quick to set up
- ✅ No server costs
- ✅ Complete privacy
- ❌ No data persistence across devices
- ❌ No data backup
- ❌ Passwords in plain text

### **Production Recommendations**
- ✅ Server-side data storage
- ✅ Encrypted passwords
- ✅ Data backup and recovery
- ✅ Cross-device synchronization
- ✅ User data export/import
- ❌ Requires backend infrastructure
- ❌ Higher complexity

## 🔧 **Configuration Options**

### **Environment Variables**
```javascript
// In config.js
const LOVELOCKER_CONFIG = {
  storage: {
    type: 'localStorage', // or 'firebase', 'supabase', 'custom'
    backup: true,
    encryption: false
  }
};
```

### **Storage Adapters**
You can create storage adapters to switch between different storage methods:

```javascript
class StorageAdapter {
  async saveUsers(users) { /* implementation */ }
  async getUsers() { /* implementation */ }
  async saveLetters(letters) { /* implementation */ }
  async getLetters() { /* implementation */ }
}

class LocalStorageAdapter extends StorageAdapter {
  // localStorage implementation
}

class FirebaseAdapter extends StorageAdapter {
  // Firebase implementation
}
```

## 📋 **Summary**

**Current Storage**: Browser localStorage only
**Data Location**: User's device browser
**Privacy Level**: Maximum (no external servers)
**Backup**: Manual export required
**Sync**: No cross-device sync
**Recovery**: No automatic recovery

For a personal/private app, localStorage is perfect. For a commercial app, consider upgrading to a proper backend with database storage.

---

**Need Help?** Check the [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md) or [Email Setup Guide](EMAIL_SETUP.md) for more information.
