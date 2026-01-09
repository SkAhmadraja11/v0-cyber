-- MFA Table Creation Script
-- Copy this entire script and run in Supabase SQL Editor

-- First, check if the function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own MFA" ON public.user_mfa;

-- Policy: Users can only access their own MFA data
CREATE POLICY "Users can manage their own MFA" ON public.user_mfa
  FOR ALL USING (auth.uid() = user_id);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_mfa_updated_at ON public.user_mfa;

-- Add trigger for updated_at
CREATE TRIGGER update_user_mfa_updated_at BEFORE UPDATE ON public.user_mfa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT 'user_mfa table created successfully' as status;
