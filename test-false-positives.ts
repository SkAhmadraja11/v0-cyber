import { RealPhishingDetector } from "./lib/real-detection";

async function testFalsePositives() {
    const detector = new RealPhishingDetector();
    const tests = [
        {
            name: "Legitimate Support Email",
            input: "From: Support Team <support@trusted-company.com>\nSubject: Your account inquiry\nHello, we received your request for support and are happy to help.",
            mode: "email" as const,
            expected: "SAFE"
        },
        {
            name: "URL with Email in Query Param",
            input: "https://legit-site.com/login?user=someone@gmail.com&session=abc12345",
            mode: "url" as const,
            expected: "SAFE"
        },
        {
            name: "Generic Software Update (Safe)",
            input: "Hi team, please find the latest software update attached as software-update.zip. Let me know if you have questions.",
            mode: "email" as const,
            expected: "SAFE"
        },
        {
            name: "Automated Bot Email",
            input: "From: No-Reply <noreply@corporate-it.net>\nSubject: System Maintenance Notification\nPlease be advised of system maintenance tonight.",
            mode: "email" as const,
            expected: "SAFE"
        },
        {
            name: "Crypto Discussion (Safe)",
            input: "I think the future of the token depends on the blockchain implementation and NFT integration.",
            mode: "email" as const,
            expected: "SAFE"
        }
    ];

    console.log("=== RUNNING FALSE POSITIVE TESTS ===\n");
    let passed = 0;

    for (const test of tests) {
        const result = await detector.detect(test.input, test.mode);
        const success = result.classification === test.expected;

        console.log(`[${success ? "PASS" : "FAIL"}] ${test.name}`);
        console.log(`- Input: ${test.input.substring(0, 50)}...`);
        console.log(`- Classification: ${result.classification} (Score: ${result.riskScore})`);
        if (!success) {
            console.log(`- Reasons: ${result.reasons.join(", ")}`);
        }
        console.log("");

        if (success) passed++;
    }

    console.log(`Summary: ${passed}/${tests.length} False Positive Tests Passed`);

    if (passed === tests.length) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

testFalsePositives().catch(console.error);
