// Vercel Serverless Function for user management
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing required environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const { action, ...data } = req.body

    switch (action) {
      case 'register':
        return await handleRegister(req, res, data)
      case 'verifyEmail':
        return await handleVerifyEmail(req, res, data)
      case 'resendVerification':
        return await handleResendVerification(req, res, data)
      case 'login':
        return await handleLogin(req, res, data)
      case 'getUser':
        return await handleGetUser(req, res, data)
      case 'updateUser':
        return await handleUpdateUser(req, res, data)
      case 'connectUsers':
        return await handleConnectUsers(req, res, data)
      case 'forgotPassword':
        return await handleForgotPassword(req, res, data)
      case 'resetPassword':
        return await handleResetPassword(req, res, data)
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleRegister(req, res, data) {
  const { name, email, age, password } = data

  if (!name || !email || !age || !password) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Check if user already exists by email
  const { data: existingUserByEmail, error: checkEmailError } = await supabase
    .from('users')
    .select('id, email_verified')
    .eq('email', email)
    .single()

  if (existingUserByEmail) {
    if (existingUserByEmail.email_verified) {
      return res.status(400).json({ error: 'User with this email already exists' })
    } else {
      return res.status(400).json({ error: 'User with this email already exists but not verified. Please check your email for verification code.' })
    }
  }

  // Check if user already exists by name and email combination
  const { data: existingUserByNameEmail, error: checkNameEmailError } = await supabase
    .from('users')
    .select('id, email_verified')
    .eq('name', name)
    .eq('email', email)
    .single()

  if (existingUserByNameEmail) {
    if (existingUserByNameEmail.email_verified) {
      return res.status(400).json({ error: 'User with this name and email already exists' })
    } else {
      return res.status(400).json({ error: 'User with this name and email already exists but not verified. Please check your email for verification code.' })
    }
  }

  // Generate connection code and verification code
  const connectionCode = generateConnectionCode()
  const verificationCode = generateVerificationCode()

  // Hash the password
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Create new user (unverified)
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        age: parseInt(age),
        password: hashedPassword,
        connection_code: connectionCode,
        email_verified: false,
        verification_code: verificationCode,
        verification_code_expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Failed to create user' })
  }

  // Send verification email
  try {
    await sendVerificationEmail(user, verificationCode)
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
    // Don't fail registration if email fails, but log it
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  return res.status(201).json({
    success: true,
    user: userWithoutPassword,
    message: 'Registration successful! Please check your email for verification code.'
  })
}

async function handleLogin(req, res, data) {
  const { email, password } = data

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // Verify password using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  // Check if email is verified
  if (!user.email_verified) {
    return res.status(401).json({ 
      error: 'Email not verified. Please check your email for verification code.',
      needsVerification: true,
      userId: user.id
    })
  }

  // Update last login and login count
  await supabase
    .from('users')
    .update({ 
      last_login: new Date().toISOString(),
      login_count: (user.login_count || 0) + 1
    })
    .eq('id', user.id)

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  return res.status(200).json({
    success: true,
    user: userWithoutPassword
  })
}

async function handleGetUser(req, res, data) {
  const { userId } = data

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  return res.status(200).json({
    success: true,
    user: userWithoutPassword
  })
}

async function handleUpdateUser(req, res, data) {
  const { userId, updates } = data

  if (!userId || !updates) {
    return res.status(400).json({ error: 'Missing user ID or updates' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Update error:', error)
    return res.status(500).json({ error: 'Failed to update user' })
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  return res.status(200).json({
    success: true,
    user: userWithoutPassword
  })
}

async function handleConnectUsers(req, res, data) {
  const { userId, partnerCode } = data

  if (!userId || !partnerCode) {
    return res.status(400).json({ error: 'Missing user ID or partner code' })
  }

  // Find partner by connection code
  const { data: partner, error: partnerError } = await supabase
    .from('users')
    .select('*')
    .eq('connection_code', partnerCode)
    .neq('id', userId)
    .single()

  if (partnerError || !partner) {
    return res.status(404).json({ error: 'Invalid connection code' })
  }

  // Check if either user is already connected
  if (partner.partner_id || data.partner_id) {
    return res.status(400).json({ error: 'One of you is already connected' })
  }

  // Update both users to connect them
  const { error: updateError } = await supabase
    .from('users')
    .update({ partner_id: partner.id })
    .eq('id', userId)

  if (updateError) {
    return res.status(500).json({ error: 'Failed to connect users' })
  }

  const { error: partnerUpdateError } = await supabase
    .from('users')
    .update({ partner_id: userId })
    .eq('id', partner.id)

  if (partnerUpdateError) {
    return res.status(500).json({ error: 'Failed to connect users' })
  }

  // Remove password from response
  const { password: _, ...partnerWithoutPassword } = partner

  return res.status(200).json({
    success: true,
    partner: partnerWithoutPassword
  })
}

async function handleVerifyEmail(req, res, data) {
  const { userId, verificationCode } = data

  if (!userId || !verificationCode) {
    return res.status(400).json({ error: 'Missing user ID or verification code' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Check if already verified
  if (user.email_verified) {
    return res.status(400).json({ error: 'Email already verified' })
  }

  // Check verification code and expiry
  if (user.verification_code !== verificationCode) {
    return res.status(400).json({ error: 'Invalid verification code' })
  }

  if (new Date() > new Date(user.verification_code_expiry)) {
    return res.status(400).json({ error: 'Verification code expired' })
  }

  // Update user to verified
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      email_verified: true,
      verification_code: null,
      verification_code_expiry: null
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Verification update error:', updateError)
    return res.status(500).json({ error: 'Failed to verify email' })
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  return res.status(200).json({
    success: true,
    user: { ...userWithoutPassword, email_verified: true },
    message: 'Email verified successfully!'
  })
}

async function handleResendVerification(req, res, data) {
  const { userId } = data

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' })
  }

  // Check if already verified
  if (user.email_verified) {
    return res.status(400).json({ error: 'Email already verified' })
  }

  // Generate new verification code
  const verificationCode = generateVerificationCode()

  // Update user with new verification code
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      verification_code: verificationCode,
      verification_code_expiry: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    })
    .eq('id', userId)

  if (updateError) {
    console.error('Resend verification update error:', updateError)
    return res.status(500).json({ error: 'Failed to resend verification code' })
  }

  // Send verification email
  try {
    await sendVerificationEmail(user, verificationCode)
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
    return res.status(500).json({ error: 'Failed to send verification email' })
  }

  return res.status(200).json({
    success: true,
    message: 'Verification code sent successfully!'
  })
}

async function sendVerificationEmail(user, verificationCode) {
  const emailData = {
    to: user.email,
    subject: `💕 LoveLocker - Verify Your Email`,
    html: generateVerificationEmail(user, verificationCode),
    type: 'email_verification'
  }

  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email')
    }

    console.log('📧 Verification email sent:', result.messageId)
  } catch (error) {
    console.error('📧 Verification email failed:', error)
    throw error
  }
}

function generateVerificationEmail(user, verificationCode) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h1 style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 2.5rem; margin-bottom: 20px;">💕 LoveLocker</h1>
      
      <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin: 20px 0;">
        <h2 style="color: #ff6b9d; margin-bottom: 15px;">Verify Your Email Address ✉️</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>Welcome to LoveLocker! To complete your registration and start creating beautiful time capsule letters, please verify your email address.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b9d;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Your Verification Code</h3>
          <p style="margin: 5px 0; color: #666;">Enter this code in the app to verify your email:</p>
        </div>
        
        <div style="background: #fff3cd; border: 2px solid #ff6b9d; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <h4 style="margin: 0 0 10px 0; color: #856404;">🔑 Verification Code</h4>
          <div style="background: #f8f9fa; border: 2px solid #ff6b9d; padding: 15px; border-radius: 5px; text-align: center; margin: 10px 0;">
            <strong style="font-size: 2rem; color: #333; font-family: 'Courier New', monospace; letter-spacing: 3px;">${verificationCode}</strong>
          </div>
          <p style="margin: 10px 0 0 0; color: #856404; font-size: 0.9rem;">This code will expire in 15 minutes for security reasons.</p>
        </div>
        
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0c5460;">📱 Next Steps</h4>
          <p style="margin: 0; color: #0c5460; font-size: 0.9rem;">1. Return to the LoveLocker app<br>2. Enter the verification code above<br>3. Start creating your first time capsule letter!</p>
        </div>
        
        <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 30px;">
          Made with 💕 by LoveLocker
        </p>
      </div>
    </div>
  `;
}

function generateConnectionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateVerificationCode() {
  const chars = '0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function handleForgotPassword(req, res, data) {
  const { email } = data

  if (!email) {
    return res.status(400).json({ error: 'Missing email address' })
  }

  // Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !user) {
    return res.status(404).json({ error: 'No account found with that email address' })
  }

  // Generate reset token
  const resetToken = generateResetToken()
  const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Update user with reset token
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry.toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Reset token update error:', updateError)
    return res.status(500).json({ error: 'Failed to generate reset token' })
  }

  // Send reset email
  try {
    await sendPasswordResetEmail(user, resetToken)
  } catch (emailError) {
    console.error('Failed to send reset email:', emailError)
    return res.status(500).json({ error: 'Failed to send reset email' })
  }

  return res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email!'
  })
}

async function handleResetPassword(req, res, data) {
  const { resetToken, newPassword } = data

  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Missing reset token or new password' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' })
  }

  // Find user by reset token
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_token', resetToken)
    .single()

  if (error || !user) {
    return res.status(400).json({ error: 'Invalid reset token' })
  }

  // Check if token is expired
  if (new Date() > new Date(user.reset_token_expiry)) {
    return res.status(400).json({ error: 'Reset token has expired' })
  }

  // Hash new password
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

  // Update user with new password and clear reset token
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Password reset update error:', updateError)
    return res.status(500).json({ error: 'Failed to reset password' })
  }

  return res.status(200).json({
    success: true,
    message: 'Password reset successfully!'
  })
}

function generateResetToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}?reset_token=${resetToken}`
  
  const emailData = {
    to: user.email,
    subject: `💕 LoveLocker - Password Reset Request`,
    html: generatePasswordResetEmail(user, resetUrl),
    type: 'password_reset'
  }

  try {
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email')
    }

    console.log('📧 Password reset email sent:', result.messageId)
  } catch (error) {
    console.error('📧 Password reset email failed:', error)
    throw error
  }
}

function generatePasswordResetEmail(user, resetUrl) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h1 style="text-align: center; font-family: 'Dancing Script', cursive; font-size: 2.5rem; margin-bottom: 20px;">💕 LoveLocker</h1>
      
      <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin: 20px 0;">
        <h2 style="color: #ff6b9d; margin-bottom: 15px;">Password Reset Request 🔐</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>We received a request to reset your LoveLocker password. If you made this request, click the button below to set a new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff6b9d, #ff8fab); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Security Notice</h4>
          <p style="margin: 0; color: #856404; font-size: 0.9rem;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        
        <p style="color: #666; font-size: 0.9rem; text-align: center; margin-top: 30px;">
          Made with 💕 by LoveLocker
        </p>
      </div>
    </div>
  `;
}
