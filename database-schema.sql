-- LoveLocker Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER NOT NULL,
    password VARCHAR(255) NOT NULL,
    connection_code VARCHAR(6) UNIQUE NOT NULL,
    partner_id UUID REFERENCES users(id),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    notification_settings JSONB DEFAULT '{"email": true, "browser": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Letters table
CREATE TABLE letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    secret_code VARCHAR(8) NOT NULL,
    unlock_date DATE NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_connection_code ON users(connection_code);
CREATE INDEX idx_users_partner_id ON users(partner_id);
CREATE INDEX idx_letters_recipient_id ON letters(recipient_id);
CREATE INDEX idx_letters_author_id ON letters(author_id);
CREATE INDEX idx_letters_unlock_date ON letters(unlock_date);
CREATE INDEX idx_letters_is_unlocked ON letters(is_unlocked);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and their partner's data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can read partner data" ON users
    FOR SELECT USING (auth.uid()::text = partner_id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Letters can be read by author and recipient
CREATE POLICY "Letters can be read by author and recipient" ON letters
    FOR SELECT USING (
        auth.uid()::text = author_id::text OR 
        auth.uid()::text = recipient_id::text
    );

-- Letters can be created by authenticated users
CREATE POLICY "Letters can be created by authenticated users" ON letters
    FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);

-- Letters can be updated by author and recipient
CREATE POLICY "Letters can be updated by author and recipient" ON letters
    FOR UPDATE USING (
        auth.uid()::text = author_id::text OR 
        auth.uid()::text = recipient_id::text
    );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
