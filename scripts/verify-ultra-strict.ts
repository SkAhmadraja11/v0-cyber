
import { RealPhishingDetector } from "../lib/real-detection";

const detector = new RealPhishingDetector();

const testCases = [
    {
        name: "Safe URL",
        url: "https://google.com",
        expected: "SAFE"
    },
    {
        name: "Obfuscated URL (Double Encoding)",
        url: "http://example.com/login%2520reset",
        expected: "MALICIOUS" // or HIGH_RISK
    },
    {
        name: "High Entropy Path",
        url: "http://example.com/a8s7d6f876asd876asd/safd786asf876",
        expected: "MALICIOUS"
    },
    {
        name: "Payload (CMD Injection)",
        url: "http://example.com/admin.php?cmd=cat%20/etc/passwd",
        expected: "MALICIOUS"
    },
    {
        name: "Intent (Fake Update)",
        url: "http://update-chrome-browser-v88.com/setup.exe",
        expected: "MALICIOUS"
    },
    {
        name: "Malware Keywords",
        url: "http://crack-software.com/keygen.exe",
        expected: "MALICIOUS"
    }
];

async function runTests() {
    console.log("Starting Ultra-Strict Detection Verification...");

    for (const test of testCases) {
        console.log(`\n-----------------------------------`);
        console.log(`Testing: ${test.name}`);
        console.log(`URL: ${test.url}`);

        try {
            // Use detect() instead of scanUrl() to get the full classification
            const result = await detector.detect(test.url, 'url');

            console.log(`Verdict: ${result.classification}`);
            console.log(`Risk Score: ${result.riskScore}`);

            const strictSource = result.sources.find(s => s.name === "Ultra-Strict Heuristics");
            if (strictSource) {
                console.log(`Ultra-Strict Source: Detected=${strictSource.detected}, Confidence=${strictSource.confidence}`);
                console.log(`Reason: ${strictSource.reason}`);
            } else {
                console.log("Ultra-Strict Source: Not found (or not returned in sources)");
            }

            const passed = (test.expected === "SAFE" && result.classification === "SAFE") ||
                (test.expected === "MALICIOUS" && (result.classification === "MALICIOUS" || result.classification === "HIGH_RISK" || result.classification === "DANGEROUS"));

            if (passed) {
                console.log("RESULT: PASS ✅");
            } else {
                console.log(`RESULT: FAIL ❌ (Expected ${test.expected}, got ${result.classification})`);
            }

        } catch (error) {
            console.error("Error during test:", error);
        }
    }
}

runTests();
