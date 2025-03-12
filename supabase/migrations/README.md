# Database Migrations

This directory contains SQL migration files that define and evolve the database schema for the TechGarden application. Migrations provide a version-controlled approach to database schema changes.

## 📋 Migration Overview

Migrations in this project follow a chronological order, with each file representing a discrete change to the database schema. Migration files are automatically generated with a timestamp prefix using the Supabase CLI.

## 📂 Migration Files

The migration files in this directory show the evolution of the TechGarden database:

### Initial Schema Setup
- `20250311121532_graceful_mountain.sql` - Initial schema setup
- `20250311122053_yellow_cherry.sql` - Core table definitions

### User and Authentication System
- `20250311125151_fancy_hill.sql` - User profiles and settings
- `20250311125342_fancy_breeze.sql` - Authentication RLS policies
- `20250311125731_throbbing_dune.sql` - User role management

### Plot Management System
- `20250311130120_azure_bonus.sql` - Plot definitions and attributes
- `20250311131813_snowy_disk.sql` - Plot assignment and status tracking
- `20250311132022_fragrant_moon.sql` - Plot history and tracking

### Event System
- `20250311134137_spring_bush.sql` - Events table and relationships
- `20250311135150_peaceful_credit.sql` - Event registration system
- `20250311135350_scarlet_shadow.sql` - Event categories and tags

### Task Management System
- `20250311135905_tight_cake.sql` - Tasks table and relationships
- `20250311141331_still_coast.sql` - Task assignments and tracking
- `20250311144745_cool_heart.sql` - Task categories and priority system

### Fixes and Optimizations
- `20250311153416_rough_truth.sql` - Performance indexes
- `20250311155509_precious_leaf.sql` - Bug fixes and constraint refinements
- `20250311155804_orange_resonance.sql` - Additional RLS policies
- `20250311161118_morning_limit.sql` - Trigger optimizations
- `20250311172500_fix_user_trigger.sql` - Fix for user creation trigger

### Messaging System
- `20250312075700_add_messaging_system.sql` - Conversations and messages tables

## 🔧 Migration Process

### Creating a New Migration

```bash
# Generate a new migration file
supabase migration new my_migration_name

# This creates a timestamped file:
# YYYYMMDDHHMMSS_my_migration_name.sql
```

### Writing Migrations

Migrations are written in standard PostgreSQL syntax and can include:
- Table creation/alteration
- Index creation
- Function and trigger definitions
- RLS policy definitions
- Seed data insertion

Example migration:
```sql
-- Create new table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policy
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events" 
ON public.events
FOR SELECT
USING (true);

CREATE POLICY "Only creators can update events" 
ON public.events
FOR UPDATE
USING (auth.uid() = created_by);
```

### Applying Migrations

```bash
# Apply migrations to local Supabase
supabase db push

# Reset database (caution: deletes all data)
supabase db reset
```

## 🔍 Best Practices

1. **One Change Per Migration**: Each migration should focus on a single logical change
2. **Idempotent When Possible**: Migrations should be able to run multiple times without error
3. **Up and Down**: Consider adding down migrations for reverting changes
4. **Test First**: Test migrations on development before applying to production
5. **Avoid Data Loss**: Be careful with DROP and ALTER that might cause data loss

## 🔒 Security Considerations

- RLS policies should be defined in the same migration as their tables
- Always enable RLS on tables containing sensitive data
- Use function-based RLS for complex permission logic
- Define appropriate permissions for all CRUD operations

## 🔄 Migration Strategies

### Schema Changes

For simple schema changes:
```sql
-- Add a column
ALTER TABLE public.tasks ADD COLUMN priority INTEGER DEFAULT 1;

-- Modify a column
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;
```

### Data Migrations

For moving or transforming data:
```sql
-- Update existing data
UPDATE public.profiles 
SET display_name = username 
WHERE display_name IS NULL;
```

### Function Updates

For updating stored procedures:
```sql
-- Drop and recreate function
DROP FUNCTION IF EXISTS public.get_user_tasks;

CREATE OR REPLACE FUNCTION public.get_user_tasks(user_id UUID)
RETURNS SETOF public.tasks
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.tasks
  WHERE assignee_id = user_id
  ORDER BY created_at DESC;
$$;
```

## 📊 Database Versioning

The migration system ensures that the database schema version matches the application version. This provides:
- Consistent environments across development, staging, and production
- Easy rollback to previous schemas if needed
- Clear documentation of database changes
- Reliable deployment process
