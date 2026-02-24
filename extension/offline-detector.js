
// Offline / Client-Side Detection Engine for Phishing Detective Enterprise
// Provides "High Tier" protection even when the main API server is unreachable.
// Ports the Ultra-Strict Heuristics from the server-side engine.

class OfflineDetector {
    /**
     * Main entry point for offline scanning
     * @param {string} url 
     * @returns {Promise<Object>} Scan result compatible with API response
     */
    static async scan(url) {
        // console.log("Running Offline Detection for:", url);
        const components = this.decomposeUrl(url);
        if (!components) return this.createSafeResult(url);

        let riskScore = 0;
        const indicators = [];

        // 1. Run Ultra-Strict Heuristics
        const obfuscation = this.checkObfuscation(components);
        riskScore += obfuscation.score;
        indicators.push(...obfuscation.indicators);

        const payloads = this.checkPayloads(components);
        riskScore += payloads.score;
        indicators.push(...payloads.indicators);

        const entropy = this.checkEntropy(components);
        riskScore += entropy.score;
        indicators.push(...entropy.indicators);

        const intent = this.checkMaliciousIntent(components);
        riskScore += intent.score;
        indicators.push(...intent.indicators);

        // 2. Quick Infrastructure Checks (No external API needed for regex)
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(components.hostname)) {
            riskScore += 50;
            indicators.push("SUSPICIOUS_INFRASTRUCTURE: Raw IP address usage");
        }

        // 3. Malware Keywords (Warez/Crack)
        const malwareKeywords = ["crack", "keygen", "cheat", "hack tool", "free premium", "activator", "loader.exe", "injector"];
        if (malwareKeywords.some(kw => components.full.toLowerCase().includes(kw))) {
            riskScore += 95;
            indicators.push("MALWARE_DISTRIBUTION: Known warez/malware terminology detected");
        }

        // 4. Brand Impersonation (Simple regex version)
        const brands = ["paypal", "google", "microsoft", "apple", "facebook", "netflix", "amazon", "bank", "chase", "wellsfargo"];
        const domain = components.domain.toLowerCase();
        // If domain contains brand but is NOT the brand's official domain
        // e.g. "paypal-secure.com" (contains paypal, isn't paypal.com)
        for (const brand of brands) {
            if (domain.includes(brand) && !domain.endsWith(`.${brand}.com`) && domain !== `${brand}.com`) {
                // Check if it's not a common sub like google.com.br or google.co.uk (simplified)
                if (!domain.includes(`.${brand}.`)) {
                    riskScore += 70;
                    indicators.push(`BRAND_IMPERSONATION: Suspicious use of '${brand}' in domain`);
                }
            }
        }

        // Finalize Verdict
        let verdict = "SAFE";
        if (riskScore >= 85) verdict = "MALICIOUS";
        else if (riskScore >= 65) verdict = "HIGH_RISK";
        else if (riskScore >= 40) verdict = "SUSPICIOUS";

        return {
            verdict,
            riskScore: Math.min(riskScore, 100),
            key_indicators: indicators.length > 0 ? indicators : ["No client-side heuristics triggers"],
            threat_type: indicators.length > 0 ? ["Client-Side Heuristics"] : [],
            is_offline_scan: true
        };
    }

    static createSafeResult(url) {
        return {
            verdict: "SAFE",
            riskScore: 0,
            key_indicators: ["Local scan clean"],
            threat_type: [],
            is_offline_scan: true
        };
    }

    // --- HELPER METHODS PORTED FROM LIB/REAL-DETECTION.TS ---

    static decomposeUrl(url) {
        try {
            const u = new URL(url);
            return {
                full: url,
                protocol: u.protocol,
                hostname: u.hostname,
                domain: u.hostname.split('.').slice(-2).join('.'), // Simple extract
                path: u.pathname,
                query: u.search,
                hash: u.hash
            };
        } catch (e) {
            return null;
        }
    }

    static checkObfuscation(components) {
        let score = 0;
        const indicators = [];
        const full = components.full;

        if (/%25[0-9A-F]{2}/i.test(full)) { // Double URL encoding
            score += 30;
            indicators.push("OBFUSCATION: Double URL encoding detected");
        }
        if (/0x[0-9A-Fa-f]+/.test(components.hostname)) { // Hex IP
            score += 40;
            indicators.push("OBFUSCATION: Hexadecimal IP address");
        }
        if (full.includes("base64") || /[A-Za-z0-9+/]{50,}={0,2}/.test(components.query)) {
            score += 25;
            indicators.push("OBFUSCATION: Potential Base64 encoded payload");
        }

        return { score, indicators };
    }

    static checkPayloads(components) {
        let score = 0;
        const indicators = [];
        const full = components.full.toLowerCase();

        const xss = /<script>|javascript:|on\w+=/i;
        const sqli = /union.*select|insert.*into|update.*set/i;
        const lfi = /\.\.\/|\/etc\/passwd|c:\\windows/i;
        const cmd = /cmd\.exe|powershell|bash\s+-|wget\s+|curl\s+/i;
        const rce = /eval\(|exec\(|system\(/i;

        if (xss.test(full)) { score += 45; indicators.push("PAYLOAD: XSS vector"); }
        if (sqli.test(full)) { score += 50; indicators.push("PAYLOAD: SQL Injection vector"); }
        if (lfi.test(full)) { score += 40; indicators.push("PAYLOAD: Path Traversal / LFI"); }
        if (cmd.test(full)) { score += 60; indicators.push("PAYLOAD: Command Injection"); }
        if (rce.test(full)) { score += 55; indicators.push("PAYLOAD: Code Execution"); }

        return { score, indicators };
    }

    static checkEntropy(components) {
        let score = 0;
        const indicators = [];

        const path = components.path.substring(1); // remove leading /
        if (path.length > 10) {
            const entropy = this.calculateShannonEntropy(path);
            if (entropy > 4.8) {
                score += 25;
                indicators.push(`ENTROPY: High randomness in path (${entropy.toFixed(1)})`);
            }
        }

        // Domain entropy (skip common TLDs for calc approx)
        const hostPart = components.hostname.split('.')[0];
        if (hostPart.length > 12) {
            const entropy = this.calculateShannonEntropy(hostPart);
            if (entropy > 4.5 && !hostPart.includes('-')) { // Exclude hyphenated-words which are usually safe
                score += 20;
                indicators.push("ENTROPY: DGA-like random domain name");
            }
        }

        return { score, indicators };
    }

    static checkMaliciousIntent(components) {
        let score = 0;
        const indicators = [];
        const full = components.full.toLowerCase();

        const urgency = /urgent|verify|suspend|restrict|locked|required|immediate/i;
        if (urgency.test(full)) { score += 15; indicators.push("INTENT: Urgency/Panic keywords"); }

        const fakeAuth = /login|signin|account|update|confirm|secure|banking|wallet/i;
        if (fakeAuth.test(full) && !full.includes("google.com") && !full.includes("microsoft.com")) {
            // Simple whitelist check
            score += 15;
            indicators.push("INTENT: Authentication keywords in suspicious context");
        }

        return { score, indicators };
    }

    static calculateShannonEntropy(str) {
        const len = str.length;
        const frequencies = {};
        for (let i = 0; i < len; i++) {
            const char = str[i];
            frequencies[char] = (frequencies[char] || 0) + 1;
        }
        let entropy = 0;
        for (const char in frequencies) {
            const p = frequencies[char] / len;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    }
}
