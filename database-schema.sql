-- =============================================
-- LoveLocker Complete Database Schema
-- Production-Ready for Supabase
-- =============================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS letters CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User profile information
    name VARCHAR(100) NOT NULL CHECK (length(trim(name)) >= 2 AND length(trim(name)) <= 100),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
    
    -- Authentication
    password VARCHAR(255) NOT NULL CHECK (length(password) >= 8),
    
    -- Connection system
    connection_code VARCHAR(6) UNIQUE NOT NULL,
    partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Email verification system
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_code VARCHAR(6),
    verification_code_expiry TIMESTAMP WITH TIME ZONE,
    
    -- Password reset system
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP WITH TIME ZONE,
    
    -- User preferences and settings
    notification_settings JSONB DEFAULT '{"email": true, "browser": false}' NOT NULL,
    
    -- Account status and activity
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT users_different_partner CHECK (id != partner_id)
);

-- =============================================
-- LETTERS TABLE
-- =============================================
CREATE TABLE letters (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Letter relationships
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Letter content
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) >= 1 AND length(trim(title)) <= 200),
    content TEXT NOT NULL CHECK (length(trim(content)) >= 10),
    
    -- Security and unlocking
    secret_code VARCHAR(8) NOT NULL,
    unlock_date DATE NOT NULL CHECK (unlock_date > CURRENT_DATE),
    is_unlocked BOOLEAN DEFAULT FALSE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    
    -- Notification system
    notification_sent BOOLEAN DEFAULT FALSE NOT NULL,
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Letter metadata
    letter_type VARCHAR(50) DEFAULT 'love_letter' CHECK (letter_type IN ('love_letter', 'anniversary', 'birthday', 'special_occasion', 'surprise')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT letters_different_author_recipient CHECK (author_id != recipient_id)
);

-- =============================================
-- EMAIL_LOGS TABLE (for tracking email delivery)
-- =============================================
CREATE TABLE email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('verification', 'password_reset', 'letter_notification', 'welcome')),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    message_id VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- USER_SESSIONS TABLE (for session management)
-- =============================================
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_connection_code ON users(connection_code);
CREATE INDEX idx_users_partner_id ON users(partner_id);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Letter indexes
CREATE INDEX idx_letters_author_id ON letters(author_id);
CREATE INDEX idx_letters_recipient_id ON letters(recipient_id);
CREATE INDEX idx_letters_unlock_date ON letters(unlock_date);
CREATE INDEX idx_letters_is_unlocked ON letters(is_unlocked);
CREATE INDEX idx_letters_notification_sent ON letters(notification_sent);
CREATE INDEX idx_letters_created_at ON letters(created_at);
CREATE INDEX idx_letters_letter_type ON letters(letter_type);

-- Composite indexes for common queries
CREATE INDEX idx_letters_recipient_unlock ON letters(recipient_id, unlock_date, is_unlocked);
CREATE INDEX idx_letters_author_created ON letters(author_id, created_at);
CREATE INDEX idx_letters_unlockable ON letters(recipient_id, unlock_date, is_unlocked, notification_sent);

-- Email logs indexes
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- Session indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- =============================================
-- UNIQUE CONSTRAINTS
-- =============================================

-- Prevent duplicate users with same name and email
CREATE UNIQUE INDEX idx_users_name_email ON users(name, email);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can read partner data" ON users
    FOR SELECT USING (auth.uid()::text = partner_id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Letter policies
CREATE POLICY "Letters can be read by author and recipient" ON letters
    FOR SELECT USING (
        auth.uid()::text = author_id::text OR 
        auth.uid()::text = recipient_id::text
    );

CREATE POLICY "Letters can be created by authenticated users" ON letters
    FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);

CREATE POLICY "Letters can be updated by author and recipient" ON letters
    FOR UPDATE USING (
        auth.uid()::text = author_id::text OR 
        auth.uid()::text = recipient_id::text
    );

-- Email logs policies
CREATE POLICY "Users can read own email logs" ON email_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert email logs" ON email_logs
    FOR INSERT WITH CHECK (true);

-- Session policies
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate connection codes
CREATE OR REPLACE FUNCTION generate_connection_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ language 'plpgsql';

-- Function to generate secret codes
CREATE OR REPLACE FUNCTION generate_secret_code()
RETURNS VARCHAR(8) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(8) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ language 'plpgsql';

-- Function to generate verification codes
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    chars VARCHAR(10) := '0123456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ language 'plpgsql';

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Clean up expired verification codes
    UPDATE users 
    SET verification_code = NULL, verification_code_expiry = NULL
    WHERE verification_code_expiry < NOW() AND email_verified = FALSE;
    
    -- Clean up expired reset tokens
    UPDATE users 
    SET reset_token = NULL, reset_token_expiry = NULL
    WHERE reset_token_expiry < NOW();
    
    -- Clean up expired sessions
    UPDATE user_sessions 
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    -- Log cleanup completion
    RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$$ language 'plpgsql';

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_letters_created', COUNT(CASE WHEN l.author_id = user_uuid THEN 1 END),
        'total_letters_received', COUNT(CASE WHEN l.recipient_id = user_uuid THEN 1 END),
        'letters_unlocked', COUNT(CASE WHEN l.recipient_id = user_uuid AND l.is_unlocked = true THEN 1 END),
        'letters_ready_to_unlock', COUNT(CASE WHEN l.recipient_id = user_uuid AND l.unlock_date <= CURRENT_DATE AND l.is_unlocked = false THEN 1 END),
        'account_age_days', EXTRACT(DAYS FROM NOW() - u.created_at)
    )
    INTO result
    FROM users u
    LEFT JOIN letters l ON (u.id = l.author_id OR u.id = l.recipient_id)
    WHERE u.id = user_uuid
    GROUP BY u.id, u.created_at;
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ language 'plpgsql';

-- =============================================
-- TRIGGERS
-- =============================================

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_letters_updated_at 
    BEFORE UPDATE ON letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set connection code on user creation
CREATE OR REPLACE FUNCTION set_connection_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.connection_code IS NULL THEN
        NEW.connection_code := generate_connection_code();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_user_connection_code
    BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION set_connection_code();

-- Trigger to set secret code on letter creation
CREATE OR REPLACE FUNCTION set_secret_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.secret_code IS NULL THEN
        NEW.secret_code := generate_secret_code();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_letter_secret_code
    BEFORE INSERT ON letters
    FOR EACH ROW EXECUTE FUNCTION set_secret_code();

-- =============================================
-- VIEWS
-- =============================================

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.email_verified,
    u.is_active,
    u.created_at,
    u.last_login,
    u.login_count,
    COUNT(DISTINCT CASE WHEN l.author_id = u.id THEN l.id END) as total_letters_created,
    COUNT(DISTINCT CASE WHEN l.recipient_id = u.id THEN l.id END) as total_letters_received,
    COUNT(DISTINCT CASE WHEN l.recipient_id = u.id AND l.is_unlocked = true THEN l.id END) as letters_unlocked,
    COUNT(DISTINCT CASE WHEN l.recipient_id = u.id AND l.unlock_date <= CURRENT_DATE AND l.is_unlocked = false THEN l.id END) as letters_ready_to_unlock
FROM users u
LEFT JOIN letters l ON (u.id = l.author_id OR u.id = l.recipient_id)
GROUP BY u.id, u.name, u.email, u.email_verified, u.is_active, u.created_at, u.last_login, u.login_count;

-- View for letters ready to unlock
CREATE OR REPLACE VIEW letters_ready_to_unlock AS
SELECT 
    l.*,
    u.name as author_name,
    u.email as author_email,
    r.name as recipient_name,
    r.email as recipient_email
FROM letters l
JOIN users u ON l.author_id = u.id
JOIN users r ON l.recipient_id = r.id
WHERE l.unlock_date <= CURRENT_DATE 
    AND l.is_unlocked = FALSE 
    AND l.notification_sent = FALSE;

-- View for active user sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.*,
    u.name as user_name,
    u.email as user_email
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = TRUE AND s.expires_at > NOW();

-- =============================================
-- GRANTS AND PERMISSIONS
-- =============================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON letters TO authenticated;
GRANT SELECT ON email_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE users IS 'User accounts with email verification, partner connections, and authentication';
COMMENT ON TABLE letters IS 'Time capsule letters with secret codes, unlock dates, and notifications';
COMMENT ON TABLE email_logs IS 'Log of all emails sent for tracking and debugging';
COMMENT ON TABLE user_sessions IS 'Active user sessions for security and analytics';

COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN users.verification_code IS '6-digit code sent for email verification';
COMMENT ON COLUMN users.verification_code_expiry IS 'When the verification code expires (15 minutes)';
COMMENT ON COLUMN users.connection_code IS '6-character code for partner connection';
COMMENT ON COLUMN users.is_active IS 'Whether the user account is active (not deleted)';
COMMENT ON COLUMN users.login_count IS 'Number of times user has logged in';

COMMENT ON COLUMN letters.secret_code IS '8-character code required to unlock the letter';
COMMENT ON COLUMN letters.unlock_date IS 'Date when the letter can be unlocked';
COMMENT ON COLUMN letters.notification_sent IS 'Whether unlock notification has been sent';
COMMENT ON COLUMN letters.letter_type IS 'Type of letter (love_letter, anniversary, birthday, etc.)';
COMMENT ON COLUMN letters.priority IS 'Priority level of the letter';

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO users (name, email, age, password, email_verified) VALUES
('John Doe', 'john@example.com', 25, 'password123', true),
('Jane Smith', 'jane@example.com', 23, 'password123', true);

UPDATE users SET partner_id = (SELECT id FROM users WHERE email = 'jane@example.com') WHERE email = 'john@example.com';
UPDATE users SET partner_id = (SELECT id FROM users WHERE email = 'john@example.com') WHERE email = 'jane@example.com';
*/

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'LoveLocker database schema created successfully!';
    RAISE NOTICE 'Tables created: users, letters, email_logs, user_sessions';
    RAISE NOTICE 'Functions created: generate_connection_code, generate_secret_code, generate_verification_code, cleanup_expired_data, get_user_stats';
    RAISE NOTICE 'Views created: user_stats, letters_ready_to_unlock, active_sessions';
    RAISE NOTICE 'RLS policies enabled for security';
    RAISE NOTICE 'Ready for production use!';
END $$;