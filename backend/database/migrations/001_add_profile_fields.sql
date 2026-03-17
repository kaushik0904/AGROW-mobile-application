-- 001_add_profile_fields.sql
-- Add new profile fields to the users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS farm_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS farm_size VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_image TEXT;
