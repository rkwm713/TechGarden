/*
  # Create admin user profile

  1. Changes
    - Create admin profile with admin role
  
  2. Security
    - Maintains existing RLS policies
    - Admin user will have full access based on existing policies
    - Uses UUID generation for consistency with auth.users
*/

-- First check if the admin profile already exists to avoid duplicates
DO $$ 
DECLARE
  new_user_id UUID;
BEGIN 
  -- Get the user ID from auth.users table
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'admin@ts'
  LIMIT 1;

  -- Only proceed if we found the user
  IF new_user_id IS NOT NULL AND 
     NOT EXISTS (
       SELECT 1 FROM profiles 
       WHERE email = 'admin@ts'
     ) THEN
    -- Insert the admin profile with the matching auth.users id
    INSERT INTO profiles (id, email, role)
    VALUES (
      new_user_id,
      'admin@ts',
      'admin'
    );
  END IF;
END $$;