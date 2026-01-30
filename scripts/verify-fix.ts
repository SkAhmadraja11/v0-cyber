
import { RealPhishingDetector } from "../lib/real-detection";

async function verify() {
    const detector = new RealPhishingDetector();
    const url = "https://192.168.1.1/urgent-security-update.php";

    console.log(`Scanning URL: ${url}`);
    const result = await detector.detect(url, "url");

    console.log("--- Result ---");
    console.log(`Risk Score: ${result.riskScore}`);
    console.log(`Classification: ${result.classification}`);

    const ipSource = result.sources.find(s => s.name === "IP Usage Check");
    const nlpSource = result.sources.find(s => s.name === "Enhanced NLP Analysis");

    console.log(`IP Usage Check Detected: ${ipSource?.detected}`);
    console.log(`NLP Analysis Detected: ${nlpSource?.detected}`);

    if (result.classification === "MALICIOUS" && result.riskScore >= 85) {
        console.log("SUCCESS: URL classified as MALICIOUS with high score.");
    } else {
        console.log("FAILURE: URL not classified correctly.");
        console.log("Sources:", JSON.stringify(result.sources.filter(s => s.detected), null, 2));
    }
}

verify().catch(console.error);
