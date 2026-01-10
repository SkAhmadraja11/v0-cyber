-- Fix Missing Database Tables
-- Run this in your Supabase SQL Editor to fix the schema cache issue

-- 1. Check if scan_results table exists and create it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scan_results'
    ) THEN
        -- Create scan_results table
        CREATE TABLE public.scan_results (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            scan_type TEXT NOT NULL CHECK (scan_type IN ('url', 'email', 'file')),
            risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
            classification TEXT NOT NULL CHECK (classification IN ('SAFE', 'SUSPICIOUS', 'PHISHING')),
            confidence DECIMAL(5,2) NOT NULL,
            detection_sources JSONB NOT NULL,
            features_extracted JSONB,
            reasons TEXT[],
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'scan_results table created successfully';
    ELSE
        RAISE NOTICE 'scan_results table already exists';
    END IF;
END $$;

-- 2. Create indexes for scan_results table
DO $$
BEGIN
    -- Check and create indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'scan_results' 
        AND indexname = 'idx_scan_results_user_id'
    ) THEN
        CREATE INDEX idx_scan_results_user_id ON public.scan_results(user_id);
        RAISE NOTICE 'Created idx_scan_results_user_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'scan_results' 
        AND indexname = 'idx_scan_results_classification'
    ) THEN
        CREATE INDEX idx_scan_results_classification ON public.scan_results(classification);
        RAISE NOTICE 'Created idx_scan_results_classification index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'scan_results' 
        AND indexname = 'idx_scan_results_created_at'
    ) THEN
        CREATE INDEX idx_scan_results_created_at ON public.scan_results(created_at DESC);
        RAISE NOTICE 'Created idx_scan_results_created_at index';
    END IF;
END $$;

-- 3. Set up Row Level Security (RLS)
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own scan results" ON public.scan_results;
DROP POLICY IF EXISTS "Users can insert own scan results" ON public.scan_results;

-- Create RLS policies
CREATE POLICY "Users can view own scan results" ON public.scan_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan results" ON public.scan_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Grant permissions
GRANT ALL ON public.scan_results TO authenticated;
GRANT SELECT ON public.scan_results TO anon;

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 6. Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'scan_results'
ORDER BY ordinal_position;

-- 7. Test table access
SELECT 'scan_results table is accessible' as status, COUNT(*) as row_count 
FROM public.scan_results;

SELECT 'Database fix completed successfully' as result;
