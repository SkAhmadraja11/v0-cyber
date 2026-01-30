
import { RealPhishingDetector } from "./lib/real-detection";
import * as fs from 'fs';

// Mock global fetch
const originalFetch = global.fetch;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = input.toString();

    if (url.includes("phishing-keyword.com")) {
        return {
            ok: true,
            text: async () => "<html><body><h1>Verify your account</h1><p>Please update payment.</p></body></html>",
            status: 200
        } as Response;
    }

    if (url.includes("sensitive-form-http.com")) {
        // HTTP url
        return {
            ok: true,
            text: async () => "<html><body><form><input type='password' name='pass'></form></body></html>",
            status: 200
        } as Response;
    }

    if (url.includes("brand-mismatch.com")) {
        return {
            ok: true,
            text: async () => "<html><head><title>Login to PayPal</title></head><body>...</body></html>",
            status: 200
        } as Response;
    }

    if (originalFetch) return originalFetch(input, init);
    return { ok: false, status: 404 } as Response;
};

async function testDeepContent() {
    const detector = new RealPhishingDetector();
    console.log("--- Starting Deep Content Analysis & Validation Tests ---\n");

    const results: any[] = [];
    const tests = [
        {
            name: "Invalid URL Validation",
            input: "abc",
            expectedVerdict: "DANGEROUS",
            expectedReason: "Invalid URL"
        },
        {
            name: "Phishing Keyword Detection",
            input: "http://phishing-keyword.com",
            expectedScore: 40,
            expectedReason: "Suspicious keywords found"
        },
        {
            name: "Sensitive Form on HTTP",
            input: "http://sensitive-form-http.com",
            expectedScore: 80,
            expectedReason: "Sensitive input fields on non-secure (HTTP) page"
        },
        {
            name: "Brand Title Mismatch",
            input: "http://brand-mismatch.com",
            expectedScore: 90,
            expectedReason: "Title claims 'paypal'"
        }
    ];

    for (const t of tests) {
        console.log(`Running: ${t.name}`);
        const result = await detector.detect(t.input, "url");
        console.log(`Score: ${result.riskScore}`);
        console.log(`Verdict: ${result.classification}`);
        console.log(`Reasons: ${result.reasons.join(", ")}`);

        // Validation
        let passed = false;
        if (t.name === "Invalid URL Validation") {
            passed = result.reasons.some(r => r.includes("Invalid URL"));
        } else {
            passed = result.riskScore >= (t.expectedScore || 0) &&
                result.reasons.some(r => r.includes(t.expectedReason || ""));
        }

        console.log(passed ? "✅ PASS" : "❌ FAIL");
        console.log("-----------------------------------");

        results.push({
            name: t.name,
            input: t.input,
            score: result.riskScore,
            verdict: result.classification,
            reasons: result.reasons,
            passed
        });
    }

    fs.writeFileSync('test_deep_results.json', JSON.stringify(results, null, 2));
}

testDeepContent().catch(console.error);
