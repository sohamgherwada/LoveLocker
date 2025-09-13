-- =============================================
-- FIX PERMISSIONS FOR ANONYMOUS USERS
-- Run this in Supabase SQL Editor to fix the 401 error
-- =============================================

-- Allow anonymous users to insert into users table (for registration)
GRANT INSERT ON users TO anon;

-- Allow anonymous users to select from users table (for login)
GRANT SELECT ON users TO anon;

-- Allow anonymous users to update users table (for verification)
GRANT UPDATE ON users TO anon;

-- Allow anonymous users to insert into letters table
GRANT INSERT ON letters TO anon;

-- Allow anonymous users to select from letters table
GRANT SELECT ON letters TO anon;

-- Allow anonymous users to update letters table
GRANT UPDATE ON letters TO anon;

-- Allow anonymous users to insert into email_logs table
GRANT INSERT ON email_logs TO anon;

-- Allow anonymous users to select from email_logs table
GRANT SELECT ON email_logs TO anon;

-- Allow anonymous users to use the functions
GRANT EXECUTE ON FUNCTION generate_connection_code() TO anon;
GRANT EXECUTE ON FUNCTION generate_secret_code() TO anon;
GRANT EXECUTE ON FUNCTION generate_verification_code() TO anon;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Anonymous user permissions added successfully!';
    RAISE NOTICE 'The 401 error should now be fixed.';
END $$;
