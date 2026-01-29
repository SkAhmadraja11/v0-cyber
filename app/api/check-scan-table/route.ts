import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if scan_results table exists
    const { data: tableCheck, error: tableError } = await supabase
      .rpc('check_table_exists', { table_name: 'scan_results' })

    let tableExists = false
    let tableInfo = null

    if (tableError) {
      // Fallback: Try to query the table directly
      try {
        const { data, error } = await supabase
          .from('scan_results')
          .select('count')
          .limit(1)

        tableExists = !error
        if (error) {
          tableInfo = { error: error.message, code: error.code }
        } else {
          tableInfo = { status: 'accessible', count: data?.length || 0 }
        }
      } catch (e: any) {
        tableInfo = { error: e.message, accessible: false }
      }
    } else {
      tableExists = tableCheck
      tableInfo = { status: 'checked via rpc', exists: tableCheck }
    }

    // Check schema information
    let schemaInfo = null
    try {
      const { data: schemaData } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'scan_results')
        .order('ordinal_position')

      schemaInfo = schemaData || []
    } catch (e: any) {
      schemaInfo = { error: e.message }
    }

    // Test basic operations
    const testResults = {
      select: false,
      insert: false,
      update: false
    }

    try {
      const { data, error } = await supabase
        .from('scan_results')
        .select('*')
        .limit(1)

      testResults.select = !error
    } catch (e) {
      testResults.select = false
    }

    return NextResponse.json({
      success: true,
      scan_results: {
        exists: tableExists,
        info: tableInfo,
        schema: schemaInfo,
        operations: testResults
      },
      timestamp: new Date().toISOString(),
      recommendations: tableExists ? [
        "Table exists and is accessible"
      ] : [
        "Run the fix-scan-results-table.sql script",
        "Check Supabase permissions",
        "Verify RLS policies are correctly set"
      ]
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
