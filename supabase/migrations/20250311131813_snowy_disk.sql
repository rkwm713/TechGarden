/*
  # Garden Plots Schema

  1. New Tables
    - `plots`
      - `id` (uuid, primary key)
      - `number` (text, unique plot identifier)
      - `size` (text, plot dimensions)
      - `soil_ph` (numeric, soil pH level)
      - `sunlight` (text, amount of sunlight)
      - `soil_type` (text, type of soil)
      - `irrigation` (text, irrigation details)
      - `notes` (text, plot-specific notes)
      - `assigned_to` (uuid, reference to profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `plot_plants`
      - `id` (uuid, primary key)
      - `plot_id` (uuid, reference to plots)
      - `plant_name` (text, name of plant)
      - `status` (text, growing status)
      - `planted_date` (date)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading and managing plots
*/

-- Create plots table
CREATE TABLE IF NOT EXISTS plots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  size text NOT NULL,
  soil_ph numeric NOT NULL,
  sunlight text NOT NULL,
  soil_type text NOT NULL,
  irrigation text NOT NULL,
  notes text,
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plot_plants table
CREATE TABLE IF NOT EXISTS plot_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id uuid REFERENCES plots(id) ON DELETE CASCADE NOT NULL,
  plant_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('seeded', 'sprouting', 'growing', 'harvesting', 'finished')),
  planted_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_plants ENABLE ROW LEVEL SECURITY;

-- Plots policies
CREATE POLICY "Anyone can view plots"
  ON plots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage plots"
  ON plots
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Plot plants policies
CREATE POLICY "Anyone can view plot plants"
  ON plot_plants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Plot owners can manage their plants"
  ON plot_plants
  USING (
    EXISTS (
      SELECT 1 FROM plots
      WHERE plots.id = plot_plants.plot_id
      AND plots.assigned_to = auth.uid()
    )
  );

-- Update trigger for plots
CREATE TRIGGER update_plots_updated_at
  BEFORE UPDATE ON plots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for plot_plants
CREATE TRIGGER update_plot_plants_updated_at
  BEFORE UPDATE ON plot_plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();