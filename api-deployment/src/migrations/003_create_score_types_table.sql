-- Create score_types table
CREATE TABLE IF NOT EXISTS score_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    score_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_score_types_name ON score_types(name);
CREATE INDEX IF NOT EXISTS idx_score_types_active ON score_types(is_active);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_score_types_updated_at ON score_types;
CREATE TRIGGER update_score_types_updated_at 
    BEFORE UPDATE ON score_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
