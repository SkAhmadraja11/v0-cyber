import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has MFA enabled
    const { data: mfaRecord, error: mfaError } = await supabase
      .from('user_mfa')
      .select('enabled, created_at')
      .eq('user_id', user.id)
      .single()

    // Handle case where user doesn't have MFA record
    if (mfaError && mfaError.code === 'PGRST116') {
      // No rows returned - user doesn't have MFA setup
      return NextResponse.json({ 
        mfaEnabled: false,
        needsSetup: true
      })
    }

    if (mfaError) {
      console.error('Error checking MFA status:', mfaError)
      return NextResponse.json({ error: 'Failed to check MFA status' }, { status: 500 })
    }

    return NextResponse.json({ 
      mfaEnabled: mfaRecord?.enabled || false,
      needsSetup: !mfaRecord?.enabled,
      enrolledAt: mfaRecord?.created_at
    })
  } catch (error) {
    console.error('Error in MFA status check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
