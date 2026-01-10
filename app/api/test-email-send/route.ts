import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Testing email send to 2300030338@kluniversity.in...')
    
    // Test email content
    const emailData = {
      to: '2300030338@kluniversity.in',
      subject: 'Hello Brother! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hello Brother</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #333;
              margin-bottom: 30px;
            }
            .message {
              font-size: 18px;
              line-height: 1.6;
              color: #555;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #888;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 Hello Brother!</h1>
            </div>
            <div class="message">
              <p>Just wanted to say hello and test this email system! 🎉</p>
              <p>This is a test email from PhishGuard AI to verify that our email sending is working perfectly.</p>
              <p><strong>Message:</strong> Say hello brother!</p>
            </div>
            <div class="footer">
              <p>Sent from PhishGuard AI Email System</p>
              <p>Time: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
    
    // Option 1: Test with Resend API directly (if you have the key)
    if (process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html
          })
        })
        
        const resendResult = await resendResponse.json()
        
        if (resendResponse.ok) {
          return NextResponse.json({
            success: true,
            method: 'Resend API',
            message: 'Email sent successfully!',
            result: resendResult,
            emailData
          })
        } else {
          return NextResponse.json({
            success: false,
            method: 'Resend API',
            error: resendResult,
            emailData
          }, { status: 400 })
        }
      } catch (resendError) {
        console.error('Resend API error:', resendError)
      }
    }
    
    // Option 2: Test with Supabase Edge Function (if deployed)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseAnonKey) {
        const edgeFunctionResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify(emailData)
        })
        
        const edgeResult = await edgeFunctionResponse.json()
        
        if (edgeFunctionResponse.ok) {
          return NextResponse.json({
            success: true,
            method: 'Supabase Edge Function',
            message: 'Email sent successfully!',
            result: edgeResult,
            emailData
          })
        } else {
          return NextResponse.json({
            success: false,
            method: 'Supabase Edge Function',
            error: edgeResult,
            emailData
          }, { status: 400 })
        }
      }
    } catch (edgeError) {
      console.error('Edge Function error:', edgeError)
    }
    
    // If neither method works, return test data
    return NextResponse.json({
      success: false,
      message: 'Email service not configured',
      emailData,
      setup: {
        resendApiKey: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
        resendFromEmail: process.env.RESEND_FROM_EMAIL || '❌ Missing',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
      },
      instructions: [
        '1. Set RESEND_API_KEY in environment variables',
        '2. Deploy Supabase Edge Function',
        '3. Test again'
      ]
    })
    
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      message: 'Email test failed'
    }, { status: 500 })
  }
}
