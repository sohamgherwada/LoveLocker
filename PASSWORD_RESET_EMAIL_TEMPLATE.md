# 📧 Password Reset Email Template

This is the EmailJS template for password reset emails. Add this template to your EmailJS dashboard.

## 📋 **Template Setup**

### **Template ID**: `password_reset_template`
### **Subject**: `💕 LoveLocker - Password Reset Request`

### **HTML Template**:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
    <h1 style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 2.5rem; margin-bottom: 20px;">💕 LoveLocker</h1>
    
    <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin: 20px 0;">
        <h2 style="color: #ff6b9d; margin-bottom: 15px;">Password Reset Request 🔐</h2>
        
        <p>Dear {{to_name}},</p>
        
        <p>We received a request to reset your LoveLocker password. If you made this request, click the button below to set a new password.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b9d;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Reset Your Password</h3>
            <p style="margin: 5px 0; color: #666;">This link will expire in 24 hours for security reasons.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{reset_url}}" style="background: linear-gradient(135deg, #ff6b9d, #ff8fab); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Security Notice</h4>
            <p style="margin: 0; color: #856404; font-size: 0.9rem;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <div style="background: #f8f9fa; border: 1px solid #e1e5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem;">Can't click the button? Copy and paste this link:</p>
            <a href="{{reset_url}}" style="color: #ff6b9d; text-decoration: none; font-weight: bold; word-break: break-all;">{{reset_url}}</a>
        </div>
        
        <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 30px;">
            Made with 💕 by LoveLocker
        </p>
    </div>
</div>
```

## 🔧 **Template Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_name}}` | Recipient's name | John Doe |
| `{{to_email}}` | Recipient's email | john@example.com |
| `{{reset_url}}` | Password reset link | https://love-locker.vercel.app?reset_token=abc123... |
| `{{app_url}}` | Main app URL | https://love-locker.vercel.app |

## 📝 **Setup Instructions**

1. **Go to EmailJS Dashboard**
   - Visit [EmailJS.com](https://www.emailjs.com/)
   - Sign in to your account

2. **Create New Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Set Template ID: `password_reset_template`

3. **Add Template Content**
   - Copy the HTML template above
   - Paste it into the template editor
   - Set the subject line: `💕 LoveLocker - Password Reset Request`

4. **Test Template**
   - Use the "Test" feature in EmailJS
   - Send a test email to yourself
   - Verify the template works correctly

5. **Update JavaScript**
   - The JavaScript is already configured to use this template
   - No code changes needed

## 🔐 **Security Features**

- **24-Hour Expiration**: Reset tokens expire after 24 hours
- **One-Time Use**: Tokens are invalidated after successful reset
- **Secure Tokens**: 32-character random strings
- **Clear Instructions**: Users know what to do if they didn't request reset

## 🎨 **Template Features**

- **Responsive Design**: Works on desktop and mobile
- **Branded Styling**: Matches LoveLocker theme
- **Clear Call-to-Action**: Prominent reset button
- **Fallback Link**: Text link for all email clients
- **Security Notice**: Clear instructions for unintended requests

## 🧪 **Testing**

### **Test the Password Reset Flow**:
1. Go to your LoveLocker app
2. Click "Login" → "Forgot your password?"
3. Enter your email address
4. Check your email for the reset link
5. Click the reset link
6. Set a new password
7. Login with the new password

### **Verify Email Content**:
- Reset button works and links correctly
- Fallback text link is present
- All styling displays properly
- Security notice is visible

---

**Need Help?** Check the [Email Setup Guide](EMAIL_SETUP.md) for complete EmailJS configuration instructions.
