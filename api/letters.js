// Vercel Serverless Function for letter management
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
      case 'create':
        return await handleCreateLetter(req, res, data)
      case 'getByUser':
        return await handleGetLettersByUser(req, res, data)
      case 'unlock':
        return await handleUnlockLetter(req, res, data)
      case 'getUnlockable':
        return await handleGetUnlockableLetters(req, res, data)
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleCreateLetter(req, res, data) {
  const { authorId, recipientId, title, content, unlockDate } = data

  if (!authorId || !recipientId || !title || !content || !unlockDate) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Generate random secret code
  const secretCode = generateSecretCode()

  const { data: letter, error } = await supabase
    .from('letters')
    .insert([
      {
        author_id: authorId,
        recipient_id: recipientId,
        title,
        content,
        secret_code: secretCode,
        unlock_date: unlockDate,
        is_unlocked: false,
        notification_sent: false,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Create letter error:', error)
    return res.status(500).json({ error: 'Failed to create letter' })
  }

  return res.status(201).json({
    success: true,
    letter
  })
}

async function handleGetLettersByUser(req, res, data) {
  const { userId } = data

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' })
  }

  const { data: letters, error } = await supabase
    .from('letters')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get letters error:', error)
    return res.status(500).json({ error: 'Failed to get letters' })
  }

  return res.status(200).json({
    success: true,
    letters
  })
}

async function handleUnlockLetter(req, res, data) {
  const { letterId, secretCode } = data

  if (!letterId || !secretCode) {
    return res.status(400).json({ error: 'Missing letter ID or secret code' })
  }

  // Get the letter
  const { data: letter, error: getError } = await supabase
    .from('letters')
    .select('*')
    .eq('id', letterId)
    .single()

  if (getError || !letter) {
    return res.status(404).json({ error: 'Letter not found' })
  }

  // Check if already unlocked
  if (letter.is_unlocked) {
    return res.status(400).json({ error: 'Letter already unlocked' })
  }

  // Check secret code
  if (letter.secret_code !== secretCode) {
    return res.status(401).json({ error: 'Invalid secret code' })
  }

  // Unlock the letter
  const { data: updatedLetter, error: updateError } = await supabase
    .from('letters')
    .update({ is_unlocked: true })
    .eq('id', letterId)
    .select()
    .single()

  if (updateError) {
    console.error('Unlock error:', updateError)
    return res.status(500).json({ error: 'Failed to unlock letter' })
  }

  return res.status(200).json({
    success: true,
    letter: updatedLetter
  })
}

async function handleGetUnlockableLetters(req, res, data) {
  const { userId } = data

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' })
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: letters, error } = await supabase
    .from('letters')
    .select('*')
    .eq('recipient_id', userId)
    .lte('unlock_date', today)
    .eq('is_unlocked', false)
    .eq('notification_sent', false)

  if (error) {
    console.error('Get unlockable letters error:', error)
    return res.status(500).json({ error: 'Failed to get unlockable letters' })
  }

  return res.status(200).json({
    success: true,
    letters
  })
}

function generateSecretCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
