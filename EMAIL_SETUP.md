# 📧 Gmail Email Setup for LoveLocker

This guide will help you set up Gmail integration to send email notifications when letters are ready to unlock.

## 🔧 EmailJS Setup

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Gmail Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Select "Gmail" from the list
4. Follow the setup instructions to connect your Gmail account
5. **Use these credentials:**
   - **App Name:** LoveLocker
   - **Password:** `rovj uenn jgtc wilo`
6. Note down your **Service ID** (usually "gmail")

### Step 3: Create Email Template
1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Use this template ID: `love_locker_notification`
4. Copy and paste this HTML template:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
    <h1 style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 2.5rem; margin-bottom: 20px;">💕 LoveLocker</h1>
    
    <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin: 20px 0;">
        <h2 style="color: #ff6b9d; margin-bottom: 15px;">A Love Letter is Ready to Unlock! 💌</h2>
        
        <p>Dear {{to_name}},</p>
        
        <p>Great news! A time capsule letter from {{partner_name}} is ready to be unlocked today!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b9d;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Letter Details:</h3>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{letter_title}}</p>
            <p style="margin: 5px 0;"><strong>Unlock Date:</strong> {{unlock_date}}</p>
            <p style="margin: 5px 0;"><strong>Created:</strong> {{created_date}}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">🔑 Your Secret Code</h4>
            <p style="margin: 0 0 10px 0; color: #856404;">Use this secret code to unlock your letter:</p>
            <div style="background: #f8f9fa; border: 2px solid #ff6b9d; padding: 10px; border-radius: 5px; text-align: center; margin: 10px 0;">
                <strong style="font-size: 1.2rem; color: #333; font-family: 'Courier New', monospace;">{{secret_code}}</strong>
            </div>
            <p style="margin: 10px 0 0 0; color: #856404; font-size: 0.9rem;">Visit your LoveLocker and enter this code to unlock and read your special message!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{app_url}}" style="background: linear-gradient(135deg, #ff6b9d, #ff8fab); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px;">💕 Open LoveLocker</a>
        </div>
        
        <div style="background: #f8f9fa; border: 1px solid #e1e5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem;">Can't click the button? Copy and paste this link:</p>
            <a href="{{app_url}}" style="color: #ff6b9d; text-decoration: none; font-weight: bold; word-break: break-all;">{{app_url}}</a>
        </div>
        
        <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 30px;">
            Made with 💕 by LoveLocker
        </p>
    </div>
</div>
```

5. Set the subject line to: `💕 LoveLocker - Letter Ready to Unlock!`
6. Save the template

### Step 4: Get Your Public Key
1. Go to "Account" in your EmailJS dashboard
2. Copy your **Public Key** (starts with "user_")

### Step 5: Update LoveLocker Configuration
1. Open `script.js` in your LoveLocker folder
2. Find this line:
   ```javascript
   publicKey: 'YOUR_EMAILJS_PUBLIC_KEY' // Replace with your EmailJS public key
   ```
3. Replace `YOUR_EMAILJS_PUBLIC_KEY` with your actual public key
4. Update the serviceId if needed (usually "gmail")

## 🔐 Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account > Security > 2-Step Verification
2. Scroll down to "App passwords"
3. Select "Mail" and "Other (custom name)"
4. Enter "LoveLocker" as the app name
5. Copy the generated 16-character password
6. Use this password: `rovj uenn jgtc wilo` (or your generated password)

## 🧪 Testing Email Notifications

1. Open your LoveLocker app
2. Create a test letter with today's date
3. Check the browser console for email sending logs
4. Check your email inbox for the notification

## 📋 Configuration Summary

After setup, your `script.js` should look like this:

```javascript
this.emailConfig = {
    serviceId: 'gmail', // Your EmailJS service ID
    templateId: 'love_locker_notification', // Your EmailJS template ID
    publicKey: 'user_xxxxxxxxxxxxxxxx' // Your EmailJS public key
};
```

## 🚨 Troubleshooting

### Email Not Sending
- Check browser console for errors
- Verify EmailJS public key is correct
- Ensure Gmail service is properly connected
- Check if email notifications are enabled in settings

### Gmail Connection Issues
- Verify app password is correct
- Check if 2FA is enabled
- Try regenerating the app password

### Template Issues
- Verify template ID matches exactly
- Check that all template variables are correct
- Test template in EmailJS dashboard

## 💡 Tips

- EmailJS free tier allows 200 emails per month
- Test with a small number of letters first
- Keep your EmailJS credentials secure
- Monitor email delivery in EmailJS dashboard

---

**Need Help?** Check the EmailJS documentation or contact support if you encounter issues.
