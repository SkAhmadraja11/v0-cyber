#!/usr/bin/env node

// Test script to demonstrate improved phishing detection
import { RealPhishingDetector } from './lib/real-detection.ts'

const detector = new RealPhishingDetector()

// Test cases for fraud email detection
const testCases = [
  {
    name: "Fraud PayPal Email",
    mode: "email",
    input: `From: security@paypal-update.com
Subject: Your PayPal Account Has Been Suspended

Dear Customer,

Your PayPal account has been suspended due to unusual activity. You must verify your account immediately within 24 hours to avoid permanent closure.

Click here to verify your account: http://paypal-security-verify.tk/login

If you don't act now, all funds will be frozen.

Thank you,
PayPal Security Team`
  },
  {
    name: "Fraud Bank Email",
    mode: "email",
    input: `From: noreply@chase-alert.xyz
Subject: Urgent: Your Account Will Be Closed

IMMEDIATE ACTION REQUIRED

Your Chase bank account will be suspended within 24 hours due to suspicious login attempts. 

Please verify your identity: https://chase-secure-login.ml/verify

Don't delay - your account access is at risk!

Chase Security Team`
  },
  {
    name: "Fraud Amazon Email",
    mode: "email",
    input: `From: order@amazon-prize.ga
Subject: Congratulations! You Won!

Congratulations! You have been selected as our lucky winner!

You've won a $1000 Amazon gift card! Claim your prize immediately.

Click here to claim: http://amazon-prize-claim.tk/reward

Limited time offer - act now!

Amazon Rewards Team`
  },
  {
    name: "Suspicious URL",
    mode: "url",
    input: "https://arnazon-secure-login.com/signin"
  },
  {
    name: "Legitimate Email",
    mode: "email",
    input: `From: team@github.com
Subject: Your repository has a new star

Hi there,

Someone starred your repository! Check out your dashboard to see more details.

Thanks,
The GitHub Team`
  }
]

async function runTests() {
  console.log("🔍 Testing Enhanced Phishing Detection\n")

  for (const testCase of testCases) {
    console.log(`📧 Testing: ${testCase.name}`)
    console.log(`📝 Input: ${testCase.input.substring(0, 100)}...`)

    try {
      const result = await detector.detect(testCase.input, testCase.mode)

      console.log(`🎯 Classification: ${result.classification}`)
      console.log(`⚠️  Risk Score: ${result.riskScore}/100`)
      console.log(`🔍 Confidence: ${result.confidence}%`)
      console.log(`📋 Reasons:`)
      result.reasons.forEach(reason => console.log(`   • ${reason}`))

      console.log(`🔍 Detection Sources:`)
      result.sources
        .filter(source => source.detected)
        .forEach(source => {
          console.log(`   • ${source.name}: ${source.reason} (${source.confidence}% confidence)`)
        })

    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
    }

    console.log("\n" + "=".repeat(60) + "\n")
  }
}

runTests().catch(console.error)
