console.log("Test script started")
import { RealPhishingDetector } from "./lib/real-detection"

async function main() {
    console.log("Detector initializing...")
    const detector = new RealPhishingDetector()
    console.log("Scanning URL...")
    const result = await detector.detect("https://google.com", "url")
    console.log("Result:", JSON.stringify(result, null, 2))
}

main().catch(console.error)
