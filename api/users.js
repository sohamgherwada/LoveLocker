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

  // Check if user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' })
  }

  // Generate connection code
  const connectionCode = generateConnectionCode()

  // Create new user
  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        age: parseInt(age),
        password, // In production, hash this password
        connection_code: connectionCode,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Failed to create user' })
  }

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user

  return res.status(201).json({
    success: true,
    user: userWithoutPassword
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

function generateConnectionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
