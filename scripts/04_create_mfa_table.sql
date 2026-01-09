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
