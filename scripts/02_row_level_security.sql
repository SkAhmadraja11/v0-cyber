-- Row Level Security (RLS) Policies
-- Run this after creating tables

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Scan results policies
CREATE POLICY "Users can view own scans" ON public.scan_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON public.scan_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all scans" ON public.scan_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Threat intel policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view threat intel" ON public.threat_intel
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage threat intel" ON public.threat_intel
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- API usage policies
CREATE POLICY "Users can view own API usage" ON public.api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage" ON public.api_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all API usage" ON public.api_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
