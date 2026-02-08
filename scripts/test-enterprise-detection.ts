
import { EnterpriseThreatEngine } from "../lib/enterprise-detection";
import * as fs from 'fs';
import * as path from 'path';

const engine = new EnterpriseThreatEngine();
const logPath = path.join(process.cwd(), 'scripts', 'test-output.txt');

function log(message: string) {
    fs.appendFileSync(logPath, message + '\n');
}

async function runTests() {
    log("Starting Enterprise Threat Engine Tests...\n");

    // 1. Phishing URL Test
    log("--- Test 1: Known Phishing URL ---");
    const result1 = await engine.analyze({
        type: "url",
        content: "http://paypal-login-secure-update.com.suspicious-tld.xyz/login"
    });
    log(JSON.stringify(result1, null, 2));

    // 2. Safe URL Test
    log("\n--- Test 2: Safe URL (Google) ---");
    const result2 = await engine.analyze({
        type: "url",
        content: "https://www.google.com"
    });
    log(JSON.stringify(result2, null, 2));

    // 3. Email with Bad Auth Headers & Urgency
    log("\n--- Test 3: Email with Bad Auth & Urgency ---");
    const result3 = await engine.analyze({
        type: "email",
        content: "URGENT: Your account will be suspended immediately. Click here to verify.",
        metadata: {
            emailHeaders: "From: \"PayPal Security\" <support@random-domain.com>\nReceived-SPF: softfail\nDKIM-Signature: v=1; d=random-domain.com; result=fail\nAuthentication-Results: spf=softfail dkim=fail"
        }
    });
    log(JSON.stringify(result3, null, 2));

    // 4. Malicious Attachment
    log("\n--- Test 4: Malicious Attachment ---");
    const result4 = await engine.analyze({
        type: "email",
        content: "Please see attached invoice.",
        metadata: {
            attachments: [
                { name: "invoice_2024.pdf.exe", type: "application/x-dosexec", size: 1024 }
            ]
        }
    });
    log(JSON.stringify(result4, null, 2));
}

// Clear previous log
fs.writeFileSync(logPath, '');
runTests().catch(e => log(e.toString()));
