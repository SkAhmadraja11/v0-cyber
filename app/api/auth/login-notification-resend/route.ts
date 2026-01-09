import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { data: notificationData, error: notificationError } = await supabase
      .from('login_notifications')
      .insert({
        user_id: profile.id,
        email: email,
        login_time: loginTime,
        ip_address: ipAddress,
        user_agent: userAgent,
        notification_type: 'login_confirmation',
        is_sent: false, // Will be updated after email is sent
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (notificationError) {
      console.error('Error creating login notification:', notificationError)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    // Send login confirmation email
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@phishguard.ai',
        to: [email],
        subject: 'Login Confirmation - PhishGuard AI',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Confirmation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
              .details { background: white; padding: 15px; border-radius: 4px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 PhishGuard AI</h1>
                <p>Login Confirmation</p>
              </div>
              
              <div class="content">
                <h2>Hello ${profile.full_name || email},</h2>
                <p>We detected a successful login to your PhishGuard AI account.</p>
                
                <div class="details">
                  <p><strong>Login Time:</strong> ${new Date(loginTime).toLocaleString()}</p>
                  <p><strong>IP Address:</strong> ${ipAddress}</p>
                  <p><strong>Device:</strong> ${userAgent || 'Unknown'}</p>
                </div>
                
                <p>If this was you, No action is needed. If this wasn't you, please secure your account immediately:</p>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login" class="button">
                    Secure Your Account
                  </a>
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated message from PhishGuard AI Security System.</p>
                <p>If you have questions, contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      if (error) {
        console.error('Error sending email:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }

      // Update notification record to mark email as sent
      await supabase
        .from('login_notifications')
        .update({ is_sent: true })
        .eq('id', notificationData.id)

      console.log(`Login confirmation email sent to ${email}`)

      return NextResponse.json({ 
        success: true, 
        message: 'Login confirmation email sent' 
      })

    } catch (emailError: any) {
      console.error('Error sending login confirmation email:', emailError)
      
      // Update notification record to mark email as failed
      await supabase
        .from('login_notifications')
        .update({ is_sent: false, error_message: emailError.message })
        .eq('id', notificationData.id)

      return NextResponse.json({ 
        error: 'Failed to send confirmation email', 
        details: emailError.message 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in login notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
