
import { POST } from "./app/api/real-scan/route";
import { NextRequest } from "next/server";

// Mocking NextRequest for direct testing of the POST handler
async function testValidation() {
    console.log("--- Starting Strict Validation Tests ---\n");

    const tests = [
        { name: "Valid URL", body: { url: "https://google.com" }, expectedStatus: 200 },
        { name: "Missing URL", body: {}, expectedStatus: 400 },
        { name: "Empty URL String", body: { url: "" }, expectedStatus: 400 },
        { name: "Invalid URL Format", body: { url: "not-a-url" }, expectedStatus: 400 },
        { name: "Backward Compatibility (input)", body: { input: "https://amazon.com" }, expectedStatus: 200 }
    ];

    for (const t of tests) {
        process.stdout.write(`Testing ${t.name.padEnd(25)}: `);

        try {
            const req = new NextRequest("http://localhost:3000/api/real-scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(t.body)
            });

            const response = await POST(req);
            const status = response.status;
            const data = await response.json();

            if (status === t.expectedStatus) {
                console.log(`[PASS] (Status: ${status})`);
            } else {
                console.log(`[FAIL] (Expected: ${t.expectedStatus}, Got: ${status})`);
                console.log("Response Body:", JSON.stringify(data));
            }

            if (status !== 200) {
                console.log(`       Error Info: ${data.message || data.error}`);
            }
        } catch (e) {
            console.log(`[ERROR] ${e.message}`);
        }
    }
    console.log("\n--- Validation Tests Completed ---");
}

testValidation().catch(console.error);
