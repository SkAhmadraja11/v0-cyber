import { EnterpriseThreatEngine } from "./lib/enterprise-detection";

async function testAccuracy() {
    const engine = new EnterpriseThreatEngine();

    const testCases = [
        {
            name: "High Reputation Domain (Google)",
            type: "url" as const,
            content: "https://www.google.com",
            expectedVerdict: "SAFE"
        },
        {
            name: "Safe Neutral Domain (Example)",
            type: "url" as const,
            content: "https://example.com",
            expectedVerdict: "SAFE"
        },
        {
            name: "Unknown Domain (No signals)",
            type: "url" as const,
            content: "https://a-random-safe-looking-new-domain-123.com",
            expectedVerdict: "SAFE"
        },
        {
            name: "Phishing Pattern (Urgency + Brand + Bad TLD)",
            type: "url" as const,
            content: "https://paypal-verify-account.top",
            expectedVerdict: ["HIGH_RISK", "MALICIOUS", "SUSPICIOUS"] // Should be flagged
        },
        {
            name: "Sensitive Form on HTTP (Critical)",
            type: "url" as const,
            content: "http://unsecure-login-site.xyz/login?user=admin",
            expectedVerdict: ["HIGH_RISK", "MALICIOUS"]
        }
    ];

    console.log("Starting Accuracy Verification...\n");

    for (const testCase of testCases) {
        console.log(`Testing: ${testCase.name} (${testCase.content})`);
        try {
            const result = await engine.analyze({ type: testCase.type, content: testCase.content });
            console.log(`Result: Verdict=${result.verdict}, Score=${result.risk_score}`);
            console.log(`Explanation: ${result.explanation}`);

            const matches = Array.isArray(testCase.expectedVerdict)
                ? testCase.expectedVerdict.includes(result.verdict)
                : result.verdict === testCase.expectedVerdict;

            if (matches) {
                console.log("✅ PASS");
            } else {
                console.log(`❌ FAIL (Expected ${testCase.expectedVerdict} but got ${result.verdict})`);
            }
        } catch (e) {
            console.error(`❌ ERROR: ${e}`);
        }
        console.log("-".repeat(40));
    }
}

testAccuracy();
