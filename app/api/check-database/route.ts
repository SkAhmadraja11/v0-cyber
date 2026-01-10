import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // Test profiles table structure
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    // Test user_mfa table
    const { data: mfa, error: mfaError } = await supabase
      .from('user_mfa')
      .select('*')
      .limit(1)
    
    // Test login_notifications table
    const { data: notifications, error: notificationsError } = await supabase
      .from('login_notifications')
      .select('*')
      .limit(1)
    
    return NextResponse.json({
      success: true,
      tables: {
        profiles: {
          exists: !profilesError,
          error: profilesError?.message || null,
          sample: profiles
        },
        user_mfa: {
          exists: !mfaError,
          error: mfaError?.message || null,
          sample: mfa
        },
        login_notifications: {
          exists: !notificationsError,
          error: notificationsError?.message || null,
          sample: notifications
        }
      },
      message: 'Database schema check completed'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      message: 'Failed to check database schema'
    }, { status: 500 })
  }
}
