import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('🔍 Running comprehensive system diagnostic...')

    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      database: {},
      authentication: {},
      storage: {},
      summary: { status: 'unknown', issues: [] }
    }

    // 1. Environment Check
    results.environment = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV || '❌ Missing',
    }

    // 2. Database Connection Test
    try {
      const supabase = await createClient()

      // Test profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      results.database.profiles = profilesError ? '❌ Error' : '✅ Connected'
      results.database.profilesError = profilesError?.message || null

      // Test user_mfa table
      const { data: mfa, error: mfaError } = await supabase
        .from('user_mfa')
        .select('count')
        .limit(1)

      results.database.user_mfa = mfaError ? '❌ Error' : '✅ Connected'
      results.database.mfaError = mfaError?.message || null

      // Test login_notifications table
      const { data: notifications, error: notificationsError } = await supabase
        .from('login_notifications')
        .select('count')
        .limit(1)

      results.database.login_notifications = notificationsError ? '❌ Error' : '✅ Connected'
      results.database.notificationsError = notificationsError?.message || null

    } catch (dbError) {
      results.database = { status: '❌ Connection failed', error: (dbError as Error).message, profiles: '❌ Error', user_mfa: '❌ Error', login_notifications: '❌ Error' }
    }

    // 3. Authentication Test
    try {
      const supabase = await createClient()

      // Test auth service
      const { data: authData, error: authError } = await supabase.auth.getSession()

      results.authentication.service = authError ? '❌ Error' : '✅ Working'

    } catch (authError) {
      results.authentication = { status: '❌ Auth service failed', error: (authError as Error).message, service: '❌ Error' }
    }

    // 4. Storage Test
    try {
      const supabase = await createClient()

      // Test bucket access
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

      results.storage.buckets = bucketError ? '❌ Error' : '✅ Accessible'
      results.storage.count = buckets?.length || 0
      results.storage.bucketError = bucketError?.message || null

    } catch (storageError) {
      results.storage = { status: '❌ Storage failed', error: (storageError as Error).message, buckets: '❌ Error', count: 0 }
    }

    // 5. Summary
    const issues = []

    if (Object.values(results.environment).includes('❌ Missing')) {
      issues.push('Environment variables missing')
    }

    if (Object.values(results.database).includes('❌ Error')) {
      issues.push('Database connection issues')
    }

    if (results.authentication.service === '❌ Error') {
      issues.push('Authentication service problems')
    }

    if (results.storage.buckets === '❌ Error') {
      issues.push('Storage access issues')
    }

    results.summary = {
      status: issues.length === 0 ? '✅ All systems working' : '⚠️ Issues detected',
      issues: issues,
      recommendation: issues.length > 0 ? 'Fix the issues above' : 'System is ready'
    }

    return NextResponse.json(results)

  } catch (error) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      details: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
