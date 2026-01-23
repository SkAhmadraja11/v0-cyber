"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Check, X, AlertOctagon, CheckCircle2 } from "lucide-react"

// Mock Emails
const EMAILS = [
    {
        id: 1,
        sender: "security@paypaI.com", // Spoofed L -> I
        subject: "URGENT: Unauthorized Login Attempt",
        body: "We detected a login from Russia. Click here immediately to secure your account or it will be permanently locked.",
        isPhishing: true,
        reason: "Spoofed Domain (paypaI.com) + False Urgency"
    },
    {
        id: 2,
        sender: "newsletter@substack.com",
        subject: "Your Weekly Tech Digest",
        body: "Here are the top stories this week: AI breakthroughs, new React features, and more.",
        isPhishing: false,
        reason: "Legitimate sender domain and content."
    },
    {
        id: 3,
        sender: "hr-department@company-internal-portal.net",
        subject: "Please Review: Q3 Salary Adjustment",
        body: "Attached is the spreadsheet for next month's salary changes. Please enable macros to view.",
        isPhishing: true,
        reason: "Suspicious long domain + Request to enable Macros (Malware vector)."
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
        sender: "ceo@company.com",
        subject: "Gift Cards task",
        body: "I am in a meeting. Can you buy 5x$100 Apple Gift Cards and email me the codes? I will reimburse you.",
        isPhishing: true,
        reason: "CEO Fraud (BEC). Requests for gift cards are always scams."
    }
]

export default function PhishingGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [showFeedback, setShowFeedback] = useState(false)
    const [lastResult, setLastResult] = useState<{ correct: boolean; reason: string } | null>(null)
    const [completed, setCompleted] = useState(false)

    const handleDecision = (choice: 'legit' | 'phishing') => {
        const email = EMAILS[currentIndex]
        const isCorrect = (choice === 'phishing' && email.isPhishing) || (choice === 'legit' && !email.isPhishing)

        if (isCorrect) setScore(s => s + 200)

        setLastResult({
            correct: isCorrect,
            reason: email.reason
        })
        setShowFeedback(true)
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
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                    <Mail className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Inbox Cleared!</h2>
                <p className="text-xl">Your Detective Score: {score} / 1000</p>
                <Button onClick={() => onComplete(score)} size="lg">Finish Simulation</Button>
            </div>
        )
    }

    const email = EMAILS[currentIndex]

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center text-sm text-muted-foreground font-mono">
                <span>Email {currentIndex + 1} / {EMAILS.length}</span>
                <span>Current Score: {score}</span>
            </div>

            {/* Email Client Simulation */}
            <Card className="border-2 shadow-xl overflow-hidden min-h-[400px] flex flex-col">
                {/* Simulated Toolbar */}
                <div className="bg-muted p-2 border-b flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <div className="ml-4 text-xs text-muted-foreground flex items-center">
                        <Mail className="w-3 h-3 mr-1" /> Inbox
                    </div>
                </div>

                {/* Email Content */}
                <div className="p-6 flex-1 space-y-6">
                    <div className="space-y-1 border-b pb-4">
                        <div className="flex justify-between">
                            <span className="font-bold text-lg">{email.subject}</span>
                            <span className="text-xs text-muted-foreground">10:42 AM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {email.sender[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">Sender</span>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{email.sender}</span>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
                        {email.body}
                    </div>
                </div>

                {/* Controls */}
                {!showFeedback ? (
                    <div className="p-4 bg-muted/30 border-t flex justify-center gap-4">
                        <Button
                            variant="destructive"
                            size="lg"
                            className="w-40 hover:scale-105 transition-transform"
                            onClick={() => handleDecision('phishing')}
                        >
                            <AlertOctagon className="w-4 h-4 mr-2" />
                            Report Phishing
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            className="w-40 bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform"
                            onClick={() => handleDecision('legit')}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Mark Safe
                        </Button>
                    </div>
                ) : (
                    <div className={`p-6 border-t animate-in slide-in-from-bottom-10 ${lastResult?.correct ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {lastResult?.correct ? <CheckCircle2 className="text-green-600 w-6 h-6" /> : <X className="text-red-500 w-6 h-6" />}
                            <h3 className={`font-bold text-lg ${lastResult?.correct ? "text-green-700" : "text-red-600"}`}>
                                {lastResult?.correct ? "Correct Choice!" : "Wrong Decision"}
                            </h3>
                        </div>
                        <p className="mb-4 text-foreground">{lastResult?.reason}</p>
                        <Button onClick={nextEmail} className="w-full">
                            Next Email
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}
