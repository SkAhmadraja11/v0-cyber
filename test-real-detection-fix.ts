
import { RealPhishingDetector } from "./lib/real-detection";

async function deepVerify() {
    const detector = new RealPhishingDetector();
    const urls = [
        "https://www.amazon.in",
        "https://amazon.co.jp",
        "https://google.co.in",
        "https://paypal.com",
        "https://phishing-amazon-login.com" // Control: Should be malicious
    ];

    console.log("--- Testing Brand Detection with Regional Domains ---");

    for (const url of urls) {
        // We only test checkBrandImpersonation to isolate the logic change
        const result = await detector.checkBrandImpersonation(url);
        console.log(`URL: ${url}`);
        console.log(`Detected: ${result.detected}`);
        console.log(`Reason: ${result.reason}`);
        console.log(`Confidence: ${result.confidence}`);
        console.log("---------------------------------------------------");
    }
}

deepVerify().catch(console.error);
