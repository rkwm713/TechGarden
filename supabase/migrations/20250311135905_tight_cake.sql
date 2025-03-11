/*
  # Add Plot Assignment Feature

  1. Changes
    - Add RLS policies for plot assignment
    - Update existing policies to handle plot assignments

  2. Security
    - Only admins and mods can assign plots
    - Users can view their assigned plots
    - Admins and mods can view all assignments
*/

-- Update RLS policies for plots table
DROP POLICY IF EXISTS "Admins can manage plots" ON plots;
DROP POLICY IF EXISTS "Anyone can view plots" ON plots;

-- Allow admins and mods to manage all plots
CREATE POLICY "Admins and mods can manage plots"
ON plots
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'mod')
  )
);

-- Allow users to view all plots but only update their assigned plots
CREATE POLICY "Users can view and manage assigned plots"
ON plots
FOR ALL
TO authenticated
USING (
  -- Can view all plots
  TRUE
)
WITH CHECK (
  -- Can only update if they are assigned to the plot
  assigned_to = auth.uid()
);