-- Migration: alter_scores_columns
-- Description: Alter scores table columns
-- Date: 2025-08-26

ALTER TABLE scores
    rename column assigned_by_user_id to assigned_by;

ALTER TABLE scores
    rename column notes to comment;

