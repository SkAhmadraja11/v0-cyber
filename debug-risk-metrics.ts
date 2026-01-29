
import { RealPhishingDetector } from "./lib/real-detection";

async function debugRisk() {
    const detector = new RealPhishingDetector();
    const safeUrls = [
        "https://www.mozilla.org",
        "https://webpack.js.org", // Likely has minified code/docs
        "https://react.dev", // Modern SPA
        "https://www.freecodecamp.org"
    ];

    console.log("--- Debugging Risk Score for Safe Sites ---");

    for (const url of safeUrls) {
        console.log(`\nScanning: ${url}`);
        const result = await detector.detect(url, "url");

        console.log(`Verdict: ${result.classification} (Score: ${result.riskScore})`);
        console.log("Detections triggering suspicion:");
        result.sources.filter(s => s.detected).forEach(s => {
            console.log(`- [${s.category}] ${s.name}: ${s.reason} (Conf: ${s.confidence})`);
        });

        if (result.classification !== "SAFE") {
            const js = result.sources.find(s => s.name.includes("JavaScript"));
            const ext = result.sources.find(s => s.name.includes("External"));

            if (js && js.detected) console.log("   -> JS Details:", js.reason);
            if (ext && ext.detected) console.log("   -> External Details:", ext.reason);
        }
    }
}

debugRisk().catch(console.error);
