import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// CORS preflight for Chrome extension
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET() {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({
                authenticated: false,
                user: null,
                message: 'No active session'
            }, { headers: CORS_HEADERS })
        }

        // Get profile details (optional, for plan info)
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single()

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                name: profile?.full_name || user.user_metadata?.full_name || 'Enterprise User',
                plan: 'Premium Protection',
                avatar: profile?.avatar_url || null
            }
        }, { headers: CORS_HEADERS })
    } catch (error) {
        console.error('Error in session check:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS })
    }
}
