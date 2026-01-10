// Real-time phishing detection using multiple trusted data sources
// Integrates with Google Safe Browsing, PhishTank, VirusTotal APIs

import { GoogleSafeBrowsingClient, PhishTankClient, VirusTotalClient, WHOISClient } from "./api-clients"
import { levenshteinDistance } from "./utils/levenshtein"
import { TOP_DOMAINS } from "./utils/top-domains"

export interface DetectionSource {
  name: string
  detected: boolean
  confidence: number
  reason: string
  details?: string // e.g. which URL triggered it
}

export interface RealDetectionResult {
  riskScore: number // 0-100
  classification: "SAFE" | "SUSPICIOUS" | "PHISHING"
  confidence: number // 0-100
  reasons: string[]
  sources: DetectionSource[]
  timestamp: string
  processingTime: number
}

export class RealPhishingDetector {
  private googleClient: GoogleSafeBrowsingClient
  private phishTankClient: PhishTankClient
  private virusTotalClient: VirusTotalClient
  private whoisClient: WHOISClient

  constructor() {
    this.googleClient = new GoogleSafeBrowsingClient()
    this.phishTankClient = new PhishTankClient()
    this.virusTotalClient = new VirusTotalClient()
    this.whoisClient = new WHOISClient()
  }

  // --- Individual Checks ---

  async checkGoogleSafeBrowsing(url: string): Promise<DetectionSource> {
    const result = await this.googleClient.checkUrl(url)
    return {
      name: "Google Safe Browsing",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
      details: url
    }
  }

  async checkPhishTank(url: string): Promise<DetectionSource> {
    const result = await this.phishTankClient.checkUrl(url)
    return {
      name: "PhishTank Database",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
      details: url
    }
  }

  async checkVirusTotal(url: string): Promise<DetectionSource> {
    const result = await this.virusTotalClient.checkUrl(url)
    return {
      name: "VirusTotal",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
      details: url
    }
  }

  async checkDomainAge(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const { age, isNew } = await this.whoisClient.getDomainAge(domain)

    return {
      name: "Domain Age Analysis",
      detected: isNew,
      confidence: isNew ? 75 : 10,
      reason: isNew
        ? `Domain '${domain}' registered ${age} days ago (High Risk)`
        : `Domain '${domain}' is ${age}+ days old (Established)`,
      details: domain
    }
  }

  async checkSSLCertificate(url: string): Promise<DetectionSource> {
    // Check SSL/HTTPS validity
    const hasSSL = url.startsWith("https://")

    return {
      name: "SSL Certificate Check",
      detected: !hasSSL,
      confidence: hasSSL ? 5 : 85,
      reason: hasSSL ? "Valid HTTPS connection with SSL certificate" : "No SSL/HTTPS protection - insecure connection",
      details: url
    }
  }

  async nlpPhishingLanguageDetection(input: string): Promise<DetectionSource> {
    // Enhanced NLP-based phishing language detection with more aggressive thresholds
    const urgentKeywords = [
      "urgent", "immediate", "critical", "alert", "warning", "suspended", "locked",
      "verify now", "confirm immediately", "act now", "limited time", "expire", "deadline"
    ]
    
    const financialKeywords = [
      "payment", "billing", "invoice", "transaction", "transfer", "wire", "bank",
      "account", "credit card", "debit", "paypal", "venmo", "zelle", "crypto", "bitcoin",
      "wallet", "investment", "refund", "tax", "irs", "stimulus", "grant"
    ]
    
    const securityKeywords = [
      "security alert", "unusual activity", "suspicious login", "password", "signin",
      "authentication", "verification", "update security", "compromised", "breach", "hack"
    ]
    
    const rewardKeywords = [
      "prize", "winner", "congratulations", "claim", "reward", "bonus", "gift",
      "lottery", "sweepstakes", "free", "congrats", "selected", "won"
    ]

    const inputLower = input.toLowerCase()
    
    // Count keyword occurrences with higher sensitivity
    const urgentCount = urgentKeywords.filter(k => inputLower.includes(k)).length
    const financialCount = financialKeywords.filter(k => inputLower.includes(k)).length
    const securityCount = securityKeywords.filter(k => inputLower.includes(k)).length
    const rewardCount = rewardKeywords.filter(k => inputLower.includes(k)).length
    
    const totalSuspiciousWords = urgentCount + financialCount + securityCount + rewardCount
    
    // Additional suspicious patterns
    const hasUrgency = urgentCount >= 1
    const hasFinancial = financialCount >= 1
    const hasSecurity = securityCount >= 1
    const hasReward = rewardCount >= 1
    
    // Check for suspicious sender patterns
    const suspiciousSenderPatterns = [
      /noreply@.*\.xyz$/i,
      /support@.*\.tk$/i,
      /admin@.*\.ml$/i,
      /security@.*\.ga$/i
    ]
    
    const hasSuspiciousSender = suspiciousSenderPatterns.some(pattern => inputLower.match(pattern))
    
    // Calculate risk score more aggressively
    let riskScore = 0
    if (hasUrgency) riskScore += 25
    if (hasFinancial) riskScore += 30
    if (hasSecurity) riskScore += 35
    if (hasReward) riskScore += 20
    if (hasSuspiciousSender) riskScore += 40
    
    // Additional risk factors
    if (totalSuspiciousWords >= 3) riskScore += 20
    if (inputLower.includes("click here") || inputLower.includes("link")) riskScore += 15
    if (inputLower.match(/\d{4}.*\d{4}.*\d{4}.*\d{4}/)) riskScore += 25 // Credit card pattern
    
    const detected = riskScore >= 30 // Lowered threshold for better detection
    const confidence = Math.min(riskScore + (totalSuspiciousWords * 5), 95)

    return {
      name: "Enhanced NLP Analysis",
      detected,
      confidence: detected ? confidence : 5,
      reason: detected
        ? `High-risk content detected: ${totalSuspiciousWords} suspicious keywords found (Urgency: ${urgentCount}, Financial: ${financialCount}, Security: ${securityCount}, Reward: ${rewardCount})`
        : "No suspicious patterns detected",
    }
  }

  async checkBrandImpersonation(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const domainParts = domain.split('.')
    const mainPart = domainParts.length > 2 ? domainParts[domainParts.length - 2] : domainParts[0]

    let detected = false
    let reason = "No brand impersonation detected"
    let confidence = 0
    let maxRiskScore = 0

    // Enhanced brand list with more common targets
    const brands = [
      ...TOP_DOMAINS,
      "microsoft", "office365", "outlook", "hotmail", "live",
      "amazon", "aws", "prime", "kindle",
      "apple", "icloud", "itunes", "appstore",
      "google", "gmail", "drive", "docs", "youtube",
      "facebook", "instagram", "whatsapp", "meta",
      "twitter", "x", "tiktok", "snapchat",
      "paypal", "venmo", "cashapp", "zelle",
      "chase", "wellsfargo", "bankofamerica", "citibank",
      "netflix", "hulu", "disney", "hbo",
      "linkedin", "indeed", "monster", "glassdoor",
      "ebay", "craigslist", "etsy", "shopify"
    ]

    for (const brand of brands) {
      const brandMain = brand.split('.')[0]
      if (domain.endsWith(brand)) continue

      // Multiple detection methods
      const distance = levenshteinDistance(mainPart, brandMain)
      const containsBrand = mainPart.includes(brandMain) || brandMain.includes(mainPart)
      const hasBrandPrefix = mainPart.startsWith(brandMain)
      const hasBrandSuffix = mainPart.endsWith(brandMain)

      // Calculate risk score
      let riskScore = 0
      let detectionReason = ""

      if (distance > 0 && distance <= 2) {
        riskScore = 90 - (distance * 10)
        detectionReason = `Typo-squatting of ${brandMain} (distance: ${distance})`
      } else if (distance > 2 && distance <= 3) {
        riskScore = 60 - (distance * 5)
        detectionReason = `Possible typo-squatting of ${brandMain} (distance: ${distance})`
      }

      if (containsBrand && mainPart !== brandMain) {
        riskScore = Math.max(riskScore, 75)
        detectionReason = `Brand name embedded in domain: ${brandMain}`
      }

      if (hasBrandPrefix && mainPart !== brandMain) {
        riskScore = Math.max(riskScore, 70)
        detectionReason = `Brand prefix used: ${brandMain}`
      }

      if (hasBrandSuffix && mainPart !== brandMain) {
        riskScore = Math.max(riskScore, 65)
        detectionReason = `Brand suffix used: ${brandMain}`
      }

      // Check for suspicious TLD combinations
      const suspiciousTLDs: string[] = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.site', '.online']
      const hasSuspiciousTLD = suspiciousTLDs.some((tld: string) => domain.endsWith(tld))
      
      if (hasSuspiciousTLD && (containsBrand || hasBrandPrefix || hasBrandSuffix)) {
        riskScore = Math.max(riskScore, 85)
        detectionReason += ` with suspicious TLD`
      }

      if (riskScore > maxRiskScore) {
        maxRiskScore = riskScore
        detected = riskScore >= 60 // Lowered threshold
        confidence = riskScore
        reason = detectionReason || `Potential impersonation of ${brand}`
      }
    }

    return {
      name: "Enhanced Brand Impersonation",
      detected,
      confidence: detected ? confidence : 0,
      reason,
      details: url
    }
  }

  async checkRedirects(url: string): Promise<DetectionSource> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout

      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual", // Don't follow automatically so we can count them or inspect headers
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location")
        return {
          name: "Redirect Analysis",
          detected: true, // Redirects themselves aren't evil, but we flag for review
          confidence: 50,
          reason: `URL redirects to ${location}`,
          details: url
        }
      }

      return {
        name: "Redirect Analysis",
        detected: false,
        confidence: 0,
        reason: "No immediate redirects detected",
        details: url
      }

    } catch (error) {
      return {
        name: "Redirect Analysis",
        detected: false, // Error doesn't necessarily mean phishing
        confidence: 0,
        reason: "Could not trace redirects (connection failed or timed out)",
        details: url
      }
    }
  }

  async checkHomoglyphs(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    // Punycode detection (starts with xn--)
    const isPunycode = domain.startsWith("xn--") || domain.includes(".xn--")

    // loose check for non-ascii characters if not punycode encoded yet
    const hasNonAscii = /[^\u0000-\u007F]/.test(domain)

    const detected = isPunycode || hasNonAscii

    return {
      name: "Homoglyph/IDN Check",
      detected,
      confidence: detected ? 85 : 0,
      reason: detected ? "Domain uses Punycode or non-ASCII characters (potential homoglyph attack)" : "Standard ASCII characters used",
      details: url
    }
  }

  async checkIpUrl(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    // IPv4 regex
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(domain)

    return {
      name: "IP Usage Check",
      detected: isIp,
      confidence: isIp ? 75 : 0,
      reason: isIp ? "Host is an raw IP address (suspicious for public sites)" : "Host is a domain name",
      details: url
    }
  }

  async checkRandomStringDomain(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    
    // Remove common TLDs and analyze the main domain part
    const domainParts = domain.split('.')
    const mainDomain = domainParts[0] || domain
    
    // Check for random string patterns
    const randomPatterns = [
      // Consonant-heavy patterns (common in random domains)
      /^[bcdfghjklmnpqrstvwxyz]{8,}$/i,
      // Mixed random characters with no meaning
      /^[a-z]{10,}[0-9]*$/i,
      // Keyboard patterns
      /^[qwertyuiopasdfghjklzxcvbnm]{8,}$/i,
      // Repeated character patterns
      /(.)\1{3,}/,
      // No vowels (suspicious for legitimate domains)
      /^[^aeiou]{8,}$/i,
      // High entropy random strings
      /^[a-z0-9]{12,}$/i
    ]
    
    let isRandom = false
    let confidence = 0
    let reason = ""
    
    // Check each pattern
    for (const pattern of randomPatterns) {
      if (pattern.test(mainDomain)) {
        isRandom = true
        confidence = Math.max(confidence, 75)
        reason = `Domain appears to be random string: ${mainDomain}`
        break
      }
    }
    
    // Additional checks for suspicious characteristics
    const hasNumbers = /\d/.test(mainDomain)
    const hasRepeatedChars = /(.)\1{2,}/.test(mainDomain)
    const isVeryLong = mainDomain.length > 15
    const hasNoVowels = !/[aeiou]/i.test(mainDomain)
    
    // Calculate risk score based on multiple factors
    let riskScore = 0
    if (hasNumbers) riskScore += 20
    if (hasRepeatedChars) riskScore += 25
    if (isVeryLong) riskScore += 30
    if (hasNoVowels) riskScore += 35
    
    // Domain entropy calculation (simplified)
    const uniqueChars = new Set(mainDomain.toLowerCase()).size
    const entropy = uniqueChars / mainDomain.length
    if (entropy > 0.8 && mainDomain.length > 10) {
      riskScore += 40
      isRandom = true
      confidence = Math.max(confidence, 85)
      reason = `High entropy random domain: ${mainDomain}`
    }
    
    // Check for suspicious TLD combinations
    const suspiciousTLDs: string[] = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.site', '.online', '.info', '.biz']
    const hasSuspiciousTLD = suspiciousTLDs.some((tld: string) => domain.endsWith(tld))
    
    if (hasSuspiciousTLD && (isRandom || riskScore > 30)) {
      riskScore += 25
      confidence = Math.max(confidence, 90)
      reason += ` with suspicious TLD`
    }
    
    const detected = isRandom || riskScore >= 40
    
    return {
      name: "Random Domain Analysis",
      detected,
      confidence: detected ? Math.min(confidence + riskScore/2, 95) : 5,
      reason: detected 
        ? reason || `Suspicious domain pattern detected: ${mainDomain}`
        : "Domain appears legitimate",
      details: url
    }
  }

  async checkEmailSpecificPatterns(input: string): Promise<DetectionSource> {
    const inputLower = input.toLowerCase()
    let riskScore = 0
    let detected = false
    let reasons: string[] = []

    // Check for suspicious email headers/senders
    const suspiciousHeaders = [
      "from: noreply@", "from: support@", "from: admin@", "from: security@",
      "from: notification@", "from: service@", "from: update@", "from: alert@"
    ]
    
    const hasSuspiciousHeader = suspiciousHeaders.some(header => inputLower.includes(header))
    if (hasSuspiciousHeader) {
      riskScore += 20
      reasons.push("Suspicious sender address pattern")
    }

    // Check for suspicious domains in email addresses
    const suspiciousEmailDomains = [
      "@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com"
    ]
    
    // Look for official-looking emails from free providers (often phishing)
    const officialWords = ["security", "paypal", "amazon", "apple", "microsoft", "google", "facebook", "bank"]
    const hasOfficialWord = officialWords.some(word => inputLower.includes(word))
    const hasFreeDomain = suspiciousEmailDomains.some(domain => inputLower.includes(domain))
    
    if (hasOfficialWord && hasFreeDomain) {
      riskScore += 35
      reasons.push("Official brand name using free email provider")
    }

    // Check for suspicious links
    const linkPatterns = [
      /click here/gi, /link below/gi, /follow this link/gi, /visit our website/gi
    ]
    
    const hasLinkPattern = linkPatterns.some(pattern => pattern.test(inputLower))
    if (hasLinkPattern) {
      riskScore += 25
      reasons.push("Suspicious link wording")
    }

    // Check for attachment warnings
    const attachmentWords = ["attachment", "download", "open file", "document attached", "invoice.pdf"]
    const hasAttachmentWarning = attachmentWords.some(word => inputLower.includes(word))
    if (hasAttachmentWarning) {
      riskScore += 30
      reasons.push("Suspicious attachment reference")
    }

    // Check for poor grammar indicators
    const grammarIssues = [
      /\bdear\s+customer\b/i, /\byou\s+have\s+been\s+selected\b/i, /\bcongratulation\b/i,
      /\byour\s+account\s+will\s+be\s+suspended\b/i, /\bverify\s+your\s+account\s+immediately\b/i
    ]
    
    const hasGrammarIssue = grammarIssues.some(pattern => pattern.test(inputLower))
    if (hasGrammarIssue) {
      riskScore += 20
      reasons.push("Poor grammar or suspicious phrasing")
    }

    // Check for time pressure
    const timePressure = ["within 24 hours", "immediately", "right away", "as soon as possible", "don't delay"]
    const hasTimePressure = timePressure.some(phrase => inputLower.includes(phrase))
    if (hasTimePressure) {
      riskScore += 15
      reasons.push("Time pressure tactic")
    }

    detected = riskScore >= 25 // Lower threshold for email detection
    
    return {
      name: "Email Pattern Analysis",
      detected,
      confidence: detected ? Math.min(riskScore + 10, 90) : 5,
      reason: detected 
        ? `Suspicious email patterns detected: ${reasons.join(", ")}`
        : "No suspicious email patterns detected",
    }
  }

  // --- Helpers ---

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
      return urlObj.hostname
    } catch {
      return url.toLowerCase().split('/')[0]
    }
  }

  private extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g
    const matches = text.match(urlRegex) || []
    return Array.from(new Set(matches.map(u => u.startsWith('http') || u.startsWith('www') ? u : `https://${u}`)))
  }

  private calculateRiskScore(sources: DetectionSource[]): number {
    let totalRisk = 0
    let totalWeight = 0
    let maxIndividualRisk = 0

    for (const source of sources) {
      // Enhanced weight logic for better phishing detection
      let weight = source.confidence / 100
      
      // Boost weight for high-confidence detections
      if (source.detected) {
        weight *= 2.0 // Increased from 1.5 for more sensitivity
        
        // Extra boost for critical detection sources
        if (source.name.includes("NLP") || source.name.includes("Brand") || source.name.includes("Google")) {
          weight *= 1.3
        }
      }

      // More aggressive risk calculation
      let risk: number
      if (source.detected) {
        risk = source.confidence
        maxIndividualRisk = Math.max(maxIndividualRisk, risk)
      } else {
        // Lower base risk for clean items, but not zero
        risk = Math.max(5, (15 - (source.confidence / 10)))
      }

      totalRisk += risk * weight
      totalWeight += weight
    }

    if (totalWeight === 0) return 0
    
    let finalScore = Math.min(Math.round(totalRisk / totalWeight), 100)
    
    // Boost score if any single source is high-risk
    if (maxIndividualRisk >= 80) {
      finalScore = Math.max(finalScore, 70)
    }
    if (maxIndividualRisk >= 90) {
      finalScore = Math.max(finalScore, 85)
    }
    
    return finalScore
  }

  private classifyRisk(riskScore: number): "SAFE" | "SUSPICIOUS" | "PHISHING" {
    // More aggressive thresholds for better phishing detection
    if (riskScore >= 60) return "PHISHING"    // Lowered from 75
    if (riskScore >= 30) return "SUSPICIOUS" // Lowered from 45
    return "SAFE"
  }

  private calculateOverallConfidence(sources: DetectionSource[]): number {
    const detectedCount = sources.filter((s) => s.detected).length
    const maxSourceConfidence = Math.max(...sources.map(s => s.confidence))

    // If we have a high-confidence detection (e.g. Google safe browsing says Yes), overall confidence is high
    if (detectedCount > 0) {
      return Math.min(maxSourceConfidence + (detectedCount * 5), 99.9)
    }

    return Math.min(maxSourceConfidence, 90)
  }

  private generateReasons(sources: DetectionSource[]): string[] {
    const reasons: string[] = []
    const seenReasons = new Set<string>()

    for (const source of sources) {
      if (source.detected) {
        let reasonText = `${source.name}: ${source.reason}`
        // Append URL if it's specific to one
        if (source.details && source.name !== "NLP Language Analysis") {
          const shortUrl = source.details.length > 30 ? source.details.substring(0, 27) + "..." : source.details
          reasonText += ` (${shortUrl})`
        }

        if (!seenReasons.has(reasonText)) {
          reasons.push(reasonText)
          seenReasons.add(reasonText)
        }
      }
    }

    if (reasons.length === 0) {
      reasons.push("No threats detected across multiple security databases")
      reasons.push("Content passed all security checks")
    }

    return reasons
  }

  // --- Core Methods ---

  private async scanUrl(url: string): Promise<DetectionSource[]> {
    // Ensure protocol
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`

    const results = await Promise.all([
      this.checkGoogleSafeBrowsing(cleanUrl),
      this.checkPhishTank(cleanUrl),
      this.checkVirusTotal(cleanUrl),
      this.checkDomainAge(cleanUrl),
      this.checkSSLCertificate(cleanUrl),
      this.checkBrandImpersonation(cleanUrl),
      this.checkRedirects(cleanUrl),
      this.checkHomoglyphs(cleanUrl),
      this.checkIpUrl(cleanUrl),
      this.checkRandomStringDomain(cleanUrl)
    ])

    return results
  }

  async detect(input: string, mode: "url" | "email"): Promise<RealDetectionResult> {
    const startTime = performance.now()
    let sources: DetectionSource[] = []

    // 1. Technical Analysis (URLs)
    let urlsToScan: string[] = []
    if (mode === 'url') {
      urlsToScan = [input]
    } else {
      urlsToScan = this.extractUrls(input)
      // Limit to first 5 unique URLs to prevent timeouts on massive texts
      urlsToScan = urlsToScan.slice(0, 5)
    }

    // Run technical checks on all found URLs
    const technicalResults = await Promise.all(urlsToScan.map(url => this.scanUrl(url)))
    // Flatten results
    sources = technicalResults.flat()

    // 2. Content/NLP Analysis (on full input)
    const nlpResult = await this.nlpPhishingLanguageDetection(input)
    sources.push(nlpResult)

    // 3. Email-specific Analysis (only for email mode)
    if (mode === 'email') {
      const emailResult = await this.checkEmailSpecificPatterns(input)
      sources.push(emailResult)
    }

    // Calculate aggregated results
    // If ANY URL is malicious, the whole thing is malicious.
    // We prioritize detected threats in the sources list.

    const riskScore = this.calculateRiskScore(sources)
    const classification = this.classifyRisk(riskScore)
    const confidence = this.calculateOverallConfidence(sources)
    const reasons = this.generateReasons(sources)

    const processingTime = Math.round(performance.now() - startTime)

    return {
      riskScore,
      classification,
      confidence,
      reasons,
      sources,
      timestamp: new Date().toISOString(),
      processingTime,
    }
  }
}
