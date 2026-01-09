import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Testing email configuration...')
    
    // Check environment variables
    const config = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || '❌ Missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
    
    console.log('📋 Environment Variables:', config)
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured',
        config 
      }, { status: 500 })
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json({ 
        error: 'RESEND_FROM_EMAIL not configured',
        config 
      }, { status: 500 })
    }

    // Test email
    const testEmail = 'ahmadraja984821@gmail.com'
    
    try {
      console.log('📧 Sending test email to:', testEmail)
      
      const data = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: [testEmail],
        subject: '🧪 PhishGuard AI - Email System Test',
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
              .config { background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0; }
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
                
                <div class="success">
                  <strong>EMAIL SYSTEM WORKING!</strong>
                </div>
                
                <div class="config">
                  <h3>📋 Configuration:</h3>
                  <ul>
                    <li>API Key: ${config.RESEND_API_KEY}</li>
                    <li>From Email: ${process.env.RESEND_FROM_EMAIL}</li>
                    <li>App URL: ${process.env.NEXT_PUBLIC_APP_URL}</li>
                    <li>Environment: ${config.NODE_ENV}</li>
                    <li>Timestamp: ${new Date().toISOString()}</li>
                  </ul>
                </div>
                
                <p><strong>If you receive this email, your email system is working correctly!</strong></p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      console.log('✅ Email sent successfully:', data)

      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        data: {
          emailId: (data as any)?.id,
          from: process.env.RESEND_FROM_EMAIL,
          to: testEmail,
          timestamp: new Date().toISOString(),
          config
        }
      })

    } catch (error: any) {
      console.error('❌ Email sending failed:', error)
      
      return NextResponse.json({ 
        error: 'Failed to send test email',
        details: error.message || 'Unknown error',
        config,
        suggestions: [
          'Check RESEND_API_KEY is valid',
          'Check RESEND_FROM_EMAIL is verified in Resend',
          'Check Resend account is active',
          'Check domain is verified in Resend'
        ]
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
