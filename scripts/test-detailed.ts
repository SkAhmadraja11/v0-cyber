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
        expected: ["MALICIOUS"]
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

async function runDetailedTests() {
    console.log("🔍 DETAILED ML MODEL DIAGNOSTIC TEST\n");
    console.log("=".repeat(80));

    let passed = 0;
    let failed = 0;
    const failures: any[] = [];

    for (const test of testCases) {
        console.log(`\n📋 TEST: ${test.name}`);
        console.log(`   URL: ${test.url}`);

        try {
            const result = await detector.detect(test.url, 'url');
            const verdict = result.classification;
            const score = result.riskScore;
            const isPass = test.expected.includes(verdict);

            console.log(`   Expected: ${test.expected.join(" or ")}`);
            console.log(`   Actual: ${verdict} (Score: ${score})`);

            if (isPass) {
                console.log(`   ✅ PASS`);
                passed++;
            } else {
                console.log(`   ❌ FAIL`);
                console.log(`\n   🔎 Detection Sources (Top 5):`);
                const detected = result.sources.filter(s => s.detected).slice(0, 5);
                if (detected.length === 0) {
                    console.log(`      ⚠️  NO THREATS DETECTED`);
                } else {
                    detected.forEach(s => {
                        console.log(`      • ${s.name} (Conf: ${s.confidence})`);
                        console.log(`        ${s.reason.substring(0, 100)}`);
                    });
                }
                failed++;
                failures.push({ test: test.name, url: test.url, verdict, score, expected: test.expected });
            }
        } catch (error: any) {
            console.error(`   ❌ ERROR: ${error.message}`);
            failed++;
            failures.push({ test: test.name, url: test.url, error: error.message });
        }
    }

    console.log("\n" + "=".repeat(80));
    console.log(`\n📊 RESULTS SUMMARY:`);
    console.log(`   Total: ${testCases.length}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${failed} ❌`);

    if (failed > 0) {
        console.log(`\n⚠️  FAILED TESTS:`);
        failures.forEach((f, i) => {
            console.log(`\n   ${i + 1}. ${f.test}`);
            console.log(`      URL: ${f.url}`);
            if (f.error) {
                console.log(`      Error: ${f.error}`);
            } else {
                console.log(`      Expected: ${f.expected.join(" or ")}`);
                console.log(`      Got: ${f.verdict} (Score: ${f.score})`);
            }
        });
    }

    if (failed === 0) {
        console.log(`\n🎉 ALL TESTS PASSED! The model is production-ready.`);
    } else {
        console.log(`\n⚠️  ${failed} test(s) need attention.`);
    }
}

runDetailedTests();
