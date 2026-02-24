
import { EnterpriseThreatEngine } from "../lib/enterprise-detection";
import * as fs from 'fs';
import * as path from 'path';

async function runDynamicTests() {
    const engine = new EnterpriseThreatEngine();
    const resultsDir = path.join(process.cwd(), 'scripts');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);
    const logPath = path.join(resultsDir, 'test-dynamic-results.txt');

    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync(logPath, msg + '\n');
    };

    fs.writeFileSync(logPath, `DYNAMIC DETECTION VERDICT REPORT - ${new Date().toISOString()}\n\n`);

    const testCases = [
        {
            name: "Multiple Dangerous URLs in Text",
            mode: "email",
            input: "Check these links: http://bank-secure-update.xyz/login and http://paypal-verify-account.tk/verify. Act fast!"
        },
        {
            name: "Embedded Suspicious Email in URL context",
            mode: "url",
            input: "https://secure-gate.site/portal?email=admin@paypal-support.xyz"
        },
        {
            name: "Official Name on Free Provider Email",
            mode: "email",
            input: "From: PayPal Support <support.verification.2024@gmail.com>\nSubject: Security Alert\n\nPlease update your password at http://secure-update-now.com"
        },
        {
            name: "Mixed Threat Environment",
            mode: "email",
            input: "Urgent: contact support@bank-security-alert.tk to claim your bonus. Login at http://free-token-gift.xyz"
        }
    ];

    for (const tc of testCases) {
        log(`\n================================================================`);
        log(`TEST CASE: ${tc.name}`);
        log(`INPUT: ${tc.input.substring(0, 100)}${tc.input.length > 100 ? '...' : ''}`);
        log(`================================================================`);

        try {
            const result = await engine.analyze({
                type: tc.mode as any,
                content: tc.input
            });

            log(`VERDICT: ${result.verdict} (Score: ${result.risk_score}/100)`);
            log(`THREAT TYPES: ${result.threat_type.join(', ')}`);
            log(`DETECTED INDICATORS:`);
            result.key_indicators.forEach(ind => log(` - ${ind}`));

            const emailSources = result.sources.filter(s => s.name === "Email Reputation");
            if (emailSources.length > 0) {
                log(`EMAIL REPUTATION HITS (${emailSources.length}):`);
                emailSources.forEach(s => log(` - ${s.details}: ${s.reason} (${s.confidence}%)`));
            }

            const urlSources = result.sources.filter(s => s.name.includes("Analysis") || s.name.includes("Domain") || s.name.includes("Infrastructure"));
            // Just log unique URLs found in details to show dynamic extraction worked
            const foundUrls = Array.from(new Set(result.sources.filter(s => s.details?.startsWith('http')).map(s => s.details)));
            if (foundUrls.length > 0) {
                log(`DYNAMICALLY SCANNED URLS (${foundUrls.length}):`);
                foundUrls.forEach(u => log(` - ${u}`));
            }

        } catch (err: any) {
            log(`ERROR: ${err.message}`);
        }
    }

    log(`\nVerification complete. Results saved to ${logPath}`);
}

runDynamicTests().catch(console.error);
