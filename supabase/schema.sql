-- =========================================================
-- ONLINE CLASS WHATSAPP SUPPORT AGENT - SUPABASE DATABASE SCHEMA
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    language VARCHAR(20) DEFAULT 'English', -- 'English', 'Sinhala', 'Singlish'
    interested_course VARCHAR(100),
    conversation_stage VARCHAR(50) DEFAULT 'welcome',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'ai_active', -- 'ai_active', 'needs_review', 'human_active', 'resolved'
    assigned_to VARCHAR(100),
    ai_enabled BOOLEAN DEFAULT TRUE,
    current_stage VARCHAR(50) DEFAULT 'welcome',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MESSAGES TABLE (with External ID for Idempotency)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    external_message_id VARCHAR(100) UNIQUE, -- Meta WhatsApp message ID for duplicate protection
    direction VARCHAR(20) NOT NULL, -- 'incoming', 'outgoing'
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'ai', 'human', 'system'
    message_type VARCHAR(30) DEFAULT 'text', -- 'text', 'template', 'interactive', 'unsupported'
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'delivered', -- 'sent', 'delivered', 'read', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FAQ ENTRIES TABLE (136 Approved FAQs)
CREATE TABLE IF NOT EXISTS faq_entries (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'FAQ-ADM-001'
    category VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    language VARCHAR(20) DEFAULT 'English',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
    usage_count INT DEFAULT 0,
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'CRS-DEV-001'
    code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    instructor VARCHAR(100),
    schedule VARCHAR(150),
    duration VARCHAR(50),
    fee NUMERIC(10, 2),
    enrolled_students INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'upcoming', 'completed'
    syllabus TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AUTOMATIONS TABLE
CREATE TABLE IF NOT EXISTS automations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    trigger VARCHAR(50) NOT NULL, -- 'new_enrollment', 'missed_class', 'recording_uploaded', 'payment_reminder'
    enabled BOOLEAN DEFAULT TRUE,
    steps JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AUTOMATION RUNS TABLE
CREATE TABLE IF NOT EXISTS automation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id VARCHAR(50) REFERENCES automations(id),
    conversation_id UUID REFERENCES conversations(id),
    status VARCHAR(30) DEFAULT 'completed',
    run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FOLLOW-UPS TABLE
CREATE TABLE IF NOT EXISTS follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(30) DEFAULT 'scheduled', -- 'scheduled', 'sent', 'cancelled', 'failed'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. LMS EVENTS TABLE
CREATE TABLE IF NOT EXISTS lms_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payload JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'processed', -- 'received', 'validated', 'queued', 'processed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. NOTIFICATION QUEUE TABLE
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lms_event_id UUID REFERENCES lms_events(id),
    phone_number VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'queued', -- 'queued', 'processing', 'sent', 'failed'
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- 11. HUMAN ESCALATIONS TABLE
CREATE TABLE IF NOT EXISTS human_escalations (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'ESC-901'
    conversation_id UUID REFERENCES conversations(id),
    customer_name VARCHAR(100),
    phone_number VARCHAR(50),
    reason VARCHAR(50) NOT NULL, -- 'unknown_faq', 'user_requested', 'strictness_failure', 'sensitive_topic'
    customer_message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'assigned', 'resolved'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AI LOGS TABLE
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    matched_faq_id VARCHAR(50),
    confidence INT,
    grounded_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    title VARCHAR(150) NOT NULL,
    description TEXT,
    user_or_phone VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- INDEXES FOR HIGH PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_external_id ON messages(external_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq_entries(category);
CREATE INDEX IF NOT EXISTS idx_faq_keywords ON faq_entries USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_notification_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled ON follow_ups(scheduled_at, status);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_escalations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read for faq_entries" ON faq_entries FOR SELECT USING (true);
CREATE POLICY "Service Role Full Access" ON customers FOR ALL USING (true);
