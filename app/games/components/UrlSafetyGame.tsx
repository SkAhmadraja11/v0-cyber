"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Search, Loader2 } from "lucide-react"

interface UrlData {
    url: string
    isSafe: boolean
    reason: string
    trick: "subdomain" | "typo" | "shortener" | "extension" | "none"
    whois: string
}

// Level Factory
const generateUrl = (level: number): UrlData => {
    const brands = ["google", "paypal", "microsoft", "amazon", "netflix", "facebook", "bankofamerica", "airbnb", "dropbox"]
    const safeTlds = [".com", ".org", ".net", ".io", ".gov"]
    const badTlds = [".xyz", ".top", ".info", ".cc", ".biz", ".site", ".ru", ".cn"]

    const brand = brands[Math.floor(Math.random() * brands.length)]
    const isSafe = Math.random() > 0.5

    if (isSafe) {
        return {
            url: `https://www.${brand}${safeTlds[Math.floor(Math.random() * safeTlds.length)]}/login`,
            isSafe: true,
            reason: "Valid domain and secure protocol.",
            trick: "none",
            whois: `Registrar: MarkMonitor Inc.\nOrg: ${brand.charAt(0).toUpperCase() + brand.slice(1)} Inc.\nCountry: US\nAge: 15+ years`
        }
    } else {
        const type = Math.random()
        if (type < 0.25) {
            // Typosquatting
            const badBrand = brand.replace('o', '0').replace('l', '1').replace('a', '4').replace('e', '3')
            return {
                url: `https://www.${badBrand}.com/login`,
                isSafe: false,
                reason: `Misspelled domain name (Typosquatting): ${badBrand}`,
                trick: "typo",
                whois: "Registrar: NAMECHEAP INC\nOrg: Privacy Protected\nCountry: PA\nAge: 2 days"
            }
        } else if (type < 0.5) {
            // Subdomain Attack
            return {
                url: `https://www.${brand}.verify-secure-login.com`,
                isSafe: false,
                reason: "Brand is just a subdomain. Actual domain is verify-secure-login.com",
                trick: "subdomain",
                whois: "Registrar: GoDaddy.com, LLC\nOrg: Redacted for Privacy\nCountry: RU\nAge: 5 days"
            }
        } else if (type < 0.75) {
            // Bad Extension
            return {
                url: `http://www.${brand}${badTlds[Math.floor(Math.random() * badTlds.length)]}`,
                isSafe: false,
                reason: "Suspicious Top Level Domain (TLD) and HTTP (not HTTPS).",
                trick: "extension",
                whois: "Registrar: Unknown\nOrg: Unknown\nCountry: CN\nAge: < 24 hours"
            }
        } else {
            // Malicious Path
            return {
                url: `https://bit.ly/${Math.random().toString(36).substring(7)}`,
                isSafe: false,
                reason: "Shortened link from unknown source. Could lead anywhere.",
                trick: "shortener",
                whois: "Registrar: Bitly, Inc.\nNote: Redirects to http://malware-download.xyz\nRisk: High"
            }
        }
    }
}

export default function UrlSafetyGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [urls, setUrls] = useState<UrlData[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [timeLeft, setTimeLeft] = useState(45)
    const [gameState, setGameState] = useState<"playing" | "gameover" | "won">("playing")
    const [feedback, setFeedback] = useState<{ correct: boolean, text: string } | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [showWhois, setShowWhois] = useState(false)

    // Init
    useEffect(() => {
        const list = []
        for (let i = 0; i < 10; i++) list.push(generateUrl(1))
        setUrls(list)
    }, [])

    // Timer
    useEffect(() => {
        if (gameState !== "playing") return
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState("gameover")
                    return 0
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [gameState])

    const handleChoice = (choice: "safe" | "unsafe") => {
        const current = urls[currentIndex]
        const isCorrect = (choice === "safe" && current.isSafe) || (choice === "unsafe" && !current.isSafe)

        // Disable multiple clicks
        if (feedback) return

        if (isCorrect) {
            setScore(s => s + 100 + (timeLeft * 2))
            setFeedback({ correct: true, text: "Correct! " + current.reason })
            setTimeLeft(t => Math.min(t + 5, 45)) // Bonus time
        } else {
            setLives(l => {
                const newLives = l - 1
                if (newLives <= 0) setGameState("gameover")
                return newLives
            })
            setFeedback({ correct: false, text: "WRONG! " + current.reason })
        }

        setTimeout(() => {
            setShowWhois(false)
            setFeedback(null)
            if (currentIndex + 1 >= urls.length) {
                setGameState("won")
            } else {
                setCurrentIndex(i => i + 1)
            }
        }, 2200)
    }

    const triggerWhois = () => {
        if (analyzing || showWhois) return
        setAnalyzing(true)
        setTimeout(() => {
            setAnalyzing(false)
            setShowWhois(true)
            setTimeLeft(t => Math.max(0, t - 5)) // Penalty for using tool
        }, 1000)
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-4xl font-bold text-red-600 mb-2">System Compromised!</h2>
                <p className="mb-6 text-lg text-muted-foreground">You approved a malicious link or ran out of time.</p>
                <div className="text-3xl font-mono mb-8 font-bold">Final Score: {score}</div>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.reload()} size="lg">Try Again</Button>
                    <Button variant="outline" size="lg" onClick={() => onComplete(score)}>Exit Simulation</Button>
                </div>
            </div>
        )
    }

    if (gameState === "won") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-4xl font-bold text-green-600 mb-2">Network Secured!</h2>
                <p className="mb-6 text-lg text-muted-foreground">All suspicious URLs have been analyzed and filtered.</p>
                <div className="text-3xl font-mono mb-8 font-bold">Final Score: {score}</div>
                <Button size="lg" onClick={() => onComplete(score)} className="w-48 text-lg">Finish Mission</Button>
            </div>
        )
    }

    const currentUrl = urls[currentIndex]
    if (!currentUrl) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-8 h-2 rounded-full ${i <= lives ? "bg-red-500" : "bg-muted"}`} />
                    ))}
                </div>
                <div className="text-2xl font-bold font-mono tracking-widest">{score.toString().padStart(5, '0')}</div>
                <div className={`text-xl font-mono font-bold ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-primary"}`}>
                    {timeLeft}s
                </div>
            </div>

            <Card className="p-8 md:p-12 relative overflow-hidden border-2 shadow-2xl bg-black/5 group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

                <div className="text-center space-y-10">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative">
                        <Globe className="w-10 h-10 text-primary" />
                        <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping opacity-20" />
                    </div>

                    <div className="bg-background border-2 border-primary/20 rounded-xl p-8 shadow-inner relative">
                        <div className="absolute -top-3 left-4 bg-background px-2 text-xs font-mono text-primary">TARGET_URL</div>
                        <code className="text-xl md:text-2xl break-all font-mono text-foreground font-bold tracking-tight">
                            {currentUrl.url}
                        </code>
                    </div>

                    {/* Whois Tool */}
                    <div className="min-h-[100px]">
                        {!showWhois && !feedback ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={triggerWhois}
                                disabled={analyzing}
                                className="font-mono text-xs"
                            >
                                {analyzing ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Search className="w-3 h-3 mr-2" />}
                                {analyzing ? "QUERYING DATABASE..." : "RUN WHOIS LOOKUP (-5s)"}
                            </Button>
                        ) : showWhois ? (
                            <div className="bg-black/90 p-4 rounded text-left font-mono text-xs text-green-400 border border-green-500/30 shadow-lg animate-in slide-in-from-top-2">
                                <div className="border-b border-green-500/30 mb-2 pb-1 text-green-600 font-bold">WHOIS RESULT</div>
                                <pre className="whitespace-pre-wrap">{currentUrl.whois}</pre>
                            </div>
                        ) : null}
                    </div>

                    {feedback ? (
                        <div className={`p-6 rounded-xl animate-in zoom-in spin-in-1 shadow-lg ${feedback.correct ? "bg-green-100 border-2 border-green-500 text-green-800" : "bg-red-100 border-2 border-red-500 text-red-800"}`}>
                            <div className="text-2xl font-black mb-2 uppercase tracking-wide">
                                {feedback.correct ? "ACCESS GRANTED" : "THREAT DETECTED"}
                            </div>
                            <p className="font-medium">{feedback.text}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Button
                                size="lg"
                                className="w-full sm:w-48 h-16 text-xl bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/20 hover:-translate-y-1 transition-all font-bold"
                                onClick={() => handleChoice("safe")}
                            >
                                <CheckCircle className="mr-2 w-6 h-6" /> APPROVE
                            </Button>
                            <Button
                                size="lg"
                                className="w-full sm:w-48 h-16 text-xl bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition-all font-bold"
                                onClick={() => handleChoice("unsafe")}
                            >
                                <XCircle className="mr-2 w-6 h-6" /> BLOCK
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <div className="flex justify-center gap-4 text-xs text-muted-foreground font-mono">
                <span>SECURE_CONNECTION: ENCRYPTED</span>
                <span>•</span>
                <span>SCANNER_ID: 884-29X</span>
            </div>
        </div>
    )
}
