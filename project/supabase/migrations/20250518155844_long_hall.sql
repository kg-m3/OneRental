/*
  # Fix user roles RLS policies

  1. Changes
    - Update RLS policies for user_roles table to allow:
      - Users to create their own roles during signup
      - Users to read their own roles
  
  2. Security
    - Maintain existing RLS but add insert policy
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Add updated policies
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roles"
  ON user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);