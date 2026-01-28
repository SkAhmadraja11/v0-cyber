"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Check, X, AlertOctagon, CheckCircle2, Search, Zap } from "lucide-react"

// Enhanced Mock Emails
const EMAILS = [
    {
        id: 1,
        sender: "security@paypaI.com",
        subject: "URGENT: Unauthorized Login Attempt",
        body: "We detected a login from Russia. Click here immediately to secure your account or it will be permanently locked.",
        isPhishing: true,
        reason: "Spoofed Domain (paypaI.com instead of paypal.com) + False Urgency."
    },
    {
        id: 2,
        sender: "newsletter@substack.com",
        subject: "Your Weekly Tech Digest",
        body: "Here are the top stories this week: AI breakthroughs, new React features, and more.",
        isPhishing: false,
        reason: "Legitimate sender domain and standard content."
    },
    {
        id: 3,
        sender: "hr-department@company-internal-portal.net",
        subject: "Please Review: Q3 Salary Adjustment",
        body: "Attached is the spreadsheet for next month's salary changes. Please enable macros to view.",
        isPhishing: true,
        reason: "Suspiciously long domain + dangerous request to enable Macros (Malware vector)."
    },
    {
        id: 4,
        sender: "billing@netflix.com",
        subject: "Payment Success",
        body: "Thank you for your payment of $19.99. Your subscription has been renewed.",
        isPhishing: false,
        reason: "Standard transactional email from expected domain."
    },
    {
        id: 5,
        sender: "ceo.john.doe@gmail.com",
        subject: "Urgent Task - Gift Cards",
        body: "I am in a meeting and can't talk. I need you to buy 5x$100 Apple Gift Cards for a client ASAP. Send me the codes.",
        isPhishing: true,
        reason: "CEO Fraud (BEC). CEO using a public Gmail address + financial urgency."
    },
    {
        id: 6,
        sender: "support@google.com",
        subject: "Security Alert",
        body: "New device signed in to your account: Windows 10, Brazil. If this wasn't you, check activity.",
        isPhishing: false,
        reason: "Standard security notification from a trusted domain."
    },
    {
        id: 7,
        sender: "amazon-support@delivery-tracking-update.com",
        subject: "Your package is delayed",
        body: "We could not deliver your package. Pay a $2.99 redelivery fee here.",
        isPhishing: true,
        reason: "Fake domain (delivery-tracking-update.com) attempting to steal credit card info."
    },
    {
        id: 8,
        sender: "it-support@yourcompany.com",
        subject: "Scheduled Maintenance",
        body: "Systems will be down this weekend for upgrades. No action required.",
        isPhishing: false,
        reason: "Informational email from internal IT with no malicious links or requests."
    },
    {
        id: 9,
        sender: "linkedin@linkedin-notifications.com",
        subject: "You appeared in 5 searches",
        body: "See who is looking at your profile. Click here to view.",
        isPhishing: true,
        reason: "Subtle domain spoofing. LinkedIn emails come from linkedin.com, not 'linkedin-notifications.com'."
    },
    {
        id: 10,
        sender: "dropbox@dropbox.com",
        subject: "John shared 'Q4_Report.pdf'",
        body: "Click to view the document shared with you on Dropbox.",
        isPhishing: false,
        reason: "Legitimate file sharing notification from the official domain."
    }
]

export default function PhishingGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [showFeedback, setShowFeedback] = useState(false)
    const [lastResult, setLastResult] = useState<{ correct: boolean; reason: string } | null>(null)
    const [completed, setCompleted] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)

    const handleDecision = (choice: 'legit' | 'phishing') => {
        const email = EMAILS[currentIndex]
        const isCorrect = (choice === 'phishing' && email.isPhishing) || (choice === 'legit' && !email.isPhishing)

        if (isCorrect) {
            const streakBonus = streak * 50
            setScore(s => s + 200 + streakBonus)
            setStreak(s => s + 1)
        } else {
            setStreak(0)
        }

        setLastResult({
            correct: isCorrect,
            reason: email.reason
        })
        setShowFeedback(true)
    }

    const analyzeEmail = () => {
        setAnalyzing(true)
        setTimeout(() => setAnalyzing(false), 1500)
    }

    const nextEmail = () => {
        setShowFeedback(false)
        if (currentIndex + 1 < EMAILS.length) {
            setCurrentIndex(i => i + 1)
        } else {
            setCompleted(true)
        }
    }

    if (completed) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in zoom-in-95">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center relative">
                    <Mail className="w-12 h-12 text-primary" />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Score: {score}
                    </div>
                </div>
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Simulation Complete!
                </h2>
                <div className="space-y-2">
                    <p className="text-xl">Final Score: <span className="font-mono font-bold text-primary">{score}</span></p>
                    <p className="text-muted-foreground">Emails Analyzed: {EMAILS.length}</p>
                </div>
                <Button onClick={() => onComplete(score)} size="lg" className="w-full max-w-xs shadow-lg shadow-primary/20">
                    Return to Dashboard
                </Button>
            </div>
        )
    }

    const email = EMAILS[currentIndex]

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 border-l-4 border-l-blue-500 bg-background/50 backdrop-blur">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Progress</div>
                    <div className="text-2xl font-bold">{currentIndex + 1} <span className="text-muted-foreground text-sm">/ {EMAILS.length}</span></div>
                </Card>
                <Card className="p-4 border-l-4 border-l-yellow-500 bg-background/50 backdrop-blur">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
                    <div className="text-2xl font-bold">{score}</div>
                </Card>
                <Card className="p-4 border-l-4 border-l-green-500 bg-background/50 backdrop-blur">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Streak</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                        {streak} <Zap className={`w-4 h-4 ${streak > 0 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                    </div>
                </Card>
            </div>

            {/* Email Client Simulation */}
            <Card className="border-2 shadow-2xl overflow-hidden min-h-[500px] flex flex-col relative transition-all duration-300">
                {/* Simulated Toolbar */}
                <div className="bg-muted/80 backdrop-blur p-3 border-b flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                        <span className="bg-background px-2 py-0.5 rounded border">SECURE_MAIL_CLIENT_V4.0</span>
                    </div>
                </div>

                {/* Email Content */}
                <div className="p-8 flex-1 space-y-8 bg-card/50">
                    <div className="space-y-4 border-b pb-6 relative">
                        {analyzing && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2 text-primary animate-pulse">
                                    <Search className="w-8 h-8" />
                                    <span className="font-mono text-sm">ANALYZING HEADERS...</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="font-bold text-2xl mb-1">{email.subject}</h2>
                                <span className="text-xs text-muted-foreground">Today at 10:42 AM</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={analyzeEmail} disabled={showFeedback} className="text-xs border">
                                <Search className="w-3 h-3 mr-2" /> Inspect Headers
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                {email.sender[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">From: {email.sender.split('@')[0]}</span>
                                <span className={`text-xs font-mono px-1.5 py-0.5 rounded bg-background border ${showFeedback && email.isPhishing ? "text-red-500 border-red-200 bg-red-50" : "text-muted-foreground"}`}>
                                    &lt;{email.sender}&gt;
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-sm md:prose-base max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {email.body}
                    </div>
                </div>

                {/* Controls */}
                {!showFeedback ? (
                    <div className="p-6 bg-background border-t flex justify-center gap-6">
                        <Button
                            variant="destructive"
                            size="lg"
                            className="w-48 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all hover:-translate-y-1"
                            onClick={() => handleDecision('phishing')}
                        >
                            <AlertOctagon className="w-5 h-5 mr-2" />
                            Report Phishing
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            className="w-48 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all hover:-translate-y-1"
                            onClick={() => handleDecision('legit')}
                        >
                            <Check className="w-5 h-5 mr-2" />
                            Mark Safe
                        </Button>
                    </div>
                ) : (
                    <div className={`p-8 border-t animate-in slide-in-from-bottom-10 ${lastResult?.correct ? "bg-green-500/10 border-t-green-500/50" : "bg-red-500/10 border-t-red-500/50"}`}>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${lastResult?.correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                    {lastResult?.correct ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-xl ${lastResult?.correct ? "text-green-700" : "text-red-600"}`}>
                                        {lastResult?.correct ? "Correct Choice!" : "Incorrect Decision"}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {lastResult?.correct ? `+${200 + (streak > 0 ? (streak - 1) * 50 : 0)} Points` : "No points awarded"}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-background/50 p-4 rounded-lg border">
                                <p className="font-medium text-sm text-foreground/80 leading-relaxed">
                                    <span className="font-bold">Analysis:</span> {lastResult?.reason}
                                </p>
                            </div>

                            <Button onClick={nextEmail} size="lg" className="w-full">
                                {currentIndex + 1 < EMAILS.length ? "Analyze Next Email" : "Finish Review"}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
