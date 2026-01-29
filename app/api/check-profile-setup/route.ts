import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test if avatar_url column exists in profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .limit(1)

    // Test if profile-pictures bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((bucket: any) => bucket.name === 'profile-pictures')

    return NextResponse.json({
      success: true,
      database: {
        profiles: {
          hasAvatarUrl: !profilesError,
          error: profilesError?.message || null,
          columns: profilesError ? null : Object.keys(profiles[0] || {})
        }
      },
      storage: {
        bucketExists: bucketExists || false,
        error: bucketError?.message || null,
        buckets: buckets?.map((b: any) => b.name) || []
      },
      message: 'Profile picture setup check completed'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      message: 'Failed to check profile picture setup'
    }, { status: 500 })
  }
}
