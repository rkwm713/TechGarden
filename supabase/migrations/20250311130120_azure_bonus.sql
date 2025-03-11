/*
  # Create tasks management tables

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `status` (task_status enum: 'open', 'assigned', 'completed')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references profiles)
      - `assigned_to` (uuid, references profiles)
      - `due_date` (timestamp)
      - `priority` (text: 'low', 'medium', 'high')

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for different user roles:
      - Admins can do everything
      - Mods can create and manage tasks
      - Regular users can view tasks and volunteer
*/

-- Create task status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('open', 'assigned', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status task_status NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  due_date timestamptz,
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium'
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins have full access to tasks" ON tasks;
  DROP POLICY IF EXISTS "Mods can create tasks" ON tasks;
  DROP POLICY IF EXISTS "Mods can update tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can view all tasks" ON tasks;
  DROP POLICY IF EXISTS "Users can volunteer for open tasks" ON tasks;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Policies

-- Admin policies (full access)
CREATE POLICY "Admins have full access to tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Mod policies
CREATE POLICY "Mods can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'mod'
  ));

CREATE POLICY "Mods can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'mod'
  ));

-- Regular user policies
CREATE POLICY "Users can view all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can volunteer for open tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ruser'
    )
  )
  WITH CHECK (
    status = 'assigned' AND
    assigned_to = auth.uid()
  );