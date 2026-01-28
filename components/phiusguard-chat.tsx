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
            content: "Hello! I'm PhiusGuard AI v2.5, your expert in **Cybercrime & Cybersecurity**. 🛡️\n\nI can assist you with:\n✅ Advanced Threat Analysis\n✅ Cybercrime Intelligence (BEC, Scams, etc.)\n✅ Defense Frameworks & Infrastructure\n✅ Forensic Indicator Interpretation\n\nHow can I help you secure your digital world today?"
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
        setMessages((prev: Message[]) => [...prev, userMsg])
        setInput("")
        setIsTyping(true)

        // Simulate AI processing delay
        setTimeout(() => {
            const response = generateResponse(userMsg.content)
            setMessages((prev: Message[]) => [...prev, { role: "assistant", content: response }])
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
                                {messages.map((msg: Message, idx: number) => (
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
                                            {msg.content.split('\n').map((line: string, i: number) => (
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

    // --- 🚫 SAFETY GUARDRAILS (Offensive use prevention) ---
    if (lowerInput.match(/(how to (hack|break|crack|exploit|steal|attack|ddos|bypass|phish|malware|virus|ransomware|spam|bruteforce))/)) {
        return `🚫 **I Cannot Help With That**\n\nI'm designed to teach **defensive** cybersecurity and threat intelligence.\n\n**Legal Reality:** Unauthorized access or creating malicious tools is illegal and carries severe penalties.\n\n**Safe Learning Path:**\n✅ Learn **Ethical Hacking** through legal platforms like TryHackMe or HackTheBox.\n✅ Study for certifications like **Security+** or **CISSP**.\n✅ Explore **Bug Bounty** programs (HackerOne) to legally test security.`
    }

    // --- 1. SIMULATED FORENSICS ---
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const foundUrl = input.match(urlRegex)
    if (foundUrl) {
        return `🔍 **Technical Indicator Assessment**\n\nTarget: \`${foundUrl[0]}\`\n\n**Interpreted Findings:**\n- **Protocol:** ${foundUrl[0].startsWith("https") ? "HTTPS (Encrypted)" : "HTTP (Unsecured)"}\n- **API Verification:** Simulated (No Live Data)\n\n**Verdict:** ⚠️ **Inconclusive**\nFor a full API-verified verdict using Google Safe Browsing and VirusTotal, please use our **[Real-Time Scanner](/scanner)**.`
    }

    // --- 2. THE CYBERCRIME VAULT (Modern Threats) ---
    if (lowerInput.match(/(pig butchering|romance scam|investment fraud|sha zhu pan)/)) {
        return `🐷 **Pig Butchering & Romance Scams**\n\n**Method:** Scammers build a fake emotional connection over months before pitching a "high-yield" crypto platform.\n\n**Indicators:**\n- Move to Telegram/WhatsApp immediately\n- "Guaranteed" high returns (impossible in real markets)\n- Requests for money via crypto or wire transfer\n\n**Defense:** Use the "Reverse Image Search" on their profile photo and never invest via unverified platforms.`
    }

    if (lowerInput.match(/(bec|business email compromise|ceo fraud|invoice fraud)/)) {
        return `🏢 **Business Email Compromise (BEC)**\n\n**The Attack:** Impersonating an executive or vendor to redirect wire transfers. BEC causes more financial loss annually than ransomware.\n\n**Common Hook:** "I'm in a meeting, I need this payment handled immediately."\n\n**Defense:** Implement a **Secondary Verification Policy**—never authorize a payment or account change based solely on an email.`
    }

    if (lowerInput.match(/(sim swap|port out|mobile hijacking)/)) {
        return `📱 **SIM Swapping**\n\n**The Attack:** Attackers hijack your SIM card to bypass SMS 2FA and drain bank accounts.\n\n**Defense:**\n✅ Use App-based Auth (Authy/Google Auth) instead of SMS.\n✅ Add a "Port-Out PIN" to your cellular account.`
    }

    // --- 3. CYBERSECURITY ENCYCLOPEDIA (Technical Topics) ---
    if (lowerInput.match(/(phish|social eng|baiting|pretexting|vishing|smishing)/)) {
        return `🎣 **Phishing & Social Engineering**\n\n**Phishing:** Deceptive digital communication.\n**Spear Phishing:** Targeted at a specific person.\n**Whaling:** Targeted at top executives.\n**Vishing:** Voice-based phishing.\n**Smishing:** SMS-based phishing.\n\n**Red Flags:** Urgency, Fear, and curiosity triggers designed to make you click without thinking.`
    }

    if (lowerInput.match(/(malware|virus|trojan|ransom|spyware|worm|rootkit|botnet|keylogger)/)) {
        return `🦠 **Malware Encyclopedia**\n\n- **Ransomware:** Encrypts data for ransom (e.g., LockBit, Conti).\n- **Trojan:** Disguised as legitimate files.\n- **RAT:** Allows full remote control of your device.\n- **Worm:** Spreads automatically across networks.\n- **Infostealer:** Targets browser saved passwords and crypto wallets.`
    }

    if (lowerInput.match(/(zero trust|ztna|never trust|least privilege)/)) {
        return `🔒 **Zero Trust Architecture**\n\n**Core Principle:** "Never trust, always verify." No device or user is trusted by default, even if they are inside the company network.\n\n**Tiers of Defense:**\n1. Identity (MFA)\n2. Device (Health check)\n3. Network (Segmentation)\n4. Data (Encryption)`
    }

    if (lowerInput.match(/(quantum|post.?quantum|qkd|lattice)/)) {
        return `⚛️ **Quantum-Resistant Security**\n\n**The Problem:** Quantum computers will break RSA and ECC. \n**The Solution:** NIST-approved algorithms like **Kyber** and **Dilithium**. We are currently in the era of "Harvest Now, Decrypt Later" protection.`
    }

    if (lowerInput.match(/(ai (threat|attack|security)|deepfake|adversarial ml)/)) {
        return `🤖 **Artificial Intelligence & Security**\n\n- **Deepfakes:** Used to impersonate CEOs via voice or video.\n- **Automated Phishing:** AI can write millions of perfect, personalized phishing emails.\n- **Adversarial ML:** Attacking the AI itself to make it "blind" to certain threats.`
    }

    if (lowerInput.match(/(cloud|aws|azure|gcp|s3|iam|shared responsibility)/)) {
        return `☁️ **Cloud Security**\n\n**Shared Responsibility:** The provider secures the *cloud*; you secure your *data* in the cloud. \n**Key Risks:** Misconfigured storage (S3 buckets), overprivileged IAM roles, and lack of logging.`
    }

    if (lowerInput.match(/(incident response|ir|forensic|breach|investigation)/)) {
        return `🚨 **Incident Response & Forensics**\n\n**Steps:**\n1. Preparation\n2. Detection & Analysis\n3. Containment\n4. Eradication\n5. Recovery\n6. Lessons Learned\n\n**Forensics:** The "Chain of Custody" is vital for using evidence in legal proceedings.`
    }

    if (lowerInput.match(/(crypto|encrypt|aes|rsa|hash|sha|md5|blockchain)/)) {
        return `🔐 **Cryptography Hub**\n\n- **Symmetric:** AES (Fast, same key).\n- **Asymmetric:** RSA/ECC (Public/Private keys).\n- **Hashing:** SHA-256 (One-way fingerprint). **MD5 is broken—do not use!**\n- **Blockchain:** Great for integrity, but vulnerable to 51% attacks and smart contract bugs.`
    }

    if (lowerInput.match(/(compliance|framework|nist|iso|pci|hipaa|gdpr)/)) {
        return `📋 **Compliance & Frameworks**\n\n**NIST CSF:** Identify, Protect, Detect, Respond, Recover.\n**ISO 27001:** The global standard for security management systems.\n**GDPR:** Protects user privacy rights in the EU.\n**PCI-DSS:** Essential for anyone handling credit cards.`
    }

    if (lowerInput.match(/(network|wifi|vpn|dns|firewall|mitm|ddos)/)) {
        return `🌐 **Network Defense**\n\n- **Firewall:** Blocks unwanted traffic.\n- **VPN:** Creates an encrypted tunnel over public Wi-Fi.\n- **Mitm:** Attackers "sitting in the middle" of your connection.\n- **DDoS:** Overwhelming a service to make it go offline.`
    }

    if (lowerInput.match(/(owasp|web security|xss|sql injection|injection)/)) {
        return `🕸️ **OWASP Top 10**\n\n**The Most Common Web Flaws:**\n1. Broken Access Control\n2. Cryptographic Failures\n3. Injection (SQL/Command)\n4. Insecure Design\n5. Security Misconfiguration`
    }

    if (lowerInput.match(/(career|job|soc|analyst|engineer|salary|certification|security\+|cissp)/)) {
        return `🎓 **Cybersecurity Careers**\n\n**Entry Level:** SOC Analyst, Security Generalist.\n**Specializations:** Incident Responder, Penetration Tester, GRC Consultant.\n**Top Certs:** CompTIA Security+ (Start), CISSP (Professional), OSCP (Technical).`
    }

    // --- 4. GREETING & FALLBACK ---
    if (lowerInput.match(/(hello|hi|hey|greetings|start)/)) {
        return "Hello! 👋 I am **PhiusGuard AI v2.5**, your global expert on **Cybercrime & Cybersecurity**.\n\n**I can help you with:**\n- **Cybercrime Intelligence** (Scams, BEC, SIM Swapping)\n- **Defensive Architecture** (Zero Trust, Cloud, AI)\n- **Threat Encyclopedia** (Malware, Network Security, Web)\n- **Compliance & Careers** (NIST, CISSP, SOC Roles)\n\nWhat would you like to secure today?"
    }

    return "I am a comprehensive database for all things **Cybercrime & Cybersecurity**. 🛡️\n\n**Try asking about:**\n- **Modern Scams:** Pig Butchering, Romance scams, or BEC.\n- **Infra Defense:** Zero Trust, XDR, or Cloud security.\n- **Technical Threats:** Ransomware, SQL Injection, or Quantum attacks.\n- **Careers/GRC:** CISSP training, SOC analyst paths, or NIST frameworks.\n\n*You can also paste a URL or Email for a technical interpretation.*"
}
