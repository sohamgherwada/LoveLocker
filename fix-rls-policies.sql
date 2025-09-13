-- =============================================
-- FIX RLS POLICIES FOR ANONYMOUS USERS
-- Run this in Supabase SQL Editor to fix the 401 error
-- =============================================

-- Drop existing policies that might be blocking anonymous users
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Letters can be created by authenticated users" ON letters;

-- Create new policies that allow anonymous users
CREATE POLICY "Allow anonymous user registration" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous user login" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous user updates" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous letter creation" ON letters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous letter reading" ON letters
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous letter updates" ON letters
    FOR UPDATE USING (true);

-- Grant all necessary permissions to anonymous users
GRANT ALL ON users TO anon;
GRANT ALL ON letters TO anon;
GRANT ALL ON email_logs TO anon;

-- Grant function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated for anonymous users!';
    RAISE NOTICE 'User registration should now work.';
END $$;
