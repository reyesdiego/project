-- Disable Row Level Security for development
-- This allows the anonymous role to access all tables
-- For production, you should implement proper RLS policies instead

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE score_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE scores DISABLE ROW LEVEL SECURITY; 