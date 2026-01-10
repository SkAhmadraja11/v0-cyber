import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing login flow...')
    
    const { email, password } = await request.json()
    
    console.log('📋 Input data:', { email, passwordLength: password?.length })
    
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
      
      // Test auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('🔐 Login result:', { 
        success: !error, 
        error: error?.message,
        userId: data?.user?.id,
        email: data?.user?.email
      })
      
      if (error) {
        return NextResponse.json({ 
          error: 'Login failed',
          details: error.message,
          envCheck
        }, { status: 400 })
      }
      
      if (data?.user) {
        // Test profile access
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        console.log('👤 Profile result:', { 
          success: !profileError, 
          error: profileError?.message,
          profile: profileData
        })
        
        return NextResponse.json({ 
          success: true,
          message: 'Login test successful!',
          userData: {
            userId: data.user.id,
            email: data.user.email,
            profile: profileData
          },
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
