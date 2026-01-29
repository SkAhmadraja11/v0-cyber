
import { PhishingDetector } from "./lib/ml-model";

async function runTest() {
    const detector = new PhishingDetector();
    const testCases = [
        { url: "https://www.amazon.in", expectedSafe: true, desc: "Amazon India (Regional)" },
        { url: "https://amazon.co.uk", expectedSafe: true, desc: "Amazon UK (Regional)" },
        { url: "https://google.co.jp", expectedSafe: true, desc: "Google Japan (Regional)" },
        { url: "https://amazon-login.com", expectedSafe: false, desc: "Amazon Spoof (Attack)" },
        { url: "https://pay.amazon.in", expectedSafe: true, desc: "Amazon India Subdomain" },
        { url: "https://my-amazon.com", expectedSafe: false, desc: "Amazon Dash (Spoof)" },
    ];

    console.log("---------------------------------------------------");
    console.log("Running Scanner Verification for Regional Support");
    console.log("---------------------------------------------------");

    for (const test of testCases) {
        const result = await detector.detect(test.url, "url");
        const isSafe = !result.isPhishing;
        const pass = isSafe === test.expectedSafe;

        // Check brand spoofing count specifically as that was the bug
        const spoofCount = result.features.brandSpoofing;

        const statusIcon = pass ? "✅" : "❌";
        console.log(`${statusIcon} ${test.desc}: ${test.url}`);
        console.log(`   Expected Safe: ${test.expectedSafe}, Got Safe: ${isSafe} (Risk: ${result.riskScore})`);
        console.log(`   Brand Spoofing Count: ${spoofCount}`);
        if (!pass) {
            console.error(`   FAILURE! logic needs adjustment.`);
        }
        console.log("---------------------------------------------------");
    }
}

runTest();
