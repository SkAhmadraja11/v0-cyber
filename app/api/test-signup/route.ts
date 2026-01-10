import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing signup flow...')
    
    const { email, password, fullName } = await request.json()
    
    console.log('📋 Input data:', { email, fullName, passwordLength: password?.length })
    
    // Test environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    }
    
    console.log('📋 Environment:', envCheck)
    
    // Test Supabase connection
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      console.log('🔗 Testing Supabase connection...')
      
      // Test auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })
      
      console.log('📧 Auth result:', { 
        success: !authError, 
        error: authError?.message,
        userId: authData?.user?.id 
      })
      
      if (authError) {
        return NextResponse.json({ 
          error: 'Auth signup failed',
          details: authError.message,
          envCheck
        }, { status: 400 })
      }
      
      if (authData?.user) {
        // Test profile creation
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: email,
            full_name: fullName,
            role: 'user',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        console.log('👤 Profile result:', { 
          success: !profileError, 
          error: profileError?.message 
        })
        
        if (profileError) {
          return NextResponse.json({ 
            error: 'Profile creation failed',
            details: profileError.message,
            authSuccess: true,
            envCheck
          }, { status: 500 })
        }
        
        return NextResponse.json({ 
          success: true,
          message: 'Signup test successful!',
          authData: {
            userId: authData.user.id,
            email: authData.user.email
          },
          profileData,
          envCheck
        })
      }
      
    } catch (supabaseError) {
      console.error('❌ Supabase error:', supabaseError)
      return NextResponse.json({ 
        error: 'Supabase connection failed',
        details: (supabaseError as Error).message,
        envCheck
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: (error as Error).message
    }, { status: 500 })
  }
}
