
import { RealPhishingDetector } from "./lib/real-detection";

async function deepVerify() {
    const detector = new RealPhishingDetector();

    // Test Cases covering new capabilities
    const cases = [
        { url: "https://www.paypal.com", expected: "SAFE" }, // Whitelist
        { url: "https://www.amazon.in", expected: "SAFE" }, // Regional Whitelist
        { url: "https://secure-login-apple-id.com", expected: "Brand Impersonation" }, // Brand Detection
        { url: "https://xn--pple-43d.com", expected: "Homoglyph" }, // Homoglyph (apple)
        { url: "https://a8s7d6f876asd876f.xyz", expected: "Entropy" } // High Entropy
    ];

    console.log("--- Testing Upgraded Engine Capabilities ---");

    for (const test of cases) {
        console.log(`\nTesting: ${test.url}`);

        let resultSource;

        if (test.expected === "Entropy") {
            resultSource = await detector.checkRandomStringDomain(test.url);
        } else if (test.expected === "Homoglyph") {
            resultSource = await detector.checkHomoglyphs(test.url);
        } else {
            // Default to generic brand check for others
            resultSource = await detector.checkBrandImpersonation(test.url);
        }

        console.log(`Expected: ${test.expected} related detection`);
        console.log(`Detected: ${resultSource.detected}`);
        console.log(`Reason: ${resultSource.reason}`);
        console.log(`Confidence: ${resultSource.confidence}`);
    }
}

deepVerify().catch(console.error);
