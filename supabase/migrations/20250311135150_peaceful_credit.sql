/*
  # Fix Plot Plants Policies

  1. Changes
    - Add proper RLS policies for plot_plants table
    - Ensure plot owners and admins/mods can manage plants
    - Allow authenticated users to view plants

  2. Security
    - Enable RLS on plot_plants table
    - Add policies for:
      - Viewing plants (all authenticated users)
      - Managing plants (plot owners, admins, and mods)
*/

-- Enable RLS
ALTER TABLE plot_plants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view plot plants" ON plot_plants;
DROP POLICY IF EXISTS "Plot owners can manage their plants" ON plot_plants;

-- Allow all authenticated users to view plants
CREATE POLICY "Anyone can view plot plants"
ON plot_plants
FOR SELECT
TO authenticated
USING (true);

-- Allow plot owners, admins, and mods to manage plants
CREATE POLICY "Authorized users can manage plants"
ON plot_plants
USING (
  EXISTS (
    SELECT 1 FROM plots p
    JOIN profiles pr ON pr.id = p.assigned_to
    WHERE 
      p.id = plot_plants.plot_id 
      AND (
        -- Plot owner
        p.assigned_to = auth.uid()
        -- Admin or mod
        OR pr.role IN ('admin', 'mod')
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM plots p
    JOIN profiles pr ON pr.id = p.assigned_to
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