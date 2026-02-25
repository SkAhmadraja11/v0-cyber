import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Execute the production database fix
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- 1. Profiles Enhancements
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_scans_remaining INTEGER DEFAULT 5;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_scan_date DATE DEFAULT CURRENT_DATE;

        -- 2. User Activations Table
        CREATE TABLE IF NOT EXISTS public.user_activations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          activation_token UUID NOT NULL DEFAULT uuid_generate_v4(),
          is_activated BOOLEAN DEFAULT false,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(activation_token),
          UNIQUE(email)
        );

        -- 3. Login Notifications Table
        CREATE TABLE IF NOT EXISTS public.login_notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ip_address TEXT,
          user_agent TEXT,
          notification_type TEXT DEFAULT 'login_confirmation',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- 4. User MFA Table
        CREATE TABLE IF NOT EXISTS public.user_mfa (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
          enabled BOOLEAN DEFAULT false,
          secret TEXT,
          recovery_codes TEXT[],
          last_verified_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        );

        -- 5. Scan Results Table
        CREATE TABLE IF NOT EXISTS public.scan_results (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
          url TEXT NOT NULL,
          scan_type TEXT DEFAULT 'url',
          risk_score INTEGER DEFAULT 0,
          classification TEXT DEFAULT 'SAFE',
          confidence FLOAT DEFAULT 0,
          detection_sources JSONB DEFAULT '[]'::jsonb,
          reasons TEXT[] DEFAULT '{}'::text[],
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- 6. Threat Intelligence Table
        CREATE TABLE IF NOT EXISTS public.threat_intel (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          url TEXT UNIQUE NOT NULL,
          domain TEXT NOT NULL,
          threat_type TEXT NOT NULL,
          sources TEXT[] DEFAULT '{}'::text[],
          confidence TEXT DEFAULT 'MEDIUM',
          metadata JSONB DEFAULT '{}'::jsonb,
          discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS for all new tables
        ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.login_notifications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.user_mfa ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.threat_intel ENABLE ROW LEVEL SECURITY;

        -- Create standard "Allow all for system/authenticated" policies (Adjust as needed for production)
        -- Caution: These are highly permissive for current fix purposes
        CREATE POLICY IF NOT EXISTS "Allow system access" ON public.user_activations FOR ALL USING (true);
        CREATE POLICY IF NOT EXISTS "Allow system access" ON public.login_notifications FOR ALL USING (true);
        CREATE POLICY IF NOT EXISTS "Allow system access" ON public.user_mfa FOR ALL USING (true);
        CREATE POLICY IF NOT EXISTS "Allow system access" ON public.scan_results FOR ALL USING (true);
        CREATE POLICY IF NOT EXISTS "Allow system access" ON public.threat_intel FOR ALL USING (true);

        SELECT 'Unified Database Schema Fix Applied' as result;
      `
    })

    if (error) {
      console.error('Database fix error:', error)
      return NextResponse.json({
        error: 'Failed to update database schema',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully'
    })

  } catch (error) {
    console.error('Database fix error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}
