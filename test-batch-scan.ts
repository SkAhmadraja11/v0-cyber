
import { EnterpriseThreatEngine, ThreatInput } from "./lib/enterprise-detection";
import * as fs from 'fs';

async function batchScan() {
    const urls = JSON.parse(fs.readFileSync('test-urls.json', 'utf8'));

    const engine = new EnterpriseThreatEngine();
    const results = [];

    console.log(`Starting batch scan of ${urls.length} URLs...`);

    for (const url of urls) {
        console.log(`Processing [${results.length + 1}/${urls.length}]: ${url}`);
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
            console.log(`  Verdict: ${result.verdict} (${result.risk_score})`);
        } catch (e: any) {
            results.push({ url, error: e.message });
            console.log(`  Error: ${e.message}`);
        }
    }

    fs.writeFileSync('scan_results.json', JSON.stringify(results, null, 2));
    console.log(`Successfully scanned ${results.length} URLs. Results written to scan_results.json`);
    process.exit(0);
}

batchScan().catch(err => {
    console.error("Critical error in batch scan:", err);
    process.exit(1);
});
