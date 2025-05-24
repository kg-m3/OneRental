/*
  # Update user profiles to support multiple roles

  1. Changes
    - Add user_roles table to support multiple roles per user
    - Update existing user_profiles table
    - Migrate existing role data
    
  2. Security
    - Enable RLS on user_roles table
    - Add policies for user access
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'renter')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Migrate existing data
INSERT INTO user_roles (user_id, role)
SELECT user_id, role FROM user_profiles
ON CONFLICT DO NOTHING;

-- Update user_profiles table
ALTER TABLE user_profiles DROP COLUMN role;