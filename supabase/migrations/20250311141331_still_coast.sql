/*
  # Add plot reference to tasks

  1. Changes
    - Add plot_id column to tasks table
    - Add foreign key constraint to plots table
    - Update RLS policies to allow plot access

  2. Security
    - Maintain existing RLS policies
    - Add plot reference validation
*/

-- Add plot_id column with foreign key constraint
ALTER TABLE tasks
ADD COLUMN plot_id uuid REFERENCES plots(id);

-- Update RLS policies to include plot access
CREATE POLICY "Users can view tasks for their assigned plots"
ON tasks
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM plots
    WHERE plots.id = tasks.plot_id
    AND plots.assigned_to = auth.uid()
  ))
  OR
  (created_by = auth.uid())
  OR
  (assigned_to = auth.uid())
  OR
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'mod')
  ))
);