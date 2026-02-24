import { type NextRequest, NextResponse } from "next/server"
import { EnterpriseThreatEngine, ThreatInput } from "@/lib/enterprise-detection"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { input, mode } = body

        if (!input) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await createClient()

        // Graceful Auth Check
        let user = null;
        try {
            const { data } = await supabase.auth.getUser()
            user = data.user
        } catch (e) {
            console.warn("Auth check failed (proceeding as anonymous):", e);
        }

        const engine = new EnterpriseThreatEngine()

        const threatInput: ThreatInput = {
            type: (mode === 'email') ? 'email' : 'url',
            content: input
        }

        const result = await engine.analyze(threatInput)

        // Best-effort mapping for database logging
        try {
            await supabase
                .from("scan_results")
                .insert({
                    user_id: user?.id || null,
                    url: input,
                    scan_type: mode || 'url',
                    risk_score: result.risk_score,
                    classification: result.verdict,
                    confidence: result.confidence === 'VERY_HIGH' ? 0.99 : 0.85,
                    reasons: result.key_indicators,
                    ip_address: request.headers.get("x-forwarded-for") || "unknown",
                    user_agent: request.headers.get("user-agent") || "unknown",
                })
        } catch (e) { /* Ignore DB errors */ }

        const response = {
            verdict: result.verdict,
            threat_type: result.threat_type,
            key_indicators: result.key_indicators,
            explanation: result.explanation,
            user_impact: result.user_impact,
            recommended_action: result.recommended_action,
            risk_score: result.risk_score,
            riskScore: result.risk_score,
            classification: result.verdict,
            confidence: result.confidence === 'VERY_HIGH' ? 99 : 85,
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(response)

    } catch (error) {
        console.error("Scan error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
