# Production Database Fix - Step by Step

## 🚨 Issue
Production database is missing `user_activations` table, causing signup failures.

## 🔧 Quick Fix

### Option 1: Run SQL via Supabase Dashboard (Recommended)

1. **Go to**: [supabase.com](https://supabase.com) → Your Project
2. **Open**: SQL Editor
3. **Copy and paste** this SQL:

```sql
-- Create user_activations table
CREATE TABLE IF NOT EXISTS public.user_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  activation_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  is_activated BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activation_token),
  UNIQUE(email)
);

-- Add is_activated to profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;

-- Enable RLS
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "System can manage activations" ON public.user_activations FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activations_token ON public.user_activations(activation_token);
CREATE INDEX IF NOT EXISTS idx_user_activations_email ON public.user_activations(email);
```

4. **Click "RUN"**
5. **Wait for success message**

### Option 2: Use API Endpoint

1. **Visit**: `https://next-gen-cyber.vercel.app/api/fix-database`
2. **Click "Send"** (POST request)
3. **Wait for success response**

### Option 3: Use Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Run migration
supabase db push --db-url your-production-db-url
```

## 🔍 Verify Fix

After running SQL, test:

1. **Visit**: `https://next-gen-cyber.vercel.app/auth/sign-up`
2. **Enter email** → Should send activation email
3. **Check email** → Should receive activation link
4. **Click link** → Should show password creation page
5. **Set password** → Should create account successfully

## 📋 What This Fixes

- ✅ **user_activations table** created in production
- ✅ **is_activated column** added to profiles
- ✅ **Row Level Security** policies enabled
- ✅ **Database indexes** created for performance
- ✅ **Two-step signup** will work in production

## 🚀 After Fix

Your production application will have:
- **Email verification before account creation**
- **Secure two-step signup process**
- **MFA authentication** capability
- **Login notification emails**
- **Full authentication system** working

**Run the SQL fix in Supabase Dashboard now!** 🔧
