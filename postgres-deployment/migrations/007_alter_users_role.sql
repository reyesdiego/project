-- Migration: alter_users_role
-- Description: Change users column is_admin to role
-- Date: 2025-08-25

ALTER TABLE users
    rename column is_admin to role;

ALTER TABLE users
    ALTER column role type text using role::text;

ALTER TABLE users
    ALTER column role drop default;


