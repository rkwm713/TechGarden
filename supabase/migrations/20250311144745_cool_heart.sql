/*
  # Create events table and policies

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `start_date` (timestamptz, required)
      - `end_date` (timestamptz)
      - `location` (text)
      - `max_participants` (integer)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `events` table
    - Add policies for:
      - Admins and mods can manage all events
      - All authenticated users can view events
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  max_participants integer,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Trigger for updating updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Policies
CREATE POLICY "Admins and mods can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mod')
    )
  );

CREATE POLICY "All users can view events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);