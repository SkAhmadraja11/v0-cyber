import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing activation email system...')
    
    // Check environment variables
    const envCheck = {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing',
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || '❌ Missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '❌ Missing',
    }
    
    console.log('📋 Environment Variables:', envCheck)
    
    // Check if API key is valid
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured',
        fix: 'Add RESEND_API_KEY to your .env.local file',
        envCheck 
      }, { status: 500 })
    }
    
    // Test database connection
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('user_activations')
        .select('count')
        .limit(1)
      
      if (error) {
        return NextResponse.json({ 
          error: 'Database connection failed',
          details: error.message,
          fix: 'Run SQL from fix-database.sql in Supabase Dashboard'
        }, { status: 500 })
      }
      
    } catch (dbError) {
      return NextResponse.json({ 
        error: 'Database connection error',
        details: (dbError as Error).message,
        fix: 'Check Supabase configuration and run database setup'
      }, { status: 500 })
    }
    
    // Test email sending
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const testEmail = 'ahmadraja984821@gmail.com' // Your test email
      
      const data = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [testEmail],
        subject: '🧪 PhishGuard AI - Activation Test',
        html: `
          <h2>✅ Activation Email Test</h2>
          <p>This is a test to verify your activation email system is working.</p>
          <p><strong>From:</strong> ${process.env.RESEND_FROM_EMAIL}</p>
          <p><strong>To:</strong> ${testEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Status:</strong> Working correctly! 🎉</p>
        `
      })
      
      console.log('✅ Test email sent:', data)
      
      return NextResponse.json({ 
        success: true,
        message: 'Activation email system working correctly!',
        testResult: data,
        envCheck,
        nextSteps: [
          '1. Test signup with your Resend account email',
          '2. Check your inbox for this test email',
          '3. Try the signup flow at /auth/sign-up'
        ]
      })
      
    } catch (emailError: any) {
      console.error('❌ Email test failed:', emailError)
      
      // Handle specific Resend errors
      if (emailError.status === 403) {
        return NextResponse.json({ 
          error: 'Resend domain limitation',
          details: 'The resend.dev domain only sends to the account owner',
          fix: 'Use your Resend account email for testing, or verify your custom domain',
          workaround: 'Test with your Resend account email address',
          envCheck
        }, { status: 403 })
      }
      
      return NextResponse.json({ 
        error: 'Email sending failed',
        details: emailError.message,
        fix: 'Check RESEND_API_KEY and RESEND_FROM_EMAIL configuration',
        envCheck
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({ 
      error: 'Test system failed',
      details: (error as Error).message,
      fix: 'Check server logs and try again'
    }, { status: 500 })
  }
}
