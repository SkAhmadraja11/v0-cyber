"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from "lucide-react"

interface UrlData {
    url: string
    isSafe: boolean
    reason: string
    trick: "subdomain" | "typo" | "shortener" | "extension" | "none"
}

// Level Factory
const generateUrl = (level: number): UrlData => {
    const brands = ["google", "paypal", "microsoft", "amazon", "netflix", "facebook", "bankofamerica"]
    const safeTlds = [".com", ".org", ".net", ".io", ".gov"]
    const badTlds = [".xyz", ".top", ".info", ".cc", ".biz"]

    const brand = brands[Math.floor(Math.random() * brands.length)]
    const isSafe = Math.random() > 0.5

    if (isSafe) {
        return {
            url: `https://www.${brand}${safeTlds[Math.floor(Math.random() * safeTlds.length)]}/login`,
            isSafe: true,
            reason: "Valid domain and secure protocol.",
            trick: "none"
        }
    } else {
        const type = Math.random()
        if (type < 0.25) {
            // Typosquatting
            const badBrand = brand.replace('o', '0').replace('l', '1').replace('a', '4')
            return {
                url: `https://www.${badBrand}.com/login`,
                isSafe: false,
                reason: `Misspelled domain name (Typosquatting): ${badBrand}`,
                trick: "typo"
            }
        } else if (type < 0.5) {
            // Subdomain Attack
            return {
                url: `https://www.${brand}.verify-secure-login.com`,
                isSafe: false,
                reason: "Brand is just a subdomain. Actual domain is verify-secure-login.com",
                trick: "subdomain"
            }
        } else if (type < 0.75) {
            // Bad Extension
            return {
                url: `http://www.${brand}${badTlds[Math.floor(Math.random() * badTlds.length)]}`,
                isSafe: false,
                reason: "Suspicious Top Level Domain (TLD) and HTTP (not HTTPS).",
                trick: "extension"
            }
        } else {
            // Malicious Path
            return {
                url: `https://bit.ly/${Math.random().toString(36).substring(7)}`,
                isSafe: false,
                reason: "Shortened link from unknown source. Could lead anywhere.",
                trick: "shortener"
            }
        }
    }
}

export default function UrlSafetyGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [urls, setUrls] = useState<UrlData[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [timeLeft, setTimeLeft] = useState(30)
    const [gameState, setGameState] = useState<"playing" | "gameover" | "won">("playing")
    const [feedback, setFeedback] = useState<{ correct: boolean, text: string } | null>(null)

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

        if (isCorrect) {
            setScore(s => s + 100 + (timeLeft * 2))
            setFeedback({ correct: true, text: "Correct! " + current.reason })
            setTimeLeft(t => Math.min(t + 3, 30)) // Bonus time
        } else {
            setLives(l => {
                const newLives = l - 1
                if (newLives <= 0) setGameState("gameover")
                return newLives
            })
            setFeedback({ correct: false, text: "Wrong! " + current.reason })
        }

        setTimeout(() => {
            setFeedback(null)
            if (currentIndex + 1 >= urls.length) {
                setGameState("won")
            } else {
                setCurrentIndex(i => i + 1)
            }
        }, 2000) // 2s delay to read feedback
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in">
                <AlertTriangle className="w-20 h-20 text-red-500 mb-4" />
                <h2 className="text-3xl font-bold text-red-600 mb-2">System Compromised!</h2>
                <p className="mb-6">You let a malicious link slip through or ran out of time.</p>
                <div className="text-2xl font-mono mb-8">Final Score: {score}</div>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                    <Button variant="outline" onClick={() => onComplete(score)}>Exit</Button>
                </div>
            </div>
        )
    }

    if (gameState === "won") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in">
                <ShieldCheck className="w-20 h-20 text-green-500 mb-4" />
                <h2 className="text-3xl font-bold text-green-600 mb-2">All URLs Scanned!</h2>
                <p className="mb-6">Great eye! The network is safe.</p>
                <div className="text-2xl font-mono mb-8">Final Score: {score}</div>
                <Button size="lg" onClick={() => onComplete(score)}>Claim Reward</Button>
            </div>
        )
    }

    const currentUrl = urls[currentIndex]
    if (!currentUrl) return <div>Loading...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center text-lg font-mono">
                <div className="flex gap-2 text-red-500">
                    {"❤️".repeat(lives)}
                </div>
                <div className="text-primary font-bold">Score: {score}</div>
                <div className={`${timeLeft < 10 ? "text-red-500 animate-pulse" : ""}`}>
                    ⏱️ {timeLeft}s
                </div>
            </div>

            <Card className="p-12 relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-black/5">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

                <div className="text-center space-y-8">
                    <Globe className="w-16 h-16 mx-auto text-primary opacity-80" />

                    <div className="bg-background border rounded-lg p-6 shadow-inner">
                        <code className="text-2xl break-all font-mono text-foreground">
                            {currentUrl.url}
                        </code>
                    </div>

                    {feedback ? (
                        <div className={`p-4 rounded-lg animate-in fade-in zoom-in ${feedback.correct ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"}`}>
                            <div className="text-xl font-bold mb-1">
                                {feedback.correct ? "ACCESSED" : "ERROR"}
                            </div>
                            {feedback.text}
                        </div>
                    ) : (
                        <div className="flex justify-center gap-8">
                            <Button
                                size="lg"
                                className="w-40 h-16 text-lg bg-green-600 hover:bg-green-700 hover:scale-105 transition-all"
                                onClick={() => handleChoice("safe")}
                            >
                                <CheckCircle className="mr-2 w-6 h-6" /> SAFE
                            </Button>
                            <Button
                                size="lg"
                                className="w-40 h-16 text-lg bg-red-600 hover:bg-red-700 hover:scale-105 transition-all"
                                onClick={() => handleChoice("unsafe")}
                            >
                                <XCircle className="mr-2 w-6 h-6" /> UNSAFE
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <p className="text-center text-muted-foreground text-sm">
                Analysis Tool v2.0 - Scanner Active
            </p>
        </div>
    )
}
