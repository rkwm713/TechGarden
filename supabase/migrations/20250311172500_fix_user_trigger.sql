/*
  # Fix handle_new_user trigger function

  1. Changes
    - Update handle_new_user function to include role and username fields
    - The username field is required and was causing "Database error saving new user"
    - Using email as default username

  2. Security
    - Maintains existing security model
*/

-- Drop the existing function with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate the function with both role AND username fields
CREATE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, username)
  VALUES (new.id, new.email, 'ruser', new.email); -- Using email as default username
  RETURN new;
END;
$function$;

-- Recreate the trigger that was dropped by CASCADE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
