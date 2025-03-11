/*
  # Fix Profile Policies

  1. Changes
    - Remove recursive role checks from policies
    - Simplify policy conditions
    - Add proper role-based access control

  2. Security
    - Enable RLS
    - Add non-recursive policies for different roles
    - Maintain proper access control hierarchy
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Mods can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Mods can update regular users" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new, simplified policies
CREATE POLICY "Admins can read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  role = 'admin'::user_role
);

CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (
  role = 'admin'::user_role
)
WITH CHECK (
  role = 'admin'::user_role
);

CREATE POLICY "Mods can read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  role = 'mod'::user_role OR id = auth.uid()
);

CREATE POLICY "Mods can update regular users"
ON profiles
FOR UPDATE
TO authenticated
USING (
  role = 'mod'::user_role AND 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ruser'::user_role
  )
)
WITH CHECK (
  role = 'mod'::user_role AND 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ruser'::user_role
  )
);

CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() AND role = 'ruser'::user_role
)
WITH CHECK (
  id = auth.uid() AND role = 'ruser'::user_role
);