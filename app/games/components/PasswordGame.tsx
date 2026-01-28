"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, ShieldAlert, Key, RefreshCcw, Terminal, ShieldCheck } from "lucide-react"

export default function PasswordGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [password, setPassword] = useState("")
    const [entropy, setEntropy] = useState(0)
    const [crackTime, setCrackTime] = useState("Instant")
    const [feedback, setFeedback] = useState<string[]>([])
    const [level, setLevel] = useState(1)
    const [score, setScore] = useState(0)
    const [hackerProgress, setHackerProgress] = useState(0)
    const [hackerGuess, setHackerGuess] = useState("")

    // Level configurations
    const getLevelReq = (lvl: number) => {
        if (lvl === 1) return { target: 40, name: "Level 1: Basic Security", req: "Use letters & numbers" }
        if (lvl === 2) return { target: 60, name: "Level 2: Enhanced", req: "Add special chars (!@#$)" }
        if (lvl === 3) return { target: 80, name: "Level 3: Fort Knox", req: "Length > 12 & mixed types" }
        return { target: 80 + (lvl - 3) * 10, name: `Level ${lvl}: Elite Cyber Defense`, req: `Entropy > ${80 + (lvl - 3) * 10}` }
    }

    const currentLevel = getLevelReq(level)

    // Hacker Simulation Effect
    useEffect(() => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
        const interval = setInterval(() => {
            // Generate random "hacker guess"
            let guess = ""
            for (let i = 0; i < Math.min(password.length || 8, 12); i++) {
                guess += chars.charAt(Math.floor(Math.random() * chars.length))
            }
            setHackerGuess(guess)

            // Hacker progress inversely proportional to entropy
            if (password.length > 0) {
                setHackerProgress(prev => {
                    const difficulty = Math.max(1, entropy)
                    const increment = (100 / difficulty) * 2 // Slower as entropy rises
                    return Math.min(100, prev + increment)
                })
            } else {
                setHackerProgress(0)
            }

        }, 100)
        return () => clearInterval(interval)
    }, [password, entropy])


    const calculateStrength = (pwd: string) => {
        let e = 0
        if (!pwd) return { e: 0, time: "Instant", feed: [] }

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
        if (/123/.test(pwd) || /abc/.test(pwd) || /qwerty/.test(pwd) || /password/.test(pwd.toLowerCase())) {
            e -= 30
            f.push("Predictable pattern detected! (-30)")
        }
        if (/(.)\1\1/.test(pwd)) {
            e -= 10
            f.push("Repeated characters (-10)")
        }

        // Time to crack logic
        let time = "Instant"
        if (e > 30) time = "2 minutes"
        if (e > 50) time = "3 days"
        if (e > 70) time = "40 years"
        if (e > 90) time = "5 million years"
        if (e > 120) time = "Heat death of universe"

        return { e: Math.max(1, Math.min(100, e)), time, feed: f }
    }

    useEffect(() => {
        const { e, time, feed } = calculateStrength(password)
        setEntropy(e)
        setCrackTime(time)
        setFeedback(feed)

        // Reset hacker progress if password changes significantly
        setHackerProgress(0)
    }, [password])

    const submitPassword = () => {
        if (entropy >= currentLevel.target) {
            setScore(s => s + entropy * 10)
            if (level < 5) {
                setLevel(l => l + 1)
                setPassword("")
                setHackerProgress(0)
            } else {
                onComplete(score + entropy * 10)
            }
        }
    }

    const typeChar = (char: string) => {
        if (password.length < 24) setPassword(p => p + char)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
            {/* Header / HUD */}
            <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-700 backdrop-blur">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {currentLevel.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">OBJECTIVE: {currentLevel.req}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-mono font-bold text-green-400 tabular-nums">{score}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest">Secure Points</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Input Area */}
                <Card className="p-6 border-2 border-slate-700 bg-slate-950 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Lock className="w-16 h-16 text-blue-500" />
                    </div>

                    <label className="text-xs font-mono text-blue-400 mb-2 block uppercase tracking-widest">New Password Protocol</label>
                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mb-6 relative overflow-hidden">
                        <div className="text-2xl font-mono tracking-wider break-all min-h-[40px] text-white flex items-center">
                            {password}
                            <span className="w-2 h-6 bg-blue-500 animate-pulse ml-1 inline-block" />
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-xs font-mono">
                            <span className={entropy < 40 ? "text-red-400" : "text-green-400"}>
                                ENTROPY: {entropy}%
                            </span>
                            <span className="text-slate-400">EST. CRACK TIME: {crackTime}</span>
                        </div>

                        {/* Entropy Bar */}
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${entropy < 40 ? "bg-red-500" : entropy < 80 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${entropy}%` }}
                            />
                        </div>

                        {/* Requirements Indicator */}
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-red-500"}`} />
                                <span className="text-slate-500">Min Length (8)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-red-500"}`} />
                                <span className="text-slate-500">Numbers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*]/.test(password) ? "bg-green-500" : "bg-red-500"}`} />
                                <span className="text-slate-500">Symbols</span>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Console */}
                    <div className="min-h-[60px] bg-black/40 rounded p-2 text-xs font-mono space-y-1">
                        {feedback.length > 0 ? (
                            feedback.map((f, i) => <div key={i} className="text-red-400">&gt; ALERT: {f}</div>)
                        ) : (
                            <div className="text-green-500/50">&gt; No vulnerabilities detected...</div>
                        )}
                    </div>
                </Card>

                {/* Hacker/Brute Force View */}
                <Card className="p-6 border-2 border-red-900/30 bg-black shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-950/10 animate-pulse" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-red-500 mb-4 border-b border-red-900/50 pb-2">
                            <Terminal className="w-5 h-5" />
                            <span className="font-mono font-bold tracking-widest text-sm">THREAT_ACTOR_MONITOR</span>
                        </div>

                        <div className="space-y-4 font-mono text-sm">
                            <div>
                                <div className="text-red-700 text-xs mb-1">ATTEMPTED_CRACK:</div>
                                <div className="text-red-500 text-lg tracking-widest animate-pulse opacity-80">{hackerGuess}</div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-red-700 mb-1">
                                    <span>BRUTE_FORCE_PROGRESS</span>
                                    <span>
                                        {entropy > 80 ? "FAILED" : `${Math.floor(hackerProgress)}%`}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-red-950 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600 transition-all duration-100 ease-linear"
                                        style={{ width: `${entropy > 80 ? 0 : hackerProgress}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-red-800 mt-1">
                                    {entropy > 80 ? "ENCRYPTION TOO STRONG. ATTACK STALLED." : "WARNING: PASSWORD VULNERABLE TO DICTIONARY ATTACK"}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Keyboard */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="grid grid-cols-10 gap-1.5 md:gap-2">
                    {"QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%&?".split("").map(char => (
                        <button
                            key={char}
                            onClick={() => typeChar(char)}
                            className="bg-slate-800 hover:bg-blue-600 hover:text-white p-2 md:p-3 text-sm md:text-base font-medium rounded transition-all active:scale-95 shadow-sm border border-slate-700 hover:border-blue-500"
                        >
                            {char}
                        </button>
                    ))}
                    <button onClick={() => setPassword(p => p.slice(0, -1))} className="col-span-2 bg-red-900/30 hover:bg-red-600/80 text-red-200 rounded text-xs border border-red-900/50 transition-colors">BACKSPACE</button>
                    <button onClick={() => setPassword("")} className="col-span-2 bg-yellow-900/30 hover:bg-yellow-600/80 text-yellow-200 rounded text-xs border border-yellow-900/50 transition-colors">CLEAR</button>
                    <button onClick={submitPassword} disabled={entropy < currentLevel.target} className={`col-span-6 rounded font-bold text-sm tracking-widest transition-all ${entropy >= currentLevel.target ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50 cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>
                        {entropy >= currentLevel.target ? "DEPLOY PASSWORD" : "INSUFFICIENT STRENGTH"}
                    </button>
                </div>
            </div>
        </div>
    )
}
