/*
  # Add plot type to plots table

  1. Changes
    - Add plot_type column to plots table with allowed values:
      - Ground Planted
      - Raised Bed
      - Pathway
      - Sitting Area
      - Available
    - Set default value to 'Available'
    - Update existing rows to have 'Available' as plot_type
*/

DO $$ BEGIN
  -- Create the enum type if it doesn't exist
  CREATE TYPE plot_type AS ENUM (
    'Ground Planted',
    'Raised Bed',
    'Pathway',
    'Sitting Area',
    'Available'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add the plot_type column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plots' AND column_name = 'plot_type'
  ) THEN
    ALTER TABLE plots
    ADD COLUMN plot_type plot_type NOT NULL DEFAULT 'Available';
  END IF;
END $$;