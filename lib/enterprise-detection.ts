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

        // 1. GATHER SIGNALS
        const signals: DetectionSource[] = [];
        const technicalIndicators: string[] = [];
        let riskScore = 0;

        // -- A. URL / DOMAIN INTELLIGENCE (For Web Scans & Email Links) --
        if (input.type === "url" || (input.type === "email" && this.extractUrl(input.content))) {
            const url = input.type === "url" ? input.content : this.extractUrl(input.content);
            if (url) {
                // RUN CHECKS IN PARALLEL (Robust: If one fails, others conclude)
                const [googleRes, phishRes, brandRes, infraRes, punyRes] = await Promise.allSettled([
                    this.detector.checkGoogleSafeBrowsing(url),
                    this.detector.checkPhishTank(url),
                    this.detector.checkBrandImpersonation(url),
                    this.detector.checkDeceptiveInfrastructure(url),
                    this.detector.checkPunycode(url)
                ]);

                // Helper to extract result safely
                const getResult = (res: PromiseSettledResult<any>) => res.status === 'fulfilled' ? res.value : { detected: false, reason: "Check failed" };

                const google = getResult(googleRes);
                const phish = getResult(phishRes);
                const brand = getResult(brandRes);
                const infra = getResult(infraRes);
                const puny = getResult(punyRes);

                if (google.detected) {
                    signals.push(google);
                    technicalIndicators.push(`Google Safe Browsing Flag: ${google.reason}`);
                    riskScore = 100; // Critical
                }

                if (phish.detected) {
                    signals.push(phish);
                    technicalIndicators.push(`PhishTank Verified: ${phish.reason}`);
                    riskScore = 100;
                }

                if (brand.detected) {
                    signals.push(brand);
                    technicalIndicators.push(brand.reason);
                    riskScore = Math.max(riskScore, brand.confidence);
                }

                if (infra.detected) {
                    signals.push(infra);
                    technicalIndicators.push(infra.reason);
                    riskScore = Math.max(riskScore, infra.confidence);
                }

                if (puny.detected) {
                    signals.push(puny);
                    technicalIndicators.push(puny.reason);
                    riskScore = Math.max(riskScore, 90);
                }
            }
        }

        // -- B. EMAIL AUTHENTICATION ANALYSIS --
        if (input.type === "email" && input.metadata?.emailHeaders) {
            const authAnalysis = this.analyzeEmailHeaders(input.metadata.emailHeaders);
            if (authAnalysis.score > 0) {
                riskScore = Math.max(riskScore, authAnalysis.score);
                technicalIndicators.push(...authAnalysis.indicators);
            }
        }

        // -- C. CONTENT & INTENT ANALYSIS (NLP) --
        if (input.type === "email" || input.type === "url") {
            const [nlpRes, cryptoRes] = await Promise.allSettled([
                this.detector.nlpPhishingLanguageDetection(input.content),
                this.detector.checkCryptoScams(input.content)
            ]);

            const nlp = nlpRes.status === 'fulfilled' ? nlpRes.value : {
                name: "NLP Analysis",
                detected: false,
                confidence: 0,
                reason: "Analysis failed due to timeout or error",
                isReal: false
            };
            const crypto = cryptoRes.status === 'fulfilled' ? cryptoRes.value : {
                name: "Crypto Analysis",
                detected: false,
                confidence: 0,
                reason: "Analysis failed due to timeout or error",
                isReal: false
            };

            if (nlp.detected) {
                signals.push(nlp);
                technicalIndicators.push(nlp.reason);
                riskScore = Math.max(riskScore, nlp.confidence);
            }

            if (crypto.detected) {
                signals.push(crypto);
                technicalIndicators.push(crypto.reason);
                riskScore = Math.max(riskScore, 95);
            }
        }

        // -- D. ATTACHMENT & PAYLOAD HEURISTICS --
        if (input.metadata?.attachments) {
            for (const file of input.metadata.attachments) {
                const fileRisk = this.analyzeAttachment(file);
                if (fileRisk.score > 0) {
                    riskScore = Math.max(riskScore, fileRisk.score);
                    technicalIndicators.push(...fileRisk.indicators);
                }
            }
        }

        // -- E. FINAL SCORING & SOCIAL ENGINEERING CORRELATION --
        // "Escalate risk on ANY high-confidence indicator" -> Already handled by Max()
        // "NEVER average down high-risk indicators" -> We used Max()

        // Normalize Risk Score
        riskScore = Math.min(Math.round(riskScore), 100);

        return this.formatResponse(riskScore, technicalIndicators, input, signals);
    }

    // --- PRIVATE HELPERS ---

    private extractUrl(text: string): string | null {
        const match = text.match(/https?:\/\/[^\s"']+/);
        return match ? match[0] : null;
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
