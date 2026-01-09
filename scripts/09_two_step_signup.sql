-- Update user_activations table to allow null user_id
-- This enables the two-step signup process

-- Drop existing table if it exists (for fresh setup)
DROP TABLE IF EXISTS public.user_activations CASCADE;

-- Recreate table with proper schema for two-step signup
CREATE TABLE public.user_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Can be null initially
  email TEXT NOT NULL,
  activation_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  is_activated BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(activation_token),
  UNIQUE(email) -- One activation per email at a time
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activations_token ON public.user_activations(activation_token);
CREATE INDEX IF NOT EXISTS idx_user_activations_user_id ON public.user_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_email ON public.user_activations(email);

-- Enable Row Level Security
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own activations
CREATE POLICY "Users can manage own activations" ON public.user_activations
  FOR ALL USING (auth.uid() = user_id);

-- Policy: System can insert activations (for initial signup)
CREATE POLICY "System can insert activations" ON public.user_activations
  FOR INSERT WITH CHECK (true);

-- Policy: System can update activations (for account creation)
CREATE POLICY "System can update activations" ON public.user_activations
  FOR UPDATE USING (true);

-- Add activation status to profiles table (if not exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;

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

-- Comment for documentation
COMMENT ON TABLE public.user_activations IS 'User account activation tokens for secure two-step signup';
COMMENT ON COLUMN public.user_activations.user_id IS 'User ID (null until account is created)';
COMMENT ON COLUMN public.user_activations.activation_token IS 'Unique token for email activation (24 hour expiry)';
COMMENT ON COLUMN public.profiles.is_activated IS 'Whether user has activated their account via email';

-- Test the table
SELECT 'User activations table updated for two-step signup!' as result;
