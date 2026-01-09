-- Email Confirmation Table
-- Tracks email confirmation tokens for secure authentication

CREATE TABLE IF NOT EXISTS public.email_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  confirmation_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  is_confirmed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(confirmation_token)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_confirmations_token ON public.email_confirmations(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_user_id ON public.email_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_email ON public.email_confirmations(email);

-- Enable Row Level Security
ALTER TABLE public.email_confirmations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own confirmations
CREATE POLICY "Users can manage own email confirmations" ON public.email_confirmations
  FOR ALL USING (auth.uid() = user_id);

-- Policy: System can insert confirmations
CREATE POLICY "System can insert email confirmations" ON public.email_confirmations
  FOR INSERT WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE public.email_confirmations IS 'Email confirmation tokens for secure authentication';
COMMENT ON COLUMN public.email_confirmations.confirmation_token IS 'Unique token for email confirmation';
COMMENT ON COLUMN public.email_confirmations.expires_at IS 'Token expiration time (1 hour)';
