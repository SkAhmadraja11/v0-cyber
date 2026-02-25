
$path = "c:\cyber-phishing\v0-cyber\lib\real-detection.ts"
$content = Get-Content $path

# checkObfuscation: 677-723
$new_obfuscation = @'
  private checkObfuscation(components: any): { score: number, indicators: string[] } {
    let score = 0
    const indicators: string[] = []
    const full = components.full.toLowerCase()

    // 0. User Info / Authority Manipulation (@ symbol)
    if (full.includes('@')) {
      try {
        const urlObj = new URL(full)
        if (urlObj.username || urlObj.password) {
          score = 100
          indicators.push("CRITICAL_THREAT: URL Authority Manipulation (@ symbol in authority detected)")
        }
      } catch (e) {
        if (full.split('?')[0].includes('@')) {
          score = 100
          indicators.push("CRITICAL_THREAT: Potential Authority Manipulation in malformed URL")
        }
      }
    }

    // 1. Double URL Encoding / Mixed Encoding (Scanned on FULL URL)
    if (/%25[0-9a-f]{2}/i.test(full) || /%[0-9a-f]{2}.*%[0-9a-f]{2}/i.test(full)) {
      score += 40
      indicators.push("Double/Nested URL encoding detected")
    }

    // 2. Base64-like strings in path/query/fragment
    const base64Pattern = /(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)/
    const hasBase64 = base64Pattern.test(full) && full.length > 30
    if (hasBase64) {
      score += 50
      indicators.push("Suspicious Base64-encoded string in URL (Potential Payload)")
    }

    // 3. Hex-encoded payloads (Scanned on FULL URL)
    if (/0x[0-9a-fA-F]{4,}/.test(full) || /%x[0-9a-fA-F]{2}/.test(full)) {
      score += 45
      indicators.push("Hex-encoded payload detected in URL")
    }

    return { score, indicators }
  }
'@

# checkPayloads: 726-756
$new_payloads = @'
  private checkPayloads(components: any): { score: number, indicators: string[] } {
    let score = 0
    const indicators: string[] = []
    const full = components.full.toLowerCase()

    const criticalKeywords = [
      "cmd.exe", "/bin/sh", "/bin/bash", "powershell", "wget", "curl",
      "javascript:", "vbscript:", "onload=", "onerror=", "eval(", "exec(",
      "src=http", "href=http", "redirect=", "callback=", "jsonp="
    ]

    if (criticalKeywords.some(k => full.includes(k))) {
      score += 90
      indicators.push("PAYLOAD_SIGNATURE_DETECTED: Critical Remote execution or injection signature found")
    }

    // Serialized object patterns (Expanded)
    if (full.includes("rO0AB") || full.includes("eyJ") || full.includes("Tzo")) { 
      score += 65
      indicators.push("Serialized data detected (Potential Exploit Payload)")
    }

    // File inclusion markers
    if (full.includes("../") || full.includes("..\\")) {
      score += 70
      indicators.push("Directory traversal pattern (LFI/RFI)")
    }

    return { score, indicators }
  }
'@

# checkMaliciousIntent: 783-804
$new_intent = @'
  private checkMaliciousIntent(components: any): { score: number, indicators: string[] } {
    let score = 0
    const indicators: string[] = []
    const full = components.full.toLowerCase()

    const intentPatterns = [
      { regex: /install.*update|update.*browser/i, name: "Fake Browser Update" },
      { regex: /verify.*wallet|connect.*dapp/i, name: "Crypto Wallet Drainer Intent" },
      { regex: /confirm.*password|login.*verify/i, name: "Credential Capture Intent" },
      { regex: /download.*driver|driver.*update/i, name: "Fake Driver Download" },
      { regex: /urgent.*(action|update|verify)|security.*(alert|update|notification)/i, name: "Social Engineering: Urgent Security Lure" },
      { regex: /captcha|robot.*verification|human.*check/i, name: "Anti-Analysis: Fake CAPTCHA Redirect" },
      { regex: /drainer|contract.*verify|stake.*reward/i, name: "Crypto: Potential Drainer Interaction" }
    ]

    intentPatterns.forEach(p => {
      if (p.regex.test(full)) {
        score += 85
        indicators.push(`MALICIOUS_INTENT_INFERRED: ${p.name}`)
      }
    })

    return { score, indicators }
  }
'@

# Replace the sections
$new_content = @()
for ($i = 0; $i -lt $content.Count; $i++) {
    $lineNum = $i + 1
    if ($lineNum -eq 677) {
        $new_content += $new_obfuscation -split "`r`n"
        $i = 722 # Skip the replaced lines
    } elseif ($lineNum -eq 726) {
        $new_content += $new_payloads -split "`r`n"
        $i = 755
    } elseif ($lineNum -eq 783) {
        $new_content += $new_intent -split "`r`n"
        $i = 803
    } else {
        $new_content += $content[$i]
    }
}

$new_content | Out-File -FilePath $path -Encoding utf8 -NoNewline
