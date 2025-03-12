# Supabase Backend

This directory contains the Supabase configuration and database migrations for the TechGarden application. Supabase provides a complete backend solution with PostgreSQL database, authentication, storage, and real-time capabilities.

## 🗄️ Database Architecture

The TechGarden database is built on PostgreSQL and structured around the following core entities:

### Core Entities

1. **Users**
   - Managed through Supabase Auth
   - Extended profile information in `profiles` table
   - Connected to plots, tasks, events, and messages

2. **Plots**
   - Garden plots available for assignment
   - Plot status tracking
   - Plot assignment history

3. **Events**
   - Community events
   - Event registration
   - Event categories

4. **Tasks**
   - Garden maintenance tasks
   - Task assignments
   - Task completion tracking

5. **Messaging**
   - Conversations between users
   - Message storage
   - Conversation participants

### Schema Design

The database follows these design principles:
- Foreign key relationships for data integrity
- Row Level Security (RLS) policies for data protection
- Triggers for automatic operations
- Indexes for query performance

## 📁 Directory Structure

```
supabase/
├── config.toml        # Supabase configuration
├── migrations/        # Database migrations
│   └── ...            # Migration files
└── .gitignore         # Git ignore rules
```

## 🔄 Migration System

The `migrations` directory contains SQL migration files that define the database schema and its evolution over time. Each migration file has a timestamp prefix and descriptive name.

### Migration Naming Convention

```
YYYYMMDDHHMMSS_descriptive_name.sql
```

Example: `20250311121532_initial_schema.sql`

### Migration Process

1. Create a new migration file with `supabase migration new`
2. Write SQL to define schema changes
3. Apply migrations with `supabase db push`
4. Commit the migration file to version control

Migrations ensure consistent database schema across all environments and maintain a history of database changes.

## 🔒 Security Implementation

### Row Level Security (RLS)

Supabase uses PostgreSQL's Row Level Security to control access to data:

```sql
-- Example RLS policy (simplified)
CREATE POLICY "Users can only view their own data"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);
```

### Authentication

- User authentication through Supabase Auth
- JWT tokens for authenticated requests
- Role-based access control

### Data Validation

- Check constraints for data validation
- Triggers for complex validation logic
- Stored procedures for controlled data operations

## 🔌 Real-time Capabilities

Supabase provides real-time functionality through PostgreSQL's LISTEN/NOTIFY system:

- Real-time updates for messages
- Live plot status changes
- Event updates
- Task assignments notifications

## 🛠️ Local Development

Setting up local development with Supabase:

1. Install Supabase CLI:
   ```
   npm install -g supabase
   ```

2. Start local Supabase instance:
   ```
   supabase start
   ```

3. Apply migrations:
   ```
   supabase db push
   ```

4. Set environment variables:
   ```
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   ```

## 🔄 Database Evolution

As the TechGarden application evolves, new migrations are added to update the database schema. When adding new features that require database changes:

1. Create a new migration file
2. Write SQL for the required changes
3. Update type definitions in the frontend
4. Apply migrations to all environments

## 📊 Database Diagram

The database structure can be visualized as a relational schema:

```
users (from auth.users)
 │
 ├─> profiles
 │    │
 │    └─> user_settings
 │
 ├─> plot_assignments
 │    │
 │    └─> plots
 │
 ├─> task_assignments
 │    │
 │    └─> tasks
 │
 ├─> event_attendees
 │    │
 │    └─> events
 │
 └─> conversation_participants
      │
      └─> conversations
           │
           └─> messages
```

## 🔍 Debugging and Monitoring

The Supabase dashboard provides tools for:
- Query inspection
- Database performance monitoring
- Authentication logs
- Storage usage
- Real-time subscription tracking

## 🚀 Deployment

The production database is deployed on Supabase's managed platform:
- Automatic backups
- High availability
- Scaling capabilities
- Monitoring and alerting

## 📝 Adding New Features

When adding new database features:
1. Design the data model
2. Create migrations
3. Implement RLS policies
4. Update TypeScript types
5. Test thoroughly before deployment
