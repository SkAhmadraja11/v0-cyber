import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser, error: existingError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser && !existingError) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          email: email
        }
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 })
    }

    // Generate activation token
    const activation_token = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store activation token
    const { error: tokenError } = await supabase
      .from('user_activations')
      .insert({
        user_id: authData.user.id,
        email: email,
        activation_token,
        expires_at,
        is_activated: false
      })

    if (tokenError) {
      return NextResponse.json({ error: 'Failed to create activation token' }, { status: 500 })
    }

    // Send activation email
    const activationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/activate-account?token=${activation_token}`

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@phishguard.ai',
        to: [email],
        subject: 'Activate Your PhishGuard AI Account',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Activation</title>
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
                <p>Account Activation Required</p>
              </div>
              
              <div class="content">
                <h2>Welcome to PhishGuard AI, ${fullName || email}!</h2>
                <p>Thank you for creating an account. To activate your account and start using our security features, please click the button below:</p>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> This activation link expires in 24 hours.
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${activationLink}" class="button">
                    Activate Your Account
                  </a>
                </div>
                
                <p><strong>Account Details:</strong></p>
                <ul>
                  <li>Email: ${email}</li>
                  <li>Status: Pending Activation</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>This is an automated message from PhishGuard AI Security System.</p>
                <p>If you have questions, contact our support team.</p>
                <p>If you didn't create this account, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Account created successfully. Please check your email to activate your account.',
        requires_activation: true,
        activation_token 
      })

    } catch (emailError) {
      console.error('Error sending activation email:', emailError)
      return NextResponse.json({ error: 'Failed to send activation email' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in account creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
