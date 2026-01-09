-- Production Database Fix
-- Create missing user_activations table in production

-- Check if uuid-ossp extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Add is_activated to profiles table if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;

-- Enable Row Level Security
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activations_token ON public.user_activations(activation_token);
CREATE INDEX IF NOT EXISTS idx_user_activations_user_id ON public.user_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_email ON public.user_activations(email);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_activations_updated_at 
  BEFORE UPDATE ON public.user_activations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test setup
SELECT 'user_activations table created successfully!' as result;
