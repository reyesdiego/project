-- Migration: add_agent_email_unique
-- Description: Add unique constraint to agent email field
-- Date: 2025-01-27

-- Add unique constraint to agent email field
ALTER TABLE agents 
ADD CONSTRAINT unique_agent_email UNIQUE (email);

-- Note: This will fail if there are duplicate emails in existing data
-- You may need to clean up duplicate emails first
