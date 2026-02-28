import { type NextRequest, NextResponse } from "next/server"
import { RealPhishingDetector } from "@/lib/real-detection"
import { EnterpriseThreatEngine, ThreatInput } from "@/lib/enterprise-detection"
import { createClient } from "@/lib/supabase/server"

// CORS headers for Chrome extension compatibility
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

// Handles CORS preflight from the Chrome extension (browser always sends OPTIONS first)
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON",
        message: "The request body must be a valid JSON object"
      }, { status: 400, headers: CORS_HEADERS })
    }

    console.log("Incoming body:", body)

    // Strict Validation
    const input = body.url || body.input
    const mode = body.mode || 'url'

    if (!input || typeof input !== 'string' || input.trim() === '') {
      return NextResponse.json({
        success: false,
        error: "URL is required",
        message: "URL is required"
      }, { status: 400, headers: CORS_HEADERS })
    }

    const normalizedInput = input.trim()
    let finalUrl = normalizedInput

    // Auto-prepend protocol if missing for basic validation
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }

    // Basic URL format validation
    try {
      new URL(finalUrl)
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Invalid URL format",
        message: "Invalid URL format"
      }, { status: 400, headers: CORS_HEADERS })
    }

    const supabase = await createClient()

    // Graceful Auth Check (Prevent timeout from blocking scan)
    let user = null;
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (e) {
      console.warn("Auth check failed (proceeding as anonymous):", e);
    }

    // --- ENTERPRISE ENGINE INTEGRATION ---
    const engine = new EnterpriseThreatEngine()

    // Speed optimization: Removed artificial delay
    // await new Promise((resolve) => setTimeout(resolve, 800))

    // Map legacy input to strict ThreatInput
    const threatInput: ThreatInput = {
      type: (mode === 'email') ? 'email' : 'url',
      content: finalUrl
    }

    const result = await engine.analyze(threatInput)

    // Save scan results to database
    try {
      const { error: insertError } = await supabase
        .from("scan_results")
        .insert({
          user_id: user?.id || null,
          url: finalUrl,
          scan_type: mode || 'url',
          risk_score: result.risk_score,
          classification: result.verdict,
          confidence: result.confidence === 'VERY_HIGH' ? 99 : result.confidence === 'HIGH' ? 85 : result.confidence === 'MEDIUM' ? 60 : 30,
          detection_sources: result.key_indicators.map(i => ({ name: i, detected: true, reason: i })),
          reasons: result.key_indicators,
          ip_address: request.headers.get("x-forwarded-for") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
        })

      if (insertError) console.error("[v0] DB Error:", insertError)
    } catch (e) { /* Ignore DB errors */ }

    // Save Threat Intel if malicious
    if (result.verdict === "MALICIOUS" || result.verdict === "HIGH_RISK") {
      try {
        await supabase.from("threat_intel").upsert({
          url: finalUrl.slice(0, 500),
          domain: finalUrl.includes('http') ? new URL(finalUrl).hostname : finalUrl.split('/')[0],
          threat_type: result.threat_type[0] || 'Unknown',
          sources: result.key_indicators,
          metadata: { riskScore: result.risk_score, confidence: result.confidence }
        }, { onConflict: 'url' })
      } catch (e) { /* Ignore */ }
    }

    // Map to RealDetectionResult for Frontend Compatibility
    const response = {
      // -- Extension Fields --
      verdict: result.verdict,
      threat_type: result.threat_type,
      key_indicators: result.key_indicators,
      explanation: result.explanation,
      user_impact: result.user_impact,
      recommended_action: result.recommended_action,
      risk_score: result.risk_score,

      // -- Frontend Fields --
      riskScore: result.risk_score,
      classification: result.verdict === 'HIGH_RISK' ? 'DANGEROUS' : result.verdict,
      confidence: result.confidence === 'VERY_HIGH' ? 99 :
        result.confidence === 'HIGH' ? 85 :
          result.confidence === 'MEDIUM' ? 60 : 15,
      reasons: result.key_indicators,
      sources: result.sources || [],
      timestamp: new Date().toISOString(),
      verdictReport: {
        url: finalUrl,
        finalVerdict: result.verdict,
        evidenceSourcesUsed: result.sources?.map(s => s.name) || [],
        confirmedFindings: result.key_indicators,
        confidenceLevel: result.confidence === 'VERY_HIGH' ? "High" :
          result.confidence === 'HIGH' ? "High" :
            result.confidence === 'MEDIUM' ? "Medium" : "Low",
        limitations: result.confidence === 'MEDIUM' || result.confidence === 'LOW'
          ? ["Heuristic analysis baseline."]
          : [],
        recommendedAction: result.recommended_action === 'BLOCK' ? "Block" : "Allow"
      }
    };

    return NextResponse.json(response, { headers: CORS_HEADERS })

  } catch (error) {
    console.error("Enterprise scan error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "An unexpected error occurred during scan"
    }, { status: 500, headers: CORS_HEADERS })

  }
}
