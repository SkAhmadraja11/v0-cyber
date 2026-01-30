
import { RealPhishingDetector } from "../lib/real-detection";

async function debug() {
    const detector = new RealPhishingDetector();
    const url = "https://coresume.in/";

    console.log(`Scanning URL: ${url}`);
    const result = await detector.detect(url, "url");

    console.log("--- Result ---");
    console.log(`Risk Score: ${result.riskScore}`);
    console.log(`Classification: ${result.classification}`);

    console.log("--- Detected Sources ---");
    result.sources.filter(s => s.detected).forEach(s => {
        console.log(`[${s.name}] (+${s.confidence}): ${s.reason}`);
    });

    // Also check the previous malicious case to ensure no regression
    const maliciousUrl = "https://192.168.1.1/urgent-security-update.php";
    console.log(`\nScanning Malicious URL: ${maliciousUrl}`);
    const badResult = await detector.detect(maliciousUrl, "url");
    console.log(`Risk Score: ${badResult.riskScore} (${badResult.classification})`);
}

debug().catch(console.error);
