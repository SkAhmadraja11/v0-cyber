
const fs = require('fs');

// We need to implement a MINIMAL version of the detector logic here because 
// importing the full TS file in a node script without compilation might be tricky if tsx is failing.
// Ideally, we would fix the environment, but for speed, I will replicate the logic to find the flaw.
// 
// Wait, I can try to use `ts-node` or just assume the logic in `lib/real-detection.ts` is what matters.
// I will attempt to require the actual file if I can, but since it's TS, I can't in raw Node.
// 
// STRATEGY: I will recreate the logic related to the potential false positive.
// Core potential issues:
// 1. "resume" keyword matching "Financial" or "Urgent"?
// 2. Whois check returning "New"?

// MOCKING THE HELPER FUNCTIONS from real-detection.ts for simulation
function calculateRiskScore(sources) {
    let score = 0;
    const detectedSources = sources.filter(s => s.detected);

    // [Simplified Copy of Logic from real-detection.ts]

    // Phase 1
    if (detectedSources.some(s => s.name.includes("Deceptive Infrastructure"))) score += 75;
    if (detectedSources.some(s => s.name.includes("Identity"))) score += 75;

    const nlpSource = detectedSources.find(s => s.name === "Enhanced NLP Analysis");
    if (nlpSource) score += 65;

    // Zero Day Rule
    const domainAgeSrc = sources.find(s => s.name.includes("WHOIS"));
    if (domainAgeSrc && domainAgeSrc.detected && nlpSource && nlpSource.detected) {
        score = Math.max(score, 85); // <--- SUSPECT #1
    }

    // IP Rule
    const ipSource = detectedSources.find(s => s.name === "IP Usage Check");
    if (ipSource && nlpSource && nlpSource.detected) {
        score = Math.max(score, 85);
    }

    // ... medium signals ...

    return score;
}

// SIMULATION OF NLP DETECTION
function nlpCheck(input) {
    const urgentKeywords = ["urgent", "immediate", "critical", "alert", "warning", "suspended"];
    const financialKeywords = ["payment", "billing", "invoice", "transaction", "bank", "account"];
    const securityKeywords = ["security", "login", "password", "verify", "authentication"];
    // "resume" contains "me"? No, exact match usually or includes.

    // The user's URL: "https://coresume.in/"
    // The input might be the URL itself or content.
    // If input is just URL: "https://coresume.in/"

    const inputLower = input.toLowerCase();

    // Let's check keywords against "coresume.in"
    // "security" ? No. "resume"?

    // Wait... "coresume" -> "core" + "sume"?
    // "resume" is not in the list I saw earlier.

    // Let's check matches.
    let matches = [];
    [...urgentKeywords, ...financialKeywords, ...securityKeywords].forEach(k => {
        if (inputLower.includes(k)) matches.push(k);
    });

    return matches;
}

// ACTUAL DEBUGGING
const url = "https://coresume.in/";
const matches = nlpCheck(url);

let output = `Analysis associated with URL: ${url}\n`;
output += `NLP Matches: ${matches.join(", ")}\n`;

// Investigation:
// If "resume" isn't a keyword, maybe "me" is? No.
// Maybe "in" (India) is triggering something?
// Maybe "core" ? 
//
// WAIT! "account" is a keyword. "secure" is a keyword.
// "coresume.in" -> "res-u-me". 
// "secure" -> "s-e-c-u-r-e".
//
// Let's look at the ACTUAL keywords in `real-detection.ts` again.
// I will read the file `lib/real-detection.ts` in the NEXT step to connect the dots.
// But for now, let's dump this output.

fs.writeFileSync('debug_result.txt', output);
