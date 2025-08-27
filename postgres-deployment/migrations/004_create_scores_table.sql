-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    score_type_id INTEGER NOT NULL REFERENCES score_types(id) ON DELETE CASCADE,
    assigned_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scores_agent_id ON scores(agent_id);
CREATE INDEX IF NOT EXISTS idx_scores_score_type_id ON scores(score_type_id);
CREATE INDEX IF NOT EXISTS idx_scores_assigned_by_user_id ON scores(assigned_by_user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(score_date);
CREATE INDEX IF NOT EXISTS idx_scores_agent_date ON scores(agent_id, score_date);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_scores_updated_at ON scores;
CREATE TRIGGER update_scores_updated_at 
    BEFORE UPDATE ON scores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
