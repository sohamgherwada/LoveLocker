# LoveLocker Setup Guide

This guide will help you set up and deploy the LoveLocker application with proper authentication, database, and email functionality.

## Prerequisites

- Node.js (v16 or higher)
- A Supabase account
- A Gmail account with App Password enabled
- A Vercel account

## 1. Database Setup (Supabase)

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Note down your project URL and anon key from the project settings

### Step 2: Set up the Database Schema
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-schema.sql` into the editor
3. Run the SQL script to create all tables, functions, and policies

### Step 3: Configure Row Level Security (RLS)
The database schema includes RLS policies, but you may need to adjust them based on your needs. The current setup allows:
- Users to read their own data and their partner's data
- Users to create and update their own letters
- Anonymous users to register and verify emails

## 2. Email Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Generate a new app password for "Mail"
4. Save this password securely

## 3. Environment Variables

### Step 1: Create Environment File
Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Gmail SMTP Configuration
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password_here

# Optional: Custom domain
WEBSITE_URL=https://your-custom-domain.com
```

### Step 2: Get Supabase Credentials
1. In your Supabase project dashboard, go to Settings → API
2. Copy the "Project URL" and "anon public" key
3. Add them to your `.env.local` file

## 4. Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8000`

## 5. Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy to Vercel
```bash
vercel --prod
```

### Step 3: Set Environment Variables in Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all the environment variables from your `.env.local` file

## 6. Testing the Application

### Step 1: Test Registration
1. Open your deployed application
2. Click "Sign Up"
3. Fill in the registration form
4. Check your email for the verification code
5. Enter the verification code to complete registration

### Step 2: Test Login
1. Use the credentials you just created
2. Verify that you can log in successfully
3. Check that the dashboard loads properly

### Step 3: Test Password Reset
1. Click "Forgot your password?" on the login form
2. Enter your email address
3. Check your email for the reset link
4. Click the reset link and set a new password

## 7. Troubleshooting

### Common Issues

#### 1. "Missing Supabase environment variables"
- Ensure your environment variables are properly set in Vercel
- Check that the variable names match exactly (case-sensitive)

#### 2. "Failed to send email"
- Verify your Gmail App Password is correct
- Ensure 2-Factor Authentication is enabled on your Google account
- Check that the Gmail user has "Less secure app access" enabled (if needed)

#### 3. "Invalid credentials" on login
- Ensure passwords are being hashed properly
- Check that the user exists in the database
- Verify the email verification process completed

#### 4. Database connection issues
- Verify your Supabase URL and key are correct
- Check that RLS policies are properly configured
- Ensure the database schema was created successfully

### Debugging Steps

1. **Check Vercel Function Logs**
   - Go to your Vercel dashboard
   - Click on your project
   - Go to Functions tab
   - Check the logs for any errors

2. **Test API Endpoints Directly**
   - Use a tool like Postman or curl to test your API endpoints
   - Check the response status and error messages

3. **Verify Database Data**
   - Check your Supabase dashboard
   - Verify that users are being created
   - Check that emails are being sent (if using email logs)

## 8. Security Considerations

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length is 8 characters
- Reset tokens expire after 24 hours

### Database Security
- Row Level Security (RLS) is enabled
- Users can only access their own data and their partner's data
- Anonymous users can only register and verify emails

### Email Security
- Verification codes expire after 15 minutes
- Reset tokens are cryptographically secure
- Email templates include security warnings

## 9. Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Database schema created in Supabase
- [ ] RLS policies configured
- [ ] Gmail App Password generated
- [ ] Email functionality tested
- [ ] Registration flow tested
- [ ] Login flow tested
- [ ] Password reset tested
- [ ] Partner connection tested
- [ ] Letter creation tested

## 10. Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the Vercel function logs
3. Check the Supabase logs
4. Verify all environment variables are set correctly
5. Ensure the database schema is properly created

## Additional Notes

- The application uses session storage for user data (not localStorage for security)
- All API calls include proper error handling
- The application is mobile-responsive
- Email templates are beautifully designed and branded
- The application includes proper CORS configuration for API calls

---

**Made with 💕 by LoveLocker**
