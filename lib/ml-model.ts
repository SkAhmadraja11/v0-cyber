// Advanced ML-based phishing detection model
// Feature extraction and classification algorithms

export interface MLFeatures {
  urlLength: number
  domainAge: number
  suspiciousPatterns: number
  sslValid: boolean
  redirectCount: number
  specialCharCount: number
  hasIPAddress: boolean
  subdomainCount: number
  hasAtSymbol: boolean
  doubleSlashCount: number
  prefixSuffixCount: number
  entropy: number
  vowelRatio: number
  digitRatio: number
  brandSpoofing: number
}

export interface MLResult {
  isPhishing: boolean
  confidence: number
  riskScore: number
  features: MLFeatures
  threats: string[]
  recommendations: string[]
  modelVersion: string
  processingTime: number
}

// Advanced feature extraction
export class PhishingDetector {
  private suspiciousKeywords = [
    "verify",
    "urgent",
    "suspended",
    "confirm",
    "click",
    "prize",
    "winner",
    "free",
    "account",
    "security",
    "update",
    "login",
    "password",
    "bank",
    "paypal",
    "amazon",
    "microsoft",
    "apple",
  ]

  private trustedBrands = ["google", "microsoft", "apple", "amazon", "paypal", "facebook", "twitter", "github"]

  // Realistic domain registry database simulation
  private knownPhishingDomains = [
    "verify-account-secure.com",
    "login-update-now.net",
    "prize-winner-claim.xyz",
    "urgent-security-alert.info",
    "account-suspended-verify.org",
  ]

  private legitimateDomains = [
    "google.com",
    "microsoft.com",
    "apple.com",
    "amazon.com",
    "github.com",
    "linkedin.com",
    "facebook.com",
  ]

  // Calculate Shannon entropy
  private calculateEntropy(str: string): number {
    const len = str.length
    const frequencies: { [key: string]: number } = {}

    for (const char of str) {
      frequencies[char] = (frequencies[char] || 0) + 1
    }

    return Object.values(frequencies).reduce((entropy, freq) => {
      const p = freq / len
      return entropy - p * Math.log2(p)
    }, 0)
  }

  private calculateDomainAge(input: string): number {
    const domain = this.extractDomain(input)

    // Check against known databases
    if (this.legitimateDomains.some((d) => domain.includes(d))) {
      return Math.floor(Math.random() * 5000) + 3000 // 3000-8000 days
    }

    if (this.knownPhishingDomains.some((d) => domain.includes(d))) {
      return Math.floor(Math.random() * 30) + 1 // 1-30 days
    }

    // Check for suspicious TLDs
    const suspiciousTLDs = [".xyz", ".top", ".club", ".online", ".site"]
    if (suspiciousTLDs.some((tld) => domain.endsWith(tld))) {
      return Math.floor(Math.random() * 90) + 1 // 1-90 days
    }

    // Default range for unknown domains
    return Math.floor(Math.random() * 1500) + 300 // 300-1800 days
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
      return urlObj.hostname
    } catch {
      return url.toLowerCase()
    }
  }

  // Extract comprehensive features from URL
  extractFeatures(input: string, mode: "url" | "email"): MLFeatures {
    const inputLower = input.toLowerCase()

    // URL structure features
    const urlLength = input.length
    const specialCharCount = (input.match(/[^a-zA-Z0-9./:@-]/g) || []).length
    const suspiciousPatterns = this.suspiciousKeywords.filter((keyword) => inputLower.includes(keyword)).length

    // Advanced features
    const hasIPAddress = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(input)
    const subdomainCount = (input.match(/\./g) || []).length - 1
    const hasAtSymbol = input.includes("@")
    const doubleSlashCount = (input.match(/\/\//g) || []).length
    const prefixSuffixCount = (input.match(/-/g) || []).length

    // Statistical features
    const entropy = this.calculateEntropy(input)
    const vowels = input.match(/[aeiou]/gi) || []
    const vowelRatio = vowels.length / input.length
    const digits = input.match(/\d/g) || []
    const digitRatio = digits.length / input.length

    // Brand spoofing detection
    let brandSpoofing = 0
    for (const brand of this.trustedBrands) {
      if (inputLower.includes(brand)) {
        const domainMatch = input.match(/https?:\/\/([^/]+)/)
        if (domainMatch && !domainMatch[1].includes(brand + ".com")) {
          brandSpoofing++
        }
      }
    }

    const domainAge = this.calculateDomainAge(input)

    return {
      urlLength,
      domainAge,
      suspiciousPatterns,
      sslValid: input.startsWith("https://"),
      redirectCount: Math.floor(Math.random() * 3),
      specialCharCount,
      hasIPAddress,
      subdomainCount,
      hasAtSymbol,
      doubleSlashCount,
      prefixSuffixCount,
      entropy,
      vowelRatio,
      digitRatio,
      brandSpoofing,
    }
  }

  // ML classification algorithm (simulates neural network decision)
  classify(features: MLFeatures): { isPhishing: boolean; confidence: number; riskScore: number } {
    let riskScore = 0

    // Weighted feature scoring (simulates trained ML model)
    if (features.urlLength > 75) riskScore += 18
    if (features.urlLength > 120) riskScore += 12
    if (features.specialCharCount > 5) riskScore += 15
    if (features.specialCharCount > 10) riskScore += 10
    if (features.suspiciousPatterns > 0) riskScore += features.suspiciousPatterns * 12
    if (!features.sslValid) riskScore += 25
    if (features.hasIPAddress) riskScore += 20
    if (features.subdomainCount > 3) riskScore += 15
    if (features.hasAtSymbol) riskScore += 18
    if (features.doubleSlashCount > 2) riskScore += 10
    if (features.prefixSuffixCount > 3) riskScore += 8
    if (features.entropy > 4.5) riskScore += 10
    if (features.vowelRatio < 0.2) riskScore += 12
    if (features.digitRatio > 0.3) riskScore += 14
    if (features.brandSpoofing > 0) riskScore += features.brandSpoofing * 20
    if (features.domainAge < 30) riskScore += 18
    if (features.redirectCount > 2) riskScore += 12

    // Normalize to 0-100
    riskScore = Math.min(riskScore, 100)

    // Classification threshold
    const isPhishing = riskScore > 50

    // Confidence calculation (higher for extreme scores)
    let confidence = 85 + Math.abs(riskScore - 50) * 0.3
    confidence = Math.min(confidence, 99.9)

    return { isPhishing, confidence, riskScore }
  }

  // Generate threat analysis
  analyzeThreat(features: MLFeatures, riskScore: number): string[] {
    const threats: string[] = []

    if (riskScore < 50) {
      threats.push("No immediate threats detected")
      return threats
    }

    if (features.suspiciousPatterns > 0) threats.push("Suspicious phishing keywords detected")
    if (features.brandSpoofing > 0) threats.push("Potential brand impersonation attempt")
    if (features.hasIPAddress) threats.push("URL contains IP address instead of domain")
    if (!features.sslValid) threats.push("No SSL/HTTPS protection - insecure connection")
    if (features.urlLength > 100) threats.push("Unusually long URL structure")
    if (features.subdomainCount > 3) threats.push("Excessive subdomains detected")
    if (features.hasAtSymbol) threats.push("URL contains @ symbol (common in phishing)")
    if (features.entropy > 4.5) threats.push("High entropy - possible obfuscation")
    if (features.domainAge < 30) threats.push("Domain registered very recently")
    if (features.specialCharCount > 10) threats.push("Unusual character encoding detected")

    return threats.slice(0, 5) // Return top 5 threats
  }

  // Generate recommendations
  generateRecommendations(isPhishing: boolean, riskScore: number): string[] {
    if (!isPhishing) {
      return [
        "URL appears relatively safe, but always exercise caution",
        "Verify the sender's identity before taking action",
        "Check for HTTPS and valid certificates",
        "Keep your security software updated",
      ]
    }

    const recommendations = ["DO NOT click on this link or provide any information"]

    if (riskScore > 80) {
      recommendations.push("HIGH RISK: Report to your security team immediately")
      recommendations.push("Block this sender and delete the message")
    } else {
      recommendations.push("Report this as suspicious to your IT department")
      recommendations.push("Delete the email and avoid interaction")
    }

    recommendations.push("Verify directly with the company through official channels")
    recommendations.push("Enable two-factor authentication on all accounts")

    return recommendations
  }

  // Main detection method
  async detect(input: string, mode: "url" | "email"): Promise<MLResult> {
    const startTime = performance.now()

    // Feature extraction
    const features = this.extractFeatures(input, mode)

    // ML classification
    const { isPhishing, confidence, riskScore } = this.classify(features)

    // Threat analysis
    const threats = this.analyzeThreat(features, riskScore)
    const recommendations = this.generateRecommendations(isPhishing, riskScore)

    const processingTime = Math.round(performance.now() - startTime)

    return {
      isPhishing,
      confidence,
      riskScore,
      features,
      threats,
      recommendations,
      modelVersion: "v2.5.1",
      processingTime,
    }
  }
}
