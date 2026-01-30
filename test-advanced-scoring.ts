import { RealPhishingDetector } from "./lib/real-detection";
import * as fs from "fs";

async function testAdvancedScoring() {
    const detector = new RealPhishingDetector();
    const results = [];
    const testURLs = [
        {
            url: "https://xn--pypal-4ve.com",
            description: "Punycode (Paypal Homograph)",
            expectedMinScore: 85,
            expectedClassification: "MALICIOUS",
        },
        {
            url: "https://login.security-verify-0x39a1f2b.tk/update?id=0x123abc456",
            description: "Suspicious TLD + Random Subdomain + Encoded Params",
            expectedMinScore: 81,
            expectedClassification: "MALICIOUS",
        },
        {
            url: "https://coresume.in",
            description: "Legitimate Resume Site (Safe Marker)",
            expectedMaxScore: 40,
            expectedClassification: "SAFE",
        },
        {
            url: "https://www.google.com",
            description: "Whitelisted Top Domain",
            expectedScore: 0,
            expectedClassification: "SAFE",
        },
    ];

    console.log("--- Starting Advanced Detection Tests ---\n");

    for (const test of testURLs) {
        console.log(`Testing: ${test.description}`);
        console.log(`URL: ${test.url}`);

        const result = await detector.detect(test.url, "url");

        console.log(`Score: ${result.riskScore}`);
        console.log(`Classification: ${result.classification}`);
        console.log(`Reasons: ${result.reasons.join(", ")}`);

        const scoreOk =
            test.expectedScore !== undefined
                ? result.riskScore === test.expectedScore
                : (test.expectedMinScore ? result.riskScore >= test.expectedMinScore : true) &&
                (test.expectedMaxScore ? result.riskScore <= test.expectedMaxScore : true);

        const classOk = result.classification === test.expectedClassification;

        results.push({
            url: test.url,
            description: test.description,
            riskScore: result.riskScore,
            classification: result.classification,
            reasons: result.reasons,
            status: scoreOk && classOk ? "PASS" : "FAIL",
        });

        if (scoreOk && classOk) {
            console.log("✅ PASS");
        } else {
            console.log("❌ FAIL");
            if (!scoreOk)
                console.log(
                    `   Score out of range! (Expected ${test.expectedScore ?? test.expectedMinScore + "-" + test.expectedMaxScore
                    })`
                );
            if (!classOk) console.log(`   Classification mismatch! (Expected ${test.expectedClassification})`);
        }
        console.log("-----------------------------------\n");
    }

    fs.writeFileSync("test-results.json", JSON.stringify(results, null, 2));
}

testAdvancedScoring().catch(console.error);
