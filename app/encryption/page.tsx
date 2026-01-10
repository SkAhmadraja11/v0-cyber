"use client"

import { useState } from "react"
import {
    Lock,
    Unlock,
    Shield,
    ShieldAlert,
    Key,
    Hash,
    RefreshCw,
    Database,
    Zap,
    GraduationCap,
    ArrowLeft,
    Terminal,
    Eye,
    EyeOff,
    Search,
    Brain,
    AlertTriangle,
    CheckCircle2,
    Binary,
    Lightbulb,
    Copy,
    CheckCheck
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Footer from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Simple encryption simulator for educational purposes
function LiveEncryptionSimulator() {
    const [plaintext, setPlaintext] = useState("")
    const [secretKey, setSecretKey] = useState("SECRET123")
    const [ciphertext, setCiphertext] = useState("")
    const [copied, setCopied] = useState(false)

    const simulateEncryption = (text: string, key: string) => {
        if (!text) return ""
        // Simple Caesar cipher-like transformation for demo
        let result = ""
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i)
            const keyChar = key.charCodeAt(i % key.length)
            const encrypted = String.fromCharCode((charCode + keyChar) % 256)
            result += encrypted.charCodeAt(0).toString(16).padStart(2, '0')
        }
        return result.toUpperCase()
    }

    const handleEncrypt = () => {
        const encrypted = simulateEncryption(plaintext, secretKey)
        setCiphertext(encrypted)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(ciphertext)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="glassmorphism border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Live Encryption Simulator
                </CardTitle>
                <CardDescription>See how data is transformed from readable text to ciphertext</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="plaintext">Your Message (Plaintext)</Label>
                        <Input
                            id="plaintext"
                            placeholder="Hello World!"
                            value={plaintext}
                            onChange={(e) => setPlaintext(e.target.value)}
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="key">Secret Key</Label>
                        <Input
                            id="key"
                            placeholder="SECRET123"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            className="font-mono"
                        />
                    </div>
                </div>

                <Button onClick={handleEncrypt} className="w-full" disabled={!plaintext}>
                    <Lock className="w-4 h-4 mr-2" />
                    Encrypt Message
                </Button>

                {ciphertext && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        <Label>Encrypted Output (Ciphertext)</Label>
                        <div className="relative">
                            <div className="p-4 bg-black/40 rounded-lg border border-primary/20 font-mono text-sm break-all text-primary">
                                {ciphertext}
                            </div>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2"
                                onClick={copyToClipboard}
                            >
                                {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            This is a simplified demo. Real encryption like AES-256 is much more complex!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function EncryptionPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Lock className="w-6 h-6 text-primary" />
                                <h1 className="font-bold text-xl text-foreground">Cryptography Hub</h1>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/awareness">
                                <Button variant="ghost" size="sm">Awareness Dashboard</Button>
                            </Link>
                            <Link href="/training">
                                <Button variant="outline" size="sm">Training Quiz</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Mastering Encryption</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Explore the world of cryptography through the eyes of both defenders and attackers.
                        Understand the algorithms that secure our digital world.
                    </p>
                </div>

                <Tabs defaultValue="fundamentals" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 glassmorphism">
                        <TabsTrigger value="fundamentals" className="py-2">Fundamentals</TabsTrigger>
                        <TabsTrigger value="blue" className="py-2">Blue Team (Defense)</TabsTrigger>
                        <TabsTrigger value="red" className="py-2">Red Team (Offense)</TabsTrigger>
                        <TabsTrigger value="algorithms" className="py-2">Algorithm Matrix</TabsTrigger>
                    </TabsList>

                    {/* Fundamentals Tab */}
                    <TabsContent value="fundamentals" className="space-y-6">
                        {/* Live Simulator */}
                        <LiveEncryptionSimulator />

                        {/* Simple Explanation Header */}
                        <div className="text-center py-8">
                            <h3 className="text-2xl font-bold mb-2">The 3 Pillars of Cryptography</h3>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Think of encryption like different types of locks and boxes. Each serves a unique purpose in keeping data secure.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Card className="glassmorphism border-border/50">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                                        <RefreshCw className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <CardTitle>Symmetric Encryption</CardTitle>
                                    <CardDescription>🔑 One Key for Everything</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm space-y-4">
                                    <div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/20">
                                        <p className="font-semibold text-blue-500 mb-1">📦 The Locked Box Analogy:</p>
                                        <p className="text-muted-foreground text-xs">
                                            Imagine a box with ONE key. You use the same key to lock it (encrypt)
                                            and unlock it (decrypt). Fast and simple, but you need to safely share the key!
                                        </p>
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs"><strong>Fast:</strong> Great for large files</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs"><strong>Efficient:</strong> Used for WiFi (WPA3), Disk Encryption</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs"><strong>Problem:</strong> How do you securely give someone the key?</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 p-2 bg-black/20 rounded border border-blue-500/20">
                                        <p className="text-xs font-mono text-blue-400">Example: AES-256</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glassmorphism border-border/50">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <Key className="w-6 h-6 text-primary" />
                                    </div>
                                    <CardTitle>Asymmetric Encryption</CardTitle>
                                    <CardDescription>🔐 Two Keys: Public & Private</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm space-y-4">
                                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                                        <p className="font-semibold text-primary mb-1">📬 The Mailbox Analogy:</p>
                                        <p className="text-muted-foreground text-xs">
                                            Your mailbox has a PUBLIC slot (anyone can drop mail in), but only YOU have the
                                            PRIVATE key to open it. This solves the "key sharing" problem!
                                        </p>
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                            <span className="text-xs"><strong>Secure:</strong> Public key is safe to share</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                            <span className="text-xs"><strong>Signatures:</strong> Proves YOU sent the message</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs"><strong>Slower:</strong> Not ideal for huge files</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 p-2 bg-black/20 rounded border border-primary/20">
                                        <p className="text-xs font-mono text-primary">Example: RSA-2048</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glassmorphism border-border/50">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                                        <Hash className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <CardTitle>Hashing</CardTitle>
                                    <CardDescription>🔨 One-Way Fingerprints</CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm space-y-4">
                                    <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/20">
                                        <p className="font-semibold text-orange-500 mb-1">🖐️ The Fingerprint Analogy:</p>
                                        <p className="text-muted-foreground text-xs">
                                            Hashing is like crushing a document into a unique fingerprint. You can't reverse
                                            it back to the original, but you can compare fingerprints to check if two files match!
                                        </p>
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs"><strong>Integrity:</strong> Detects file tampering</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs"><strong>Passwords:</strong> Stored as hashes, not plaintext</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs"><strong>Caution:</strong> Old algorithms (MD5) are crackable</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 p-2 bg-black/20 rounded border border-orange-500/20">
                                        <p className="text-xs font-mono text-orange-400">Example: SHA-256</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Comparison */}
                        <Card className="glassmorphism border-primary/20 mt-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    Quick Comparison
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center p-4 bg-blue-500/5 rounded-lg">
                                        <p className="font-bold text-blue-500">Symmetric</p>
                                        <p className="text-xs text-muted-foreground mt-1">Best for: File/Disk encryption</p>
                                    </div>
                                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                                        <p className="font-bold text-primary">Asymmetric</p>
                                        <p className="text-xs text-muted-foreground mt-1">Best for: Secure communication</p>
                                    </div>
                                    <div className="text-center p-4 bg-orange-500/5 rounded-lg">
                                        <p className="font-bold text-orange-500">Hashing</p>
                                        <p className="text-xs text-muted-foreground mt-1">Best for: Passwords & Verification</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </ TabsContent>

                    {/* Blue Team Tab */}
                    <TabsContent value="blue" className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-blue-500" />
                                    The Defender's Handbook
                                </h3>
                                <p className="text-muted-foreground">
                                    Blue Teams use encryption to build layers of defense. The goal is to ensure
                                    Confidentiality, Integrity, and Availability (CIA Triad).
                                </p>

                                <div className="space-y-4">
                                    <Card className="bg-blue-500/5 border-blue-500/20">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-lg">Data-at-Rest Protection</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            Encrypting databases and hard drives (AES-256) so that if physical hardware
                                            is stolen, the data remains unreadable without the keys.
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-blue-500/5 border-blue-500/20">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-lg">Data-in-Transit (TLS)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            Using HTTPS (TLS 1.3) to prevent Man-in-the-Middle (MitM) attacks. Encrypting
                                            packets ensures that hackers sniffing Wi-Fi cannot read your messages.
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-blue-500/5 border-blue-500/20">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-lg">Key Management (PKI)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            Properly storing keys in Hardware Security Modules (HSMs) and rotating them
                                            regularly to minimize the impact of a potential breach.
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/10 to-primary/5 rounded-2xl p-8 border border-blue-500/20 flex flex-col justify-center">
                                <h4 className="text-xl font-bold mb-4">Blue Team Checklist</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                        <span>Use strong, salted hashes for passwords (Argon2, bcrypt).</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                        <span>Disable old protocols like SSLv3 and TLS 1.0.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                        <span>Implement Zero Trust: Encrypt even internal network traffic.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                        <span>Regularly audit third-party library encryption dependencies.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Red Team Tab */}
                    <TabsContent value="red" className="space-y-6">
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl p-8 border border-red-500/20">
                                <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500">
                                    <Terminal className="w-6 h-6" />
                                    Exploiting Misconfigurations
                                </h4>
                                <div className="space-y-6">
                                    <div className="bg-black/20 p-4 rounded-lg border border-red-500/10 font-mono text-sm">
                                        <p className="text-red-400 mb-2"># Red Team Tactic: Breaking Weak Crypto</p>
                                        <p>$ hashcat -m 0 MD5_HASH wordlist.txt</p>
                                        <p className="text-muted-foreground mt-2">// MD5 is insecure and prone to brute force.</p>
                                    </div>
                                    <ul className="space-y-4 text-sm">
                                        <li className="flex gap-3">
                                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                                            <div>
                                                <span className="font-bold text-red-500">Downgrade Attacks:</span>
                                                <p className="text-muted-foreground">Forcing a server to use an older, vulnerable version of TLS (POODLE, HEARTBLEED).</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                                            <div>
                                                <span className="font-bold text-red-500">Side-Channel Attacks:</span>
                                                <p className="text-muted-foreground">Recovering keys by measuring power consumption or timing differences during encryption.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                                            <div>
                                                <span className="font-bold text-red-500">Hardcoded Secrets:</span>
                                                <p className="text-muted-foreground">Scanning GitHub and config files for API keys and encryption private keys.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2 text-red-500">
                                    <Binary className="w-6 h-6" />
                                    Encryption as a Weapon
                                </h3>
                                <p className="text-muted-foreground">
                                    Red Teams and cybercriminals also use encryption to bypass defenses and
                                    extort victims.
                                </p>

                                <div className="space-y-4">
                                    <Card className="bg-red-500/5 border-red-500/20">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-lg text-red-500 uppercase tracking-tighter font-black italic">Ransomware</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            Attackers use robust symmetric encryption (AES) to lock victim files, then use Asymmetric
                                            encryption (RSA) to securely transmit the recovery key only upon payment.
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-red-500/5 border-red-500/20">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-lg text-red-500">Encrypted Payload C2</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            Malware uses encryption to hide its Command & Control (C2) traffic from
                                            firewalls and DPI (Deep Packet Inspection). The traffic looks like normal HTTPS.
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-red-500/5 border-red-500/20">
                                        <CardHeader className="py-4">
                                            <CardTitle className="text-lg text-red-500">Exfiltration Shielding</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            Stolen data is often encrypted before being moved (Exfiltration) so that
                                            security systems cannot flag sensitive keywords being sent over the net.
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Algorithm Matrix Tab */}
                    <TabsContent value="algorithms" className="space-y-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse glassmorphism rounded-xl">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="p-4 font-bold text-primary">Algorithm</th>
                                        <th className="p-4 font-bold text-primary">Type</th>
                                        <th className="p-4 font-bold text-primary">Key Size</th>
                                        <th className="p-4 font-bold text-primary">Security Status</th>
                                        <th className="p-4 font-bold text-primary">Use Case</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-border/20 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono">AES-256</td>
                                        <td className="p-4">Symmetric</td>
                                        <td className="p-4">256-bit</td>
                                        <td className="p-4"><span className="text-green-500 font-bold">Recommended</span></td>
                                        <td className="p-4 text-muted-foreground">Disk encryption, WiFi security (WPA3)</td>
                                    </tr>
                                    <tr className="border-b border-border/20 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono">RSA-2048+</td>
                                        <td className="p-4">Asymmetric</td>
                                        <td className="p-4">2048-4096 bit</td>
                                        <td className="p-4"><span className="text-green-500 font-bold">Strong</span></td>
                                        <td className="p-4 text-muted-foreground">Digital signatures, SSL/TLS handshakes</td>
                                    </tr>
                                    <tr className="border-b border-border/20 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono">SHA-256</td>
                                        <td className="p-4">Hash</td>
                                        <td className="p-4">256-bit</td>
                                        <td className="p-4"><span className="text-green-500 font-bold">Standard</span></td>
                                        <td className="p-4 text-muted-foreground">File integrity, Blockchain</td>
                                    </tr>
                                    <tr className="border-b border-border/20 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-red-400 italic">MD5</td>
                                        <td className="p-4">Hash</td>
                                        <td className="p-4">128-bit</td>
                                        <td className="p-4"><span className="text-red-500 font-bold uppercase">Broken</span></td>
                                        <td className="p-4 text-muted-foreground">DEPRECATED. Prone to collisions.</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-red-400 italic">DES</td>
                                        <td className="p-4">Symmetric</td>
                                        <td className="p-4">56-bit</td>
                                        <td className="p-4"><span className="text-red-500 font-bold uppercase">Legacy</span></td>
                                        <td className="p-4 text-muted-foreground">Insecure. Key size is too small for modern compute.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <Card className="glassmorphism border-primary/20 max-w-4xl mx-auto p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-4">Want to dive deeper into defense?</h3>
                            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                Check out our main awareness dashboard for more topics on malware, email security,
                                and threat prevention systems.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/awareness">
                                    <Button size="lg" className="shadow-lg shadow-primary/20">
                                        Back to Awareness
                                        <Shield className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link href="/training">
                                    <Button variant="outline" size="lg" className="bg-transparent">
                                        Test your Crypto Knowledge
                                        <Brain className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
            
            {/* Footer */}
            <Footer />
        </div>
    )
}
