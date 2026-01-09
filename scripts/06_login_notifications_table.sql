-- Login Notifications Table
-- Records login attempts and sends confirmation emails

CREATE TABLE IF NOT EXISTS public.login_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  notification_type TEXT DEFAULT 'login_confirmation' CHECK (notification_type IN ('login_confirmation', 'suspicious_activity')),
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_notifications_user_id ON public.login_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_login_notifications_email ON public.login_notifications(email);

-- Enable Row Level Security
ALTER TABLE public.login_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own login notifications
CREATE POLICY "Users can view own login notifications" ON public.login_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: System can insert login notifications
CREATE POLICY "System can insert login notifications" ON public.login_notifications
  FOR INSERT WITH CHECK (true);

-- Comment for documentation
COMMENT ON TABLE public.login_notifications IS 'Tracks user login activities for security notifications';
COMMENT ON COLUMN public.login_notifications.notification_type IS 'Type of notification: login_confirmation or suspicious_activity';
COMMENT ON COLUMN public.login_notifications.is_sent IS 'Whether the email notification has been sent';
