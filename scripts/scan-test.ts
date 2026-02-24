import fs from "fs"
import path from "path"
import { RealPhishingDetector } from "../lib/real-detection"

async function main() {
  const detector = new RealPhishingDetector()
  const datasetPath = path.resolve(__dirname, "sample-urls.json")
  const raw = fs.readFileSync(datasetPath, "utf8")
  const dataset: { url: string; expected?: string }[] = JSON.parse(raw)

  for (const entry of dataset) {
    try {
      console.log("-".repeat(80))
      console.log(`Testing: ${entry.url}  (expected: ${entry.expected || 'unknown'})`)
      const result = await detector.detect(entry.url, "url")
      console.log(`Classification: ${result.classification}  Risk: ${result.riskScore}  Confidence: ${result.confidence}`)
      console.log(`Top reasons:`)
      for (const r of result.reasons) console.log(`  • ${r}`)
      console.log(`Sources detected: ${result.sources.filter(s => s.detected).map(s=>s.name).join(', ') || 'none'}`)
    } catch (e) {
      console.error(`Error testing ${entry.url}:`, e)
    }
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
