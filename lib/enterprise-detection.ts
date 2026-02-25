import { RealPhishingDetector, DetectionSource } from "./real-detection";

// --- STRICT RESPONSE TYPES ---

export type Verdict = "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "MALICIOUS";

export type ThreatType =
    | "Phishing"
    | "Credential Harvesting"
    | "Malware Delivery"
    | "Brand Impersonation"
    | "Business Email Compromise"
    | "Scam"
    | "Unknown";

export type Confidence = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type RecommendedAction = "ALLOW" | "WARN" | "BLOCK" | "QUARANTINE";

export interface EnterpriseThreatResponse {
    risk_score: number;
    verdict: Verdict;
    threat_type: ThreatType[];
    confidence: Confidence;
    key_indicators: string[];
    user_impact: string;
    recommended_action: RecommendedAction;
    explanation: string;
    sources: DetectionSource[];
}

export interface ThreatInput {
    type: "email" | "url" | "file";
    content: string; // URL string, Email body, or File name/hash
    metadata?: {
        emailHeaders?: string; // Raw headers
        senderIdentity?: string;
        attachments?: Array<{ name: string; type: string; size: number }>;
        interactionContext?: "hover" | "click" | "download";
    };
}

// --- ENGINE CLASS ---

export class EnterpriseThreatEngine {
    private detector: RealPhishingDetector;

    constructor() {
        this.detector = new RealPhishingDetector();
    }

    public async analyze(input: ThreatInput): Promise<EnterpriseThreatResponse> {
        // Use the core detector for the heavy lifting
        const mode = input.type === "email" ? "email" : "url";
        const result = await this.detector.detect(input.content, mode);

        // Map Verdict
        let verdict: Verdict = "SAFE";
        if (result.classification === "MALICIOUS") verdict = "MALICIOUS";
        else if (result.classification === "DANGEROUS") verdict = "HIGH_RISK";
        else if (result.riskScore >= 40) verdict = "SUSPICIOUS";

        // Map Confidence
        let confidence: Confidence = "LOW";
        if (result.confidence >= 90) confidence = "VERY_HIGH";
        else if (result.confidence >= 70) confidence = "HIGH";
        else if (result.confidence >= 40) confidence = "MEDIUM";

        // Map Recommended Action
        let recommended_action: RecommendedAction = "ALLOW";
        if (verdict === "MALICIOUS") recommended_action = "BLOCK";
        else if (verdict === "HIGH_RISK") recommended_action = "QUARANTINE";
        else if (verdict === "SUSPICIOUS") recommended_action = "WARN";

        // Determine Threat Types from sources
        const threat_types: ThreatType[] = [];
        const detectedSources = result.sources.filter(s => s.detected);

        if (detectedSources.some(s => s.category === "Virus" || s.name.toLowerCase().includes("malware"))) {
            threat_types.push("Malware Delivery");
        }
        if (detectedSources.some(s => s.name.toLowerCase().includes("brand") || s.name.toLowerCase().includes("impersonation"))) {
            threat_types.push("Brand Impersonation");
        }
        if (detectedSources.some(s => s.name.toLowerCase().includes("phishing") || s.name.toLowerCase().includes("homoglyph"))) {
            threat_types.push("Phishing");
        }
        if (detectedSources.some(s => s.name.toLowerCase().includes("credential") || s.name.toLowerCase().includes("login"))) {
            threat_types.push("Credential Harvesting");
        }
        if (detectedSources.some(s => s.name.toLowerCase().includes("scam") || s.name.toLowerCase().includes("crypto"))) {
            threat_types.push("Scam");
        }

        if (threat_types.length === 0 && verdict !== "SAFE") {
            threat_types.push("Unknown");
        }

        // Final user-impact and explanation
        const userImpact = (verdict === 'MALICIOUS' || verdict === 'HIGH_RISK')
            ? 'Interaction could lead to credential theft, malware infection, or financial loss.'
            : (verdict === 'SUSPICIOUS' ? 'Potential social engineering or suspicious infrastructure.' : 'No immediate threats detected.');

        const explanation = result.reasons.length > 0
            ? result.reasons.join(' | ')
            : 'No specific indicators found';

        return {
            risk_score: result.riskScore,
            verdict,
            threat_type: threat_types,
            confidence,
            key_indicators: result.reasons,
            user_impact: userImpact,
            recommended_action: recommended_action,
            explanation,
            sources: result.sources
        };
    }

    // --- PRIVATE HELPERS ---

    /** @deprecated Use extractAllUrls for multi-URL support */
    private extractUrl(text: string): string | null {
        const match = text.match(/https?:\/\/[^\s"']+/);
        return match ? match[0] : null;
    }

    /** Dynamically extract all URLs from text at runtime */
    private extractAllUrls(text: string): string[] {
        const urlRegex =
            /(?:https?:\/\/(?:www\.)?|www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)|(?<![\w@.])([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}(?:\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?)/g
        const raw = [...text.matchAll(urlRegex)].map(m => m[0])
        const normalized = raw
            .map(u => (u.startsWith('http') || u.startsWith('www.') ? u : `https://${u}`))
            .filter(u => {
                try { new URL(u.startsWith('www.') ? `https://${u}` : u); return true } catch { return false }
            })
        return Array.from(new Set(normalized))
    }

    /** Dynamically extract all email addresses from text at runtime */
    private extractAllEmails(text: string): string[] {
        const emailRegex = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g
        const matches = text.match(emailRegex) || []
        return Array.from(new Set(matches.map(e => e.toLowerCase())))
    }

    private analyzeEmailHeaders(headers: string): { score: number; indicators: string[] } {
        let score = 0;
        const indicators: string[] = [];
        const lowerHeaders = headers.toLowerCase();

        // 1. SPF Check (Simulated parsing of Authentication-Results)
        if (lowerHeaders.includes("spf=fail") || lowerHeaders.includes("spf=softfail")) {
            score = 65;
            indicators.push("Email Authentication Failed (SPF)");
        }

        // 2. DKIM Check
        if (lowerHeaders.includes("dkim=fail")) {
            score = 70;
            indicators.push("Email Authentication Failed (DKIM)");
        }

        // 3. DMARC Check
        if (lowerHeaders.includes("dmarc=fail")) {
            score = 80;
            indicators.push("DMARC Policy Violation - High Spoofing Risk");
        }

        // 4. Reply-To Mismatch (Simple check if headers provided explicitly)
        // Complex regex to extract From and Reply-To
        const fromMatch = headers.match(/^From:.*<(.+)>/m) || headers.match(/^From:\s*(.+)/m);
        const replyToMatch = headers.match(/^Reply-To:.*<(.+)>/m) || headers.match(/^Reply-To:\s*(.+)/m);

        if (fromMatch && replyToMatch) {
            const fromEmail = fromMatch[1].trim();
            const replyToEmail = replyToMatch[1].trim();
            if (fromEmail !== replyToEmail) {
                score = Math.max(score, 50);
                indicators.push(`Reply-To Mismatch: From '${fromEmail}' but replies go to '${replyToEmail}'`);
            }
        }

        return { score, indicators };
    }

    private analyzeAttachment(file: { name: string; type: string; size: number }): { score: number; indicators: string[] } {
        let score = 0;
        const indicators: string[] = [];
        const ext = file.name.split('.').pop()?.toLowerCase() || "";

        // 1. Dangerous Extensions
        const dangerousExts = ["exe", "bat", "cmd", "scr", "vbs", "js", "wsf", "hta", "ps1", "jar"];
        if (dangerousExts.includes(ext)) {
            score = 90;
            indicators.push(`Executable attachment detected (.${ext})`);
        }

        // 2. Double Extension Trick
        if (file.name.match(/\.[a-z]{3}\.exe$/i)) {
            score = 100;
            indicators.push("Double extension malware evasion detected");
        }

        // 3. MIME Mismatch (Simulated logic as we rely on inputs)
        // If strict type is 'application/x-dosexec' but name is 'invoice.pdf'
        if (file.type === "application/x-dosexec" && ext !== "exe") {
            score = 95;
            indicators.push("MIME Type Mismatch: Executable masked as document");
        }

        return { score, indicators };
    }

    private formatResponse(riskScore: number, indicators: string[], input: ThreatInput, signals: DetectionSource[]): EnterpriseThreatResponse {
        // Risk Interpretation
        let verdict: Verdict = "SAFE";
        let confidence: Confidence = "LOW";
        let recommendedAction: RecommendedAction = "ALLOW";

        if (riskScore >= 76) {
            verdict = "MALICIOUS";
            confidence = "VERY_HIGH";
            recommendedAction = "BLOCK";
        } else if (riskScore >= 51) {
            verdict = "HIGH_RISK";
            confidence = "HIGH";
            recommendedAction = "QUARANTINE";
        } else if (riskScore >= 26) {
            verdict = "SUSPICIOUS";
            confidence = "MEDIUM";
            recommendedAction = "WARN";
        }

        // Determine Threat Types
        const threatTypes: ThreatType[] = [];
        const indString = indicators.join(" ").toLowerCase();

        if (indString.includes("phishing") || indString.includes("login") || indString.includes("password")) threatTypes.push("Phishing");
        if (indString.includes("malware") || indString.includes("executable")) threatTypes.push("Malware Delivery");
        if (indString.includes("brand") || indString.includes("spoofing") || indString.includes("impersonation")) threatTypes.push("Brand Impersonation");
        if (indString.includes("bank") || indString.includes("financial") || indString.includes("wallet")) threatTypes.push("Scam");

        if (threatTypes.length === 0 && riskScore > 25) threatTypes.push("Unknown");

        // User Impact & Explanation
        let userImpact = "None.";
        let explanation = "No significant threats detected.";

        if (verdict === "MALICIOUS" || verdict === "HIGH_RISK") {
            userImpact = "Interaction could lead to immediate credential theft, malware infection, or financial loss.";
            explanation = `The system detected CRITICAL indicators: ${indicators.slice(0, 2).join(", ")}. This content is actively malicious and matches known attack patterns.`;
        } else if (verdict === "SUSPICIOUS") {
            userImpact = "Potential risk of social engineering or spam.";
            explanation = `Some suspicious elements were found: ${indicators.slice(0, 2).join(", ")}. Proceed with extreme caution.`;
        }

        return {
            risk_score: riskScore,
            verdict,
            threat_type: threatTypes,
            confidence,
            key_indicators: indicators,
            user_impact: userImpact,
            recommended_action: recommendedAction,
            explanation,
            sources: input.type === "url" || input.type === "email" ? signals : [], // NEW: Return collected signals
        };
    }
}
