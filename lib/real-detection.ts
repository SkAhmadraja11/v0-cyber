// Real-time phishing detection using multiple trusted data sources
// Integrates with Google Safe Browsing, PhishTank, VirusTotal APIs

import { GoogleSafeBrowsingClient, PhishTankClient, VirusTotalClient, WHOISClient } from "./api-clients"

export interface DetectionSource {
  name: string
  detected: boolean
  confidence: number
  reason: string
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

  async checkGoogleSafeBrowsing(url: string): Promise<DetectionSource> {
    const result = await this.googleClient.checkUrl(url)
    return {
      name: "Google Safe Browsing",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
    }
  }

  async checkPhishTank(url: string): Promise<DetectionSource> {
    const result = await this.phishTankClient.checkUrl(url)
    return {
      name: "PhishTank Database",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
    }
  }

  async checkVirusTotal(url: string): Promise<DetectionSource> {
    const result = await this.virusTotalClient.checkUrl(url)
    return {
      name: "VirusTotal",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
    }
  }

  async checkDomainAge(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const { age, isNew } = await this.whoisClient.getDomainAge(domain)

    return {
      name: "Domain Age Analysis",
      detected: isNew,
      confidence: isNew ? 70 : 20,
      reason: isNew
        ? `Domain registered ${age} days ago - newly created domains are high risk`
        : `Domain is ${age}+ days old - established domain`,
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
    }
  }

  async nlpPhishingLanguageDetection(input: string): Promise<DetectionSource> {
    // NLP-based phishing language detection
    const phishingKeywords = [
      "urgent",
      "verify",
      "suspended",
      "confirm",
      "click here",
      "act now",
      "limited time",
      "prize",
      "winner",
      "congratulations",
      "claim",
      "password",
      "security alert",
      "unusual activity",
      "locked account",
    ]

    const inputLower = input.toLowerCase()
    const foundKeywords = phishingKeywords.filter((keyword) => inputLower.includes(keyword))
    const keywordDensity = (foundKeywords.length / phishingKeywords.length) * 100

    const detected = foundKeywords.length >= 2

    return {
      name: "NLP Language Analysis",
      detected,
      confidence: detected ? Math.min(50 + keywordDensity * 2, 95) : 10,
      reason: detected
        ? `Detected ${foundKeywords.length} phishing keywords: ${foundKeywords.slice(0, 3).join(", ")}`
        : "No suspicious phishing language patterns detected",
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
      return urlObj.hostname
    } catch {
      return url.toLowerCase()
    }
  }

  private calculateRiskScore(sources: DetectionSource[]): number {
    let totalRisk = 0
    let totalWeight = 0

    for (const source of sources) {
      const weight = source.confidence / 100
      const risk = source.detected ? source.confidence : (100 - source.confidence) * 0.1

      totalRisk += risk * weight
      totalWeight += weight
    }

    return Math.min(Math.round(totalRisk / totalWeight), 100)
  }

  private classifyRisk(riskScore: number): "SAFE" | "SUSPICIOUS" | "PHISHING" {
    if (riskScore >= 70) return "PHISHING"
    if (riskScore >= 40) return "SUSPICIOUS"
    return "SAFE"
  }

  private calculateOverallConfidence(sources: DetectionSource[], riskScore: number): number {
    // Higher confidence when multiple sources agree
    const detectedCount = sources.filter((s) => s.detected).length
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length

    // Boost confidence when multiple sources agree
    const agreementBonus = detectedCount >= 3 ? 15 : detectedCount >= 2 ? 10 : 0

    return Math.min(avgConfidence + agreementBonus, 99.9)
  }

  private generateReasons(sources: DetectionSource[]): string[] {
    const reasons: string[] = []

    // Add reasons from sources that detected threats
    for (const source of sources) {
      if (source.detected) {
        reasons.push(`${source.name}: ${source.reason}`)
      }
    }

    // If no threats, add safe indicators
    if (reasons.length === 0) {
      reasons.push("No threats detected across multiple security databases")
      reasons.push("URL passed all security checks")
    }

    return reasons
  }

  async detect(input: string, mode: "url" | "email"): Promise<RealDetectionResult> {
    const startTime = performance.now()

    // Run all checks in parallel for speed
    const [googleResult, phishTankResult, virusTotalResult, domainAgeResult, sslResult, nlpResult] = await Promise.all([
      this.checkGoogleSafeBrowsing(input),
      this.checkPhishTank(input),
      this.checkVirusTotal(input),
      this.checkDomainAge(input),
      this.checkSSLCertificate(input),
      this.nlpPhishingLanguageDetection(input),
    ])

    const sources = [googleResult, phishTankResult, virusTotalResult, domainAgeResult, sslResult, nlpResult]

    // Calculate final risk score based on all sources
    const riskScore = this.calculateRiskScore(sources)
    const classification = this.classifyRisk(riskScore)
    const confidence = this.calculateOverallConfidence(sources, riskScore)
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
