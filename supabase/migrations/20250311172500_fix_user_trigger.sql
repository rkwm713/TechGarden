/*
  # Fix handle_new_user trigger function

  1. Changes
    - Update handle_new_user function to explicitly include role field
    - This fixes the "Database error saving new user" issue

  2. Security
    - Maintains existing security model
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with the role field included
CREATE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'ruser');
  RETURN new;
END;
$function$;
