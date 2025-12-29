import { type NextRequest, NextResponse } from "next/server"
import { RealPhishingDetector } from "@/lib/real-detection"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, mode } = body

    if (!input || !mode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get authenticated user (optional - works without auth too)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Initialize real detector with multiple data sources
    const detector = new RealPhishingDetector()

    // Simulate realistic API call delay (real APIs take time)
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Perform real multi-source detection
    const result = await detector.detect(input, mode)

    const { data: scanRecord, error: insertError } = await supabase
      .from("scan_results")
      .insert({
        user_id: user?.id || null,
        url: input,
        scan_type: mode,
        risk_score: result.riskScore,
        classification: result.classification,
        confidence: result.confidence,
        detection_sources: result.sources,
        reasons: result.reasons,
        ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error saving scan to database:", insertError)
      // Continue even if database save fails - don't block the scan result
    } else {
      console.log("[v0] Scan saved to database with ID:", scanRecord?.id)
    }

    if (result.classification === "PHISHING") {
      const domain = new URL(input.startsWith("http") ? input : `https://${input}`).hostname

      await supabase.from("threat_intel").upsert(
        {
          url: input,
          domain,
          threat_type: result.classification,
          sources: result.sources.filter((s) => s.detected).map((s) => s.name),
          metadata: { confidence: result.confidence, riskScore: result.riskScore },
        },
        {
          onConflict: "url",
        },
      )
    }

    const response = NextResponse.json(result)
    response.headers.set("X-Processing-Time", `${result.processingTime}ms`)
    response.headers.set("X-Detection-Sources", result.sources.length.toString())

    return response
  } catch (error) {
    console.error("Real scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
