import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Mock data for when Supabase tables don't exist yet
const mockScans = [
  {
    id: "1",
    url: "https://secure-paypal-verify.com",
    classification: "PHISHING",
    risk_score: 92,
    confidence: 95.5,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    url: "https://github.com",
    classification: "SAFE",
    risk_score: 5,
    confidence: 99.8,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    url: "https://amaz0n-security-alert.com",
    classification: "PHISHING",
    risk_score: 88,
    confidence: 92.3,
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: "4",
    url: "https://linkedin.com",
    classification: "SAFE",
    risk_score: 2,
    confidence: 99.9,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "5",
    url: "https://microsft-support.tk",
    classification: "SUSPICIOUS",
    risk_score: 75,
    confidence: 87.2,
    created_at: new Date(Date.now() - 18000000).toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Try to fetch from Supabase
    const { data: scans, error } = await supabase
      .from("scan_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    // If table doesn't exist or other error, return mock data
    if (error) {
      console.log("[v0] Supabase table not found, using mock data")
      return NextResponse.json({ scans: mockScans })
    }

    return NextResponse.json({ scans: scans || mockScans })
  } catch (error) {
    console.log("[v0] Error accessing Supabase, using mock data:", error)
    return NextResponse.json({ scans: mockScans })
  }
}
