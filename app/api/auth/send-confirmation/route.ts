import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate confirmation token
    const confirmation_token = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store confirmation token
    const { error: tokenError } = await supabase
      .from('email_confirmations')
      .insert({
        user_id: profile.id,
        email: email,
        confirmation_token,
        expires_at,
        is_confirmed: false
      })

    if (tokenError) {
      return NextResponse.json({ error: 'Failed to create confirmation token' }, { status: 500 })
    }

    // Send confirmation email
    const confirmationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm-email?token=${confirmation_token}`

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@phishguard.ai',
        to: [email],
        subject: 'Confirm Your Login - PhishGuard AI',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Confirmation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 4px; }
              .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 PhishGuard AI</h1>
                <p>Email Confirmation Required</p>
              </div>
              
              <div class="content">
                <h2>Hello ${profile.full_name || email},</h2>
                <p>A login attempt was made for your PhishGuard AI account. Please confirm this was you by clicking the button below:</p>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> If this wasn't you, please secure your account immediately.
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${confirmationLink}" class="button">
                    Confirm Login Attempt
                  </a>
                </div>
                
                <p><strong>Link expires in 1 hour</strong></p>
                <p>If you didn't request this login, you can safely ignore this email.</p>
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

      return NextResponse.json({ 
        success: true, 
        message: 'Confirmation email sent',
        confirmation_token 
      })

    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in email confirmation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
