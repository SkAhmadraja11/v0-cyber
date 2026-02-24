
import { RealPhishingDetector } from "../lib/real-detection";

const detector = new RealPhishingDetector();

const testCases = [
    // --- DANGEROUS URLS (Expected: MALICIOUS/HIGH_RISK) ---
    {
        name: "Typosquatting (paypa1)",
        url: "https://paypa1-secure-login.com/verify-account",
        expected: ["MALICIOUS", "HIGH_RISK", "DANGEROUS"]
    },
    {
        name: "IP + Urgent (192.168...)",
        url: "https://192.168.1.1/urgent-security-update.php",
        expected: ["MALICIOUS"] // Critical threat rule
    },
    {
        name: "Suspicious TLD + Keywords",
        url: "https://account-suspended-verify-now.xyz/login",
        expected: ["MALICIOUS", "HIGH_RISK"]
    },
    {
        name: "Brand + Urgency + TLD",
        url: "https://microsoft-support-urgent-action.online/verify",
        expected: ["MALICIOUS", "HIGH_RISK"]
    },
    {
        name: "Authority Manipulation (@ symbol)",
        url: "https://secure-banking-update@malicious-site.com/login",
        expected: ["MALICIOUS", "HIGH_RISK"]
    },

    // --- SAFE URLS (Expected: SAFE) ---
    {
        name: "GitHub Repository",
        url: "https://github.com/user/repository",
        expected: ["SAFE"]
    },
    {
        name: "Google Search",
        url: "https://www.google.com/search?q=example",
        expected: ["SAFE"]
    },
    {
        name: "StackOverflow",
        url: "https://stackoverflow.com/questions/12345",
        expected: ["SAFE"]
    },
    {
        name: "Amazon Product",
        url: "https://www.amazon.com/products/electronics",
        expected: ["SAFE"]
    }
];

async function runModelTests() {
    console.log("🚀 Starting ML Model Verification Test Suite...\n");

    let passed = 0;
    let failed = 0;

    for (const test of testCases) {
        // console.log(`\n-----------------------------------`);
        // console.log(`Testing: ${test.name}`);
        // console.log(`URL: ${test.url}`);

        try {
            const result = await detector.detect(test.url, 'url');
            const verdict = result.classification;
            const score = result.riskScore;

            const isPass = test.expected.includes(verdict);

            const statusIcon = isPass ? "✅ PASS" : "❌ FAIL";
            console.log(`${statusIcon} | ${test.name.padEnd(30)} | Verdict: ${verdict.padEnd(10)} (Score: ${score})`);

            if (!isPass) {
                console.log(`      Expected: ${test.expected.join(" or ")}`);
                console.log(`      Actual Reasons:`);
                result.sources.filter(s => s.detected).forEach(s => {
                    console.log(`       - ${s.name}: ${s.reason} (Conf: ${s.confidence})`);
                });
                failed++;
            } else {
                passed++;
            }

        } catch (error) {
            console.error(`❌ ERROR | ${test.name}:`, error);
            failed++;
        }
    }

    console.log(`\n-----------------------------------`);
    console.log(`Run Complete.`);
    console.log(`Total: ${testCases.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed === 0) {
        console.log(`\n🎉 ALL TEST CASES PASSED! The model is robust and ready.`);
    } else {
        console.log(`\n⚠️  SOME TESTS FAILED. Please review the model logic.`);
    }
}

runModelTests();
