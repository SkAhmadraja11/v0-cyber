import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Comprehensive authentication fix...')

    const { email, password } = await request.json()

    // Step 1: Check environment
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
    }

    // Step 2: Test database connection
    const supabase = await createClient()

    // Step 3: Check if user exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({
        error: 'Database error',
        details: profileError.message,
        envCheck
      }, { status: 500 })
    }

    // Step 4: Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      let userFriendlyError = 'Login failed'

      if (error.message.includes('Invalid login credentials')) {
        userFriendlyError = 'Invalid email or password. Please check your credentials.'
      } else if (error.message.includes('Email not confirmed')) {
        userFriendlyError = 'Please confirm your email address first.'
      } else if (error.message.includes('Too many requests')) {
        userFriendlyError = 'Too many login attempts. Please try again later.'
      } else {
        userFriendlyError = error.message
      }

      return NextResponse.json({
        error: userFriendlyError,
        technical: error.message,
        envCheck,
        userExists: !profileError || profileError.code !== 'PGRST116'
      }, { status: 400 })
    }

    // Step 5: Success - return user data
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        profile: profiles
      },
      session: data.session,
      envCheck
    })

  } catch (error) {
    console.error('❌ Authentication error:', error)
    return NextResponse.json({
      error: 'Authentication system error',
      details: (error as Error).message
    }, { status: 500 })
  }
}
