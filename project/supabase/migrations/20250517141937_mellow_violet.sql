/*
  # Add additional profile fields

  1. Changes
    - Add new columns to user_profiles table:
      - full_name (text)
      - phone (text)
      - company_name (text)
      - profile_image_url (text)
      - updated_at (timestamp)
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS profile_image_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE
    ON user_profiles
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();