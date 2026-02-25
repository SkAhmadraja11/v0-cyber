import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const results: any = {
            timestamp: new Date().toISOString(),
            status: 'analyzing',
            environment: {},
            auth: {},
            database: {
                status: 'checking',
                tables: {}
            },
            storage: {}
        }

        // 1. Environment
        results.environment = {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌',
            RESEND_API_KEY: process.env.RESEND_API_KEY ? '✅' : '❌',
            APP_URL: process.env.NEXT_PUBLIC_APP_URL
        }

        const supabase = await createClient()

        // 2. Auth Service
        try {
            const { data, error } = await supabase.auth.getSession()
            results.auth = {
                status: error ? '❌' : '✅',
                session: !!data.session,
                error: error?.message || null
            }
        } catch (e: any) {
            results.auth = { status: '❌', error: e.message }
        }

        // 3. Database Tables
        const tablesToCheck = [
            'profiles',
            'user_activations',
            'login_notifications',
            'user_mfa',
            'scan_results',
            'threat_intel'
        ]

        let healthyTables = 0
        for (const table of tablesToCheck) {
            try {
                const { error } = await supabase.from(table).select('id').limit(1)
                if (error) {
                    results.database.tables[table] = { status: '❌', error: error.message }
                } else {
                    results.database.tables[table] = { status: '✅' }
                    healthyTables++
                }
            } catch (e: any) {
                results.database.tables[table] = { status: '❌', error: e.message }
            }
        }

        results.database.status = healthyTables === tablesToCheck.length ? '✅' : '⚠️'
        results.database.summary = `${healthyTables}/${tablesToCheck.length} tables functional`

        // 4. Storage
        try {
            const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
            results.storage = {
                status: storageError ? '❌' : '✅',
                bucketCount: buckets?.length || 0,
                error: storageError?.message || null
            }
        } catch (e: any) {
            results.storage = { status: '❌', error: e.message }
        }

        // 5. Overall Status
        const totalIssues = (results.auth.status === '❌' ? 1 : 0) +
            (tablesToCheck.length - healthyTables) +
            (results.storage.status === '❌' ? 1 : 0)

        results.status = totalIssues === 0 ? '✅ Healthy' : `⚠️ ${totalIssues} Issue(s) detected`

        return NextResponse.json(results)

    } catch (error: any) {
        return NextResponse.json({
            status: '❌ Critical Failure',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
