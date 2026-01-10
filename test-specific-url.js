// Test the specific URL that was showing as safe
import { RealPhishingDetector } from './lib/real-detection.js'

const detector = new RealPhishingDetector()

async function testSpecificUrl() {
  console.log('🔍 Testing URL: www.leetcodiujhgfde.com')
  console.log('=' .repeat(50))
  
  try {
    const result = await detector.detect('www.leetcodiujhgfde.com', 'url')
    
    console.log('📊 Results:')
    console.log(`   Classification: ${result.classification}`)
    console.log(`   Risk Score: ${result.riskScore}/100`)
    console.log(`   Confidence: ${result.confidence}%`)
    console.log('')
    
    console.log('🔍 Detection Sources:')
    result.sources
      .filter(source => source.detected)
      .forEach(source => {
        console.log(`   ✅ ${source.name}: ${source.reason} (${source.confidence}% confidence)`)
      })
    
    console.log('')
    console.log('📋 All Reasons:')
    result.reasons.forEach(reason => console.log(`   • ${reason}`))
    
    console.log('')
    if (result.classification === 'PHISHING') {
      console.log('✅ SUCCESS: URL correctly detected as PHISHING!')
    } else if (result.classification === 'SUSPICIOUS') {
      console.log('⚠️  PARTIAL: URL detected as SUSPICIOUS')
    } else {
      console.log('❌ ISSUE: URL still showing as SAFE')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testSpecificUrl()
