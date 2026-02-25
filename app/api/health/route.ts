import { NextResponse } from "next/server"

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Extension popup calls HEAD to measure latency — must respond to it
export async function HEAD() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

export async function GET() {
    return NextResponse.json(
        { status: "ok", timestamp: new Date().toISOString() },
        { headers: CORS_HEADERS }
    )
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}
