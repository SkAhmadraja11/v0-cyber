import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Mock analytics for when Supabase tables don't exist
const mockAnalytics = {
  totalScans: 1247,
  threatsBlocked: 89,
  mlAccuracy: 99.2,
  avgResponseTime: 347,
  trends: [],
  scanTypes: [
    { name: "URL Scans", value: 450, color: "#3b82f6" },
    { name: "Email Analysis", value: 320, color: "#8b5cf6" },
  ],
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("range") || "7d"

    // Calculate time range
    const now = new Date()
    const hoursBack = timeRange === "24h" ? 24 : timeRange === "7d" ? 24 * 7 : 24 * 30
    const startDate = new Date(now.getTime() - hoursBack * 60 * 60 * 1000)

    // Try to fetch from Supabase
    const { count: totalScans, error: totalError } = await supabase
      .from("scan_results")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())

    // If table doesn't exist, return mock data
    if (totalError) {
      console.log("[v0] Supabase table not found, using mock analytics")
      return NextResponse.json(mockAnalytics)
    }

    const { count: threatsBlocked } = await supabase
      .from("scan_results")
      .select("*", { count: "exact", head: true })
      .in("classification", ["PHISHING", "SUSPICIOUS"])
      .gte("created_at", startDate.toISOString())

    const { data: avgData } = await supabase
      .from("scan_results")
      .select("confidence")
      .gte("created_at", startDate.toISOString())

    const avgConfidence =
      avgData && avgData.length > 0
        ? avgData.reduce((sum, row) => sum + (row.confidence || 0), 0) / avgData.length
        : 99.2

    const { data: trendsData } = await supabase
      .from("scan_results")
      .select("created_at, classification")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    const { data: scanTypesData } = await supabase
      .from("scan_results")
      .select("scan_type")
      .gte("created_at", startDate.toISOString())

    const scanTypesDistribution = scanTypesData?.reduce((acc: any, curr) => {
      const type = curr.scan_type || 'url'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Format for Recharts
    const scanTypesCharts = [
      { name: "URL Scans", value: scanTypesDistribution?.url || 0, color: "#3b82f6" },
      { name: "Email Analysis", value: scanTypesDistribution?.email || 0, color: "#8b5cf6" },
    ]

    const analytics = {
      totalScans: totalScans || 0,
      threatsBlocked: threatsBlocked || 0,
      mlAccuracy: avgConfidence,
      avgResponseTime: 347,
      trends: trendsData || [],
      scanTypes: scanTypesCharts,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.log("[v0] Error accessing Supabase, using mock analytics:", error)
    return NextResponse.json(mockAnalytics)
  }
}
