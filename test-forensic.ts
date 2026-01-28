import { RealPhishingDetector } from './lib/real-detection';

async function runVerification() {
    const detector = new RealPhishingDetector();

    const testCases = [
        {
            name: "Malformed URL",
            input: "not-a-url",
            mode: "url" as const,
            expected: "SAFE"
        },
        {
            name: "Safe Reliable Domain",
            input: "https://www.google.com",
            mode: "url" as const,
            expected: "SAFE"
        },
        {
            name: "Deceptive Brand Impersonation",
            input: "https://paypal-verify-account.secure-login.tk",
            mode: "url" as const,
            expected: "MALICIOUS"
        },
        {
            name: "Suspicious Misspelled Brand",
            input: "https://paypa1-support.com",
            mode: "url" as const,
            expected: "SUSPICIOUS"
        },
        {
            name: "Homoglyph Attack",
            input: "https://аррӏе.com", // Homoglyph version of apple.com
            mode: "url" as const,
            expected: "MALICIOUS"
        },
        {
            name: "New Crypto Scam Domain",
            input: "https://connect-metamask-wallet.xyz",
            mode: "url" as const,
            expected: "MALICIOUS"
        },
        {
            name: "Legitimate Subdomain",
            input: "https://support.microsoft.com",
            mode: "url" as const,
            expected: "SAFE"
        },
        {
            name: "Hosting Platform (Potentially Suspicious)",
            input: "https://my-paypal-login.vercel.app",
            mode: "url" as const,
            expected: "MALICIOUS" // Should trigger brand impersonation, not be auto-safelisted
        },
        {
            name: "Legitimate Enterprise Subdomain",
            input: "https://azure.microsoft.com",
            mode: "url" as const,
            expected: "SAFE"
        },
        {
            name: "Cloud Hosting with Random Subdomain",
            input: "https://a1b2c3d4e5f6.storage.googleapis.com",
            mode: "url" as const,
            expected: "SAFE"
        },
        {
            name: "SOC-TEST: Suspicious TLD + Brand Keyword",
            input: "https://paypal-support.tk",
            mode: "url" as const,
            expected: "MALICIOUS" // Deceptive infrastructure: suspicious TLD + brand
        },
        {
            name: "SOC-TEST: Hosting Platform + Brand + Action Word",
            input: "https://amazon-verify.netlify.app",
            mode: "url" as const,
            expected: "MALICIOUS" // Brand impersonation on hosting platform
        },
        {
            name: "SOC-TEST: Cloud Tunnel Service",
            input: "https://paypal-login.ngrok.io",
            mode: "url" as const,
            expected: "MALICIOUS" // Deceptive infrastructure: cloud tunnel
        },
        {
            name: "SOC-TEST: Ephemeral Hosting + Brand",
            input: "https://microsoft-temp-auth.com",
            mode: "url" as const,
            expected: "SUSPICIOUS" // Ephemeral pattern with brand
        },
        {
            name: "Urgent Phishing Email content",
            input: "URGENT: Your account has been suspended! Click the button below to verify your identity.",
            mode: "email" as const,
            expected: "SUSPICIOUS"
        }
    ];

    console.log("=== Forensic Website Threat Assessment Engine Verification ===\n");

    for (const tc of testCases) {
        console.log(`Testing [${tc.name}]: ${tc.input}`);
        try {
            const result = await detector.detect(tc.input, tc.mode);
            console.log(`Final Classification: ${result.classification}`);
            console.log(`Score: ${result.riskScore}/100, Confidence: ${result.confidence}%`);

            if (result.verdictReport && result.officialReport) {
                console.log("Verdict Report Summary:");
                console.log(`  - URL Examined: ${result.verdictReport.url}`);
                console.log(`  - Threat Category: ${(result.verdictReport as any).threatCategory || 'N/A'}`);
                console.log(`  - Primary Determinant: ${result.officialReport.primaryDeterminant}`);
                console.log(`  - Case ID: ${result.officialReport.caseId}`);
                console.log(`  - Recommended Action: ${result.verdictReport.recommendedAction}`);
                if ((result.verdictReport as any).infrastructureFlags?.length > 0) {
                    console.log(`  - Infrastructure Flags: ${(result.verdictReport as any).infrastructureFlags.join('; ')}`);
                }
            }

            console.log(`Reasons: ${result.reasons.join(", ")}`);
        } catch (e) {
            console.error(`Error testing ${tc.name}:`, e);
        }
        console.log("-".repeat(50) + "\n");
    }
}

runVerification();
