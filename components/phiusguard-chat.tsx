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
            content: "Hello! I'm PhiusGuard AI. 🛡️\n\nI can help you spot phishing, check website safety, or improve your security. How can I assist you today?"
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

    // Hacking / Red Teaming (Ethical)
    if (lowerInput.match(/(hack|exploit|penetration|pentest|red team|blue team|ctf)/)) {
        return `⚔️ **Red vs Blue Teaming**\n\nI focus on **Defense (Blue Team)**, but understanding attacks is key:\n\n- **Red Team:** Simulates attackers to find weaknesses.\n- **Blue Team:** Defends and responds to incidents.\n- **Purple Team:** Collaboration between both.\n- **CTF (Capture The Flag):** Competitions to learn ethical hacking skills legally.`
    }

    // Greeting
    if (lowerInput.match(/(hello|hi|hey|greetings|start)/)) {
        return "Hello! 👋 I am **PhiusGuard AI v2.0**.\n\nI have been upgraded with a comprehensive cybersecurity knowledge base. I can explain:\n- Advanced Threats (Ransomware, Botnets)\n- Network Defense (VPN, Firewalls)\n- Privacy & Encryption\n- Social Engineering Tactics\n\nWhat would you like to learn about?"
    }

    // Default Fallback
    return "I'm ready to discuss any cybersecurity topic. 🛡️\n\nTry asking about:\n- **Top 10 OWASP Vulnerabilities**\n- **How Ransomware spreads**\n- **Securing your Home Router**\n- **The difference between HTTP and HTTPS**\n- **Identifying a malicious email header**"
}
