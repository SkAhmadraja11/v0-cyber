import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Test email configuration
    console.log('Testing email configuration...')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured' 
      }, { status: 500 })
    }

    // Test sending a simple email
    const testEmail = 'ahmadraja984821@gmail.com' // Your email for testing
    
    try {
      const data = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@phishguard.ai',
        to: [testEmail],
        subject: '🧪 PhishGuard AI - Email Test',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Test</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .success { background: #10b981; color: white; padding: 10px; border-radius: 4px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 PhishGuard AI</h1>
                <p>Email System Test</p>
              </div>
              
              <div class="content">
                <h2>✅ Email Configuration Test</h2>
                <p>This is a test email to verify your email system is working.</p>
                
                <div style="background: #10b981; color: white; padding: 10px; border-radius: 4px; text-align: center; margin: 20px 0;">
                  <strong>EMAIL SYSTEM WORKING!</strong>
                </div>
                
                <p><strong>Test Details:</strong></p>
                <ul>
                  <li>API Key: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}</li>
                  <li>From Email: ${process.env.RESEND_FROM_EMAIL || 'Not configured'}</li>
                  <li>App URL: ${process.env.NEXT_PUBLIC_APP_URL || 'Not configured'}</li>
                  <li>Timestamp: ${new Date().toISOString()}</li>
                </ul>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      console.log('Email sent successfully:', data)

      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        data: {
          emailId: (data as any)?.id,
          from: process.env.RESEND_FROM_EMAIL,
          to: testEmail,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error: any) {
      console.error('Email sending failed:', error)
      return NextResponse.json({ 
        error: 'Failed to send test email',
        details: error.message || 'Unknown error',
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          hasFromEmail: !!process.env.RESEND_FROM_EMAIL,
          hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
