
import { EnterpriseThreatEngine } from "./lib/enterprise-detection.ts";

async function testDeepAnalysis() {
    const engine = new EnterpriseThreatEngine();

    const testCases = [
        {
            name: "Malicious Query Redirect",
            type: "url" as const,
            content: "https://legit-site.com/search?redirect=http://phish-site.net",
            expectedIndicators: ["PAYLOAD_SIGNATURE_DETECTED"]
        },
        {
            name: "Base64 in Fragment",
            type: "url" as const,
            content: "https://safe-domain.io/#login?data=YWRtaW46cGFzc3dvcmQxMjM0NTY3ODkw",
            expectedIndicators: ["Suspicious Base64-encoded string"]
        },
        {
            name: "Hex in Query",
            type: "url" as const,
            content: "https://site.com/?payload=0x4141414141414141",
            expectedIndicators: ["Hex-encoded payload detected"]
        },
        {
            name: "Fake CAPTCHA Intent",
            type: "url" as const,
            content: "https://verification-robot.cloud/captcha-check",
            expectedIndicators: ["MALICIOUS_INTENT_INFERRED: Anti-Analysis: Fake CAPTCHA Redirect"]
        },
        {
            name: "Crypto Drainer Intent",
            type: "url" as const,
            content: "https://wallet-rewards.xyz/connect-drainer",
            expectedIndicators: ["MALICIOUS_INTENT_INFERRED: Crypto: Potential Drainer Interaction"]
        }
    ];

    console.log("Starting Deep URL Analysis Verification...\n");

    for (const testCase of testCases) {
        console.log(`Testing: ${testCase.name}`);
        console.log(`URL: ${testCase.content}`);
        try {
            const result = await engine.analyze({ type: testCase.type, content: testCase.content });
            console.log(`Verdict: ${result.verdict}`);
            console.log(`Risk Score: ${result.risk_score}`);

            // Check if expected indicators are in the explanation or sources
            const found = testCase.expectedIndicators.some(expected =>
                result.explanation.includes(expected)
            );

            if (found) {
                console.log("✅ PASS: Expected indicators found");
            } else {
                console.log("❌ FAIL: Expected indicators NOT found in explanation");
                console.log(`Actual Explanation: ${result.explanation}`);
            }
        } catch (e) {
            console.error(`❌ ERROR: ${e}`);
        }
        console.log("-".repeat(40));
    }
}

testDeepAnalysis();
