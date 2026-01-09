# 🚨 "Failed to create activation token" - Database Fix

## 🔍 Problem
The `user_activations` table doesn't exist in your production Supabase database.

## 🔧 Immediate Fix

### Step 1: Run SQL in Supabase Dashboard

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

-- Test setup
SELECT 'user_activations table created successfully!' as result;
```

4. **Click "RUN"**
5. **Wait for success message**

### Step 2: Test the Fix

1. **Visit**: `https://next-gen-cyber.vercel.app/auth/sign-up`
2. **Enter your email**
3. **Should receive activation email**
4. **Click activation link**
5. **Set password and create account**

## 🔍 Verification

After running SQL, you can verify:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_activations';

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_activations' 
ORDER BY ordinal_position;
```

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

**Run the SQL fix in Supabase Dashboard now to resolve the activation token error!** 🔧
