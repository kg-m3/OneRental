/*
  # Create equipment and bookings tables

  1. New Tables
    - `equipment`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text)
      - `description` (text)
      - `type` (text)
      - `location` (text)
      - `rate` (numeric)
      - `owner_id` (uuid, references auth.users)
      - `status` (text)
      
    - `bookings`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `equipment_id` (uuid, references equipment)
      - `user_id` (uuid, references auth.users)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for equipment table:
      - Owners can read/write their own equipment
      - Anyone can read available equipment
    - Add policies for bookings table:
      - Users can read their own bookings
      - Equipment owners can read bookings for their equipment
*/

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  location text NOT NULL,
  rate numeric NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'available'
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  equipment_id uuid REFERENCES equipment NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Equipment policies
CREATE POLICY "Users can view all available equipment"
  ON equipment
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own equipment"
  ON equipment
  USING (auth.uid() = owner_id);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Equipment owners can view bookings for their equipment"
  ON bookings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT owner_id 
      FROM equipment 
      WHERE id = equipment_id
    )
  );

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);