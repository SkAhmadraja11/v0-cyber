
import { EnterpriseThreatEngine, ThreatInput } from "./lib/enterprise-detection";
import * as fs from 'fs';

async function batchScan() {
    const urls = [
        "https://www.google.com",
        "https://www.amazon.com",
        "https://www.microsoft.com",
        "https://www.paypal.com",
        "https://www.github.com",
        "https://phishing-scam-test.com",
        "https://secure-login-bank.xyz",
        "https://verify-your-account-now.top",
        "https://update-browser-security.site",
        "https://claim-your-prize-winner.info"
    ];

    const engine = new EnterpriseThreatEngine();
    const results = [];

    console.log(`Starting batch scan of ${urls.length} URLs...`);

    for (const url of urls) {
        try {
            const threatInput: ThreatInput = {
                type: 'url',
                content: url
            };

            const result = await engine.analyze(threatInput);
            results.push({
                url,
                verdict: result.verdict,
                risk_score: result.risk_score
            });
        } catch (e) {
            results.push({ url, error: e.message });
        }
    }

    fs.writeFileSync('scan_results.json', JSON.stringify(results, null, 2));
    console.log("Results written to scan_results.json");
}

batchScan().catch(console.error);
