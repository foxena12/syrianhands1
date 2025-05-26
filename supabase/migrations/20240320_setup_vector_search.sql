-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for storing embeddings
CREATE TABLE chat_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI's text-embedding-ada-002 produces 1536-dimensional vectors
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to search for similar content
CREATE OR REPLACE FUNCTION match_chat_embeddings(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    similarity float,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        chat_embeddings.id,
        chat_embeddings.content,
        1 - (chat_embeddings.embedding <=> query_embedding) as similarity,
        chat_embeddings.metadata
    FROM chat_embeddings
    WHERE 1 - (chat_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- Create an index for faster similarity searches
CREATE INDEX chat_embeddings_embedding_idx ON chat_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE chat_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
    ON chat_embeddings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON chat_embeddings FOR INSERT
    TO authenticated
    WITH CHECK (true); 