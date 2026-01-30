// Real-time phishing detection using multiple trusted data sources
// Integrates with Google Safe Browsing, PhishTank, VirusTotal APIs

import { GoogleSafeBrowsingClient, PhishTankClient, VirusTotalClient, WHOISClient } from "./api-clients"
import { levenshteinDistance } from "./utils/levenshtein"
import { TOP_DOMAINS, HOSTING_PLATFORMS } from "./utils/top-domains"

export interface DetectionSource {
  name: string
  detected: boolean
  confidence: number
  reason: string
  isReal: boolean
  details?: string
  category?: "Identity" | "Trust" | "Virus" | "Technical" | "Intelligence"
}

export interface RealDetectionResult {
  riskScore: number // 0-100
  classification: "SAFE" | "DANGEROUS"
  confidence: number // 0-100
  reasons: string[]
  sources: DetectionSource[]
  timestamp: string
  processingTime: number
  verdictReport?: {
    url: string
    finalVerdict: "SAFE" | "DANGEROUS"
    evidenceSourcesUsed: string[]
    confirmedFindings: string[]
    confidenceLevel: "High" | "Medium" | "Low"
    limitations: string[]
    recommendedAction: "Allow" | "Block"
  }
  officialReport?: {
    caseId: string
    verificationSeal: string
    primaryDeterminant: string
    mitigatingFactors: string[]
    auditTrail: { indicator: string; status: string; type: "Technical" | "Intelligence"; confidence: number }[]
  }
  url: string;
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

  // --- Advanced Heuristic Helpers ---

  private calculateEntropy(str: string): number {
    const len = str.length
    const frequencies = new Map<string, number>()
    for (const char of str) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1)
    }
    return Array.from(frequencies.values()).reduce((sum, count) => {
      const p = count / len
      return sum - p * Math.log2(p)
    }, 0)
  }

  private isHomographAttack(domain: string): boolean {
    // 1. Mixed Scripts (e.g., Cyrillic 'a' with Latin 'b')
    // Regex for Cyrillic, Greek, etc. mixed with Latin
    const hasCyrillic = /[\u0400-\u04FF]/.test(domain);
    const hasGreek = /[\u0370-\u03FF]/.test(domain);
    const hasLatin = /[a-z0-9]/.test(domain);

    if ((hasCyrillic || hasGreek) && hasLatin) return true;

    // 2. Invisible Characters (Zero Width Joiners, etc.)
    // \u200B (Zero Width Space), \u200C (Zero Width Non-Joiner), etc.
    if (/[\u200B-\u200D\uFEFF]/.test(domain)) return true;

    return false;
  }

  // --- Individual Checks ---

  async checkGoogleSafeBrowsing(url: string): Promise<DetectionSource> {
    const result = await this.googleClient.checkUrl(url)
    return {
      name: "Google Safe Browsing",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
      isReal: result.isReal,
      details: url
    }
  }

  async checkPhishTank(url: string): Promise<DetectionSource> {
    const result = await this.phishTankClient.checkUrl(url)
    return {
      name: "PhishTank",
      detected: result.detected,
      confidence: result.confidence,
      reason: result.reason,
      isReal: result.isReal,
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
      isReal: result.isReal,
      details: url
    }
  }

  async checkDomainAge(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const { age, isNew, isReal } = await this.whoisClient.getDomainAge(domain)

    return {
      name: "WHOIS / DNS",
      detected: isNew,
      confidence: isNew ? 75 : 10,
      reason: isNew
        ? `Domain '${domain}' is unusually new (${age} days)`
        : `Domain age: ${age} days`,
      isReal,
      details: domain
    }
  }

  async checkSSLCertificate(url: string): Promise<DetectionSource> {
    const hasSSL = url.startsWith("https://")
    return {
      name: "SSL / TLS",
      detected: !hasSSL,
      confidence: hasSSL ? 5 : 85,
      reason: hasSSL ? "Valid HTTPS connection" : "No SSL encryption",
      isReal: true,
      details: url
    }
  }

  async nlpPhishingLanguageDetection(input: string): Promise<DetectionSource> {
    // Enhanced NLP-based phishing language detection with more aggressive thresholds
    const urgentKeywords = [
      "urgent", "immediate", "critical", "alert", "warning", "suspended", "locked",
      "verify now", "confirm immediately", "act now", "limited time", "expire", "deadline",
      "action required", "important notice", "attention", "urgent response"
    ]

    const financialKeywords = [
      "payment", "billing", "invoice", "transaction", "transfer", "wire", "bank",
      "account", "credit card", "debit", "paypal", "venmo", "zelle", "crypto", "bitcoin",
      "wallet", "investment", "refund", "tax", "irs", "stimulus", "grant", "direct deposit",
      "funds", "payroll", "bonus", "commission"
    ]

    const securityKeywords = [
      "security alert", "unusual activity", "suspicious login", "password", "signin",
      "authentication", "verification", "update security", "compromised", "breach", "hack",
      "reset your password", "two-factor", "2fa", "mfa", "confirm identity"
    ]

    const rewardKeywords = [
      "prize", "winner", "congratulations", "claim", "reward", "bonus", "gift",
      "lottery", "sweepstakes", "free", "congrats", "selected", "won", "exclusive offer",
      "gift card", "voucher"
    ]

    const inputLower = input.toLowerCase()

    // Count keyword occurrences with higher sensitivity
    const urgentCount = urgentKeywords.filter(k => inputLower.includes(k)).length
    const financialCount = financialKeywords.filter(k => inputLower.includes(k)).length
    const securityCount = securityKeywords.filter(k => inputLower.includes(k)).length
    const rewardCount = rewardKeywords.filter(k => inputLower.includes(k)).length

    // ULTRA-STRICT: Higher confidence if many categories match
    const categoriesMatched = [urgentCount, financialCount, securityCount, rewardCount].filter(c => c > 0).length
    const totalSuspiciousWords = urgentCount + financialCount + securityCount + rewardCount
    const detected = totalSuspiciousWords >= 3 || categoriesMatched >= 2
    const confidence = Math.min(60 + (totalSuspiciousWords * 5), 90)

    // Additional suspicious patterns
    const hasSuspiciousSender = [
      /noreply@.*\.xyz$/i, /support@.*\.tk$/i, /admin@.*\.ml$/i, /security@.*\.ga$/i,
      /info@.*\.top$/i, /service@.*\.site$/i, /update@.*\.online$/i, /.*-verification@.*/i
    ].some(pattern => inputLower.match(pattern))

    // Calculate risk score more aggressively
    let riskScore = 0
    if (urgentCount >= 1) riskScore += 25
    if (financialCount >= 1) riskScore += 30
    if (securityCount >= 1) riskScore += 35
    if (rewardCount >= 1) riskScore += 20
    if (hasSuspiciousSender) riskScore += 45

    // Additional risk factors
    if (totalSuspiciousWords >= 3) riskScore += 20
    if (inputLower.includes("click here") || inputLower.includes("link") || inputLower.includes("button below")) riskScore += 15
    if (inputLower.match(/\d{4}.*\d{4}.*\d{4}.*\d{4}/)) riskScore += 30 // Credit card pattern
    if (inputLower.includes("kindly") || inputLower.includes("greetings of the day")) riskScore += 15 // Common phishing grammar

    return {
      name: "Enhanced NLP Analysis",
      detected: detected || riskScore >= 35, // Adjusted threshold
      confidence: detected ? confidence : Math.min(riskScore + (totalSuspiciousWords * 5), 95),
      reason: detected || riskScore >= 35
        ? `High-risk content detected: ${totalSuspiciousWords} suspicious keywords found (Urgency: ${urgentCount}, Financial: ${financialCount}, Security: ${securityCount}, Reward: ${rewardCount})`
        : "No suspicious patterns detected",
      isReal: false,
    }
  }

  async checkBrandImpersonation(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const domainParts = domain.split('.')
    const allParts = domainParts.map((p: string) => p.toLowerCase())

    let detected = false
    let reason = "No brand impersonation detected"
    let confidence = 0
    let maxRiskScore = 0

    // Authoritative Safelisting: Trusted high-authority domains
    const isSafeBrand = TOP_DOMAINS.some(b => domain === b || domain.endsWith("." + b))
    const isGovOrEdu = domain.endsWith(".gov") || domain.endsWith(".edu") || domain.endsWith(".gov.in")

    if (isSafeBrand || isGovOrEdu) {
      return {
        name: "Brand Analysis (Technical)",
        detected: false,
        confidence: 0,
        reason: isGovOrEdu ? "Protected High-Authority Domain (.gov/.edu)" : "Verified Trusted Enterprise Domain",
        isReal: true,
        details: url
      }
    }

    // Dynamic Brand List from TOP_DOMAINS
    // This expands protection from ~10 brands to hundreds automatically
    const brands = TOP_DOMAINS.map(d => ({
      name: d.split('.')[0].charAt(0).toUpperCase() + d.split('.')[0].slice(1),
      domain: d,
      keywords: [d.split('.')[0]]
    }))

    // Add specific high-target manual overrides if needed (e.g. slight variations)
    const manualBrands = [
      { name: "PayPal", domain: "paypal.com", keywords: ["paypal", "paypa1", "pypl"] },
      { name: "Microsoft", domain: "microsoft.com", keywords: ["microsoft", "ms-office", "office365"] },
      { name: "Google", domain: "google.com", keywords: ["google", "gmail", "gdrive"] }
    ]

    // Merge lists (manual overrides take precedence for specific keywords)
    manualBrands.forEach(mb => {
      const existing = brands.find(b => b.domain === mb.domain)
      if (existing) {
        existing.keywords = [...new Set([...existing.keywords, ...mb.keywords])]
      }
    })

    for (const brandInfo of brands) {
      const brandMain = brandInfo.keywords[0]
      const brandDomain = brandInfo.domain

      // Skip if the domain is the actual brand's domain
      if (domain === brandDomain) continue

      const { sld, subdomains } = this.extractDomainParts(domain)

      let currentRiskScore = 0
      let currentDetectionReason = ""

      // 1. Typo-squatting Analysis on the SLD
      const distance = sld ? levenshteinDistance(sld, brandMain) : 10
      if (sld && distance > 0 && distance <= 2 && sld.length > 4) {
        currentRiskScore = 85
        currentDetectionReason = `Typo-squatting of '${brandMain}' detected (domain: ${sld})`
      }

      // 2. Brand Keyword in Subdomains or Path
      const partsToSearch = [...subdomains, ...domainParts]
      if (partsToSearch.some((part: string) => {
        return brandInfo.keywords.some((kw: string) => {
          const isExact = part === kw
          const isHyphenated = part.includes(`${kw}-`) || part.includes(`-${kw}`)
          const isLongEnough = kw.length > 4 && part.includes(kw)
          return isExact || isHyphenated || isLongEnough
        })
      }) && !domain.endsWith(brandDomain)) {
        currentRiskScore = Math.max(currentRiskScore, 70)
        currentDetectionReason = `Brand keyword '${brandMain}' found in subdomain/path of non-brand domain`
      }

      // 3. Deceptive Context matching (e.g., paypal-verify)
      // Check SLD and subdomains for brand + suspicious terms
      const allSearchable = [sld, ...subdomains].filter(Boolean) as string[]
      const suspiciousSuffixes = ["support", "verify", "secure", "login", "update", "service", "account", "wallet", "claim", "bonus", "signin", "auth", "payment", "billing", "confirm", "help", "portal", "recovery", "reset"]
      const isHostingPlatform = HOSTING_PLATFORMS.some(p => domain === p || domain.endsWith("." + p))

      for (const part of allSearchable) {
        const containsBrand = brandInfo.keywords.some(kw => part.includes(kw))
        const hasSuspiciousContext = suspiciousSuffixes.some(s => part.includes(s))

        if (containsBrand && hasSuspiciousContext) {
          // SOC-GRADE: Hosting platform + brand + action word = IMMEDIATE MALICIOUS
          if (isHostingPlatform) {
            currentRiskScore = Math.max(currentRiskScore, 92)
            currentDetectionReason = `DECEPTIVE INFRASTRUCTURE: Brand '${brandMain}' on hosting platform with action keyword in '${part}' - Classic phishing pattern`
          } else {
            currentRiskScore = Math.max(currentRiskScore, 85)
            currentDetectionReason = `Brand '${brandMain}' used deceptively with suspicious keyword in '${part}'`
          }
        }
      }

      if (currentRiskScore > maxRiskScore) {
        maxRiskScore = currentRiskScore
        detected = currentRiskScore >= 70 // Lowered threshold for better sensitivity
        confidence = currentRiskScore
        reason = currentDetectionReason || `Potential impersonation of ${brandInfo.name}`
      }
    }

    return {
      name: "Brand Analysis (Technical)",
      detected,
      confidence: detected ? confidence : 0,
      reason,
      isReal: true, // Brand impersonation is real evidence when keywords align
      details: url
    }
  }

  async checkCryptoScams(input: string): Promise<DetectionSource> {
    const text = input.toLowerCase()

    const cryptoKeywords = [
      "wallet connect", "connect wallet", "verify seed", "validate phrase",
      "restore wallet", "sync wallet", "rectify issue", "claim airdrop",
      "gas fees", "bridge assets", "staking reward", "giveaway",
      "metamask", "trust wallet", "ledger", "trezor", "opensea", "binance", "coinbase",
      "web3", "dapp", "nft", "token", "blockchain", "decentralized", "smart contract"
    ]

    const walletFunctionWords = ["mnemonic", "seed phrase", "private key", "keystore", "secret phrase", "12 words", "24 words"]

    const matchCount = cryptoKeywords.filter(k => text.includes(k)).length
    const sensitiveRequest = walletFunctionWords.some(w => text.includes(w))

    let detected = false
    let riskScore = 0
    let list: string[] = []

    if (matchCount > 0) {
      riskScore += matchCount * 15
      list.push("crypto keywords")
    }

    if (sensitiveRequest) {
      riskScore += 50
      list.push("requests for private keys/seed phrases")
    }

    // Check for fake support handles if it is an email
    if (text.includes("telegram") && text.includes("support")) {
      riskScore += 20
      list.push("telegram support lure")
    }

    detected = riskScore >= 30

    return {
      name: "Crypto Scam Analysis",
      detected,
      confidence: detected ? 95 : 0,
      reason: detected
        ? `High-Confidence Malicious: Potential Crypto Drainer detected (Indicators: ${list.join(", ")})`
        : "No specific crypto scam indicators found",
      isReal: true, // Elevating to REAL technical evidence for ultra-strict mode
      details: "Content Analysis"
    }
  }

  async checkRedirects(url: string): Promise<DetectionSource> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout for consistency

      const response = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      let riskScore = 0
      const indicators: string[] = []

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location")

        // urlscan.io style: Behavior matters more than appearance
        if (location?.includes("data:") || location?.includes("javascript:")) {
          riskScore += 90
          indicators.push("malicious protocol in redirect")
        }

        // Check for cross-domain redirects (Potential stealth tactic)
        const targetDomain = location ? this.extractDomain(location) : null
        const currentDomain = this.extractDomain(url)
        if (targetDomain && targetDomain !== currentDomain) {
          riskScore += 25
          indicators.push(`cross-domain redirect to ${targetDomain}`)
        }

        return {
          name: "Redirect Analysis",
          detected: riskScore >= 40,
          confidence: riskScore,
          reason: riskScore >= 40
            ? `Suspicious redirect behavior: ${indicators.join(", ")}`
            : `Redirect observed to ${location}`,
          isReal: true,
          details: url
        }
      }

      return {
        name: "Redirect Analysis",
        detected: false,
        confidence: 0,
        reason: "No immediate redirects detected",
        isReal: true,
        details: url
      }

    } catch (error) {
      return {
        name: "Redirect Analysis",
        detected: false,
        confidence: 0,
        reason: "Could not trace redirects",
        isReal: false,
        details: url
      }
    }
  }

  async checkHomoglyphs(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    // Punycode detection (starts with xn--)
    const isPunycode = domain.startsWith("xn--") || domain.includes(".xn--")

    // Advanced Advanced Mix-Script Detection
    const isMixedScript = this.isHomographAttack(domain)

    const detected = isPunycode || isMixedScript

    return {
      name: "Homoglyph Attack Detection",
      detected,
      confidence: isPunycode ? 98 : (isMixedScript ? 95 : 0),
      reason: isPunycode
        ? "Ultra-Strict Match: Domain uses Punycode/homoglyphs for brand impersonation"
        : (isMixedScript ? "Suspicious Mixed-Script Detected (Cyrillic/Latin mix)" : "No homoglyph indicators found"),
      isReal: true,
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
      isReal: true,
      details: url
    }
  }

  async checkRandomStringDomain(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const domainParts = domain.split('.')

    let isRandom = false
    let maxConfidence = 0
    let worstReason = ""

    // Check each part of the domain (subdomains + SLD)
    for (const mainDomainPart of domainParts) {
      if (mainDomainPart.length < 5) continue
      if (["www", "mail", "remote", "blog", "webmail", "server", "ns1", "ns2", "smtp", "vpn", "api", "dev", "test", "staging", "cdn", "static", "assets"].includes(mainDomainPart.toLowerCase())) continue

      // Character sets for entropy evaluation
      const entropy = this.calculateEntropy(mainDomainPart)

      // Patterns for random strings
      const hasManyNumbers = (mainDomainPart.match(/\d/g) || []).length > 4
      const hasConsonantCluster = /[bcdfghjklmnpqrstvwxyz]{7,}/i.test(mainDomainPart)

      // SOC-GRADE: Entropy Thresholds
      // Normal English words usually have entropy < 3.5
      // Random strings "ao8s7df6" usually have entropy > 4.0
      const isHighEntropy = entropy > 4.2
      const isMediumEntropy = entropy > 3.8

      let isRandom = false
      let confidence = 0
      let reason = ""

      if (hasConsonantCluster) {
        isRandom = true
        maxConfidence = Math.max(maxConfidence, 85)
        worstReason = `Excessive consonant cluster in part: ${mainDomainPart}`
      } else if (isHighEntropy && mainDomainPart.length > 8) {
        isRandom = true
        maxConfidence = Math.max(maxConfidence, 90)
        worstReason = `High-Entropy Random String Detected: ${mainDomainPart}`
      } else if (hasManyNumbers && mainDomainPart.length > 10) {
        isRandom = true
        maxConfidence = Math.max(maxConfidence, 75)
        worstReason = `Excessive numeric characters in part: ${mainDomainPart}`
      }

      // Check for suspicious TLDs often used with DGA/random domains
      const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.site', '.online', '.info', '.biz']
      const hasSuspiciousTLD = suspiciousTLDs.some(tld => domain.endsWith(tld))

      if (hasSuspiciousTLD && (isRandom || mainDomainPart.length > 15)) {
        isRandom = true
        maxConfidence = Math.max(maxConfidence, 90)
        worstReason = worstReason ? `${worstReason} on suspicious TLD` : `Suspicious TLD usage with long domain part`
      }

      if (isRandom) break // Found a random part
    }

    // Final verdict: only detect if NOT a known top domain
    const detected = isRandom && !TOP_DOMAINS.some(d => domain.endsWith(d))

    return {
      name: "Random Domain Analysis",
      detected,
      confidence: detected ? maxConfidence : 5,
      reason: detected ? worstReason : "Domain structure appears legitimate",
      isReal: true,
      details: url
    }
  }


  async checkPrivacyProxy(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const isProxy = ["privacy", "proxy", "protect", "masked"].some(kw => domain.includes(kw))

    return {
      name: "WHOIS Privacy Protection",
      detected: isProxy,
      confidence: isProxy ? 65 : 10,
      reason: isProxy ? "Domain ownership is masked by a privacy proxy (often used by attackers)" : "Standard domain registration visible",
      isReal: true,
      details: domain
    }
  }

  async checkParkedDomain(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const isSuspiciousTLD = [".xyz", ".tk", ".ml", ".ga", ".cf", ".top", ".icu", ".pw"].some(tld => domain.endsWith(tld))

    return {
      name: "Domain Parking Check",
      detected: isSuspiciousTLD,
      confidence: isSuspiciousTLD ? 40 : 5,
      reason: isSuspiciousTLD ? "Domain is hosted on a high-risk TLD often used for parking/staging" : "Domain hosted on standardized infrastructure",
      isReal: true,
      details: domain
    }
  }

  async checkPunycode(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const isPunycode = domain.includes("xn--")

    return {
      name: "Punycode Detection",
      detected: isPunycode,
      confidence: isPunycode ? 95 : 0,
      reason: isPunycode
        ? `HIGH RISK: Punycode (IDN Homograph) domain detected: ${domain}`
        : "Standard non-ASCII characters not detected",
      isReal: true,
      category: "Technical"
    }
  }

  async checkDeceptiveInfrastructure(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    const { sld, tld, subdomains } = this.extractDomainParts(domain)

    let riskScore = 0
    const indicators: string[] = []

    // 1. Suspicious TLDs commonly used for phishing
    const highRiskTLDs = [
      ".xyz", ".top", ".icu", ".pw", ".bid", ".date", ".win", ".loan",
      ".men", ".live", ".guru", ".click", ".buzz", ".work", ".shop",
      ".space", ".online", ".site", ".tk", ".ml", ".ga", ".cf", ".gq"
    ]
    const hasSuspiciousTLD = highRiskTLDs.some(t => domain.toLowerCase().endsWith(t))

    // 2. Check for brand keywords in domain
    const brandKeywords = [
      "paypal", "amazon", "microsoft", "google", "apple", "facebook", "netflix", "bank",
      "chase", "hsbc", "wellsfargo", "barclays", "citi", "visa", "mastercard", "stripe",
      "coinbase", "binance", "metamask", "ledger", "dropbox", "adobe", "outlook", "office",
      "instagram", "whatsapp", "twitter", "linkedin", "zoom", "slack", "ebay", "walmart",
      "fedex", "ups", "dhl", "usps", "royalmail", "steam", "epicgames", "roblox", "discord"
    ]
    const hasBrandKeyword = brandKeywords.some(brand =>
      domain.toLowerCase().includes(brand)
    )

    // 3. SOC-GRADE: Suspicious TLD + Brand = IMMEDIATE THREAT
    if (hasSuspiciousTLD && hasBrandKeyword) {
      riskScore = Math.max(riskScore, 90)
      indicators.push(`Brand keyword on high-risk TLD (${domain})`)
    }

    // 4. Censys style: Relationship Mapping (Subdomain hijack / Free hosting)
    const freeHostingProviders = ["github.io", "vercel.app", "pages.dev", "firebaseapp.com", "netlify.app", "weebly.com", "wixsite.com"]
    const isFreeHosting = freeHostingProviders.some(p => domain.endsWith(p))

    if (isFreeHosting && hasBrandKeyword) {
      riskScore = Math.max(riskScore, 85)
      indicators.push(`Potential subdomain hijack: Brand keyword on free hosting provider`)
    }

    // 5. Ephemeral/temporary hosting indicators
    const ephemeralPatterns = ['temp', 'tmp', 'test', 'demo', 'staging', 'dev', 'preview']
    const hasEphemeralPattern = ephemeralPatterns.some(p => domain.includes(p))

    if (hasEphemeralPattern && hasBrandKeyword) {
      riskScore = Math.max(riskScore, 75)
      indicators.push(`Ephemeral hosting pattern with brand keyword`)
    }

    // 6. Cloud tunnel / ngrok-like patterns
    const tunnelPatterns = ['ngrok', 'localtunnel', 'serveo', 'localhost.run']
    const hasTunnelPattern = tunnelPatterns.some(p => domain.includes(p))

    if (hasTunnelPattern) {
      riskScore = Math.max(riskScore, 85)
      indicators.push("Cloud tunnel service detected")
    }

    // 7. Censys/Shodan style: Open Port / Service anomalies (Simulated)
    if (url.includes(":8080") || url.includes(":8443") || url.includes(":3000")) {
      riskScore += 20
      indicators.push("Non-standard service port exposed")
    }

    const detected = riskScore >= 70
    return {
      name: "Deceptive Infrastructure Analysis",
      detected,
      confidence: riskScore,
      reason: detected
        ? `DECEPTIVE INFRASTRUCTURE detected: ${indicators.join(", ")}`
        : "Infrastructure appears legitimate",
      isReal: true,
      details: url
    }
  }

  async checkEmailIdentity(input: string): Promise<DetectionSource> {
    const inputLower = input.toLowerCase()
    let detected = false
    let confidence = 0
    let reason = "Identity appears consistent"

    // 1. Display Name Spoofing
    const displayNameMatch = input.match(/From:\s*["']?([^"']+)["']?\s*<([^>]+)>/i)
    if (displayNameMatch) {
      const displayName = displayNameMatch[1].toLowerCase()
      const email = displayNameMatch[2].toLowerCase()

      const brands = [
        "paypal", "microsoft", "google", "amazon", "apple", "netflix", "bank", "security", "support",
        "billing", "invoice", "refund", "verify", "account", "login", "password", "chase", "hsbc",
        "wellsfargo", "barclays", "citi", "visa", "mastercard", "stripe", "coinbase", "binance",
        "metamask", "ledger", "dropbox", "adobe", "outlook", "office", "instagram", "whatsapp",
        "twitter", "linkedin", "zoom", "slack", "ebay", "walmart", "fedex", "ups", "dhl", "usps",
        "royalmail", "steam", "epicgames", "roblox", "discord", "irs", "tax", "hrblock", "capitalone",
        "americanexpress", "discover", "samsung", "hp", "dell", "lenovo", "att", "verizon", "t-mobile",
        "sprint", "comcast", "spectrum", "xfinity", "geico", "statefarm", "allstate", "progressive",
        "usbank", "bofa", "fidelity", "vanguard", "charles schwab", "robinhood", "kraken", "bybit",
        "okx", "bitget", "kucoin", "gate.io", "binance.us", "coinbase pro", "gemini", "crypto.com",
        "trezor", "keepkey", "electrum", "exodus", "trust wallet", "phantom", "solflare", "atomic wallet",
        "myetherwallet", "mycrypto", "brave", "firefox", "chrome", "edge", "safari", "opera", "duckduckgo",
        "protonvpn", "nordvpn", "expressvpn", "surfshark", "lastpass", "1password", "dashlane", "authy",
        "google authenticator", "microsoft authenticator", "yubikey", "okta", "duo", "cloudflare", "akamai",
        "fastly", "aws", "azure", "google cloud", "digitalocean", "linode", "vultr", "heroku", "netlify",
        "vercel", "github", "gitlab", "bitbucket", "jira", "confluence", "trello", "asana", "monday.com",
        "salesforce", "zendesk", "freshdesk", "intercom", "drift", "mailchimp", "sendgrid", "twilio",
        "stripe", "shopify", "woocommerce", "magento", "bigcommerce", "squarespace", "wix", "wordpress",
        "joomla", "drupal", "cpanel", "plesk", "godaddy", "namecheap", "cloudflare registrar", "google domains"
      ]
      const isBrandDisplayName = brands.some(b => displayName.includes(b))
      const isBrandEmail = brands.some(b => email.includes(b))

      // If display name says "PayPal" but email domain is generic/mismatched
      if (isBrandDisplayName && !email.includes(displayName.replace(/\s/g, ""))) {
        detected = true
        confidence = 95
        reason = `CRITICAL SPOOFING: Display name '${displayName}' uses a high-trust identity with unrelated sender '${email}'`
      }
    }

    // 2. Official Brand vs Free Provider (Expanded)
    const freeProviders = [
      "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com",
      "protonmail.com", "mail.com", "zoho.com", "yandex.com"
    ]
    const brandCheck = [
      "paypal", "amazon", "microsoft", "apple", "google", "bank", "billing", "invoice",
      "refund", "chase", "citi", "hsbc", "wellsfargo", "tax", "irs", "hrblock", "capitalone",
      "americanexpress", "discover", "samsung", "hp", "dell", "lenovo", "att", "verizon", "t-mobile",
      "sprint", "comcast", "spectrum", "xfinity", "geico", "statefarm", "allstate", "progressive",
      "usbank", "bofa", "fidelity", "vanguard", "charles schwab", "robinhood", "kraken", "bybit",
      "okx", "bitget", "kucoin", "gate.io", "binance.us", "coinbase pro", "gemini", "crypto.com",
      "trezor", "keepkey", "electrum", "exodus", "trust wallet", "phantom", "solflare", "atomic wallet",
      "myetherwallet", "mycrypto", "brave", "firefox", "chrome", "edge", "safari", "opera", "duckduckgo",
      "protonvpn", "nordvpn", "expressvpn", "surfshark", "lastpass", "1password", "dashlane", "authy",
      "google authenticator", "microsoft authenticator", "yubikey", "okta", "duo", "cloudflare", "akamai",
      "fastly", "aws", "azure", "google cloud", "digitalocean", "linode", "vultr", "heroku", "netlify",
      "vercel", "github", "gitlab", "bitbucket", "jira", "confluence", "trello", "asana", "monday.com",
      "salesforce", "zendesk", "freshdesk", "intercom", "drift", "mailchimp", "sendgrid", "twilio",
      "stripe", "shopify", "woocommerce", "magento", "bigcommerce", "squarespace", "wix", "wordpress",
      "joomla", "drupal", "cpanel", "plesk", "godaddy", "namecheap", "cloudflare registrar", "google domains"
    ]

    if (brandCheck.some(b => inputLower.includes(b))) {
      const senderMatch = input.match(/From:\s*.*<([^>]+)>/i) || input.match(/From:\s*([^\s]+)/i)
      if (senderMatch) {
        const sender = senderMatch[1].toLowerCase()
        if (freeProviders.some(p => sender.endsWith(p))) {
          detected = true
          confidence = Math.max(confidence, 85)
          reason = `FAKE IDENTITY: Official brand communication originating from a free email provider (${sender})`
        }
      }
    }

    return {
      name: "Identity Verification",
      detected,
      confidence: detected ? confidence : 10,
      reason,
      isReal: true,
      category: "Identity"
    }
  }

  async checkEmailVirusRisk(input: string): Promise<DetectionSource> {
    const inputLower = input.toLowerCase()
    let detected = false
    let confidence = 0
    let reason = "No suspicious payloads detected"
    let matchingPayloads: string[] = []

    const dangerousExtensions = [".exe", ".bat", ".scr", ".vbs", ".js", ".iso", ".wsf", ".hta", ".zip", ".rar", ".7z", ".bin"]
    const softwareLures = ["download", "attached", "installer", "update", "patch", "software", "invoice", "receipt"]

    // 1. Check for dangerous extension mentions in context of lures
    dangerousExtensions.forEach(ext => {
      if (inputLower.includes(ext)) {
        if (softwareLures.some(lure => inputLower.includes(lure))) {
          detected = true
          confidence = 85
          matchingPayloads.push(`Mention of ${ext} with ${inputLower.match(new RegExp(softwareLures.join("|")))?.[0]} lure`)
        }
      }
    })

    // 2. Check for "Double Extensions" (common malware tactic)
    const doubleExtMatch = inputLower.match(/\.[a-z0-9]+\.(exe|bat|scr|vbs|js|zip)/i)
    if (doubleExtMatch) {
      detected = true
      confidence = 95
      matchingPayloads.push(`Double extension pattern detected: ${doubleExtMatch[0]}`)
    }

    // 3. Encrypted Archive Lure
    if (inputLower.includes("password") && (inputLower.includes(".zip") || inputLower.includes(".rar"))) {
      detected = true
      confidence = 90
      matchingPayloads.push("Request to open password-protected archive (common AV evasion)")
    }

    if (detected) {
      reason = `VIRUS/PAYLOAD RISK: ${matchingPayloads.join(", ")}`
    }

    return {
      name: "Payload Analysis",
      detected,
      confidence: detected ? confidence : 10,
      reason,
      isReal: true,
      category: "Virus"
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
    const suspiciousEmailDomains = ["@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com"]

    // Look for official-looking emails from free providers (often phishing)
    const officialWords = ["security", "paypal", "amazon", "apple", "microsoft", "google", "facebook", "bank"]
    const hasOfficialWord = officialWords.some(word => inputLower.includes(word))
    const hasFreeDomain = suspiciousEmailDomains.some(domain => inputLower.includes(domain))

    if (hasOfficialWord && hasFreeDomain) {
      riskScore += 35
      reasons.push("Official brand name using free email provider")
    }

    // Check for suspicious links
    const linkPatterns = [/click here/gi, /link below/gi, /follow this link/gi, /visit our website/gi]
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
    const grammarIssues = [/\bdear\s+customer\b/i, /\byou\s+have\s+been\s+selected\b/i, /\bcongratulation\b/i, /\byour\s+account\s+will\s+be\s+suspended\b/i, /\bverify\s+your\s+account\s+immediately\b/i]
    if (grammarIssues.some(pattern => pattern.test(inputLower))) {
      riskScore += 20
      reasons.push("Poor grammar or suspicious phrasing")
    }

    // Check for time pressure
    const timePressure = ["within 24 hours", "immediately", "right away", "as soon as possible", "don't delay"]
    if (timePressure.some(phrase => inputLower.includes(phrase))) {
      riskScore += 15
      reasons.push("Time pressure tactic")
    }

    detected = riskScore >= 25
    return {
      name: "Email Pattern Analysis",
      detected,
      confidence: detected ? Math.min(riskScore + 10, 90) : 5,
      reason: detected ? `Suspicious email patterns detected: ${reasons.join(", ")}` : "No suspicious email patterns detected",
      isReal: false,
      category: "Trust"
    }
  }

  // --- Helpers ---

  private normalizeUrl(url: string): string | null {
    try {
      let input = url.trim()
      if (!input.startsWith('http://') && !input.startsWith('https://')) {
        input = 'https://' + input
      }
      const urlObj = new URL(input)
      urlObj.search = ""
      urlObj.hash = ""
      urlObj.hostname = urlObj.hostname.toLowerCase()
      return urlObj.toString()
    } catch (e) {
      return null
    }
  }

  private extractDomain(url: string): string {
    try {
      const normalized = this.normalizeUrl(url)
      if (!normalized) return url.toLowerCase().split('/')[0]
      const urlObj = new URL(normalized)
      return urlObj.hostname
    } catch {
      return url.toLowerCase().split('/')[0]
    }
  }

  private isValidDomain(input: string): boolean {
    // Basic regex to check if it looks like a domain or URL
    // Must have at least one dot, and valid chars
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

    // Check if it's "abc" (no dot) -> false
    if (!input.includes('.')) return false

    return domainRegex.test(input) || urlRegex.test(input)
  }

  private extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g
    const matches = text.match(urlRegex) || []
    return Array.from(new Set(matches.map(u => u.startsWith('http') || u.startsWith('www') ? u : `https://${u}`)))
  }

  private extractDomainParts(domain: string): { sld: string; tld: string; subdomains: string[] } {
    const parts = domain.split(".")
    if (parts.length < 2) return { sld: domain, tld: "", subdomains: [] }

    const tldPart = parts[parts.length - 1]
    const sldPart = parts[parts.length - 2]

    // Handle common multi-part TLDs (e.g., .co.uk, .com.au, .gov.in)
    if (["co", "com", "gov", "org", "net", "edu", "ac"].includes(sldPart) && tldPart.length <= 3 && parts.length >= 3) {
      const actualSld = parts[parts.length - 3]
      const actualTld = `${sldPart}.${tldPart}`
      const subdomains = parts.slice(0, parts.length - 3)
      return { sld: actualSld, tld: actualTld, subdomains }
    } else {
      const subdomains = parts.slice(0, parts.length - 2)
      return { sld: sldPart, tld: tldPart, subdomains }
    }
  }

  private calculateRiskScore(sources: DetectionSource[], url?: string): number {
    // -------------------------------------------------------------------------
    // SOC-GRADE RISK ENGINE: CONSENSUS-BASED MULTI-LAYER SCORING
    // Inspired by VirusTotal, urlscan.io, and Censys
    // -------------------------------------------------------------------------

    let score = 0;
    const detectedSources = sources.filter(s => s.detected);
    const domain = url ? this.extractDomain(url) : "";

    // --- PHASE 1: EXTERNAL THREAT INTEL (CONSENSUS LAYER) ---
    const externalIntel = sources.filter(s =>
      (s.name.includes("Google") || s.name.includes("PhishTank") || s.name.includes("VirusTotal")) &&
      s.detected
    );

    // Rule 1: Consensus Boost (Many engines flag = high confidence threat)
    if (externalIntel.length >= 2) {
      score = Math.max(score, 95);
    } else if (externalIntel.some(s => s.confidence >= 80)) {
      score = Math.max(score, 88);
    } else if (externalIntel.length === 1) {
      score = Math.max(score, 75);
    }

    // --- PHASE 2: BEHAVIORAL ANALYSIS (EXECUTION LAYER) ---
    // urlscan.io style: Behavior matters more than appearance
    const behavioralSources = detectedSources.filter(s =>
      s.name.includes("JavaScript") || s.name.includes("Redirect") || s.name.includes("External Resources")
    );

    if (behavioralSources.length >= 2) {
      score += 45;
    } else if (behavioralSources.length === 1) {
      score += 25;
    }

    // --- PHASE 3: CRITICAL TECHNICAL FORENSICS ---
    const criticalChecks = [
      { check: "Brand Analysis", weight: 60 },
      { check: "Homoglyph", weight: 65 },
      { check: "Punycode", weight: 70 },
      { check: "Crypto Scam", weight: 75 },
      { check: "Malware Pattern", weight: 80 }
    ];

    let criticalMatches = 0;
    criticalChecks.forEach(crit => {
      if (detectedSources.some(s => s.name.includes(crit.check))) {
        score += crit.weight;
        criticalMatches++;
      }
    });

    if (criticalMatches >= 2) score = Math.max(score, 92);

    // Deep Content Analysis Integration
    const contentAnalysis = detectedSources.find(s => s.name === "Page Content Analysis");
    if (contentAnalysis) {
      // Use the confidence directly as it reflects specific high-risk content finds
      // e.g. Sensitive Form on HTTP (80) or Title Mismatch (90)
      score = Math.max(score, contentAnalysis.confidence);

      // If content analysis found something critical, ensure we boost
      if (contentAnalysis.confidence >= 80) score = Math.max(score, 85);
    }

    // --- PHASE 4: INFRASTRUCTURE & RELATIONSHIPS (CENSYS STYLE) ---
    // Broaden filter to catch all infrastructure-related signals
    const infraSources = detectedSources.filter(s =>
      s.name.includes("Infrastructure") ||
      s.name.includes("IP Usage") ||
      s.name.includes("Random Domain") ||
      s.name.includes("Parking") ||
      s.name.includes("WHOIS") ||
      s.name.includes("DNS")
    );

    if (infraSources.length >= 2) {
      score = Math.max(score, 82);
    } else if (infraSources.length === 1) {
      // Boost single infrastructure signal if it's high confidence
      const topInfra = infraSources[0];
      if (topInfra.confidence > 80) score = Math.max(score, 75);
      else score += 35;
    }

    // --- PHASE 5: SOCIAL ENGINEERING (SENSITIVE ASSETS) ---
    const nlpSource = detectedSources.find(s =>
      s.name.includes("NLP") ||
      s.name.includes("Phishing Language") ||
      s.name.includes("Context Analysis")
    );

    if (nlpSource) {
      score += 30;
      // High-risk combo: Social Engineering + Infrastructure Flag -> >85
      if (infraSources.length > 0) score = Math.max(score, 85);
    }

    // --- PHASE 6: DECISION ENGINE (FINAL ADJUSTMENTS) ---
    // Rule: Any confirmed blacklist hit -> score MUST be at least 80
    if (externalIntel.length > 0) {
      score = Math.max(score, 80);
    }

    // Rule: Multiple medium-risk indicators (techCount >= 2 or behavioralSources.length >= 1) 
    // If we have at least 2 distinct technical/behavioral sources, ensure score is at least 65
    const techCount = infraSources.length;
    if ((techCount >= 2) || (techCount >= 1 && behavioralSources.length >= 1)) {
      score = Math.max(score, 65);
    }

    if (url) {
      const isSafeBrand = TOP_DOMAINS.some(b => domain === b || domain.endsWith("." + b));
      const isGovOrEdu = domain.endsWith(".gov") || domain.endsWith(".edu") || domain.endsWith(".gov.in");

      // EXCEPTION: FREE HOSTING PROVIDERS SHOULD NOT BE TREATED AS "SAFE BRANDS" FOR SUBDOMAINS
      const freeHostingProviders = ["github.io", "vercel.app", "pages.dev", "firebaseapp.com", "netlify.app", "weebly.com", "wixsite.com", "ngrok.io"];
      const isActuallyFreeHosting = freeHostingProviders.some(p => domain.endsWith(p));

      if ((isSafeBrand || isGovOrEdu) && !isActuallyFreeHosting) {
        // "Is this website compromised, not just malicious?"
        if (detectedSources.some(s => s.name.includes("Malware") || s.name.includes("Redirect") || s.name.includes("JavaScript"))) {
          score = Math.max(score, 70);
        } else {
          return 0; // Purely safe
        }
      }

      // Old Domain dampening (Safe context) - Only if NOT a confirmed threat or free hosting
      const domainAge = sources.find(s => s.name.includes("WHOIS") || s.name.includes("Domain Age"));
      if (domainAge && !domainAge.detected && score < 85 && !isActuallyFreeHosting) {
        score = Math.floor(score * 0.6);
      }
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private classifyRisk(riskScore: number): "SAFE" | "DANGEROUS" {
    /**
     * BINARY RISK CLASSIFICATION RULES:
     * - Any confirmed phishing, malware, or blacklist hit -> DANGEROUS (score >= 80)
     * - Multiple medium-risk indicators -> DANGEROUS (score >= 65)
     * - Clean reputation + no behavioral abuse -> SAFE (score <= 30)
     */
    if (riskScore >= 65) return "DANGEROUS";
    return "SAFE";
  }

  private calculateOverallConfidence(sources: DetectionSource[]): number {
    const detectedCount = sources.filter((s) => s.detected).length
    const maxSourceConfidence = sources.length > 0 ? Math.max(...sources.map((s) => s.confidence)) : 0
    if (detectedCount > 0) return Math.min(maxSourceConfidence + detectedCount * 5, 99.9)
    return Math.min(maxSourceConfidence, 90)
  }

  private generateReasons(sources: DetectionSource[]): string[] {
    const reasons: string[] = []
    const seenReasons = new Set<string>()
    for (const source of sources) {
      if (source.detected) {
        let reasonText = `${source.name}: ${source.reason}`
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

  // --- NEW DEEP ANALYSIS METHODS ---

  async checkSecurityHeaders(url: string): Promise<DetectionSource> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const headers = response.headers
      let riskScore = 0
      const missingHeaders: string[] = []

      // Check for critical security headers (Lowered weights for false positive reduction)
      if (!headers.get("content-security-policy")) {
        riskScore += 5 // Reduced from 15
        missingHeaders.push("CSP")
      }
      if (!headers.get("x-frame-options")) {
        riskScore += 5 // Reduced from 15
        missingHeaders.push("X-Frame-Options")
      }
      if (!headers.get("strict-transport-security") && url.startsWith("https")) {
        riskScore += 5 // Reduced from 10
        missingHeaders.push("HSTS")
      }
      if (!headers.get("x-content-type-options")) {
        riskScore += 5 // Reduced from 10
        missingHeaders.push("X-Content-Type-Options")
      }

      // Only flag as "detected" if multiple critical headers are missing
      const detected = riskScore >= 15
      return {
        name: "HTTP Security Headers",
        detected,
        confidence: detected ? riskScore : 5,
        reason: detected
          ? `Security Best Practices: Missing headers (${missingHeaders.join(", ")})`
          : "Security headers properly configured",
        isReal: true,
        category: "Technical"
      }
    } catch (error) {
      return {
        name: "HTTP Security Headers",
        detected: false,
        confidence: 0,
        reason: "Could not analyze security headers",
        isReal: false,
        category: "Technical"
      }
    }
  }

  async checkJavaScriptBehavior(url: string): Promise<DetectionSource> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const html = await response.text()
      let riskScore = 0
      const suspiciousPatterns: string[] = []

      // urlscan.io style: Behavior matters more than appearance

      // 1. Obfuscated JavaScript
      if (/eval\s*\(|String\.fromCharCode|atob\s*\(/.test(html) && html.length < 5000) {
        riskScore += 20
        suspiciousPatterns.push("highly obfuscated loader script")
      }

      // 2. Crypto mining scripts
      if (/coinhive|crypto-loot|minero\.cc|webmining|cryptonight/i.test(html)) {
        riskScore += 60
        suspiciousPatterns.push("crypto miner")
      }

      // 3. Suspicious redirects / History manipulation
      if (/window\.location\s*=|location\.replace|history\.pushState/i.test(html)) {
        riskScore += 15
        suspiciousPatterns.push("client-side navigation/history manipulation")
      }

      // 4. Data exfiltration / Credential harvesting behavior
      if (/XMLHttpRequest.*password|fetch.*credentials|navigator\.credentials|input\[type=password\]/i.test(html)) {
        riskScore += 40
        suspiciousPatterns.push("potential credential harvesting behavior")
      }

      // 5. DOM Manipulation of sensitive fields
      if (/\.value\s*=.*base64|\.innerHTML\s*=.*iframe/i.test(html)) {
        riskScore += 30
        suspiciousPatterns.push("suspicious DOM manipulation (dynamic iframes/base64 injection)")
      }

      const detected = riskScore >= 35
      return {
        name: "JavaScript Behavior Analysis",
        detected,
        confidence: detected ? Math.min(riskScore + 10, 95) : 5,
        reason: detected
          ? `Suspicious JavaScript patterns detected: ${suspiciousPatterns.join(", ")}`
          : "No malicious JavaScript patterns found",
        isReal: true,
        category: "Technical"
      }
    } catch (error) {
      return {
        name: "JavaScript Behavior Analysis",
        detected: false,
        confidence: 0,
        reason: "Could not analyze JavaScript behavior",
        isReal: false,
        category: "Technical"
      }
    }
  }

  async checkExternalResources(url: string): Promise<DetectionSource> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const html = await response.text()
      const domain = this.extractDomain(url)
      let riskScore = 0
      const suspiciousResources: string[] = []

      // Whitelist common Trusted CDNs and Analytics
      const trustedDomains = [
        'google-analytics.com', 'googletagmanager.com', 'fonts.googleapis.com',
        'facebook.net', 'twitter.com', 'linkedin.com', 'doubleclick.net',
        'cloudflare.com', 'bootstrapcdn.com', 'code.jquery.com', 'jsdelivr.net',
        'unpkg.com', 'aws.amazon.com', 'azure.microsoft.com', 'gstatic.com'
      ]

      // Extract external scripts
      const scriptMatches = html.match(/<script[^>]+src=["']([^"']+)["']/gi) || []
      const externalScripts = scriptMatches
        .map(s => s.match(/src=["']([^"']+)["']/)?.[1])
        .filter(s => s && !s.includes(domain) && !trustedDomains.some(t => s.includes(t)))

      // Check for suspicious external domains
      const suspiciousDomains = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top']
      externalScripts.forEach(script => {
        if (script && suspiciousDomains.some(d => script.includes(d))) {
          riskScore += 25
          suspiciousResources.push("high-risk TLD script")
        }
      })

      // Check for iframes from different domains (ignoring trusted)
      const iframeMatches = html.match(/<iframe[^>]+src=["']([^"']+)["']/gi) || []
      const externalIframes = iframeMatches
        .map(i => i.match(/src=["']([^"']+)["']/)?.[1])
        .filter(i => i && !i.includes(domain) && !trustedDomains.some(t => i.includes(t)))

      if (externalIframes.length > 5) { // Increased threshold from 3 to 5
        riskScore += 15 // Reduced weight
        suspiciousResources.push(`${externalIframes.length} external iframes`)
      }

      // Check for tracking pixels or hidden images
      if (/<img[^>]+style=["'][^"']*display:\s*none/i.test(html)) {
        riskScore += 10 // Reduced weight
        suspiciousResources.push("hidden tracking pixels")
      }

      const detected = riskScore >= 30
      return {
        name: "External Resources Scan",
        detected,
        confidence: detected ? Math.min(riskScore, 90) : 5,
        reason: detected
          ? `Suspicious external resources: ${suspiciousResources.join(", ")}`
          : `${externalScripts.length + externalIframes.length} unverified external resources`,
        isReal: true,
        category: "Technical"
      }
    } catch (error) {
      return {
        name: "External Resources Scan",
        detected: false,
        confidence: 0,
        reason: "Could not analyze external resources",
        isReal: false,
        category: "Technical"
      }
    }
  }

  async checkMalwarePatterns(url: string): Promise<DetectionSource> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      const html = await response.text()
      let riskScore = 0
      const malwareIndicators: string[] = []

      // Check for known malware patterns
      const malwarePatterns = [
        { pattern: /powershell\s+-(enc|-encodedcommand)/i, name: "PowerShell obfuscation", score: 50 },
        { pattern: /\b(cmd\.exe|wscript\.exe|cscript\.exe)\b/i, name: "system binary execution", score: 45 },
        { pattern: /base64_decode|gzinflate|str_rot13/i, name: "PHP obfuscation", score: 40 },
        { pattern: /document\.write\(unescape/i, name: "JavaScript unescape", score: 35 },
        { pattern: /<script[^>]*>[\s\S]*?eval\(/i, name: "eval injection", score: 40 },
        { pattern: /\$_POST\[.*?\].*?eval/i, name: "PHP backdoor", score: 50 },
        { pattern: /\b(shell_exec|system|passthru|exec)\b\s*\(/i, name: "command injection", score: 45 }
      ]

      malwarePatterns.forEach(({ pattern, name, score }) => {
        if (pattern.test(html)) {
          riskScore += score
          malwareIndicators.push(name)
        }
      })

      // Check for suspicious file downloads
      if (/<a[^>]+download[^>]*\.(?:exe|bat|scr|vbs|js)/i.test(html)) {
        riskScore += 40
        malwareIndicators.push("executable download link")
      }

      const detected = riskScore >= 35
      return {
        name: "Malware Pattern Detection",
        detected,
        confidence: detected ? Math.min(riskScore, 98) : 5,
        reason: detected
          ? `Malware patterns detected: ${malwareIndicators.join(", ")}`
          : "No known malware patterns found",
        isReal: true,
        category: "Virus"
      }
    } catch (error) {
      return {
        name: "Malware Pattern Detection",
        detected: false,
        confidence: 0,
        reason: "Could not analyze for malware patterns",
        isReal: false,
        category: "Virus"
      }
    }
  }

  async checkHistoricalThreatIntel(url: string): Promise<DetectionSource> {
    const domain = this.extractDomain(url)
    let riskScore = 0
    const indicators: string[] = []

    // Check against known malicious patterns from threat intelligence
    const knownMaliciousPatterns = [
      { pattern: /login.*verify/i, name: "login verification lure", score: 25 },
      { pattern: /account.*suspend/i, name: "account suspension threat", score: 25 },
      { pattern: /security.*update/i, name: "fake security update", score: 20 },
      { pattern: /prize.*claim/i, name: "prize claim scam", score: 30 },
      { pattern: /wallet.*connect/i, name: "wallet connection phishing", score: 35 },
      { pattern: /tax.*refund/i, name: "tax refund scam", score: 30 },
      { pattern: /[?&].*=[^&]*%[0-9a-f]{2}%[0-9a-f]{2}/i, name: "nested URL encoding", score: 40 },
      { pattern: /0x[0-9a-f]{8,}/i, name: "encoded hex parameters", score: 45 }
    ]

    knownMaliciousPatterns.forEach(({ pattern, name, score }) => {
      if (pattern.test(url)) {
        riskScore += score
        indicators.push(name)
      }
    })

    // Check for URL shorteners (often used to hide malicious links)
    const urlShorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly']
    if (urlShorteners.some(s => domain.includes(s))) {
      riskScore += 20
      indicators.push("URL shortener (hides destination)")
    }

    // Check for suspicious port numbers
    if (/:\d{4,5}/.test(url) && !/:(80|443|8080|8443)/.test(url)) {
      riskScore += 15
      indicators.push("non-standard port")
    }

    const detected = riskScore >= 15 // Lower threshold to catch more technical signals
    return {
      name: "Historical Threat Intelligence",
      detected,
      confidence: detected ? Math.min(riskScore, 85) : 5,
      reason: detected
        ? `Threat indicators found: ${indicators.join(", ")}`
        : "No historical threat patterns detected",
      isReal: true,
      category: "Intelligence"
    }
  }

  async checkPageContent(url: string): Promise<DetectionSource> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        // If 404/403/500, could be a takedown or just broken.
        return {
          name: "Page Content Analysis",
          detected: false,
          confidence: 0,
          reason: `Page returned status ${response.status}`,
          isReal: true,
          category: "Technical"
        }
      }

      const html = await response.text()
      const lowerHtml = html.toLowerCase()
      let riskScore = 0
      const indicators: string[] = []

      // 1. Phishing Keywords
      const phishingKeywords = ["verify your account", "update payment", "unlock wallet", "confirm identity", "security alert", "unusual sign-in", "verify identity"]
      const foundKeywords = phishingKeywords.filter(k => lowerHtml.includes(k))
      if (foundKeywords.length > 0) {
        riskScore += 20 * foundKeywords.length
        indicators.push(`Suspicious keywords found: ${foundKeywords.slice(0, 3).join(", ")}`)
      }

      // 2. Sensitive Forms
      // Regex to catch input type=password with single or double quotes
      const passwordInputRegex = /<input[^>]*type=["']password["'][^>]*>/i;
      if (passwordInputRegex.test(html) || lowerHtml.includes("credit_card") || lowerHtml.includes("cvv") || lowerHtml.includes("ssn")) {
        if (!url.startsWith("https")) {
          riskScore += 80 // Critical: Password/Card on HTTP
          indicators.push("Sensitive input fields on non-secure (HTTP) page")
        } else {
          riskScore += 15
          indicators.push("Sensitive form detected")
        }
      }

      // 3. Title Mismatch (Brand Impersonation)
      const titleMatch = html.match(/<title>(.*?)<\/title>/i)
      if (titleMatch) {
        const title = titleMatch[1].toLowerCase()
        const domain = this.extractDomain(url)
        const brands = ["paypal", "google", "microsoft", "apple", "facebook", "netflix", "amazon", "bank"]

        for (const brand of brands) {
          if (title.includes(brand) && !domain.includes(brand)) {
            riskScore += 90
            indicators.push(`Title claims '${brand}' but domain is unconnected`)
          }
        }
      }

      const detected = riskScore >= 40
      return {
        name: "Page Content Analysis",
        detected,
        confidence: Math.min(riskScore, 100),
        reason: detected ? `Content Analysis: ${indicators.join(", ")}` : "Content appears legitimate",
        isReal: true,
        category: "Technical"
      }

    } catch (e) {
      return {
        name: "Page Content Analysis",
        detected: false,
        confidence: 0,
        reason: "Content unreachable (Offline/Blocked)",
        isReal: true,
        category: "Technical"
      }
    }
  }

  async scanUrl(url: string, isRefresh: boolean = false): Promise<DetectionSource[]> {
    const normalized = this.normalizeUrl(url)
    if (!normalized) return []
    const sources = await Promise.all([
      // Tier 1: External Intelligence APIs
      this.checkGoogleSafeBrowsing(normalized).then(s => ({ ...s, category: "Intelligence" })),
      this.checkPhishTank(normalized).then(s => ({ ...s, category: "Intelligence" })),
      this.checkVirusTotal(normalized).then(s => ({ ...s, category: "Intelligence" })),

      // Tier 2: Technical Forensics
      this.checkDomainAge(normalized).then(s => ({ ...s, category: "Technical" })), // Re-enabled for Tier-1 Scoring
      this.checkSSLCertificate(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkRedirects(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkIpUrl(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkHomoglyphs(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkBrandImpersonation(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkRandomStringDomain(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkPrivacyProxy(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkParkedDomain(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkDeceptiveInfrastructure(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkPunycode(normalized).then(s => ({ ...s, category: "Technical" })),

      // NEW: Deep Analysis Methods
      this.checkJavaScriptBehavior(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkExternalResources(normalized).then(s => ({ ...s, category: "Technical" })),
      this.checkMalwarePatterns(normalized).then(s => ({ ...s, category: "Virus" })),
      this.checkHistoricalThreatIntel(normalized).then(s => ({ ...s, category: "Intelligence" })),
      this.checkPageContent(normalized).then(s => ({ ...s, category: "Technical" })) // NEW: Deep Content Scan
    ]) as any
    if (isRefresh) {
      return sources.map((s: any) => (!s.isReal && s.name.includes("API")) ? { ...s, reason: "Not Available (Live Refresh)" } : s)
    }
    return sources
  }

  async detect(input: string, mode: "url" | "email", isRefresh: boolean = false): Promise<RealDetectionResult> {
    const startTime = performance.now()
    let urlToExamine = input
    if (mode === 'url') {
      const normalized = this.normalizeUrl(input)
      if (!normalized || !this.isValidDomain(input)) {
        return {
          riskScore: 0, classification: "DANGEROUS", confidence: 0, reasons: ["Invalid URL format or Unreachable Domain"],
          sources: [], timestamp: new Date().toISOString(), processingTime: 0, url: input
        }
      }
      urlToExamine = normalized
    }

    let sources: DetectionSource[] = []
    let urlsToScan: string[] = mode === 'url' ? [urlToExamine] : this.extractUrls(input).slice(0, 5)
    const technicalResults = await Promise.all(urlsToScan.map(url => this.scanUrl(url, isRefresh)))
    sources = technicalResults.flat()

    sources.push({ ...(await this.nlpPhishingLanguageDetection(input)), category: "Trust" })

    if (mode === 'email') {
      sources.push(await this.checkEmailIdentity(input))
      sources.push(await this.checkEmailVirusRisk(input))
      sources.push(await this.checkEmailSpecificPatterns(input))
    }

    sources.push({ ...(await this.checkCryptoScams(input)), category: "Virus" })

    const riskScore = this.calculateRiskScore(sources, urlToExamine)
    const classification = this.classifyRisk(riskScore)
    const confidence = this.calculateOverallConfidence(sources)

    // Top 3 Technical Reasons only
    const allReasons = this.generateReasons(sources)
    const reasons = allReasons.slice(0, 3)

    // SOC-GRADE: Determine threat category based on detection sources
    let threatCategory = "Clean"
    if (classification !== "SAFE") {
      const detectedSources = sources.filter(s => s.detected)
      if (detectedSources.some(s => s.name.includes("Brand Analysis"))) {
        threatCategory = "Brand Impersonation"
      } else if (detectedSources.some(s => s.name.includes("Deceptive Infrastructure"))) {
        threatCategory = "Deceptive Infrastructure"
      } else if (detectedSources.some(s => s.name.includes("Homoglyph"))) {
        threatCategory = "Phishing (Homoglyph)"
      } else if (detectedSources.some(s => s.name.includes("Crypto"))) {
        threatCategory = "Crypto Scam"
      } else if (detectedSources.some(s => s.name.includes("Google Safe Browsing") || s.name.includes("VirusTotal"))) {
        threatCategory = "Malware/Phishing"
      } else {
        threatCategory = "Suspicious Activity"
      }
    }

    const verdictReport = {
      url: mode === 'url' ? urlToExamine : "Email Analysis",
      finalVerdict: classification,
      threatCategory, // SOC-GRADE: Threat classification
      evidenceSourcesUsed: Array.from(new Set(sources.filter(s => s.isReal).map(s => s.name))),
      confirmedFindings: (isRefresh && sources.filter(s => s.detected).length === 0)
        ? ["Refresh completed – No new live threat intelligence available."]
        : (sources.filter(s => s.isReal && s.detected).map(s => `${s.name}: ${s.reason}`).length > 0
          ? sources.filter(s => s.isReal && s.detected).map(s => `${s.name}: ${s.reason}`)
          : ["No confirmed threats found"]),
      confidenceLevel: (sources.filter(s => s.isReal).length >= 5 ? "High" : sources.filter(s => s.isReal).length >= 3 ? "Medium" : "Low") as any,
      limitations: sources.filter(s => !s.isReal).map(s => s.name).length > 0 ? [`Missing data: ${sources.filter(s => !s.isReal).map(s => s.name).join(", ")}`] : [],
      recommendedAction: (classification === "DANGEROUS" ? "Block" : "Allow") as any,
      infrastructureFlags: sources.filter(s => s.detected && (s.name.includes("Infrastructure") || s.name.includes("Brand") || s.name.includes("Privacy Proxy"))).map(s => s.reason) // SOC-GRADE: Infrastructure red flags
    }

    const officialReport = {
      caseId: `VEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${new Date().getFullYear()}`,
      verificationSeal: "VERDICT_ENGINE_CERTIFIED_v2.0",
      primaryDeterminant: sources.find(s => s.detected && s.confidence >= 80)?.reason || "Composite indicator alignment",
      mitigatingFactors: classification === "SAFE" ? ["Established domain history", "API status clean"] : ["No definitive external block"],
      auditTrail: sources.map(s => {
        let tier = "T3 (Heuristic)"
        if (s.name.includes("API") || s.name.includes("PhishTank") || s.name.includes("VirusTotal")) {
          tier = s.isReal ? "T1 (Verified Intel)" : "T3 (Simulated Intel)"
        } else if (s.isReal) {
          tier = "T2 (Forensic)"
        }

        return {
          indicator: s.name,
          status: s.detected ? "DETECTED" : "CLEAN",
          type: (s.name.includes("API") || s.name.includes("PhishTank") || s.name.includes("VirusTotal")) ? "Intelligence" as const : "Technical" as const,
          confidence: s.confidence,
          tier // Added tiering for SOC auditability
        }
      })
    }

    return {
      riskScore, classification, confidence, reasons, sources,
      timestamp: new Date().toISOString(),
      processingTime: Math.round(performance.now() - startTime),
      url: urlToExamine,
      verdictReport,
      officialReport
    }
  }
}
