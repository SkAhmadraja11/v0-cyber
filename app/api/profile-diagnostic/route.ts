import { createClient } from "@/lib/supabase/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    // Test table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0)
    
    // Check if avatar_url column exists by trying to select it
    const { data: avatarTest, error: avatarError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .limit(1)
    
    return NextResponse.json({
      success: true,
      connection: {
        test: connectionTest,
        error: connectionError?.message
      },
      table: {
        info: tableInfo,
        error: tableError?.message
      },
      avatarColumn: {
        exists: !avatarError,
        error: avatarError?.message
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
