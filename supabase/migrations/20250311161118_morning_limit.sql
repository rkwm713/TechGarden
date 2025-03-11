/*
  # Add plot assignments and task assignments

  1. New Tables
    - `plot_assignments`
      - `id` (uuid, primary key)
      - `plot_id` (uuid, references plots)
      - `user_id` (uuid, references profiles)
      - `role` (text, e.g., 'primary', 'helper')
      - `created_at` (timestamp)

  2. Changes
    - Add task assignment fields
      - `assigned_by` to track who assigned the task
      - `assigned_at` to track when the task was assigned

  3. Security
    - Enable RLS on new tables
    - Add policies for plot assignments
    - Update task policies
*/

-- Create plot assignments table
CREATE TABLE IF NOT EXISTS plot_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id uuid REFERENCES plots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('primary', 'helper')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(plot_id, user_id)
);

-- Enable RLS
ALTER TABLE plot_assignments ENABLE ROW LEVEL SECURITY;

-- Add task assignment tracking
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- Policies for plot assignments

-- Admins and mods can manage all assignments
CREATE POLICY "Admins and mods can manage plot assignments"
ON plot_assignments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'mod')
  )
);

-- Users can view their own assignments
CREATE POLICY "Users can view their plot assignments"
ON plot_assignments
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'mod')
  )
);

-- Update task policies to consider assigned_by
CREATE POLICY "Users can see who assigned tasks"
ON tasks
FOR SELECT
TO authenticated
USING (true);

-- Function to handle plot assignment changes
CREATE OR REPLACE FUNCTION handle_plot_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a primary assignment, update the plots.assigned_to
  IF NEW.role = 'primary' THEN
    UPDATE plots 
    SET assigned_to = NEW.user_id
    WHERE id = NEW.plot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for plot assignments
CREATE TRIGGER plot_assignment_trigger
AFTER INSERT OR UPDATE ON plot_assignments
FOR EACH ROW
EXECUTE FUNCTION handle_plot_assignment();