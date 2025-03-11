/*
  # Fix Plot Plants RLS Policies

  1. Changes
    - Update RLS policies for plot_plants table
    - Fix policy for managing plants to properly handle plot ownership
    - Ensure admins and mods can manage all plants
    - Allow plot owners to manage their own plants

  2. Security
    - Enable RLS on plot_plants table
    - Add policies for:
      - Viewing plants (all authenticated users)
      - Managing plants (plot owners, admins, and mods)
*/

-- Enable RLS
ALTER TABLE plot_plants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view plot plants" ON plot_plants;
DROP POLICY IF EXISTS "Authorized users can manage plants" ON plot_plants;

-- Allow all authenticated users to view plants
CREATE POLICY "Anyone can view plot plants"
ON plot_plants
FOR SELECT
TO authenticated
USING (true);

-- Allow plot owners, admins, and mods to manage plants
CREATE POLICY "Authorized users can manage plants"
ON plot_plants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM plots p
    JOIN profiles pr ON pr.id = auth.uid()
    WHERE 
      p.id = plot_plants.plot_id 
      AND (
        -- Plot owner
        p.assigned_to = auth.uid()
        -- Admin or mod
        OR pr.role IN ('admin', 'mod')
      )
  )
);