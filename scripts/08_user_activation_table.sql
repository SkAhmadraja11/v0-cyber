-- User Account Activation Table
-- Tracks account activation status before authentication is allowed

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activations_token ON public.user_activations(activation_token);
CREATE INDEX IF NOT EXISTS idx_user_activations_user_id ON public.user_activations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_email ON public.user_activations(email);

-- Enable Row Level Security
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own activations
CREATE POLICY "Users can manage own activations" ON public.user_activations
  FOR ALL USING (auth.uid() = user_id);

-- Policy: System can insert activations
CREATE POLICY "System can insert activations" ON public.user_activations
  FOR INSERT WITH CHECK (true);

-- Add activation status to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;

-- Comment for documentation
COMMENT ON TABLE public.user_activations IS 'User account activation tokens for secure onboarding';
COMMENT ON COLUMN public.user_activations.activation_token IS 'Unique token for email activation (24 hour expiry)';
COMMENT ON COLUMN public.profiles.is_activated IS 'Whether user has activated their account via email';
