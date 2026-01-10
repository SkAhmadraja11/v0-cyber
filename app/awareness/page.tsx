"use client"

import Link from "next/link"
import { useState } from "react"
import {
    Shield,
    AlertTriangle,
    Mail,
    Layers,
    Lock,
    Skull,
    Eye,
    Bug,
    FileWarning,
    Keyboard,
    Factory,
    Zap,
    Flame,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    GraduationCap,
    TrendingUp,
    Search,
    Filter,
    Brain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Footer from "@/components/footer"
import { UserNav } from "@/components/user-nav"

export default function SecurityAwarenessPage() {
    const [expandedMalware, setExpandedMalware] = useState<string | null>(null)
    const [expandedCase, setExpandedCase] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="fixed inset-0 bg-grid-pattern opacity-30" />
            <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30">
                                    <GraduationCap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-xl text-foreground">Security Awareness Platform</h1>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Educational Dashboard</p>
                                </div>
                            </div>
                        </div>
                        <UserNav />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 relative z-10">
                {/* Hero Section */}
                <div className="mb-12">
                    <Card className="p-8 glassmorphism relative overflow-hidden border-purple-500/20">
                        <div className="absolute top-0 right-0 p-32 opacity-10 bg-purple-500 blur-[100px] rounded-full pointer-events-none" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                                <Shield className="w-4 h-4 text-purple-500" />
                                <span className="text-sm font-medium text-purple-500">Learn. Protect. Defend.</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                                Master Cybersecurity Threats
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                Understanding how attacks work is the first step to defending against them. Explore real-world cases, learn about malware, and build your security awareness.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Tabbed Content */}
                <Tabs defaultValue="malware" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 glassmorphism">
                        <TabsTrigger value="malware" className="flex items-center gap-2 py-3">
                            <Bug className="w-4 h-4" />
                            <span className="hidden sm:inline">Malware Types</span>
                            <span className="sm:hidden">Malware</span>
                        </TabsTrigger>
                        <TabsTrigger value="cases" className="flex items-center gap-2 py-3">
                            <Flame className="w-4 h-4" />
                            <span className="hidden sm:inline">Attack Cases</span>
                            <span className="sm:hidden">Cases</span>
                        </TabsTrigger>
                        <TabsTrigger value="email" className="flex items-center gap-2 py-3">
                            <Mail className="w-4 h-4" />
                            <span className="hidden sm:inline">Email Security</span>
                            <span className="sm:hidden">Email</span>
                        </TabsTrigger>
                        <TabsTrigger value="defense" className="flex items-center gap-2 py-3">
                            <Shield className="w-4 h-4" />
                            <span className="hidden sm:inline">Defense Systems</span>
                            <span className="sm:hidden">Defense</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: Malware Types */}
                    <TabsContent value="malware" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Common Malware Types</h3>
                            <p className="text-muted-foreground">Learn about different types of malicious software and how they spread</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <MalwareCard
                                icon={Lock}
                                title="Ransomware"
                                threat="Critical"
                                description="Encrypts your files and demands payment for the decryption key."
                                spread={["📧 Phishing emails with malicious attachments", "🌐 Compromised websites (drive-by downloads)", "🔌 Exploiting unpatched software vulnerabilities", "💾 Infected USB devices"]}
                                examples="WannaCry, Ryuk, REvil, LockBit"
                                expanded={expandedMalware === "ransomware"}
                                onToggle={() => setExpandedMalware(expandedMalware === "ransomware" ? null : "ransomware")}
                            />

                            <MalwareCard
                                icon={Eye}
                                title="Spyware"
                                threat="High"
                                description="Secretly monitors your activity and steals sensitive information."
                                spread={["📥 Bundled with free software downloads", "🎣 Clicking malicious ads or pop-ups", "📧 Email attachments", "🔗 Fake software updates"]}
                                examples="Pegasus, FinFisher, DarkHotel"
                                expanded={expandedMalware === "spyware"}
                                onToggle={() => setExpandedMalware(expandedMalware === "spyware" ? null : "spyware")}
                            />

                            <MalwareCard
                                icon={Skull}
                                title="Trojan Horse"
                                threat="High"
                                description="Disguises itself as legitimate software to gain access to your system."
                                spread={["📦 Fake software installers", "🎮 Pirated games and cracked apps", "📧 Email attachments posing as invoices/documents", "🌐 Malicious browser extensions"]}
                                examples="Emotet, Zeus, TrickBot"
                                expanded={expandedMalware === "trojan"}
                                onToggle={() => setExpandedMalware(expandedMalware === "trojan" ? null : "trojan")}
                            />

                            <MalwareCard
                                icon={TrendingUp}
                                title="Worm"
                                threat="High"
                                description="Self-replicating malware that spreads across networks automatically."
                                spread={["🌐 Network vulnerabilities and open ports", "📧 Mass email distribution", "💾 Removable media (USB drives)", "🔗 Peer-to-peer file sharing"]}
                                examples="Stuxnet, Conficker, SQL Slammer"
                                expanded={expandedMalware === "worm"}
                                onToggle={() => setExpandedMalware(expandedMalware === "worm" ? null : "worm")}
                            />

                            <MalwareCard
                                icon={Keyboard}
                                title="Keylogger"
                                threat="Medium"
                                description="Records every keystroke to steal passwords and sensitive data."
                                spread={["📧 Phishing email attachments", "🌐 Compromised websites", "🔌 Physical installation on public computers", "📦 Bundled with other malware"]}
                                examples="Agent Tesla, FormBook, Olympic Vision"
                                expanded={expandedMalware === "keylogger"}
                                onToggle={() => setExpandedMalware(expandedMalware === "keylogger" ? null : "keylogger")}
                            />

                            <MalwareCard
                                icon={FileWarning}
                                title="Adware"
                                threat="Low"
                                description="Displays unwanted advertisements and tracks browsing behavior."
                                spread={["📥 Free software bundles", "🌐 Browser extensions", "🔗 Clicking deceptive download buttons", "📧 Fake software updates"]}
                                examples="Fireball, DollarRevenue, Gator"
                                expanded={expandedMalware === "adware"}
                                onToggle={() => setExpandedMalware(expandedMalware === "adware" ? null : "adware")}
                            />
                        </div>
                    </TabsContent>

                    {/* TAB 2: Real-World Attack Cases */}
                    <TabsContent value="cases" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Real-World Attack Case Studies</h3>
                            <p className="text-muted-foreground">Learn from major cybersecurity incidents and their impact</p>
                        </div>

                        <div className="space-y-6">
                            <CaseStudyCard
                                year="2017"
                                title="WannaCry Ransomware Attack"
                                icon={Lock}
                                impact="Global"
                                description="A worldwide ransomware attack that encrypted over 200,000 computers across 150 countries in just a few days."
                                details={{
                                    method: "Exploited EternalBlue vulnerability in Windows SMB protocol",
                                    damage: "$4 billion+ in global damages, disrupted healthcare services (NHS), manufacturing, and logistics",
                                    victims: "300,000+ computers, including hospitals, banks, and government agencies",
                                    lesson: "Always apply security patches immediately. The vulnerability was patched 2 months before the attack."
                                }}
                                expanded={expandedCase === "wannacry"}
                                onToggle={() => setExpandedCase(expandedCase === "wannacry" ? null : "wannacry")}
                            />

                            <CaseStudyCard
                                year="2020"
                                title="SolarWinds Supply Chain Attack"
                                icon={Factory}
                                impact="Enterprise"
                                description="Nation-state attackers compromised SolarWinds Orion software updates, affecting thousands of organizations."
                                details={{
                                    method: "Backdoored software update (SUNBURST malware) distributed to 18,000+ customers",
                                    damage: "Compromised 100+ companies and 9 US federal agencies including Treasury and Homeland Security",
                                    victims: "Microsoft, Cisco, Intel, Deloitte, and numerous government agencies",
                                    lesson: "Supply chain security is critical. Verify software integrity and monitor for unusual network activity."
                                }}
                                expanded={expandedCase === "solarwinds"}
                                onToggle={() => setExpandedCase(expandedCase === "solarwinds" ? null : "solarwinds")}
                            />

                            <CaseStudyCard
                                year="2021"
                                title="Log4Shell Vulnerability (Log4j)"
                                icon={Bug}
                                impact="Critical"
                                description="A zero-day vulnerability in the widely-used Java logging library Log4j allowed remote code execution."
                                details={{
                                    method: "JNDI injection vulnerability (CVE-2021-44228) in Log4j library",
                                    damage: "Affected millions of applications globally, estimated billions in remediation costs",
                                    victims: "Apple iCloud, Steam, Twitter, Minecraft servers, and countless enterprise applications",
                                    lesson: "Maintain an inventory of all dependencies (SBOM). Respond quickly to critical CVEs."
                                }}
                                expanded={expandedCase === "log4j"}
                                onToggle={() => setExpandedCase(expandedCase === "log4j" ? null : "log4j")}
                            />

                            <CaseStudyCard
                                year="2021"
                                title="Colonial Pipeline Ransomware"
                                icon={Flame}
                                impact="Infrastructure"
                                description="Ransomware attack on the largest fuel pipeline in the US, causing widespread fuel shortages."
                                details={{
                                    method: "DarkSide ransomware group gained access via compromised VPN credentials (no MFA)",
                                    damage: "$4.4 million ransom paid, 5-day shutdown, fuel shortages across East Coast",
                                    victims: "Colonial Pipeline (45% of East Coast fuel supply), millions of consumers",
                                    lesson: "Implement MFA everywhere. Segment critical infrastructure networks. Have incident response plans."
                                }}
                                expanded={expandedCase === "colonial"}
                                onToggle={() => setExpandedCase(expandedCase === "colonial" ? null : "colonial")}
                            />
                        </div>
                    </TabsContent>

                    {/* TAB 3: Email Security Best Practices */}
                    <TabsContent value="email" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-foreground mb-2">Email Security Best Practices</h3>
                            <p className="text-muted-foreground">Learn how to identify and protect against email-based threats</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Red Flags Section */}
                            <Card className="glassmorphism border-destructive/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                        <XCircle className="w-5 h-5" />
                                        🚩 Red Flags to Watch For
                                    </CardTitle>
                                    <CardDescription>Warning signs of phishing or malicious emails</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <RedFlag text="Urgent language: 'Act now!', 'Your account will be closed!'" />
                                    <RedFlag text="Suspicious sender addresses (e.g., paypa1.com instead of paypal.com)" />
                                    <RedFlag text="Generic greetings like 'Dear Customer' instead of your name" />
                                    <RedFlag text="Spelling and grammar mistakes" />
                                    <RedFlag text="Requests for passwords, credit cards, or sensitive info" />
                                    <RedFlag text="Unexpected attachments (especially .exe, .zip, .scr files)" />
                                    <RedFlag text="Links that don't match the displayed text (hover to check)" />
                                    <RedFlag text="Emails claiming to be from companies you don't use" />
                                </CardContent>
                            </Card>

                            {/* Best Practices Section */}
                            <Card className="glassmorphism border-green-500/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-500">
                                        <CheckCircle2 className="w-5 h-5" />
                                        ✅ Best Practices
                                    </CardTitle>
                                    <CardDescription>How to stay safe with email</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <BestPractice text="Verify sender identity through a secondary channel (phone call)" />
                                    <BestPractice text="Hover over links before clicking to see the real URL" />
                                    <BestPractice text="Never click links or attachments from unknown senders" />
                                    <BestPractice text="Use email authentication (SPF, DKIM, DMARC) if sending email" />
                                    <BestPractice text="Enable MFA on all email accounts" />
                                    <BestPractice text="Scan attachments with antivirus before opening" />
                                    <BestPractice text="Type URLs directly instead of clicking email links" />
                                    <BestPractice text="Report suspicious emails to your IT department" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Email Authentication Protocols */}
                        <Card className="glassmorphism">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Email Authentication Protocols
                                </CardTitle>
                                <CardDescription>Technical safeguards that prevent email spoofing</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                            <span className="text-2xl font-bold text-blue-500">SPF</span>
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-2">Sender Policy Framework</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Specifies which mail servers are authorized to send email on behalf of your domain. Prevents spoofing.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                                            <span className="text-xl font-bold text-purple-500">DKIM</span>
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-2">DomainKeys Identified Mail</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Adds a digital signature to emails to verify they haven't been tampered with during transit.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                                            <span className="text-lg font-bold text-green-500">DMARC</span>
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-2">Domain-based Message Auth</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Tells receiving servers what to do if SPF or DKIM checks fail (reject, quarantine, or allow).
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 4: Defense Systems */}
                    <TabsContent value="defense" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-foreground mb-2">How Defense Systems Work</h3>
                            <p className="text-muted-foreground">Understanding antivirus and email filtering mechanisms</p>
                        </div>

                        {/* Defense Pipeline */}
                        <Card className="glassmorphism p-8">
                            <h4 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" />
                                Multi-Layer Defense Pipeline
                            </h4>
                            <div className="space-y-6">
                                <DefensePipeline
                                    number="1"
                                    icon={Search}
                                    title="Signature-Based Detection"
                                    description="Compares files against a database of known malware signatures (hashes). Fast but only catches known threats."
                                    pros="✅ Very fast, reliable for known threats"
                                    cons="❌ Useless against new/unknown malware (zero-days)"
                                />
                                <DefensePipeline
                                    number="2"
                                    icon={Brain}
                                    title="Heuristic Analysis"
                                    description="Analyzes code behavior and structure to detect suspicious patterns that resemble malware, even if not in the database."
                                    pros="✅ Can detect new variants of known malware"
                                    cons="❌ Higher false positive rate"
                                />
                                <DefensePipeline
                                    number="3"
                                    icon={Eye}
                                    title="Behavioral Monitoring"
                                    description="Watches program behavior in real-time. If software starts encrypting files or making suspicious network calls, it's blocked."
                                    pros="✅ Catches zero-day malware and ransomware"
                                    cons="❌ Resource-intensive, may slow system"
                                />
                                <DefensePipeline
                                    number="4"
                                    icon={Zap}
                                    title="Machine Learning"
                                    description="AI models trained on millions of samples predict whether new files are malicious based on hundreds of features."
                                    pros="✅ Adaptive, improves over time"
                                    cons="❌ Requires large datasets, can be fooled"
                                />
                            </div>
                        </Card>

                        {/* Email Filtering */}
                        <Card className="glassmorphism">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-primary" />
                                    Email Filtering Techniques
                                </CardTitle>
                                <CardDescription>How email services protect you from spam and phishing</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-bold">1</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-foreground mb-1">Sender Reputation</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Checks if the sender's IP/domain has a history of sending spam or malware
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-bold">2</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-foreground mb-1">Content Analysis</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Scans email body and subject for spam keywords, urgency tactics, and phishing phrases
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-bold">3</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-foreground mb-1">Link Analysis</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Checks URLs against blacklists and analyzes for typosquatting or known phishing domains
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-bold">4</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-foreground mb-1">Attachment Scanning</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Scans files for malware signatures and blocks dangerous file types (.exe, .scr, .vbs)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-bold">5</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-foreground mb-1">Authentication Checks</h5>
                                            <p className="text-sm text-muted-foreground">
                                                Verifies SPF, DKIM, and DMARC records to ensure email is from a legitimate sender
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-primary font-bold">6</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-foreground mb-1">Machine Learning</h5>
                                            <p className="text-sm text-muted-foreground">
                                                AI models learn from user behavior to identify sophisticated phishing attempts
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Takeaway */}
                        <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">No Single Solution is Perfect</h3>
                                <p className="text-muted-foreground text-sm">
                                    Defense in depth is critical. Combine multiple layers (antivirus, email filters, firewalls, user training) and keep all software updated. The best defense is an informed user who questions suspicious emails before clicking.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Call to Action */}
                <div className="mt-12">
                    <Card className="p-8 glassmorphism border-primary/20 text-center">
                        <h3 className="text-2xl font-bold text-foreground mb-4">Ready to test your skills?</h3>
                        <p className="text-muted-foreground mb-6">
                            Use our scanner to analyze real URLs and emails for potential threats
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/scanner">
                                <Button size="lg" className="shadow-lg shadow-primary/20">
                                    Launch Scanner
                                    <Zap className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/training">
                                <Button variant="outline" size="lg" className="bg-transparent">
                                    Take Interactive Quiz
                                </Button>
                            </Link>
                            <Link href="/encryption">
                                <Button variant="ghost" size="lg">
                                    Cryptography Hub
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="ghost" size="lg">
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </main>
            
            {/* Footer */}
            <Footer />
        </div>
    )
}

// Malware Card Component
function MalwareCard({ icon: Icon, title, threat, description, spread, examples, expanded, onToggle }: any) {
    const threatStyles = {
        Critical: "bg-destructive/10 text-destructive",
        High: "bg-orange-500/10 text-orange-500",
        Medium: "bg-yellow-500/10 text-yellow-500",
        Low: "bg-blue-500/10 text-blue-500",
    }[threat as "Critical" | "High" | "Medium" | "Low"] || "bg-muted text-muted-foreground"

    return (
        <Card className="glassmorphism border-border/50 hover:border-primary/50 transition-all">
            <CardHeader>
                <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${threatStyles}`}>
                        {threat} Risk
                    </span>
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="w-full justify-between"
                >
                    {expanded ? "Hide Details" : "Show How It Spreads"}
                    <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
                </Button>
                {expanded && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <h5 className="text-sm font-semibold text-foreground mb-2">How it spreads:</h5>
                            <ul className="space-y-1">
                                {spread.map((item: string, idx: number) => (
                                    <li key={idx} className="text-sm text-muted-foreground">{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Examples:</span> {examples}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Case Study Card Component
function CaseStudyCard({ year, title, icon: Icon, impact, description, details, expanded, onToggle }: any) {
    return (
        <Card className="glassmorphism border-destructive/20 hover:border-destructive/40 transition-all">
            <CardHeader>
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <Icon className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-destructive/10 text-destructive">{year}</span>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-muted text-muted-foreground">{impact} Impact</span>
                        </div>
                        <CardTitle className="text-xl mb-2">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="w-full justify-between"
                >
                    {expanded ? "Hide Case Details" : "View Full Case Study"}
                    <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
                </Button>
                {expanded && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid gap-3">
                            <div className="p-3 rounded-lg bg-muted/50">
                                <h5 className="text-sm font-semibold text-foreground mb-1">Attack Method:</h5>
                                <p className="text-sm text-muted-foreground">{details.method}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <h5 className="text-sm font-semibold text-foreground mb-1">Damage:</h5>
                                <p className="text-sm text-muted-foreground">{details.damage}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <h5 className="text-sm font-semibold text-foreground mb-1">Victims:</h5>
                                <p className="text-sm text-muted-foreground">{details.victims}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <h5 className="text-sm font-semibold text-green-500 mb-1">🎓 Lesson Learned:</h5>
                                <p className="text-sm text-foreground">{details.lesson}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Red Flag Component
function RedFlag({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{text}</span>
        </div>
    )
}

// Best Practice Component
function BestPractice({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{text}</span>
        </div>
    )
}

// Defense Pipeline Component
function DefensePipeline({ number, icon: Icon, title, description, pros, cons }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xl font-bold text-primary/30 mt-2">{number}</div>
            </div>
            <div className="flex-1 pb-6 border-b border-border/50 last:border-0">
                <h5 className="text-lg font-semibold text-foreground mb-2">{title}</h5>
                <p className="text-sm text-muted-foreground mb-3">{description}</p>
                <div className="grid md:grid-cols-2 gap-2">
                    <div className="text-xs bg-green-500/10 border border-green-500/20 rounded px-2 py-1.5">
                        {pros}
                    </div>
                    <div className="text-xs bg-destructive/10 border border-destructive/20 rounded px-2 py-1.5">
                        {cons}
                    </div>
                </div>
            </div>
        </div>
    )
}
