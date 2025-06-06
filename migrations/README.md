# Database Migrations

This folder contains SQL migration files for the Puros application. Each migration is numbered sequentially and should be run in order.

## Migration Files

| File | Description | Status |
|------|-------------|---------|
| `001_create_profiles_table.sql` | Creates the profiles table with RLS policies | ⏳ Pending |
| `002_create_storage_bucket.sql` | Creates storage bucket for profile images | ⏳ Pending |

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order
4. Execute each migration one by one
5. Mark the migration as completed in the table above

**Note**: If you get permission errors, you can create the storage bucket through the Supabase Dashboard UI instead.

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db reset
# This will run all migrations in the migrations folder
```

### Option 3: Manual Execution
```bash
# Connect to your database and run each file
psql -h your-db-host -U postgres -d postgres -f migrations/001_create_profiles_table.sql
psql -h your-db-host -U postgres -d postgres -f migrations/002_create_storage_bucket.sql
```

## Migration Naming Convention

Migrations should follow this naming pattern:
```
XXX_description_of_change.sql
```

Where:
- `XXX` is a 3-digit sequential number (001, 002, 003, etc.)
- `description_of_change` is a brief description using underscores
- Always use `.sql` extension

## Adding New Migrations

When adding new migrations:

1. **Create a new file** with the next sequential number
2. **Add a header comment** with migration info:
   ```sql
   -- Migration: XXX_migration_name.sql
   -- Description: Brief description of what this migration does
   -- Date: YYYY-MM-DD
   ```
3. **Update this README** with the new migration in the table above
4. **Test the migration** on a development database first
5. **Document any rollback procedures** if needed

## Important Notes

- ⚠️ **Always backup your database** before running migrations in production
- ⚠️ **Test migrations** on a development environment first
- ⚠️ **Run migrations in order** - never skip or reorder them
- ⚠️ **Don't modify existing migration files** once they've been run in production
- ✅ **Create new migrations** for any schema changes instead of modifying existing ones

## Rollback Procedures

If you need to rollback a migration, create a new migration file that reverses the changes. For example:

- `003_add_user_preferences.sql` (adds a column)
- `004_rollback_user_preferences.sql` (removes the column)

## Current Schema State

After running all migrations, your database will have:

- ✅ `profiles` table with user profile information
- ✅ Row Level Security policies for profiles
- ✅ `profile-pictures` storage bucket
- ✅ Storage policies for profile picture uploads

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Make sure you're running as a superuser or have the necessary permissions
2. **Policy Already Exists**: Check if the migration was already run
3. **Storage Bucket Exists**: The bucket creation might fail if it already exists

### Checking Migration Status:

```sql
-- Check if profiles table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'profiles'
);

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'profile-pictures';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
``` 