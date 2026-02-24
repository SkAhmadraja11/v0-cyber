const fs = require('fs')
const path = require('path')

async function post(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

async function main() {
  const datasetPath = path.resolve(__dirname, 'sample-urls.json')
  const raw = fs.readFileSync(datasetPath, 'utf8')
  const dataset = JSON.parse(raw)

  const endpoint = process.env.SCAN_ENDPOINT || 'http://localhost:3000/api/real-scan'

  for (const entry of dataset) {
    console.log('-'.repeat(60))
    console.log(`Testing: ${entry.url} (expected: ${entry.expected || 'unknown'})`)
    try {
      const result = await post(endpoint, { input: entry.url, mode: 'url' })
      console.log(`Verdict: ${result.verdict}  risk_score: ${result.risk_score || result.riskScore || 'N/A'}  confidence: ${result.confidence || 'N/A'}`)
      console.log('Reasons:')
      const reasons = result.reasons || result.key_indicators || result.key_indicators || []
      for (const r of reasons) console.log(`  • ${r}`)
      console.log('')
    } catch (e) {
      console.error('Request failed:')
      console.error(e && e.stack ? e.stack : e)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
