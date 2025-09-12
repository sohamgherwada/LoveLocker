// Vercel Serverless Function for user management
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
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

  // Create new user (unverified)
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        age: parseInt(age),
        password, // In production, hash this password
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
    .eq('password', password)
    .single()

  if (error || !user) {
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
