import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("range") || "7d"

    // Return mock data for now - replace with real database queries
    const mockAnalytics = {
      totalScans: 1247,
      threatsBlocked: 89,
      mlAccuracy: 99.2,
      avgResponseTime: 347,
      scanTypes: [
        { name: "URL Scans", value: 450, color: "#3b82f6" },
        { name: "Email Analysis", value: 320, color: "#8b5cf6" },
        { name: "File Checks", value: 210, color: "#ec4899" },
      ],
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
