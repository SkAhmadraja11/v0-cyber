"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Inbox, Trash2, Check, AlertOctagon, User, Mail, ShieldAlert } from "lucide-react"

const EMAILS = [
    { type: "spam", subject: "YOU WON A IPHONE!!", sender: "apple-winner@free-prize.xyz", body: "Click here to claim your prize immediately before it expires!" },
    { type: "legit", subject: "Project Update Meeting", sender: "sarah.manager@company.com", body: "Hi team, just a reminder about the sprint review tomorrow at 10 AM." },
    { type: "phishing", subject: "URGENT: Password Expiry", sender: "security@micros0ft.corn", body: "Your password will expire in 24 hours. Login now to keep your account." },
    { type: "spam", subject: "Cheap Meds 90% OFF", sender: "pharmacy-bot@spam.net", body: "Best prices on all supplements. No prescription needed." },
    { type: "legit", subject: "Your Amazon Order", sender: "orders@amazon.com", body: "Your package has been shipped and is on its way." },
    { type: "phishing", subject: "Verify your Bank Account", sender: "support@chase-secure-login.net", body: "We detected unusual activity. Please verify your identity." },
    { type: "spam", subject: "Hot Singles in your area", sender: "dating@spam.com", body: "Someone viewed your profile! See who it is now." },
    { type: "legit", subject: "Weekend Plans?", sender: "mom@gmail.com", body: "Are you coming over for dinner on Sunday? Let me know." },
    { type: "phishing", subject: "CEO: Wire Transfer Needed", sender: "ceo-office@company-internal.net", body: "I need you to process a payment for a vendor immediately. Confidential." },
    { type: "legit", subject: "Subscription Invoice", sender: "billing@netflix.com", body: "Here is your receipt for this month's subscription." },
    { type: "phishing", subject: "HR: Salary Increase", sender: "hr-benefits@payroll-audit.com", body: "Please review your new salary structure attached." },
    { type: "spam", subject: "Crypto Investment Opportunity", sender: "elon@crypto-doubler.biz", body: "Double your bitcoin in 24 hours! Guaranteed returns." },
    { type: "legit", subject: "Code Review", sender: "dev-team@github.com", body: "You have been requested to review a pull request." }
]

export default function SpamFilterGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [index, setIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")
    const [lastAction, setLastAction] = useState<"keep" | "trash" | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)

    // Emails randomizer (simple shuffle on mount could be better, but index looping works for now)

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
        const email = EMAILS[index % EMAILS.length]
        let correct = false

        if (action === "keep") {
            correct = email.type === "legit"
        } else {
            correct = email.type !== "legit"
        }

        if (correct) {
            setScore(s => s + 100 + (streak * 10))
            setStreak(s => s + 1)
            setTimeLeft(t => Math.min(t + 2, 45)) // Bonus time
            setFeedback("CORRECT")
        } else {
            setScore(s => Math.max(0, s - 50))
            setStreak(0)
            setTimeLeft(t => Math.max(1, t - 3)) // Penalty
            setFeedback("WRONG")
        }

        setLastAction(action)
        setTimeout(() => {
            setLastAction(null)
            setFeedback(null)
            setIndex(currentIndex => currentIndex + 1)
        }, 300)
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in bg-slate-950 rounded-xl border border-slate-800">
                <div className="w-24 h-24 bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Inbox className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-white">Inbox Zero Achieved</h2>
                <div className="text-4xl font-mono font-bold text-blue-400 mb-8">{score} PTS</div>
                <p className="mb-8 text-slate-400">Filtering complete. AI model updated.</p>
                <Button onClick={() => onComplete(score)} size="lg" className="w-full max-w-xs">Return to Dashboard</Button>
            </div>
        )
    }

    const email = EMAILS[index % EMAILS.length]

    return (
        <div className="max-w-md mx-auto h-[600px] flex flex-col items-center justify-center relative select-none">
            {/* HUD */}
            <div className="absolute top-0 w-full flex justify-between p-4 z-10">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Score</span>
                    <span className="text-xl font-mono font-bold">{score}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Streak</span>
                    <span className={`text-xl font-mono font-bold ${streak > 2 ? "text-yellow-500 animate-pulse" : "text-slate-600"}`}>x{streak}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time</span>
                    <span className={`text-xl font-mono font-bold ${timeLeft < 5 ? "text-red-500 animate-bounce" : ""}`}>{timeLeft}s</span>
                </div>
            </div>

            {/* Card Container */}
            <div className="relative w-full h-[400px] mt-10 perspective-1000">
                {/* Background Card for depth */}
                <div className="absolute inset-0 top-4 scale-95 opacity-50 bg-slate-100 rounded-xl border-2 border-slate-200" />

                {/* Active Card */}
                <Card className={`absolute inset-0 p-6 flex flex-col border-2 shadow-2xl transition-all duration-300 transform bg-white
                    ${lastAction === 'trash' ? '-translate-x-[150%] rotate-[-15deg] opacity-0' :
                        lastAction === 'keep' ? 'translate-x-[150%] rotate-[15deg] opacity-0' :
                            'translate-x-0 rotate-0 scale-100'}
                    ${email.type === 'phishing' ? 'shadow-red-500/5' : ''}
                `}>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md
                            ${email.sender.includes('company') ? 'bg-blue-500' : 'bg-slate-500'}
                        `}>
                            {email.sender[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <div className="font-bold text-lg leading-tight truncate">{email.subject}</div>
                            <div className="text-xs text-muted-foreground truncate">{email.sender}</div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 mb-6" />

                    {/* Body */}
                    <div className="flex-1">
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {email.body}
                        </p>

                        {(email.type === 'phishing' || email.type === 'spam') && (
                            <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-400 italic border border-slate-100">
                                Tip: Check the sender domain carefully.
                            </div>
                        )}
                    </div>

                    {/* Visual Feedback Overlay */}
                    {feedback && (
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] rounded-xl z-20 animate-in fade-in zoom-in duration-200`}>
                            <div className={`text-4xl font-black uppercase tracking-tighter -rotate-12 border-4 px-4 py-2 rounded-lg ${feedback === "CORRECT" ? "text-green-600 border-green-600 bg-green-100" : "text-red-600 border-red-600 bg-red-100"}`}>
                                {feedback}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-12 mt-8 z-10">
                <Button
                    size="icon"
                    className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-[0_10px_20px_rgba(239,68,68,0.3)] hover:scale-110 transition-all border-4 border-white active:scale-95"
                    onClick={() => handleSwipe("trash")}
                >
                    <Trash2 className="w-8 h-8 text-white" />
                </Button>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                    <div>Swipe Mode</div>
                    <div className="mt-1">Active</div>
                </div>
                <Button
                    size="icon"
                    className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:scale-110 transition-all border-4 border-white active:scale-95"
                    onClick={() => handleSwipe("keep")}
                >
                    <Check className="w-8 h-8 text-white" />
                </Button>
            </div>

            <div className="absolute bottom-4 text-[10px] text-slate-300 uppercase tracking-widest">
                AI Filter Training Module v4.2
            </div>
        </div>
    )
}
