/*
  # Add user roles and policies

  1. Changes
    - Add role column to profiles table with enum type
    - Set default role to 'ruser'
    - Update RLS policies to handle different roles

  2. Security
    - Admins can read and update all profiles
    - Mods can read all profiles and update regular users
    - Regular users can only read and update their own profiles
*/

-- Create enum type for roles
CREATE TYPE user_role AS ENUM ('admin', 'mod', 'ruser');

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role NOT NULL DEFAULT 'ruser';

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new role-based policies
-- Read policies
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Mods can read all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'mod'
  )
);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id AND 
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'ruser'
  )
);

-- Update policies
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

CREATE POLICY "Mods can update regular users"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'mod'
  ) AND
  (SELECT role FROM profiles WHERE id = profiles.id) = 'ruser'
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'mod'
  ) AND
  (SELECT role FROM profiles WHERE id = profiles.id) = 'ruser'
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'ruser'
  )
)
WITH CHECK (
  auth.uid() = id AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'ruser'
  )
);

-- Create function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;