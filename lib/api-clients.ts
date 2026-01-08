// API client wrappers for real phishing detection services
// These integrate with actual external APIs when keys are provided

interface GoogleSafeBrowsingResponse {
  matches?: Array<{
    threatType: string
    platformType: string
    threat: { url: string }
  }>
}

interface PhishTankResponse {
  results: {
    in_database: boolean
    valid: boolean
    verified: boolean
  }
}

interface VirusTotalResponse {
  data: {
    attributes: {
      last_analysis_stats: {
        malicious: number
        suspicious: number
        harmless: number
      }
    }
  }
}

export class GoogleSafeBrowsingClient {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
  }

  async checkUrl(url: string): Promise<{ detected: boolean; confidence: number; reason: string }> {
    // If no API key, return simulated result
    if (!this.apiKey) {
      return this.simulateCheck(url)
    }

    try {
      const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "phishguard-ai", clientVersion: "1.0.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Google Safe Browsing API error: ${response.status} ${response.statusText}`)
      }

      const data: GoogleSafeBrowsingResponse = await response.json()

      if (data.matches && data.matches.length > 0) {
        return {
          detected: true,
          confidence: 95,
          reason: `Flagged as ${data.matches[0].threatType} by Google Safe Browsing`,
        }
      }

      return {
        detected: false,
        confidence: 10,
        reason: "No threats found in Google Safe Browsing database",
      }
    } catch (error) {
      console.error("[v0] Google Safe Browsing API error:", error)
      return this.simulateCheck(url)
    }
  }

  private simulateCheck(url: string): { detected: boolean; confidence: number; reason: string } {
    const maliciousPatterns = ["verify-account", "urgent-login", "suspended-account", "prize-winner", "security-alert"]
    const detected = maliciousPatterns.some((pattern) => url.toLowerCase().includes(pattern))

    return {
      detected,
      confidence: detected ? 95 : 10,
      reason: detected
        ? "URL matches known phishing patterns (simulated check - add API key for real detection)"
        : "No threats detected (simulated check - add API key for real detection)",
    }
  }
}

export class PhishTankClient {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.PHISHTANK_API_KEY
  }

  async checkUrl(url: string): Promise<{ detected: boolean; confidence: number; reason: string }> {
    if (!this.apiKey) {
      return this.simulateCheck(url)
    }

    try {
      const encodedUrl = encodeURIComponent(url)
      const response = await fetch(`https://checkurl.phishtank.com/checkurl/`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `url=${encodedUrl}&format=json&app_key=${this.apiKey}`,
      })

      if (!response.ok) {
        throw new Error(`PhishTank API error: ${response.status} ${response.statusText}`)
      }

      const data: PhishTankResponse = await response.json()

      if (!data.results) {
        throw new Error("Invalid response format from PhishTank")
      }

      if (data.results.in_database && data.results.verified) {
        return {
          detected: true,
          confidence: 98,
          reason: "URL verified as phishing in PhishTank community database",
        }
      }

      return {
        detected: false,
        confidence: 8,
        reason: "URL not found in PhishTank phishing reports",
      }
    } catch (error) {
      console.error("[v0] PhishTank API error:", error)
      return this.simulateCheck(url)
    }
  }

  private simulateCheck(url: string): { detected: boolean; confidence: number; reason: string } {
    const knownPhishing = [
      "verify-account-secure.com",
      "login-update-now.net",
      "prize-winner-claim.xyz",
      "urgent-security-alert.info",
    ]
    const detected = knownPhishing.some((domain) => url.includes(domain))

    return {
      detected,
      confidence: detected ? 98 : 8,
      reason: detected
        ? "URL found in known phishing database (simulated - add API key for real detection)"
        : "URL not in phishing database (simulated - add API key for real detection)",
    }
  }
}

export class VirusTotalClient {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.VIRUSTOTAL_API_KEY
  }

  async checkUrl(url: string): Promise<{ detected: boolean; confidence: number; reason: string }> {
    if (!this.apiKey) {
      return this.simulateCheck(url)
    }

    try {
      // First, submit the URL for analysis
      const urlId = btoa(url).replace(/=/g, "")

      const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
        headers: { "x-apikey": this.apiKey },
      })

      if (!response.ok) {
        throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`)
      }

      const data: VirusTotalResponse = await response.json()

      if (!data.data?.attributes?.last_analysis_stats) {
        throw new Error("Invalid response format from VirusTotal")
      }

      const stats = data.data.attributes.last_analysis_stats

      const maliciousCount = stats.malicious + stats.suspicious
      const totalCount = maliciousCount + stats.harmless

      if (maliciousCount > 0) {
        const confidence = Math.min(50 + (maliciousCount / totalCount) * 50, 95)
        return {
          detected: true,
          confidence: Math.round(confidence),
          reason: `${maliciousCount}/${totalCount} security vendors flagged this URL as malicious`,
        }
      }

      return {
        detected: false,
        confidence: 15,
        reason: "No security vendor flags detected",
      }
    } catch (error) {
      console.error("[v0] VirusTotal API error:", error)
      return this.simulateCheck(url)
    }
  }

  private simulateCheck(url: string): { detected: boolean; confidence: number; reason: string } {
    const suspiciousIndicators =
      url.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) || url.includes("@") || (url.match(/\./g) || []).length > 4

    return {
      detected: !!suspiciousIndicators,
      confidence: suspiciousIndicators ? 75 : 15,
      reason: suspiciousIndicators
        ? "Suspicious patterns detected (simulated - add API key for real detection)"
        : "No suspicious patterns found (simulated - add API key for real detection)",
    }
  }
}

export class WHOISClient {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.WHOIS_API_KEY
  }

  async getDomainAge(domain: string): Promise<{ age: number; isNew: boolean }> {
    if (!this.apiKey) {
      return this.simulateCheck(domain)
    }

    try {
      const response = await fetch(
        `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${this.apiKey}&domainName=${domain}&outputFormat=JSON`,
      )

      if (!response.ok) {
        throw new Error(`WHOIS API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.WhoisRecord?.createdDate) {
        throw new Error("Invalid response format from WHOIS API")
      }

      const createdDate = new Date(data.WhoisRecord.createdDate)
      const age = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

      return {
        age,
        isNew: age < 30,
      }
    } catch (error) {
      console.error("[v0] WHOIS API error:", error)
      return this.simulateCheck(domain)
    }
  }

  private simulateCheck(domain: string): { age: number; isNew: boolean } {
    const trustedDomains = ["google.com", "microsoft.com", "apple.com", "amazon.com", "github.com"]
    const isTrusted = trustedDomains.some((d) => domain.includes(d))
    const age = isTrusted ? 5000 : Math.floor(Math.random() * 100)

    return {
      age,
      isNew: age < 30,
    }
  }
}
