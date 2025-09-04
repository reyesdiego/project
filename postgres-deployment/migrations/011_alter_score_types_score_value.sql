-- Migration: alter_score_types_score_value
-- Description: Change score_value column from integer to decimal(10,2) to support 2 decimal places
-- Date: 2025-01-27

-- First, add a new column with the correct type
ALTER TABLE score_types 
ADD COLUMN score_value_new DECIMAL(10,2);

-- Copy existing data from old column to new column (converting integer to decimal)
UPDATE score_types 
SET score_value_new = score_value::DECIMAL(10,2);

-- Drop the old column
ALTER TABLE score_types 
DROP COLUMN score_value;

-- Rename the new column to the original name
ALTER TABLE score_types 
RENAME COLUMN score_value_new TO score_value;

-- Add a check constraint to ensure values are multiples of 0.05 (5 cents)
ALTER TABLE score_types 
ADD CONSTRAINT check_score_value_multiple_of_5 
CHECK (score_value = ROUND(score_value * 20) / 20);

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT check_score_value_multiple_of_5 ON score_types 
IS 'Ensures score_value is a multiple of 0.05 (5 cents)';
