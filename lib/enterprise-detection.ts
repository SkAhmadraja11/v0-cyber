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
        // Comprehensive multi-layer analysis using detector's technical and intelligence checks
        const signals: DetectionSource[] = [];
        const reasons: string[] = [];

        // --- DYNAMIC EXTRACTION ---
        // Discover ALL URLs and email addresses in the input at runtime
        const dynamicUrls = this.extractAllUrls(input.content);
        const dynamicEmails = this.extractAllEmails(input.content);

        // Primary URL for URL-mode inputs
        const primaryUrl = input.type === 'url' ? input.content : null;
        // Merge: primary URL + any URLs found dynamically (up to 5 total)
        const urlsToScan = Array.from(new Set([
            ...(primaryUrl ? [primaryUrl] : []),
            ...dynamicUrls
        ])).slice(0, 5);

        // 1) Scan all discovered URLs in parallel
        if (urlsToScan.length > 0) {
            try {
                const urlSignalGroups = await Promise.all(
                    urlsToScan.map(url => this.detector.scanUrl(url, false).catch(() => [] as DetectionSource[]))
                );
                signals.push(...urlSignalGroups.flat());
            } catch (e) {
                // Non-fatal
            }
        }

        // 2) Content and email-specific signals
        if (input.type === 'email') {
            try {
                signals.push(await this.detector.nlpPhishingLanguageDetection(input.content));
                signals.push(await this.detector.checkEmailIdentity(input.content));
                signals.push(await this.detector.checkEmailVirusRisk(input.content));
                signals.push(await this.detector.checkEmailSpecificPatterns(input.content));

                // --- DYNAMIC EMAIL ADDRESS REPUTATION ---
                // Check every email address found in the content
                if (dynamicEmails.length > 0) {
                    const emailRep = await Promise.all(
                        dynamicEmails.slice(0, 8).map(e => this.detector.checkEmailReputation(e).catch(() => null))
                    );
                    signals.push(...emailRep.filter(Boolean) as DetectionSource[]);
                }

                if (input.metadata?.emailHeaders) {
                    const auth = this.analyzeEmailHeaders(input.metadata.emailHeaders);
                    if (auth.indicators.length) {
                        signals.push({ name: 'Email Authentication', detected: true, confidence: auth.score, reason: auth.indicators.join('; '), isReal: true });
                    }
                }
            } catch { /* continue */ }
        } else {
            // For URL scans: run NLP on the raw URL string and also check any email addresses embedded in path/query
            try {
                signals.push(await this.detector.nlpPhishingLanguageDetection(input.content));
            } catch { }

            if (dynamicEmails.length > 0) {
                const emailRep = await Promise.all(
                    dynamicEmails.slice(0, 3).map(e => this.detector.checkEmailReputation(e).catch(() => null))
                );
                signals.push(...emailRep.filter(Boolean) as DetectionSource[]);
            }
        }

        // 3) Scoring: deterministic, weighted, explainable
        let riskScore = 0;
        let highestConfidence = 0;
        let realDetections = 0;

        for (const s of signals) {
            if (!s) continue;
            const name = (s.name || '').toLowerCase();
            const detected = !!s.detected;
            const conf = Math.min(Math.max(Math.round(s.confidence || 0), 0), 100);
            highestConfidence = Math.max(highestConfidence, conf);
            if (s.isReal && detected) realDetections++;

            if (!detected) continue;

            // Base weight by indicator type
            let weight = 10;
            if (name.includes('google') || name.includes('phishtank') || name.includes('virustotal')) weight = 45;
            else if (name.includes('malware') || name.includes('payload') || name.includes('virus')) weight = 40;
            else if (name.includes('puny') || name.includes('homoglyph') || name.includes('idn')) weight = 40;
            else if (name.includes('brand') || name.includes('imperson') || name.includes('title')) weight = 35;
            else if (name.includes('deceptive') || name.includes('infrastructure') || name.includes('random domain')) weight = 35;
            else if (name.includes('redirect') || name.includes('javascript') || name.includes('external resources') || name.includes('page content')) weight = 30;
            else if (name.includes('whois') || name.includes('domain age') || name.includes('privacy') || name.includes('parking')) weight = 20;
            else if (name.includes('ip usage') || name.includes('raw ip')) weight = 25;

            // Scale by confidence to create deterministic contributions
            const contribution = Math.round((conf / 100) * weight);
            riskScore += contribution;

            // Record concise technical reason
            const shortReason = s.reason && s.reason.length > 180 ? s.reason.slice(0, 177) + '...' : s.reason || s.name;
            reasons.push(`${s.name}: ${shortReason}`);
        }

        // Consensus / absolute rules
        const t1Hits = signals.filter(s => s.detected && /(google|phishtank|virustotal)/i.test(s.name)).length;
        if (t1Hits >= 2) riskScore = Math.max(riskScore, 98);
        if (signals.some(s => s.detected && /google|phishtank|virustotal/i.test(s.name) && (s.confidence || 100) >= 90)) riskScore = Math.max(riskScore, 95);

        // Strong single indicator domination
        if (highestConfidence >= 95) riskScore = Math.max(riskScore, highestConfidence);

        // If domain is new or WHOIS shows 'isNew', elevate minimal risk
        const whois = signals.find(s => /whois|domain age/i.test(s.name));
        if (whois && /new|unusually new|is unusually new/i.test(String(whois.reason))) {
            riskScore = Math.max(riskScore, 40);
            reasons.push(`Domain Intelligence: ${whois.reason}`);
        }

        // If no real verified signals (all heuristic), treat as SUSPICIOUS baseline
        // Optimistic Clean: If no threats detected, do not force a risk baseline. 
        // Allow score to be 0 for clean sites.

        // Normalize and clamp
        riskScore = Math.min(Math.max(Math.round(riskScore), 0), 100);

        // Deterministic mapping to verdict and confidence
        let verdict: Verdict = 'SAFE';
        let confidence: Confidence = 'LOW';
        let recommended_action: RecommendedAction = 'ALLOW';

        // Intelligence check: Did we get hits from external APIs?
        const hasT1Intelligence = signals.some(s => s.detected && /(google|phishtank|virustotal)/i.test(s.name));
        const hasForensicHits = signals.some(s => s.detected && !/(google|phishtank|virustotal)/i.test(s.name));

        if (riskScore >= 85) {
            verdict = 'MALICIOUS';
            confidence = hasT1Intelligence ? 'VERY_HIGH' : 'HIGH';
            recommended_action = 'BLOCK';
        } else if (riskScore >= 65) {
            verdict = 'HIGH_RISK';
            confidence = hasT1Intelligence ? 'HIGH' : 'MEDIUM';
            recommended_action = 'QUARANTINE';
        } else if (riskScore >= 40) {
            verdict = 'SUSPICIOUS';
            confidence = hasForensicHits ? 'MEDIUM' : 'LOW';
            recommended_action = 'WARN';
        } else {
            verdict = 'SAFE';
            // If it's safe because of a lack of evidence, confidence is low.
            // If it's safe even with some noise, confidence is medium.
            confidence = riskScore < 10 ? 'MEDIUM' : 'LOW';
            recommended_action = 'ALLOW';
        }

        // If truly unknown (no signals at all), treat as SAFE (Opt-in to threat detection)
        if (signals.length === 0) {
            verdict = 'SAFE';
            confidence = 'LOW';
            riskScore = 0;
            reasons.push('No immediate threat indicators found');
        }

        // Build concise, de-duplicated reasons (top 6)
        const uniqueReasons: string[] = [];
        for (const r of reasons) {
            if (uniqueReasons.length >= 6) break;
            if (!uniqueReasons.includes(r)) uniqueReasons.push(r);
        }

        // Final user-impact and explanation (concise)
        const userImpact = (verdict === 'MALICIOUS' || verdict === 'HIGH_RISK')
            ? 'Interaction could lead to credential theft, malware infection, or financial loss.'
            : (verdict === 'SUSPICIOUS' ? 'Potential social engineering or suspicious infrastructure.' : 'No immediate threats detected.');

        const explanation = uniqueReasons.length > 0
            ? uniqueReasons.join(' | ')
            : 'No specific indicators found';

        // Return enterprise-shaped response (keeps original schema)
        return {
            risk_score: riskScore,
            verdict,
            threat_type: uniqueReasons.length ? ['Unknown'] : ['Unknown'],
            confidence,
            key_indicators: uniqueReasons,
            user_impact: userImpact,
            recommended_action: recommended_action,
            explanation,
            sources: signals
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
