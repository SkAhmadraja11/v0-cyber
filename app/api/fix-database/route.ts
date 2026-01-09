import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Execute the production database fix
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create user_activations table if it doesn't exist
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
        
        -- Add is_activated to profiles if missing
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;
        
        -- Enable RLS
        ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY IF NOT EXISTS "System can manage activations" ON public.user_activations FOR ALL USING (true);
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_user_activations_token ON public.user_activations(activation_token);
        CREATE INDEX IF NOT EXISTS idx_user_activations_email ON public.user_activations(email);
        
        SELECT 'Database schema updated successfully!' as result;
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
