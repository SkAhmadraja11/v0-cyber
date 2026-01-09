-- MINIMAL MFA TABLE CREATION
-- Copy this EXACT script to Supabase SQL Editor and click RUN

CREATE TABLE public.user_mfa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own MFA" ON public.user_mfa
  FOR ALL USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_user_mfa_user_id ON public.user_mfa(user_id);

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_user_mfa_updated_at 
  BEFORE UPDATE ON public.user_mfa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
