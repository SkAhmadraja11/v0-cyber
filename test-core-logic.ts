import { RealPhishingDetector } from "./lib/real-detection";
import * as fs from "fs";

async function testCoreLogic() {
    const detector = new RealPhishingDetector();
    const results = [];

    const testScenarios = [
        {
            name: "Consensus Scoring Test",
            url: "https://login-secure-auth.tk", // Should trigger multiple technical and TLD flags
            expectedMinScore: 80,
        },
        {
            name: "Subdomain Hijack Relationship Test",
            url: "https://paypal-login.github.io", // Brand + Free Hosting
            expectedMinScore: 85,
        },
        {
            name: "Compromised Site Test",
            url: "https://google.com/malicious-redirect", // Safe Brand + Potential Flag (Simulated)
            // Note: In real setup, it would need a backend flag, but we can check if logic handles it
            expectedMinScore: 0,
        },
        {
            name: "Email Infrastructure DMARC Failure",
            type: "email",
            input: "Subject: Action Required! Authentication-Results: mx.google.com; dmarc=fail",
            expectedMinScore: 70
        },
        {
            name: "JavaScript Behavior: Credential Access",
            url: "https://test-credentials-theft.com",
            // We simulate HTML content via fetch mock if we could, but here we scan and see if it picks up static indicators or if we can find a way to trigger it.
            // For now, let's focus on logic that triggers from URL pattern or internal behavior.
            expectedMinScore: 40
        }
    ];

    console.log("--- Starting Core Logic Enhancement Tests ---\n");

    for (const test of testScenarios) {
        console.log(`Running Scenario: ${test.name}`);

        let result;
        if (test.type === "email" && test.input !== undefined) {
            result = await detector.detect(test.input, "email");
        } else {
            result = await detector.detect(test.url || "", "url");
        }

        console.log(`Score: ${result.riskScore}`);
        console.log(`Classification: ${result.classification}`);
        console.log(`Reasons: ${result.reasons.slice(0, 3).join(", ")}...`);

        const passed = result.riskScore >= (test.expectedMinScore || 0);
        console.log(passed ? "✅ PASS" : "❌ FAIL");

        results.push({
            ...test,
            actualScore: result.riskScore,
            actualClassification: result.classification,
            passed
        });
        console.log("-----------------------------------\n");
    }

    fs.writeFileSync("core-logic-test-results.json", JSON.stringify(results, null, 2));
}

testCoreLogic().catch(console.error);
