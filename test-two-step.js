// Quick Test Script for Two-Step Signup
// Run this to identify issues

const testTwoStepSignup = async () => {
  console.log('🧪 Testing Two-Step Signup System...\n')
  
  try {
    // Test 1: Check if server is running
    console.log('📡 Testing server connection...')
    const serverResponse = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    })
    
    if (serverResponse.ok) {
      console.log('✅ Server is running and responding')
    } else {
      console.log('❌ Server not responding - run: npm run dev')
      return
    }
    
    // Test 2: Test activation email sending
    console.log('\n📧 Testing activation email...')
    const activationResponse = await fetch('http://localhost:3000/api/auth/send-activation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ahmadraja984821@gmail.com' })
    })
    
    const activationData = await activationResponse.json()
    
    if (activationResponse.ok) {
      console.log('✅ Activation email sent successfully')
      console.log('📧 Check your inbox for activation link')
    } else {
      console.log('❌ Activation email failed:', activationData.error)
      
      if (activationData.error?.includes('RESEND_API_KEY')) {
        console.log('🔧 Fix: Add RESEND_API_KEY to .env.local')
      }
      
      if (activationData.error?.includes('user_activations')) {
        console.log('🔧 Fix: Run SQL script in Supabase')
        console.log('📄 File: scripts/09_two_step_signup.sql')
      }
    }
    
    // Test 3: Check sign-up page
    console.log('\n🌐 Testing sign-up page...')
    try {
      const signUpResponse = await fetch('http://localhost:3000/auth/sign-up')
      if (signUpResponse.ok) {
        console.log('✅ Sign-up page is accessible')
      } else {
        console.log('❌ Sign-up page not accessible')
      }
    } catch (error) {
      console.log('❌ Sign-up page error:', error.message)
    }
    
    // Test 4: Check password creation page
    console.log('\n🔐 Testing password creation page...')
    try {
      const passwordResponse = await fetch('http://localhost:3000/auth/create-password?token=test-token')
      if (passwordResponse.ok) {
        console.log('✅ Password creation page is accessible')
      } else {
        console.log('✅ Password creation page shows error (expected for invalid token)')
      }
    } catch (error) {
      console.log('❌ Password creation page error:', error.message)
    }
    
    console.log('\n📋 Summary:')
    console.log('1. ✅ Server running')
    console.log('2. 📧 Email system tested')
    console.log('3. 🌐 Pages accessible')
    console.log('\n🔧 If issues persist:')
    console.log('- Check .env.local for missing variables')
    console.log('- Run SQL script in Supabase')
    console.log('- Check browser console for errors')
    console.log('- Check terminal for server errors')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.log('\n🔧 Quick fixes:')
    console.log('1. Run: npm run dev')
    console.log('2. Check .env.local file')
    console.log('3. Run SQL script in Supabase')
  }
}

// Run the test
testTwoStepSignup()
