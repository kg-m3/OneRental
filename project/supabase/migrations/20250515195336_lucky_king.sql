/*
  # Fix RLS policies for user_profiles table

  1. Changes
    - Add RLS policies for user_profiles table to allow:
      - Users to create their own profile during signup
      - Users to read their own profile
      - Users to update their own profile
  
  2. Security
    - Enable RLS on user_profiles table
    - Add policies for insert, select, and update operations
*/

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own profile
CREATE POLICY "Users can create their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);