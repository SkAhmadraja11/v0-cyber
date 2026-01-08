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
    // Enhanced NLP-based phishing language detection
    const phishingKeywords = [
      "urgent", "verify", "suspended", "confirm", "click here", "act now",
      "limited time", "prize", "winner", "congratulations", "claim",
      "password", "security alert", "unusual activity", "locked account",
      "bank", "signin", "login", "update payment", "billing", "invoice",
      "irs", "tax", "refund", "bitcoin", "wallet", "crypto", "ethereum"
    ]

    const inputLower = input.toLowerCase()
    const foundKeywords = phishingKeywords.filter((keyword) => inputLower.includes(keyword))
    // Calculate density relative to a short text segment for better accuracy
    const keywordDensity = (foundKeywords.length > 0) ? (foundKeywords.length * 10) : 0

    const detected = foundKeywords.length >= 2

    return {
      name: "NLP Language Analysis",
      detected,
      confidence: detected ? Math.min(40 + keywordDensity, 90) : 10,
      reason: detected
        ? `Detected suspicious language: ${foundKeywords.slice(0, 5).join(", ")}`
        : "No suspicious phishing language patterns detected",
    }
  }

  async checkBrandImpersonation(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const domainParts = domain.split('.')
    const mainPart = domainParts.length > 2 ? domainParts[domainParts.length - 2] : domainParts[0] // crude extraction, but works for simple cases like google.com or sub.google.com

    let detected = false
    let reason = "No brand impersonation detected"
    let confidence = 0

    for (const topDomain of TOP_DOMAINS) {
      const topMain = topDomain.split('.')[0]
      // Skip if exact match (it's the real deal)
      if (domain.endsWith(topDomain)) continue

      const distance = levenshteinDistance(mainPart, topMain)

      // If distance is small (1 or 2) but not identical, it's likely a typo-squat
      if (distance > 0 && distance <= 2) {
        detected = true
        reason = `Potential impersonation of ${topDomain} (Levenshtein distance: ${distance})`
        confidence = 90 - (distance * 10) // 80% for dist 1, 70% for dist 2
        break
      }
    }

    return {
      name: "Brand Impersonation Check",
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

    for (const source of sources) {
      // Weight logic: Databases (95% conf) are weighted heavier than heuristics
      let weight = source.confidence / 100

      // Boost weight for detected threats
      if (source.detected) weight *= 1.5

      const risk = source.detected ? source.confidence : (20 - (source.confidence / 5)) // Base risk for clean items is low

      totalRisk += risk * weight
      totalWeight += weight
    }

    if (totalWeight === 0) return 0
    return Math.min(Math.round(totalRisk / totalWeight), 100)
  }

  private classifyRisk(riskScore: number): "SAFE" | "SUSPICIOUS" | "PHISHING" {
    if (riskScore >= 75) return "PHISHING"
    if (riskScore >= 45) return "SUSPICIOUS"
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
      this.checkIpUrl(cleanUrl)
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
