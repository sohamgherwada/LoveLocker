# 🗄️ Database Setup Guide for LoveLocker

This guide will help you set up a PostgreSQL database using Supabase for your LoveLocker app.

## 🚀 **Step 1: Create Supabase Project**

1. **Go to Supabase**:
   - Visit [supabase.com](https://supabase.com)
   - Sign up or log in with your GitHub account
   - Click "New Project"

2. **Create Project**:
   - **Name**: `love-locker`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - Click "Create new project"

3. **Wait for Setup**:
   - Project creation takes 2-3 minutes
   - You'll get a notification when ready

## 📊 **Step 2: Set Up Database Schema**

1. **Go to SQL Editor**:
   - In your Supabase dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run the Schema**:
   - Copy the contents of `database-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

3. **Verify Tables**:
   - Go to "Table Editor"
   - You should see `users` and `letters` tables

## 🔑 **Step 3: Get API Keys**

1. **Go to Settings**:
   - Click "Settings" → "API" in your Supabase dashboard

2. **Copy Keys**:
   - **Project URL**: Copy the "Project URL"
   - **Anon Key**: Copy the "anon public" key

## ⚙️ **Step 4: Set Environment Variables in Vercel**

### **Option A: Via Vercel Dashboard (Recommended)**

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your "love-locker" project

2. **Add Environment Variables**:
   - Go to "Settings" → "Environment Variables"
   - Add these variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `SUPABASE_URL` | your-project-url | Production |
   | `SUPABASE_ANON_KEY` | your-anon-key | Production |
   | `GMAIL_USER` | your-email@gmail.com | Production |
   | `GMAIL_APP_PASSWORD` | your-app-password | Production |

3. **Save and Redeploy**:
   - Click "Save" after adding all variables
   - Go to "Deployments" → Click "Redeploy" on latest deployment

### **Option B: Via Terminal**

```bash
# Set Supabase URL
vercel env add SUPABASE_URL
# Enter your Supabase project URL when prompted

# Set Supabase Anon Key
vercel env add SUPABASE_ANON_KEY
# Enter your Supabase anon key when prompted

# Set Gmail credentials (if you want email notifications)
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD

# Redeploy
vercel --prod
```

## 🧪 **Step 5: Test the Database**

1. **Test User Registration**:
   - Go to your LoveLocker app
   - Try registering a new account
   - Check Supabase "Table Editor" → "users" table

2. **Test Letter Creation**:
   - Create a test letter
   - Check "letters" table in Supabase

3. **Test Connection**:
   - Create two accounts
   - Connect them using connection codes
   - Verify `partner_id` is set in both users

## 📊 **Database Schema Overview**

### **Users Table**
- `id`: Unique user identifier (UUID)
- `name`: User's full name
- `email`: User's email address (unique)
- `age`: User's age
- `password`: User's password (plain text - not recommended for production)
- `connection_code`: 6-character code for pairing
- `partner_id`: ID of connected partner
- `reset_token`: Password reset token
- `reset_token_expiry`: Token expiration time
- `notification_settings`: JSON object for email/browser preferences
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### **Letters Table**
- `id`: Unique letter identifier (UUID)
- `author_id`: ID of letter author
- `recipient_id`: ID of letter recipient
- `title`: Letter title
- `content`: Letter content
- `secret_code`: 8-character unlock code
- `unlock_date`: Date when letter can be unlocked
- `is_unlocked`: Whether letter has been unlocked
- `notification_sent`: Whether notification email was sent
- `created_at`: Letter creation timestamp
- `updated_at`: Last update timestamp

## 🔐 **Security Features**

- **Row Level Security (RLS)**: Users can only access their own data
- **UUID Primary Keys**: Secure, non-sequential identifiers
- **Foreign Key Constraints**: Data integrity maintained
- **Indexes**: Optimized for performance
- **Triggers**: Automatic timestamp updates

## 📈 **Database Benefits**

✅ **Persistent Storage**: Data survives browser clears  
✅ **Multi-Device Access**: Login from any device  
✅ **Data Backup**: Automatic backups by Supabase  
✅ **Scalability**: Handles thousands of users  
✅ **Security**: Professional-grade security  
✅ **Real-time**: Can add real-time features later  

## 🚨 **Important Notes**

### **Password Security**
- Currently passwords are stored in plain text
- For production, implement password hashing
- Consider using Supabase Auth for better security

### **Data Privacy**
- All data is stored in your Supabase database
- You have full control over the data
- Supabase is GDPR compliant

### **Backup**
- Supabase automatically backs up your data
- You can export data anytime
- Point-in-time recovery available

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Missing Supabase environment variables"**:
   - Check that SUPABASE_URL and SUPABASE_ANON_KEY are set
   - Redeploy after setting variables

2. **"User already exists"**:
   - Email addresses must be unique
   - Try a different email or reset password

3. **"Invalid connection code"**:
   - Make sure the code is exactly 6 characters
   - Check for typos when entering

4. **Letters not loading**:
   - Check that user is logged in
   - Verify API endpoints are working

### **Check Database**:
- Go to Supabase "Table Editor"
- Check if data is being inserted
- Look for any error messages

### **Check Vercel Logs**:
```bash
vercel logs --follow
```

## ✅ **Verification Checklist**

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] SUPABASE_URL environment variable set
- [ ] SUPABASE_ANON_KEY environment variable set
- [ ] Vercel project redeployed
- [ ] User registration test successful
- [ ] Letter creation test successful
- [ ] User connection test successful

## 🎉 **You're Done!**

Your LoveLocker app now has a proper database backend! All user data and letters are stored securely in Supabase, and users can access their accounts from any device.

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables).
