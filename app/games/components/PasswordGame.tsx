"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, ShieldAlert, Key, RefreshCcw } from "lucide-react"

export default function PasswordGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [password, setPassword] = useState("")
    const [entropy, setEntropy] = useState(0)
    const [crackTime, setCrackTime] = useState("0 seconds")
    const [feedback, setFeedback] = useState<string[]>([])
    const [level, setLevel] = useState(1)
    const [score, setScore] = useState(0)

    const levels = [
        { target: 40, name: "Level 1: The Basics (Min Entropy 40)", req: "Use letters & numbers" },
        { target: 60, name: "Level 2: Special Ops (Min Entropy 60)", req: "Add special chars (!@#$)" },
        { target: 80, name: "Level 3: Fort Knox (Min Entropy 80)", req: "Length > 12 & mixed types" }
    ]

    const calculateStrength = (pwd: string) => {
        let e = 0
        if (!pwd) return { e: 0, time: "0s", feed: [] }

        // Length bonus
        e += pwd.length * 4

        // Character sets
        if (/[A-Z]/.test(pwd)) e += 10
        if (/[a-z]/.test(pwd)) e += 10
        if (/[0-9]/.test(pwd)) e += 10
        if (/[^A-Za-z0-9]/.test(pwd)) e += 15

        // Penalties
        const f = []
        if (pwd.length < 8) f.push("Too short (-20)")
        if (/123/.test(pwd) || /abc/.test(pwd) || /qwerty/.test(pwd)) {
            e -= 30
            f.push("Common pattern detected! (-30)")
        }
        if (/(.)\1\1/.test(pwd)) {
            e -= 10
            f.push("Repeated characters (-10)")
        }

        // Time to crack logic (simplified)
        let time = "Instant"
        if (e > 30) time = "2 minutes"
        if (e > 50) time = "3 days"
        if (e > 70) time = "40 years"
        if (e > 100) time = "5 million years"

        return { e: Math.max(0, Math.min(100, e)), time, feed: f }
    }

    useEffect(() => {
        const { e, time, feed } = calculateStrength(password)
        setEntropy(e)
        setCrackTime(time)
        setFeedback(feed)
    }, [password])

    const submitPassword = () => {
        const currentTarget = levels[level - 1].target
        if (entropy >= currentTarget) {
            setScore(s => s + entropy * 10)
            if (level < 3) {
                setLevel(l => l + 1)
                setPassword("")
            } else {
                onComplete(score + entropy * 10)
            }
        } else {
            setFeedback(prev => [...prev, "Requirement not met! try harder."])
        }
    }

    const typeChar = (char: string) => {
        if (password.length < 20) setPassword(p => p + char)
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <Card className="p-8 border-2 border-primary shadow-[0_0_20px_rgba(37,99,235,0.3)] bg-slate-950 text-slate-50">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {levels[level - 1].name}
                    </h2>
                    <div className="text-xl font-mono text-yellow-500">{score} PTS</div>
                </div>

                <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg mb-6 relative overflow-hidden">
                    <div className="text-3xl font-mono tracking-wider text-center break-all min-h-[40px]">
                        {password || <span className="text-slate-600 animate-pulse">_Wait_Input_</span>}
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Strength: {entropy}%</span>
                        <span>Crack Time: {crackTime}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${entropy < 30 ? "bg-red-600" : entropy < 60 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${entropy}%` }}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[24px]">
                        {feedback.map((f, i) => (
                            <span key={i} className="text-xs text-red-400 bg-red-950/30 px-2 py-1 rounded animate-in fade-in">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Custom Keyboard for "Hacker" feel */}
                <div className="grid grid-cols-10 gap-1 mb-6">
                    {"QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%&?".split("").map(char => (
                        <button
                            key={char}
                            onClick={() => typeChar(char)}
                            className="bg-slate-800 hover:bg-primary hover:text-white p-2 text-sm rounded transition-colors active:scale-95"
                        >
                            {char}
                        </button>
                    ))}
                    <button onClick={() => setPassword(p => p.slice(0, -1))} className="col-span-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded text-xs">DEL</button>
                    <button onClick={() => setPassword("")} className="col-span-2 bg-yellow-900/50 hover:bg-yellow-800 text-yellow-200 rounded text-xs">CLR</button>
                </div>

                <Button
                    onClick={submitPassword}
                    className={`w-full h-12 text-lg font-bold transition-all duration-300 ${entropy >= levels[level - 1].target ? "bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "opacity-50 cursor-not-allowed"}`}
                    disabled={entropy < levels[level - 1].target}
                >
                    {entropy >= levels[level - 1].target ? "Inject Password >>" : "Password Weak"}
                </Button>
            </Card>

            <div className="text-center text-xs text-slate-500">
                Target Requirement: {levels[level - 1].req}
            </div>
        </div>
    )
}
