/*
  # Add Sample Garden Plots

  1. Sample Data
    - Creates 72 plots (6 rows × 12 columns)
    - Each plot is 7.5' × 7.5'
    - Total garden size: 45' × 90'
    - Includes sample plants for some plots
*/

-- Insert sample plots
DO $$
DECLARE
  plot_id uuid;
BEGIN
  FOR i IN 1..72 LOOP
    INSERT INTO plots (number, size, soil_ph, sunlight, soil_type, irrigation)
    VALUES (
      i::text,
      '7.5'' × 7.5''',
      6.5 + (random() * 1.0),
      CASE (random() * 3)::int
        WHEN 0 THEN 'Full Sun'
        WHEN 1 THEN 'Partial Shade'
        ELSE 'Full Shade'
      END,
      CASE (random() * 2)::int
        WHEN 0 THEN 'Loamy'
        WHEN 1 THEN 'Sandy Loam'
        ELSE 'Clay Loam'
      END,
      CASE (random() * 2)::int
        WHEN 0 THEN 'Drip'
        WHEN 1 THEN 'Sprinkler'
        ELSE 'Manual'
      END
    )
    RETURNING id INTO plot_id;

    -- Add sample plants to some plots
    IF random() < 0.3 THEN
      INSERT INTO plot_plants (plot_id, plant_name, status, planted_date)
      VALUES (
        plot_id,
        CASE (random() * 4)::int
          WHEN 0 THEN 'Tomatoes'
          WHEN 1 THEN 'Peppers'
          WHEN 2 THEN 'Lettuce'
          WHEN 3 THEN 'Carrots'
          ELSE 'Herbs'
        END,
        CASE (random() * 4)::int
          WHEN 0 THEN 'seeded'
          WHEN 1 THEN 'sprouting'
          WHEN 2 THEN 'growing'
          WHEN 3 THEN 'harvesting'
          ELSE 'finished'
        END,
        current_date - (random() * 30)::int * interval '1 day'
      );
    END IF;
  END LOOP;
END $$;