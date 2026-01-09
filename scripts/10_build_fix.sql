-- Minimal Fix for Build Issues
-- Run this if you're getting build errors

-- Check if uuid-ossp extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure user_activations table exists with proper schema
CREATE TABLE IF NOT EXISTS public.user_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  activation_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  is_activated BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activation_token)
);

-- Add is_activated to profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;

-- Enable RLS if not already enabled
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage own activations" ON public.user_activations;
DROP POLICY IF EXISTS "System can insert activations" ON public.user_activations;
DROP POLICY IF EXISTS "System can update activations" ON public.user_activations;

-- Create policies
CREATE POLICY "Users can manage own activations" ON public.user_activations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "System can insert activations" ON public.user_activations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update activations" ON public.user_activations
  FOR UPDATE USING (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_activations_token ON public.user_activations(activation_token);
CREATE INDEX IF NOT EXISTS idx_user_activations_user_id ON public.user_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_email ON public.user_activations(email);

-- Test the setup
SELECT 'Database schema fixed for two-step signup!' as result;
