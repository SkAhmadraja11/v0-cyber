
// Standalone verification of the Risk Scoring Logic
// This replicates the calculateRiskScore method from lib/real-detection.ts to verify the fix.

function calculateRiskScore(sources) {
    let score = 0;
    const detectedSources = sources.filter(s => s.detected);

    // --- PHASE 0: CRITICAL OVERRIDES ---
    const trustedIntel = sources.find(s =>
        (s.name.includes("Google") || s.name.includes("PhishTank") || s.name.includes("VirusTotal")) &&
        s.detected && s.confidence >= 70
    );
    if (trustedIntel) return 100;

    const criticalForensics = [
        { check: "Brand Analysis", minScore: 98 },
        { check: "Homoglyph", minScore: 99 },
        { check: "Crypto Scam", minScore: 95 },
        { check: "Malware Pattern", minScore: 95 },
        { check: "Payload Analysis", minScore: 95 }
    ];

    for (const crit of criticalForensics) {
        if (detectedSources.some(s => s.name.includes(crit.check))) {
            return crit.minScore;
        }
    }

    // --- PHASE 1: COMPOSITION OF RISK ---
    if (detectedSources.some(s => s.name.includes("Deceptive Infrastructure"))) score += 75;
    if (detectedSources.some(s => s.name.includes("Identity"))) score += 75;

    // FIXED LOGIC START ==========================================
    const nlpSource = detectedSources.find(s => s.name === "Enhanced NLP Analysis");
    if (nlpSource) score += 65;

    // Check for "New Domain + Suspicious Keyword"
    const domainAgeSrc = sources.find(s => s.name.includes("WHOIS"));
    if (domainAgeSrc && domainAgeSrc.detected && nlpSource && nlpSource.detected) {
        score = Math.max(score, 85);
    }

    // Check for "Raw IP + Suspicious Keyword" (Common Phishing Pattern)
    const ipSource = detectedSources.find(s => s.name === "IP Usage Check");
    if (ipSource && nlpSource && nlpSource.detected) {
        score = Math.max(score, 85);
    }
    // FIXED LOGIC END ============================================

    const mediumSignals = [
        "Redirect Analysis",
        "External Resources",
        "JavaScript Behavior",
        "Historical Threat",
        "Security Headers",
        "Privacy Proxy",
        "Domain Parking",
        "IP Usage Check" // FIXED: Added IP Usage Check
    ];

    let mediumCount = 0;
    mediumSignals.forEach(sig => {
        const match = detectedSources.find(s => s.name.toLowerCase().includes(sig.toLowerCase()));
        if (match) {
            score += 20;
            mediumCount++;
        }
    });

    if (detectedSources.some(s => s.name.includes("Random Domain"))) {
        score += 25;
    }

    // --- PHASE 2: AMPLIFICATION ---
    if (mediumCount >= 3) {
        score = Math.max(score, 75);
    } else if (mediumCount === 2 && score < 50) {
        score = 45;
    }

    // --- PHASE 3: SAFETY NETS ---
    // (Simplified for this test as we assume not a whitelist domain)

    return Math.min(Math.max(score, 0), 100);
}

// TEST CASE
const sources = [
    { name: "IP Usage Check", detected: true, confidence: 75, reason: "Host is an raw IP address" },
    { name: "Enhanced NLP Analysis", detected: true, confidence: 80, reason: "Urgent/Security keywords found" },
    { name: "Google Safe Browsing", detected: false, confidence: 0 },
    { name: "VirusTotal", detected: true, confidence: 45, reason: "Heuristic Match" }, // Low confidence, ignored by override
    { name: "WHOIS / DNS", detected: false, confidence: 0 } // Not new
];

console.log("Testing IP + NLP Combination...");
const score = calculateRiskScore(sources);
console.log(`Risk Score: ${score}`);

if (score >= 85) {
    console.log("SUCCESS: Score is High (>= 85)");
} else {
    console.log("FAILURE: Score is too low");
}
