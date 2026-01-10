-- Domain Analysis Table
-- Stores WHOIS-based domain age and registration analysis

CREATE TABLE IF NOT EXISTS public.domain_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL,
    age_days INTEGER NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registrar TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('safe', 'suspicious', 'phishing')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    analysis_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_domain_analyses_domain ON public.domain_analyses(domain);
CREATE INDEX IF NOT EXISTS idx_domain_analyses_status ON public.domain_analyses(status);
CREATE INDEX IF NOT EXISTS idx_domain_analyses_analysis_time ON public.domain_analyses(analysis_time);

-- RLS (Row Level Security) Policies
ALTER TABLE public.domain_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own domain analyses
CREATE POLICY "Users can view own domain analyses" ON public.domain_analyses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own domain analyses
CREATE POLICY "Users can insert own domain analyses" ON public.domain_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own domain analyses
CREATE POLICY "Users can update own domain analyses" ON public.domain_analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own domain analyses
CREATE POLICY "Users can delete own domain analyses" ON public.domain_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.domain_analyses TO authenticated;
GRANT SELECT ON public.domain_analyses TO anon;
