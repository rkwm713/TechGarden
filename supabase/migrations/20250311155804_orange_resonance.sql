/*
  # Add username field to profiles table

  1. Changes
    - Add username column to profiles table
    - Make username unique and not null
    - Set default username to email address
    - Add index for username lookups

  2. Notes
    - Existing profiles will have their email as username initially
    - Username can be changed later through the UI
*/

-- Add username column with email as default
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text;
    
    -- Update existing rows to use email as username
    UPDATE profiles SET username = email WHERE username IS NULL;
    
    -- Make username required and unique
    ALTER TABLE profiles 
      ALTER COLUMN username SET NOT NULL,
      ADD CONSTRAINT profiles_username_key UNIQUE (username);
    
    -- Add index for username lookups
    CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
  END IF;
END $$;