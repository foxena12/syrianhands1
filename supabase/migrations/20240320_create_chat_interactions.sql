-- Create an enum for interaction types
CREATE TYPE chat_interaction_type AS ENUM ('message', 'feedback', 'error', 'resolution');

-- Create an enum for feedback types
CREATE TYPE feedback_type AS ENUM ('helpful', 'not_helpful', 'resolved', 'escalated');

-- Create the chat interactions table
CREATE TABLE chat_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    interaction_type chat_interaction_type NOT NULL,
    message_content TEXT,
    user_query TEXT,
    bot_response TEXT,
    feedback feedback_type,
    feedback_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_chat_interactions_session ON chat_interactions(session_id);
CREATE INDEX idx_chat_interactions_user ON chat_interactions(user_id);
CREATE INDEX idx_chat_interactions_type ON chat_interactions(interaction_type);
CREATE INDEX idx_chat_interactions_feedback ON chat_interactions(feedback);
CREATE INDEX idx_chat_interactions_created ON chat_interactions(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_chat_interactions_updated_at
    BEFORE UPDATE ON chat_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for chat analytics
CREATE VIEW chat_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as day,
    interaction_type,
    feedback,
    COUNT(*) as count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users
FROM chat_interactions
GROUP BY 1, 2, 3;

-- Enable Row Level Security
ALTER TABLE chat_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
    ON chat_interactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON chat_interactions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users on own records"
    ON chat_interactions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid()); 