
const trustedBrands = ["amazon", "google", "microsoft", "paypal"];
function check(domainString) {
    let brandSpoofing = 0;
    const inputLower = domainString.toLowerCase();

    // Simulate what extractFeatures does (it works on full URL or domain)
    // But my fix was inside the loop where it extracts hostname from URL

    try {
        // Mock URL parsing
        const urlObj = new URL(inputLower.startsWith("http") ? inputLower : `https://${inputLower}`);
        const hostname = urlObj.hostname;

        for (const brand of trustedBrands) {
            if (inputLower.includes(brand)) {
                const safeBrandRegex = new RegExp(`(^|\\.)${brand}\\.[a-z]{2,}(\\.[a-z]{2,})?$`)
                if (!safeBrandRegex.test(hostname)) {
                    brandSpoofing++;
                }
            }
        }
    } catch (e) { brandSpoofing++; }

    return brandSpoofing;
}

const tests = [
    { url: "https://www.amazon.in", expected: 0 },
    { url: "https://amazon.co.uk", expected: 0 },
    { url: "https://amazon-login.com", expected: 1 }, // Should be spoof
    { url: "https://pay.amazon.in", expected: 0 },
    { url: "https://google.com", expected: 0 },
    { url: "https://google.co.jp", expected: 0 },
    { url: "https://my-google.net", expected: 1 }
];

const fs = require('fs');
let output = "Running Standalone Verification:\n";
tests.forEach(t => {
    const result = check(t.url);
    const status = result === t.expected ? "PASS" : "FAIL";
    output += `${status}: ${t.url} -> Score: ${result} (Expected: ${t.expected})\n`;
});
fs.writeFileSync('verification_result.txt', output);
console.log("Done writing to file");
