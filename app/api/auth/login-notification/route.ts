import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { email, loginTime, ipAddress, userAgent } = await request.json()

    // Get user profile for email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create login notification record
    const { error: notificationError } = await supabase
      .from('login_notifications')
      .insert({
        user_id: profile.id,
        email: email,
        login_time: loginTime,
        ip_address: ipAddress,
        user_agent: userAgent,
        notification_type: 'login_confirmation',
        created_at: new Date().toISOString()
      })

    if (notificationError) {
      console.error('Error creating login notification:', notificationError)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    // Send email notification (this would require an email service like Resend, SendGrid, etc.)
    // For now, we'll just log it
    console.log(`Login confirmation for ${email} at ${loginTime} from ${ipAddress}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Login confirmation recorded' 
    })

  } catch (error) {
    console.error('Error in login notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
