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

    // Check if user already exists
    const { data: existingUser, error: existingError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser && !existingError) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Generate activation token
    const activation_token = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store activation token (without creating user account yet)
    const { error: tokenError } = await supabase
      .from('user_activations')
      .insert({
        user_id: null, // Will be set when account is created
        email: email,
        activation_token,
        expires_at,
        is_activated: false
      })

    if (tokenError) {
      console.error('Token storage error:', tokenError)
      return NextResponse.json({ error: 'Failed to create activation token' }, { status: 500 })
    }

    // Send activation email
    const activationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/create-password?token=${activation_token}`

    try {
      const emailData = await resend.emails.send({
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
              .steps { background: #e0f2fe; padding: 15px; border-radius: 4px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 PhishGuard AI</h1>
                <p>Account Activation Required</p>
              </div>
              
              <div class="content">
                <h2>Welcome to PhishGuard AI!</h2>
                <p>Thank you for starting your account creation. To continue, please click the activation button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${activationLink}" class="button">
                    🚀 Activate Your Account & Set Password
                  </a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important:</strong> This activation link expires in 24 hours.
                </div>
                
                <div class="steps">
                  <h3>📋 What happens next?</h3>
                  <ol>
                    <li><strong>Click the button above</strong> to verify your email</li>
                    <li><strong>Create your password</strong> on the secure activation page</li>
                    <li><strong>Complete your profile</strong> and start using PhishGuard AI</li>
                    <li><strong>Enable MFA</strong> for enhanced security (optional but recommended)</li>
                  </ol>
                </div>
                
                <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="color: #0ea5e9; margin: 0 0 10px 0;">🔗 Direct Activation Link:</h4>
                  <p style="margin: 0; word-break: break-all; font-size: 12px; color: #666;">
                    ${activationLink}
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 11px; color: #999;">
                    If the button doesn't work, copy and paste this link into your browser.
                  </p>
                </div>
                
                <p><strong>Account Details:</strong></p>
                <ul>
                  <li>Email: ${email}</li>
                  <li>Status: Pending Activation</li>
                  <li>Expires: ${new Date(expires_at).toLocaleString()}</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>This is an automated message from PhishGuard AI Security System.</p>
                <p>If you have questions, contact our support team.</p>
                <p>If you didn't request this account, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      console.log('Activation email sent successfully:', emailData)

      return NextResponse.json({ 
        success: true, 
        message: 'Activation email sent successfully',
        activation_token 
      })

    } catch (emailError: any) {
      console.error('Error sending activation email:', emailError)
      return NextResponse.json({ error: 'Failed to send activation email' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in activation email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
