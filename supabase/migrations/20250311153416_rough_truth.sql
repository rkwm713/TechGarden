/*
  # Create Garden Rules Table

  1. New Tables
    - `rules`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `category` (text, not null)
      - `order` (integer, not null)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references profiles)

  2. Security
    - Enable RLS on `rules` table
    - Add policies for:
      - Everyone can read rules
      - Admins and mods can manage rules
*/

CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Add a check constraint for valid categories
ALTER TABLE rules
  ADD CONSTRAINT rules_category_check
  CHECK (category = ANY (ARRAY['general', 'safety', 'plots', 'community']));

-- Enable RLS
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view rules"
  ON rules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and mods can manage rules"
  ON rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mod')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'mod')
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some default rules
INSERT INTO rules (title, description, category, "order") VALUES
('Respect Plot Boundaries', 'Always stay within your assigned plot boundaries and do not interfere with neighboring plots without permission.', 'general', 1),
('Organic Practices Only', 'Use only organic fertilizers and pest control methods. No synthetic chemicals are allowed.', 'general', 2),
('Keep Paths Clear', 'Maintain clear pathways between plots. Do not store equipment or debris in common areas.', 'safety', 1),
('Tool Safety', 'Return all borrowed tools to the shed and report any damage. Keep tools away from pathways.', 'safety', 2),
('Regular Maintenance', 'Maintain your plot regularly, including weeding and harvesting. Neglected plots may be reassigned.', 'plots', 1),
('Water Conservation', 'Use water responsibly. Water early morning or late evening to minimize evaporation.', 'plots', 2),
('Community Support', 'Participate in community workdays and events when possible. Share knowledge and help fellow gardeners.', 'community', 1),
('Harvest Sharing', 'Consider sharing excess produce with the community or local food banks.', 'community', 2);