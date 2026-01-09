"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Send, X, Shield, Lock, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
    role: "user" | "assistant"
    content: string
}

export function PhiusGuardChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I'm PhiusGuard AI. 🛡️\n\nI can help you:\n✅ Spot phishing & scams\n✅ Check website safety\n✅ Learn security best practices\n✅ Understand threats (defensively)\n\n🚫 I won't help with hacking, malware, or illegal activities.\n\nHow can I assist you today?"
        }
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { role: "user", content: input }
        setMessages((prev) => [...prev, userMsg])
        setInput("")
        setIsTyping(true)

        // Simulate AI processing delay
        setTimeout(() => {
            const response = generateResponse(userMsg.content)
            setMessages((prev) => [...prev, { role: "assistant", content: response }])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Search/Chat Toggle Button */}
            <div className="pointer-events-auto">
                {!isOpen && (
                    <Button
                        onClick={() => setIsOpen(true)}
                        size="lg"
                        className="rounded-full h-14 w-14 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110"
                    >
                        <Bot className="w-8 h-8 text-white" />
                    </Button>
                )}
            </div>

            {/* Chat Window */}
            <div className={cn(
                "pointer-events-auto transition-all duration-500 ease-in-out origin-bottom-right",
                isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none absolute bottom-0 right-0"
            )}>
                <Card className="w-[380px] h-[600px] flex flex-col border-primary/20 shadow-2xl bg-background/95 backdrop-blur-md">
                    <CardHeader className="bg-primary/5 border-b border-white/10 p-4 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold text-foreground">PhiusGuard AI</CardTitle>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                    Online & Connected
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/20" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <ScrollArea className="h-full p-4" ref={scrollRef as any}>
                            <div className="space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                                        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                                            {msg.role === "assistant" ? (
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center border border-primary/20 rounded-full">
                                                    <Bot className="w-4 h-4 text-primary" />
                                                </div>
                                            ) : (
                                                <AvatarFallback className="bg-muted text-muted-foreground">ME</AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            msg.role === "assistant"
                                                ? "bg-secondary/50 text-foreground rounded-tl-none border border-white/5"
                                                : "bg-primary text-primary-foreground rounded-tr-none"
                                        )}>
                                            {msg.content.split('\n').map((line, i) => (
                                                <p key={i} className={line.startsWith("-") || line.startsWith("🛡️") ? "mb-1" : "mb-0"}>
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                                            <div className="w-full h-full bg-primary/10 flex items-center justify-center border border-primary/20 rounded-full">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                        </Avatar>
                                        <div className="bg-secondary/50 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Background watermark */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
                            <Shield className="w-48 h-48" />
                        </div>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-white/10 bg-muted/5 backdrop-blur-sm">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full items-center gap-2"
                        >
                            <Input
                                placeholder="Ask about phishing, passwords..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-background/50 border-white/10 focus-visible:ring-primary/50"
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

function generateResponse(input: string): string {
    const lowerInput = input.toLowerCase()

    // --- 🚫 SAFETY GUARDRAILS: Check for dangerous/unethical requests FIRST ---

    // Detect requests for malicious tools, exploits, or illegal activities
    if (lowerInput.match(/(how to (hack|break into|crack|exploit|steal|attack|ddos|bypass|phish|create malware|write virus|make ransomware|spam|bruteforce))/)) {
        return `🚫 **I Cannot Help With That**\n\nI'm designed to teach **defensive** cybersecurity, not offensive attacks.\n\n**Why This Is Dangerous:**\nUnauthorized access, creating malware, and similar activities are illegal and can result in serious legal consequences (Computer Fraud and Abuse Act, GDPR violations, etc.).\n\n**Safe Alternative:**\nInstead, I can help you:\n✅ Learn about how these attacks work *conceptually* to defend against them\n✅ Understand penetration testing in *legal*, controlled environments\n✅ Explore ethical hacking certifications (CEH, OSCP)\n✅ Participate in legal CTF competitions (HackTheBox, TryHackMe)\n\nWould you like to learn about ethical security testing instead?`
    }

    // Detect requests for malware, keyloggers, RATs, etc.
    if (lowerInput.match(/(give me|show me|create|build|make|write|code|develop).*(malware|virus|trojan|ransomware|keylogger|rat|backdoor|exploit code|rootkit|botnet)/)) {
        return `🚫 **I Cannot Provide Malicious Software**\n\n**This Request Violates:**\n- Computer Fraud and Abuse Act (CFAA)\n- Anti-hacking laws in most countries\n- Ethical standards for AI systems\n\n**Risk to You:**\nDistributing or using such tools without authorization can lead to:\n- Criminal charges\n- Heavy fines\n- Imprisonment\n\n**Learn Ethically Instead:**\nI can explain:\n✅ How malware operates (to defend against it)\n✅ Malware analysis in sandboxed environments\n✅ Careers in cybersecurity defense\n✅ How antivirus and EDR systems detect threats\n\nWould you like to understand how security professionals analyze malware safely?`
    }

    // Detect credential theft, password cracking, unauthorized access
    if (lowerInput.match(/(steal|crack|dump|extract|bypass|get access to).*(password|credential|account|login|database|admin)/)) {
        return `⚠️ **Unauthorized Access is Illegal**\n\n**The Problem:**\nAccessing accounts, systems, or data without permission is a federal crime under the CFAA and similar international laws.\n\n**Legal Consequences:**\n- Federal prosecution\n- Civil lawsuits\n- Permanent criminal record\n\n**Ethical Alternative:**\nI can teach you:\n✅ Password security best practices\n✅ How organizations protect credentials (hashing, salting, MFA)\n✅ Penetration testing *with written authorization*\n✅ Bug bounty programs where you can legally test security\n\nWant to learn about legitimate cybersecurity careers instead?`
    }

    // Detect phishing creation, fake websites, impersonation
    if (lowerInput.match(/(create|make|build|clone|fake).*(phishing|fake (site|website|login|page)|spoof|impersonate)/)) {
        return `🚫 **I Cannot Help Create Phishing Content**\n\n**Why This Is Wrong:**\n- Phishing is fraud and identity theft\n- It harms real people financially and emotionally\n- It's punishable by law (Wire Fraud Act, Identity Theft laws)\n\n**What You Should Know:**\nEven "testing" phishing on others without explicit written consent is illegal in most jurisdictions.\n\n**Safe Learning Path:**\n✅ I can explain how phishing works to help you *recognize* it\n✅ Teach you how organizations conduct *authorized* phishing simulations\n✅ Show you red flags to spot phishing attempts\n✅ Discuss career paths in security awareness training\n\nWould you like to learn how to defend against phishing instead?`
    }

    // Detect DDoS, spam, or disruption requests
    if (lowerInput.match(/(ddos|dos attack|flood|spam|take down|crash|disrupt).*(website|server|network|service)/)) {
        return `🚫 **Denial of Service Attacks Are Illegal**\n\n**Legal Reality:**\nDDoS and DoS attacks violate:\n- Computer Fraud and Abuse Act (CFAA)\n- International cyber laws\n- Terms of Service for all internet providers\n\n**Consequences:**\n- Criminal prosecution (even for "testing")\n- Heavy fines\n- Imprisonment\n\n**Defensive Learning:**\nInstead, I can explain:\n✅ How DDoS attacks work conceptually\n✅ How CDNs and rate limiting prevent DDoS\n✅ Incident response for DDoS mitigation\n✅ Careers in network security and defense\n\nWant to learn how companies defend against these attacks?`
    }

    // --- 1. SIMULATED ANALYSIS TOOLS ---

    // URL Analysis
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const foundUrl = input.match(urlRegex)
    if (foundUrl) {
        const url = foundUrl[0]
        return `🔍 **URL Safety Analysis**\n\nTarget: \`${url}\`\n\n**Cyber-Threat Assessment:**\n- **Protocol:** ${url.startsWith("https") ? "HTTPS (Encrypted)" : "HTTP (Unsecured - Risk)"}\n- **Domain Reputation:** Analyzing... (Simulated)\n\n**Verdict:** ⚠️ **Caution Advised**\nEven if a site uses HTTPS, it can still be malicious. Verify the domain spelling carefully (e.g., look for homoglyphs like '0' vs 'O').\n\n**Action:** Use a sandbox environment or a tool like VirusTotal to scan this link before visiting.`
    }

    // Email Analysis
    const emailRegex = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g
    const foundEmail = input.match(emailRegex)
    if (foundEmail) {
        return `📧 **Email Header Analysis**\n\nSender: \`${foundEmail[0]}\`\n\n**Forensic Tips:**\n1. **Check SPF/DKIM:** (Advanced) Verify if the email actually originated from the claimed domain.\n2. **Reply-To Field:** Attackers often set a different Reply-To address.\n3. **Content Analysis:** Does it demand urgent action or payment?\n\n**Recommendation:** Do not download attachments. Contact the sender via a known phone number to verify.`
    }

    // --- 2. COMPREHENSIVE KNOWLEDGE BASE ---

    // Phishing & Social Engineering
    if (lowerInput.match(/(phish|scam|fraud|fake|social eng|baiting|pretexting|quid pro quo)/)) {
        return `🎣 **Phishing & Social Engineering**\n\n**Phishing:** Deceptive emails/messages to steal creds.\n- *Spear Phishing:* Targeted at specific individuals.\n- *Whaling:* Targeted at executives.\n\n**Social Engineering:** Manipulating people into breaking security procedures.\n- *Pretexting:* Creating a fabricated scenario (e.g., "I'm IT support").\n- *Baiting:* Offering something enticing (e.g., free movie download).\n- *Vishing:* Voice phishing (phone scams).\n\n**Defense:** "Trust but Verify". Always verify requests through a secondary channel.`
    }

    // Passwords & Authentication
    if (lowerInput.match(/(pass|auth|2fa|mfa|credential|login|biometric)/)) {
        return `🔐 **Authentication Security**\n\n**Passwords:**\n- Length > Complexity. Use passphrases (e.g., "Correct-Horse-Battery-Staple").\n- Never reuse passwords.\n- Use a Password Manager (Bitwarden, 1Password, etc.).\n\n**MFA/2FA:**\n- **SMS 2FA:** Better than nothing, but vulnerable to SIM swapping.\n- **App 2FA (TOTP):** Secure and recommended (Google Auth, Authy).\n- **Hardware Keys:** (YubiKey) The gold standard for security.`
    }

    // Malware Types
    if (lowerInput.match(/(malware|virus|trojan|ransom|spyware|worm|rootkit|botnet|keylogger)/)) {
        return `🦠 **Malware Encyclopedia**\n\n- **Ransomware:** Encrypts files and demands payment (e.g., WannaCry). *Defense: Offline Backups.*\n- **Trojan:** Disguised as legitimate software. *Defense: Only verify official sources.*\n- **Spyware/Keyloggers:** Records keystrokes/activity. *Defense: Antimalware tools.*\n- **Rat (Remote Access Trojan):** Gives attackers full control.\n- **Botnet:** Slave devices used for DDoS attacks.`
    }

    // Network Security
    if (lowerInput.match(/(wifi|network|vpn|dns|firewall|port|ddos|man in the middle|mitm)/)) {
        return `🌐 **Network Security**\n\n- **VPN (Virtual Private Network):** Encrypts traffic. vital for public Wi-Fi safety.\n- **Firewall:** Monitors/blocks traffic based on rules. Enable it on your OS.\n- **DNS (Domain Name System):** Use secure DNS (e.g., Cloudflare 1.1.1.1) to avoid tracking.\n- **MitM (Man-in-the-Middle):** Attackers intercepting data. HTTPS prevents most of this.\n- **DDoS:** Overwhelming a service with traffic.`
    }

    // Web Security
    if (lowerInput.match(/(https|ssl|tls|cookie|session|xss|sql|injection|csrf)/)) {
        return `🕸️ **Web Security**\n\n- **HTTPS/SSL/TLS:** Encrypts communication between browser and server.\n- **Cookies:** Small data files. "Third-party cookies" track you across sites.\n- **XSS (Cross-Site Scripting):** Malicious scripts injected into websites.\n- **SQL Injection:** Attacking databases via input fields.\n- **CSRF:** Tricking a browser into performing unwanted actions.`
    }

    // Data Privacy & Encryption
    if (lowerInput.match(/(privacy|encrypt|data|gdpr|tracking|metadata)/)) {
        return `🛡️ **Data Privacy & Encryption**\n\n- **End-to-End Encryption (E2EE):** Only sender and receiver can read (Signal, WhatsApp).\n- **Metadata:** Data *about* data (who you called, when, how long). often more revealing than content.\n- **Digital Footprint:** Minimized by using privacy-focused browsers (Brave, Firefox) and search engines (DuckDuckGo).`
    }

    // Mobile & IoT
    if (lowerInput.match(/(phone|mobile|android|ios|iot|smart|device|camera)/)) {
        return `� **Mobile & IoT Security**\n\n**Mobile:**\n- Update OS immediately.\n- Review App Permissions (does a Flashlight app need Contacts?).\n- Avoid "Jailbreaking/Rooting" as it bypasses security sandboxes.\n\n**IoT (Smart Devices):**\n- Isolate on a separate Guest Wi-Fi network.\n- Change default passwords immediately.\n- Disable UPnP on your router.`
    }

    // Zero Trust Architecture
    if (lowerInput.match(/(zero trust|ztna|never trust|least privilege|micro.?segmentation)/)) {
        return `🔒 **Zero Trust Architecture**\n\n**Core Principle:** "Never trust, always verify" - No implicit trust based on network location.\n\n**Key Components:**\n- **Identity Verification:** Authenticate every user/device, every time\n- **Least Privilege Access:** Give minimum permissions needed\n- **Micro-segmentation:** Isolate workloads and limit lateral movement\n- **Continuous Monitoring:** Assume breach, verify constantly\n\n**Benefits:**\n✅ Reduces attack surface\n✅ Limits breach impact\n✅ Better for cloud/remote work\n\n**Implementation:** Use MFA, conditional access, and network segmentation.`
    }

    // Cloud Security
    if (lowerInput.match(/(cloud|aws|azure|gcp|s3|bucket|serverless|saas|iaas|paas)/)) {
        return `☁️ **Cloud Security**\n\n**Shared Responsibility Model:**\n- **Cloud Provider:** Secures infrastructure (hardware, network)\n- **You:** Secure your data, apps, access controls\n\n**Common Risks:**\n- **Misconfigured S3/Storage:** Public buckets exposing sensitive data\n- **Weak IAM Policies:** Overprivileged accounts\n- **Lack of Encryption:** Data at rest/in transit\n- **Shadow IT:** Unapproved cloud services\n\n**Best Practices:**\n✅ Enable MFA for all cloud accounts\n✅ Use Cloud Security Posture Management (CSPM) tools\n✅ Encrypt sensitive data\n✅ Implement least privilege IAM\n✅ Monitor logs (CloudTrail, Azure Monitor)`
    }

    // Cryptography
    if (lowerInput.match(/(crypto|encrypt|decrypt|cipher|aes|rsa|hash|sha|md5|public key|private key|asymmetric|symmetric)/)) {
        return `🔐 **Cryptography Fundamentals**\n\n**Symmetric Encryption (Same Key):**\n- **AES-256:** Current standard, very secure\n- **Use Case:** Encrypting files, disk encryption\n\n**Asymmetric Encryption (Public/Private Keys):**\n- **RSA, ECC:** Public key encrypts, private key decrypts\n- **Use Case:** HTTPS, SSH, digital signatures\n\n**Hashing (One-Way):**\n- **SHA-256:** Secure, used for passwords (with salt)\n- **MD5/SHA-1:** DEPRECATED, vulnerable to collisions\n\n**Key Concepts:**\n- **Salt:** Random data added to passwords before hashing\n- **Digital Signature:** Proves authenticity and integrity\n- **Perfect Forward Secrecy:** Past sessions secure even if key compromised`
    }

    // Compliance & Frameworks
    if (lowerInput.match(/(compliance|framework|nist|iso|pci.?dss|hipaa|gdpr|sox|cis|regulation)/)) {
        return `📋 **Compliance & Security Frameworks**\n\n**GDPR (EU Data Protection):**\n- Right to be forgotten, data portability\n- Heavy fines for breaches (4% of revenue)\n\n**PCI-DSS (Payment Card Industry):**\n- Required for businesses handling credit cards\n- Network segmentation, encryption, regular testing\n\n**HIPAA (Healthcare):**\n- Protects medical data in the US\n- Administrative, physical, and technical safeguards\n\n**NIST Cybersecurity Framework:**\n- 5 Functions: Identify, Protect, Detect, Respond, Recover\n- Risk-based approach, widely adopted\n\n**ISO 27001:**\n- Information security management system (ISMS)\n- International standard for security controls\n\n**Why It Matters:** Compliance = baseline security + legal protection`
    }

    // Incident Response & Forensics
    if (lowerInput.match(/(incident|response|forensic|breach|compromise|investigation|edr|siem|playbook)/)) {
        return `🚨 **Incident Response & Forensics**\n\n**IR Lifecycle (NIST):**\n1. **Preparation:** Playbooks, tools, training\n2. **Detection & Analysis:** SIEM alerts, log analysis\n3. **Containment:** Isolate affected systems\n4. **Eradication:** Remove malware, close vulnerabilities\n5. **Recovery:** Restore systems, monitor closely\n6. **Lessons Learned:** Post-mortem, improve defenses\n\n**Digital Forensics:**\n- **Chain of Custody:** Document evidence handling\n- **Memory Forensics:** Analyze RAM for malware\n- **Disk Imaging:** Bit-by-bit copy for analysis\n\n**Tools:**\n- EDR (Endpoint Detection & Response): CrowdStrike, SentinelOne\n- SIEM (Security Info & Event Management): Splunk, QRadar\n\n**Golden Rule:** Preparation prevents panic`
    }

    // API Security
    if (lowerInput.match(/(api|rest|graphql|oauth|jwt|token|rate limit|api key)/)) {
        return `🔌 **API Security**\n\n**Common API Vulnerabilities:**\n- **Broken Authentication:** Weak tokens, missing expiration\n- **Excessive Data Exposure:** Returning more data than needed\n- **Lack of Rate Limiting:** Enables brute force attacks\n- **Injection Flaws:** SQL, NoSQL, command injection\n- **Mass Assignment:** Modifying unintended object properties\n\n**Security Best Practices:**\n✅ Use OAuth 2.0 for authorization\n✅ Implement JWT with short expiration\n✅ Validate & sanitize ALL inputs\n✅ Use HTTPS only\n✅ Implement rate limiting & throttling\n✅ Log all API access\n\n**OWASP API Security Top 10:** Essential reading for developers`
    }

    // DevSecOps & CI/CD Security
    if (lowerInput.match(/(devsecops|ci.?cd|pipeline|sast|dast|container|docker|kubernetes|k8s|secrets management)/)) {
        return `⚙️ **DevSecOps & Pipeline Security**\n\n**Shift Left Security:** Integrate security early in development\n\n**CI/CD Security:**\n- **SAST (Static):** Scan source code for vulnerabilities\n- **DAST (Dynamic):** Test running applications\n- **SCA (Software Composition):** Find vulnerable dependencies\n- **Secrets Management:** Never hardcode credentials (use Vault, AWS Secrets Manager)\n\n**Container Security:**\n- **Image Scanning:** Check for CVEs before deployment\n- **Minimal Base Images:** Use Alpine, distroless\n- **Non-root Users:** Run containers with least privilege\n- **Network Policies:** Restrict pod-to-pod communication (K8s)\n\n**Tools:** Snyk, Trivy, Aqua Security, Falco`
    }

    // Threat Intelligence
    if (lowerInput.match(/(threat intel|ioc|ttp|apt|mitre|attack|indicator of compromise|threat actor)/)) {
        return `🎯 **Threat Intelligence**\n\n**What It Is:** Data about current/emerging threats to inform defense\n\n**Types:**\n- **Strategic:** High-level trends for executives\n- **Tactical:** TTPs (Tactics, Techniques, Procedures) for security teams\n- **Operational:** Details on specific campaigns\n- **Technical:** IOCs (malware hashes, IP addresses)\n\n**IOCs (Indicators of Compromise):**\n- File hashes (SHA-256)\n- Malicious IP addresses/domains\n- Registry keys modified by malware\n\n**MITRE ATT&CK Framework:**\n- Knowledge base of adversary tactics\n- Maps real-world attacks to techniques\n- Used for threat hunting and detection engineering\n\n**Sources:** VirusTotal, AlienVault OTX, CISA alerts`
    }

    // SOC & Security Operations
    if (lowerInput.match(/(soc|security operations|analyst|tier 1|tier 2|alert|triage|threat hunt)/)) {
        return `🛡️ **Security Operations Center (SOC)**\n\n**SOC Analyst Tiers:**\n- **Tier 1 (Triage):** Monitor alerts, initial investigation\n- **Tier 2 (Incident Response):** Deep analysis, containment\n- **Tier 3 (Threat Hunting):** Proactive threat discovery\n\n**Daily Activities:**\n- Monitor SIEM dashboards\n- Investigate alerts (true/false positives)\n- Correlate events across systems\n- Document incidents\n- Tune detection rules\n\n**Key Skills:**\n✅ Log analysis (Windows Event Logs, Syslog)\n✅ Network traffic analysis (Wireshark, Zeek)\n✅ Malware triage\n✅ Scripting (Python, PowerShell)\n\n**Career Path:** Great entry point into cybersecurity!`
    }

    // IAM (Identity & Access Management)
    if (lowerInput.match(/(iam|identity|access management|rbac|sso|saml|active directory|ldap|privilege)/)) {
        return `👤 **Identity & Access Management (IAM)**\n\n**Core Concepts:**\n- **Authentication:** Who are you? (Passwords, MFA, biometrics)\n- **Authorization:** What can you do? (Permissions, roles)\n- **RBAC (Role-Based Access Control):** Assign permissions by job role\n- **SSO (Single Sign-On):** One login for multiple apps (SAML, OAuth)\n\n**Privileged Access Management (PAM):**\n- Secure admin/root accounts\n- Just-in-time access\n- Session recording\n\n**Best Practices:**\n✅ Principle of least privilege\n✅ Regular access reviews\n✅ Disable unused accounts immediately\n✅ Enforce MFA for all users\n✅ Monitor privileged account activity\n\n**Tools:** Okta, Azure AD, CyberArk (PAM)`
    }

    // OWASP Top 10
    if (lowerInput.match(/(owasp|top 10|broken access|cryptographic failure|injection|insecure design|security misconfiguration)/)) {
        return `🕸️ **OWASP Top 10 Web Vulnerabilities**\n\n**2021 Edition:**\n1. **Broken Access Control:** Users access unauthorized data\n2. **Cryptographic Failures:** Weak encryption, exposed sensitive data\n3. **Injection:** SQL, NoSQL, OS command injection\n4. **Insecure Design:** Fundamental design flaws\n5. **Security Misconfiguration:** Default configs, open cloud storage\n6. **Vulnerable Components:** Outdated libraries (Log4Shell)\n7. **Authentication Failures:** Weak passwords, missing MFA\n8. **Software & Data Integrity:** Unsigned updates, CI/CD tampering\n9. **Logging & Monitoring Failures:** Can't detect breaches\n10. **SSRF (Server-Side Request Forgery):** Server makes unintended requests\n\n**Fix:** Security testing + developer training`
    }

    // Browser Security & Extensions
    if (lowerInput.match(/(browser|extension|add.?on|content security policy|csp|cors|same.?origin)/)) {
        return `🌐 **Browser Security**\n\n**Security Features:**\n- **Same-Origin Policy:** Limits cross-site data access\n- **CSP (Content Security Policy):** Prevents XSS by whitelisting sources\n- **CORS (Cross-Origin Resource Sharing):** Controls cross-domain requests\n- **SameSite Cookies:** Prevents CSRF\n\n**Browser Extensions:**\n⚠️ Can access all browsing data\n✅ Only install from official stores\n✅ Review permissions carefully\n✅ Remove unused extensions\n\n**Privacy Tips:**\n- Use privacy-focused browsers (Brave, Firefox)\n- Enable tracking protection\n- Clear cookies regularly\n- Use containers/profiles for separation\n\n**Recommendation:** uBlock Origin for ad/tracker blocking`
    }

    // Supply Chain Security
    if (lowerInput.match(/(supply chain|dependency|npm|package|library|vulnerability|cve|sbom)/)) {
        return `📦 **Supply Chain Security**\n\n**The Threat:** Attackers compromise trusted software/libraries\n\n**Famous Attacks:**\n- **SolarWinds (2020):** Backdoored software update\n- **Log4Shell (2021):** Critical Java logging library\n- **event-stream npm (2018):** Malicious package dependency\n\n**Defense Strategies:**\n✅ Use Software Bill of Materials (SBOM)\n✅ Pin dependency versions\n✅ Scan for known CVEs (Dependabot, Snyk)\n✅ Verify package signatures\n✅ Use private package repositories\n✅ Regular dependency audits\n\n**Developer Tip:** Run \`npm audit\` or \`pip-audit\` regularly\n\n**Why It Matters:** 80% of code is third-party libraries`
    }

    // Hacking / Red Teaming (Ethical)
    if (lowerInput.match(/(hack|exploit|penetration|pentest|red team|blue team|ctf)/)) {
        return `⚔️ **Ethical Security Testing**\n\n**Important Boundaries:**\n🚫 I will NOT provide tools or techniques for unauthorized access\n✅ I WILL explain defensive concepts and legal security careers\n\n**Ethical Security Roles:**\n- **Blue Team (Defense):** Protect systems, monitor threats, incident response\n- **Red Team (Authorized Testing):** Simulate attacks *with written permission*\n- **Purple Team:** Collaboration between red and blue\n\n**Legal Learning Paths:**\n✅ Bug Bounty Programs (HackerOne, Bugcrowd)\n✅ CTF Competitions (HackTheBox, TryHackMe, PicoCTF)\n✅ Certifications: CEH, OSCP, Security+\n✅ University programs in cybersecurity\n\n**Golden Rule:** *Never test security on systems you don't own without explicit written authorization.*`
    }

    // Greeting
    if (lowerInput.match(/(hello|hi|hey|greetings|start)/)) {
        return "Hello! 👋 I am **PhiusGuard AI v2.0**.\n\n**My Purpose:**\nI teach **defensive** cybersecurity, security awareness, and ethical practices.\n\n**I Can Help You:**\n✅ Identify phishing and scams\n✅ Understand threats conceptually\n✅ Learn security best practices\n✅ Explore ethical security careers\n✅ Analyze suspicious URLs/emails\n\n**I Will Not:**\n🚫 Provide hacking tools or malware\n🚫 Help with unauthorized access\n🚫 Assist with illegal activities\n\nWhat would you like to learn about?"
    }

    // Default Fallback
    return "I'm ready to discuss any cybersecurity topic. 🛡️\n\n**Try asking about:**\n- Zero Trust Architecture\n- Cloud security (AWS, Azure, GCP)\n- OWASP Top 10 vulnerabilities\n- Cryptography (AES, RSA, hashing)\n- Compliance frameworks (NIST, GDPR, PCI-DSS)\n- Incident response & forensics\n- API security & OAuth\n- DevSecOps & container security\n- Threat intelligence & MITRE ATT&CK\n- SOC analyst career path\n- Supply chain security\n- Identity & Access Management (IAM)\n\n*Or paste a URL/email for analysis!*"
}
