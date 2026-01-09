-- QUICK FIX - Copy & Paste This in Supabase SQL Editor

-- Create the missing user_mfa table
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

-- Enable security
ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;

-- Allow users to access their own data
CREATE POLICY "Users can manage their own MFA" ON public.user_mfa
  FOR ALL USING (auth.uid() = user_id);

-- Add index for speed
CREATE INDEX idx_user_mfa_user_id ON public.user_mfa(user_id);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_mfa_updated_at 
  BEFORE UPDATE ON public.user_mfa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test the table
SELECT 'MFA table created successfully!' as result;
