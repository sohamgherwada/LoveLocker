# 📧 Gmail Direct Integration Setup

This guide will help you set up Gmail to send emails directly from your LoveLocker app using Gmail's SMTP service.

## 🔧 **Step 1: Enable 2-Factor Authentication**

1. **Go to Google Account Settings**:
   - Visit [myaccount.google.com](https://myaccount.google.com)
   - Sign in with your Gmail account

2. **Enable 2-Factor Authentication**:
   - Go to "Security" → "2-Step Verification"
   - Follow the setup process
   - **This is required for App Passwords**

## 🔑 **Step 2: Generate Gmail App Password**

1. **Go to App Passwords**:
   - In Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Click "App passwords"

2. **Create App Password**:
   - Select "Mail" from the dropdown
   - Select "Other (custom name)"
   - Enter: **LoveLocker**
   - Click "Generate"

3. **Copy the Password**:
   - Google will show a 16-character password like: `abcd efgh ijkl mnop`
   - **Copy this password** - you'll need it for Vercel

## ⚙️ **Step 3: Set Environment Variables in Vercel**

### **Option A: Via Vercel Dashboard (Recommended)**

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your "love-locker" project

2. **Add Environment Variables**:
   - Go to "Settings" → "Environment Variables"
   - Add these variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `GMAIL_USER` | your-email@gmail.com | Production |
   | `GMAIL_APP_PASSWORD` | abcd efgh ijkl mnop | Production |

3. **Save and Redeploy**:
   - Click "Save" after adding both variables
   - Go to "Deployments" → Click "Redeploy" on latest deployment

### **Option B: Via Terminal**

```bash
# Set Gmail user
vercel env add GMAIL_USER
# Enter your Gmail address when prompted

# Set Gmail app password
vercel env add GMAIL_APP_PASSWORD
# Enter your 16-character app password when prompted

# Redeploy
vercel --prod
```

## 🧪 **Step 4: Test Email Functionality**

1. **Test Password Reset**:
   - Go to your LoveLocker app
   - Click "Login" → "Forgot your password?"
   - Enter your email address
   - Check your email for the reset link

2. **Test Letter Notifications**:
   - Create a test letter with today's date
   - Check if you receive the notification email

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **"Invalid login" error**:
   - Make sure 2FA is enabled
   - Verify the app password is correct
   - Check that GMAIL_USER is your full email address

2. **"Less secure app access" error**:
   - This shouldn't happen with App Passwords
   - Make sure you're using App Password, not your regular password

3. **Emails not sending**:
   - Check Vercel function logs
   - Verify environment variables are set
   - Test the API endpoint directly

### **Check Vercel Logs**:

```bash
# View function logs
vercel logs --follow

# Or check in Vercel dashboard
# Go to your project → Functions → View logs
```

### **Test API Endpoint**:

```bash
# Test the email API directly
curl -X POST https://your-app.vercel.app/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>",
    "type": "test"
  }'
```

## 📊 **Gmail Limits**

- **Daily Limit**: 500 emails per day (free Gmail)
- **Rate Limit**: 100 emails per hour
- **Recipients**: Up to 500 recipients per email

## 🔐 **Security Notes**

- **App Passwords are secure** - they're specific to your app
- **Never commit passwords** to your code
- **Use environment variables** for all sensitive data
- **Rotate passwords** periodically

## ✅ **Verification Checklist**

- [ ] 2-Factor Authentication enabled
- [ ] Gmail App Password generated
- [ ] GMAIL_USER environment variable set
- [ ] GMAIL_APP_PASSWORD environment variable set
- [ ] Vercel project redeployed
- [ ] Password reset email test successful
- [ ] Letter notification email test successful

## 🚀 **Your App is Ready!**

Once configured, your LoveLocker app will:
- ✅ Send password reset emails via Gmail
- ✅ Send letter notification emails via Gmail
- ✅ Use your own Gmail account
- ✅ Work reliably in production

---

**Need Help?** Check the [Vercel Documentation](https://vercel.com/docs) or [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833).
