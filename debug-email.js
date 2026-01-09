// Email System Debug Script
// Run this to test your email configuration and sending

const testEmailSystem = async () => {
  console.log('🔧 Testing Email System...\n')
  
  try {
    // Test 1: Check environment variables
    console.log('📋 Environment Variables:')
    console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing')
    console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Missing')
    console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ Missing')
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is missing!')
      return
    }
    
    // Test 2: Send test email
    console.log('\n📧 Sending test email...')
    
    const response = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ahmadraja984821@gmail.com'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Test email sent successfully!')
      console.log('📧 Email Details:', data)
    } else {
      const error = await response.text()
      console.error('❌ Failed to send test email:', error)
    }
    
    // Test 3: Check Resend API directly
    console.log('\n🔍 Testing Resend API directly...')
    const { Resend } = require('resend')
    
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@phishguard.ai',
        to: ['ahmadraja984821@gmail.com'],
        subject: '🧪 Direct API Test - PhishGuard AI',
        html: '<p>This is a direct test of the Resend API.</p>'
      })
      
      console.log('✅ Direct Resend API test successful!')
      console.log('📧 Result:', result)
      
    } catch (error) {
      console.error('❌ Direct Resend API test failed:', error)
    }
    
  } catch (error) {
    console.error('❌ Test script error:', error)
  }
}

// Run the test
testEmailSystem()
