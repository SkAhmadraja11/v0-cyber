import { type NextRequest, NextResponse } from "next/server"
import { RealPhishingDetector } from "@/lib/real-detection"
import { EnterpriseThreatEngine, ThreatInput } from "@/lib/enterprise-detection"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Incoming real-scan body:", body)

    // Strict Validation
    const input = body.url || body.input
    const mode = body.mode || 'url'
    const refresh = body.refresh

    if (!input || typeof input !== 'string' || input.trim() === '') {
      return NextResponse.json({
        success: false,
        error: "URL is required",
        message: "Please provide a valid URL to scan"
      }, { status: 400 })
    }

    // Basic URL format validation
    try {
      if (input.includes('.') && !input.startsWith('http') && !input.startsWith('//')) {
        new URL('https://' + input)
      } else {
        new URL(input)
      }
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Invalid URL format",
        message: "The provided string is not a valid URL"
      }, { status: 400 })
    }

    const normalizedInput = input.trim()

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
      content: input
    }

    const result = await engine.analyze(threatInput)

    // Save scan results to database (Adapted for new schema if needed, or best-effort mapping)
    // We map snake_case result back to legacy DB columns where possible, or just save raw result
    try {
      const { error: insertError } = await supabase
        .from("scan_results")
        .insert({
          user_id: user?.id || null,
          url: normalizedInput,
          scan_type: mode || 'url',
          risk_score: result.risk_score,
          classification: result.verdict,
          confidence: result.confidence === 'VERY_HIGH' ? 0.99 : result.confidence === 'HIGH' ? 0.85 : 0.5, // Approx mapping
          detection_sources: result.key_indicators.map(i => ({ name: i, detected: true, reason: i })), // Map indicators to sources
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
          url: normalizedInput.slice(0, 500),
          domain: normalizedInput.includes('http') ? new URL(normalizedInput).hostname : normalizedInput.split('/')[0],
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
      risk_score: result.risk_score, // Lowercase snake_case for extension if needed, but camelCase below

      // -- Frontend Fields --
      riskScore: result.risk_score,
      classification: result.verdict,
      confidence: result.confidence === 'VERY_HIGH' ? 99 : result.confidence === 'HIGH' ? 85 : result.confidence === 'MEDIUM' ? 60 : 10,
      reasons: result.key_indicators,
      sources: result.sources || [],
      timestamp: new Date().toISOString(),
      verdictReport: {
        url: normalizedInput,
        finalVerdict: result.verdict,
        evidenceSourcesUsed: result.sources?.map(s => s.name) || [],
        confirmedFindings: result.key_indicators,
        confidenceLevel: result.confidence === 'VERY_HIGH' ? "High (Verified)" :
          result.confidence === 'HIGH' ? "High (Forensic)" :
            result.confidence === 'MEDIUM' ? "Standard (Forensic)" : "Initial Assessment",
        limitations: result.confidence === 'MEDIUM' || result.confidence === 'LOW'
          ? ["Engine relying on technical forensics and heuristic patterns due to limited external API intelligence."]
          : [],
        recommendedAction: result.recommended_action === 'BLOCK' ? "Block" :
          result.recommended_action === 'QUARANTINE' ? "Isolate" :
            result.recommended_action === 'WARN' ? "Warn" : "Allow"
      }
    };

    return NextResponse.json(response)

  } catch (error) {
    console.error("Enterprise scan error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "An unexpected error occurred during scan"
    }, { status: 500 })
  }
}
