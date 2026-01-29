import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("range") || "7d"

    // Return dynamic mock data for a 'live' feel
    const randomBoost = Math.floor(Math.random() * 50)
    const mockAnalytics = {
      totalScans: 1247 + randomBoost,
      threatsBlocked: 89 + Math.floor(randomBoost / 10),
      mlAccuracy: (99.2 + (Math.random() * 0.2)).toFixed(1),
      avgResponseTime: 347 - Math.floor(Math.random() * 20),
      scanTypes: [
        { name: "URL Scans", value: 450 + randomBoost, color: "#3b82f6" },
        { name: "Email Analysis", value: 320 + Math.floor(randomBoost / 2), color: "#8b5cf6" },
        { name: "File Checks", value: 210 + Math.floor(randomBoost / 3), color: "#ec4899" },
      ],
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(mockAnalytics)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
