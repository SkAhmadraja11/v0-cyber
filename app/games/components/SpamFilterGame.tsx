"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Inbox, Trash2, Check, AlertOctagon } from "lucide-react"

const EMAILS = [
    { type: "spam", subject: "YOU WON A IPHONE!!", sender: "apple-winner@free-prize.xyz" },
    { type: "legit", subject: "Project Update Meeting", sender: "sarah.manager@company.com" },
    { type: "phishing", subject: "URGENT: Password Expiry", sender: "security@micros0ft.corn" },
    { type: "spam", subject: "Cheap Meds 90% OFF", sender: "pharmacy-bot@spam.net" },
    { type: "legit", subject: "Your Amazon Order", sender: "orders@amazon.com" },
    { type: "phishing", subject: "Verify your Bank Account", sender: "support@chase-secure-login.net" },
    { type: "spam", subject: "Hot Singles in your area", sender: "dating@spam.com" },
    { type: "legit", subject: "Weekend Plans?", sender: "mom@gmail.com" },
    { type: "phishing", subject: "CEO: Wire Transfer Needed", sender: "ceo-office@company-internal.net" },
    { type: "legit", subject: "Subscription Invoice", sender: "billing@netflix.com" },
]

export default function SpamFilterGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(0)
    const [index, setIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(20)
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")
    const [lastAction, setLastAction] = useState<"keep" | "trash" | null>(null)

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

    const handleSwipe = (action: "keep" | "trash") => {
        const email = EMAILS[index % EMAILS.length] // Loop emails
        let correct = false

        if (action === "keep") {
            correct = email.type === "legit"
        } else {
            correct = email.type !== "legit"
        }

        if (correct) {
            setScore(s => s + 100)
            setTimeLeft(t => Math.min(t + 1, 30))
        } else {
            setScore(s => Math.max(0, s - 50))
            // Slight time penalty
            setTimeLeft(t => Math.max(1, t - 2))
        }

        setLastAction(action)
        setTimeout(() => setLastAction(null), 200)
        setIndex(i => i + 1)
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in">
                <Inbox className="w-20 h-20 text-blue-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Inbox Cleared!</h2>
                <p className="mb-6">You sorted the mess.</p>
                <div className="text-2xl font-mono mb-8">Score: {score}</div>
                <Button onClick={() => onComplete(score)} size="lg">Finish</Button>
            </div>
        )
    }

    const email = EMAILS[index % EMAILS.length]

    return (
        <div className="max-w-md mx-auto h-[500px] flex flex-col items-center justify-center relative">
            <div className="flex justify-between w-full mb-4 px-4 font-mono font-bold">
                <span>Score: {score}</span>
                <span className={timeLeft < 5 ? "text-red-500 animate-pulse" : ""}>{timeLeft}s</span>
            </div>

            <div className="relative w-full h-80">
                {/* Card Stack logic could go here, but keeping it simple */}
                <Card className={`absolute inset-0 p-6 flex flex-col justify-between border-2 border-primary shadow-xl transition-transform duration-200 ${lastAction === 'trash' ? '-translate-x-20 opacity-0 rotate-12' : lastAction === 'keep' ? 'translate-x-20 opacity-0 -rotate-12' : 'translate-x-0'}`}>
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600">
                            {email.sender[0].toUpperCase()}
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">From: {email.sender}</div>
                            <div className="font-bold text-lg leading-tight">{email.subject}</div>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="text-sm text-foreground/80">
                            {email.type === 'legit' ? "Hey, just following up on..." :
                                email.type === 'spam' ? "CLICK HERE FOR FREE..." :
                                    "Please verify your credentials..."}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex gap-8 mt-8">
                <Button
                    size="icon"
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
                    onClick={() => handleSwipe("trash")}
                >
                    <Trash2 className="w-8 h-8 text-white" />
                </Button>

                <Button
                    size="icon"
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
                    onClick={() => handleSwipe("keep")}
                >
                    <Check className="w-8 h-8 text-white" />
                </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
                LEFT = SPAM/PHISHING • RIGHT = LEGIT
            </div>
        </div>
    )
}
