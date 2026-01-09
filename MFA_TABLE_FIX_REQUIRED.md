# Database Setup Required - MFA Table Missing

## 🚨 Error Analysis
The error `Could not find table 'public.user_mfa' in schema cache` means the MFA table doesn't exist in your Supabase database.

## 🔧 Solution: Run Database Migration

You need to run the SQL script in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard
1. Navigate to [supabase.com](https://supabase.com)
2. Go to your project
3. Click on "SQL Editor" in the sidebar

### Step 2: Run MFA Table Creation Script

Copy and paste this entire script into the SQL Editor:

```sql
-- MFA (Multi-Factor Authentication) Table
-- Add this to your existing database schema

-- Create user_mfa table
CREATE TABLE IF NOT EXISTS public.user_mfa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[], -- Array of hashed backup codes
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_mfa_user_id ON public.user_mfa(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own MFA data
CREATE POLICY "Users can manage their own MFA" ON public.user_mfa
  FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_mfa_updated_at BEFORE UPDATE ON public.user_mfa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Execute the Script
1. Click the **"Run"** button in the SQL Editor
2. Wait for execution to complete
3. You should see "Success" message

### Step 4: Verify Table Creation
Run this query to verify the table was created:

```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_mfa';
```

You should see: `user_mfa | BASE TABLE`

## 🔄 After Setup

Once the table is created:

1. **Restart your development server**: `npm run dev`
2. **Try MFA enrollment again**: Go to `/auth/sign-up` → Create account → MFA setup
3. **Should work without errors**: The database error will be resolved

## 📋 Alternative: Run Complete Migration

If you want to set up all tables at once, you can also run:

```sql
-- File: scripts/04_create_mfa_table.sql
```

## 🎯 Expected Result

After running the database migration:
- ✅ MFA enrollment should work without database errors
- ✅ Users can set up TOTP authentication
- ✅ Backup codes will be generated and stored
- ✅ Login confirmation emails will be sent

The MFA table creation is the **missing piece** preventing your authentication system from working! 🚀
