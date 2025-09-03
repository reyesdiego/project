-- Migration: add_admin_phone
-- Description: Add phone number to admin user for testing
-- Date: 2025-01-27

-- Update admin user to have a phone number
UPDATE users 
SET phone = '+1234567890' 
WHERE username = 'admin' AND phone IS NULL;
