"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lightbulb, ArrowRight, Star, ShieldCheck, Lock, AlertTriangle, Zap, HelpCircle, Users, Scale, MessageSquare } from "lucide-react"

export default function CyberQuizGame({ onComplete }: { onComplete: (score: number) => void }) {
    const questions = [
        // Easy
        {
            q: "What is the best way to secure your WiFi?",
            a: ["No Password", "WEP (Old Standard)", "WPA3 (Latest Standard)", "Hidden SSID"],
            c: 2,
            prize: 100,
            info: "WPA3 (Wi-Fi Protected Access 3) is currently the most secure protocol."
        },
        {
            q: "A lock icon in the browser means...",
            a: ["The site is 100% safe", "Connection is Encrypted", "No Viruses", "Government Approved"],
            c: 1,
            prize: 200,
            info: "The lock means your connection is encrypted (HTTPS), but the site could still be phishing!"
        },
        // Medium
        {
            q: "Which is a weak password?",
            a: ["Tr0ub4dour&3", "correct-horse-battery-staple", "P@ssw0rd1", "Xy9#m2!pL"],
            c: 2,
            prize: 500,
            info: "'P@ssw0rd1' is extremely common and instantly guessed by tools."
        },
        {
            q: "You find a USB drive in the parking lot. What should you do?",
            a: ["Plug it in to find the owner", "Throw it in the trash", "Give it to IT Security", "Format it and keep it"],
            c: 2,
            prize: 1000,
            info: "Unknown drives can contain 'Rubber Ducky' malware that runs effectively as a keyboard."
        },
        // Hard
        {
            q: "What does 'End-to-End Encryption' (E2EE) mean?",
            a: ["Data is encrypted in transit only", "Only sender & receiver have keys", "Service provider has a backup key", "Prevents screen recording"],
            c: 1,
            prize: 5000,
            info: "E2EE ensures not even the service provider can read the messages."
        },
        {
            q: "Which algorithm is Asymmetric?",
            a: ["AES", "RSA", "Blowfish", "DES"],
            c: 1,
            prize: 20000,
            info: "RSA uses a public/private key pair (Asymmetric). AES is Symmetric."
        },
        // Expert
        {
            q: "What is a 'Hash' collision?",
            a: ["Two inputs producing the same hash", "A database crash", "Two IPs fighting for one address", "Decrypting a password"],
            c: 0,
            prize: 100000,
            info: "A collision occurs when two different inputs result in the exact same hash output."
        },
        {
            q: "What is a 'Zero-Day' vulnerability?",
            a: ["A virus that lasts 0 days", "A flaw known to vendor but not patched", "A flaw unknown to the vendor", "A bug in date parsing"],
            c: 2,
            prize: 1000000,
            info: "Zero-Day means the developers have 'zero days' to fix it because it's already actively exploited or unknown."
        }
    ]

    const [idx, setIdx] = useState(0)
    const [score, setScore] = useState(0) // Safe score
    const [currentMoney, setCurrentMoney] = useState(0)
    const [gameState, setGameState] = useState<"playing" | "gameover" | "won">("playing")
    const [lifelines, setLifelines] = useState({ fifty: true, poll: true, ai: true })
    const [hiddenAnswers, setHiddenAnswers] = useState<number[]>([]) // Indices of hidden
    const [feedback, setFeedback] = useState<string | null>(null)
    const [aiHint, setAiHint] = useState<string | null>(null)
    const [pollResults, setPollResults] = useState<number[] | null>(null)

    const handleAns = (i: number) => {
        if (gameState !== "playing") return

        const q = questions[idx]
        if (i === q.c) {
            // Correct
            setTimeout(() => {
                setFeedback("CORRECT")
                const newMoney = q.prize
                setCurrentMoney(newMoney)

                // Checkpoints (Bank the money)
                if (newMoney >= 1000) setScore(Math.max(score, 1000))
                if (newMoney >= 20000) setScore(Math.max(score, 20000))

                setTimeout(() => {
                    setFeedback(null)
                    setAiHint(null)
                    setPollResults(null)
                    setHiddenAnswers([])
                    if (idx + 1 < questions.length) {
                        setIdx(idx + 1)
                    } else {
                        setScore(1000000)
                        setGameState("won")
                    }
                }, 1500)
            }, 500)
        } else {
            // Wrong
            setFeedback("WRONG")
            setTimeout(() => {
                setGameState("gameover")
            }, 1500)
        }
    }

    const useFifty = () => {
        if (!lifelines.fifty) return
        const q = questions[idx]
        const wrongIndices = q.a.map((_, i) => i).filter(i => i !== q.c)
        // Remove 2 wrong answers
        const toHide = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2)
        setHiddenAnswers(toHide)
        setLifelines(l => ({ ...l, fifty: false }))
    }

    const useAi = () => {
        if (!lifelines.ai) return
        setAiHint(`AI Analysis: I am ${90 - (idx * 5)}% sure the answer is: "${questions[idx].a[questions[idx].c]}"`)
        setLifelines(l => ({ ...l, ai: false }))
    }

    const usePoll = () => {
        if (!lifelines.poll) return
        const q = questions[idx]
        const results = q.a.map((_, i) => i === q.c ? 60 + Math.random() * 20 : Math.random() * 20)
        // Normalize roughly to 100
        const infoS = results.reduce((a, b) => a + b, 0)
        setPollResults(results.map(r => Math.round((r / infoS) * 100)))
        setLifelines(l => ({ ...l, poll: false }))
    }

    if (gameState === "won") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center bg-gradient-to-br from-yellow-500 to-yellow-700 text-white rounded-xl shadow-2xl animate-in zoom-in">
                <Star className="w-32 h-32 mb-6 fill-white animate-spin-slow" />
                <h1 className="text-6xl font-black mb-4 tracking-tighter shadow-black/50 drop-shadow-lg">MILLIONAIRE!</h1>
                <p className="text-2xl font-mono mb-8">Score: 1,000,000</p>
                <Button onClick={() => onComplete(1000000)} size="lg" className="bg-white text-yellow-700 hover:bg-slate-100 font-bold text-xl px-12 py-8 rounded-full shadow-xl">
                    Collect Prize
                </Button>
            </div>
        )
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center bg-slate-900 text-white rounded-xl shadow-2xl animate-in zoom-in">
                <AlertTriangle className="w-24 h-24 mb-6 text-red-500 animate-pulse" />
                <h1 className="text-4xl font-bold mb-2">GAME OVER</h1>
                <p className="text-xl text-slate-400 mb-8">You walk away with: <span className="text-green-400 font-mono font-bold">${score}</span></p>
                <Button onClick={() => onComplete(score)} size="lg" className="bg-slate-800 hover:bg-slate-700">Try Again</Button>
            </div>
        )
    }

    const q = questions[idx]

    return (
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-slate-900 flex flex-col h-[650px] relative border-4 border-indigo-900/50">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,150,0.2),rgba(0,0,0,0.8))] pointer-events-none" />

            {/* Top Bar - Lifelines */}
            <div className="flex justify-between items-start p-6 z-10">
                <div className="flex gap-4">
                    <LifelineButton icon={Scale} label="50:50" active={lifelines.fifty} onClick={useFifty} />
                    <LifelineButton icon={Users} label="POLL" active={lifelines.poll} onClick={usePoll} />
                    <LifelineButton icon={MessageSquare} label="ASK AI" active={lifelines.ai} onClick={useAi} />
                </div>
                <div className="text-right">
                    <div className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Current Prize</div>
                    <div className="text-3xl font-mono text-yellow-400 font-bold shadow-yellow-500/20 drop-shadow-lg">
                        ${currentMoney.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 relative">
                {/* Feedback Overlays */}
                {feedback === "CORRECT" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm z-50 animate-in fade-in duration-200">
                        <div className="text-6xl font-black text-green-400 drop-shadow-lg tracking-widest scale-150 animate-in zoom-in spin-in-3">CORRECT!</div>
                    </div>
                )}
                {feedback === "WRONG" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm z-50 animate-in fade-in duration-200">
                        <div className="text-6xl font-black text-red-500 drop-shadow-lg tracking-widest animate-in zoom-in">WRONG!</div>
                    </div>
                )}

                {/* Question Container */}
                <div className="bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 border-y-4 border-indigo-500 w-full p-8 mb-8 relative shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-1 bg-indigo-500" />
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-1 bg-indigo-500" />
                    <h2 className="text-2xl md:text-3xl text-center text-white font-bold leading-relaxed">
                        {q.q}
                    </h2>
                </div>

                {/* Answer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                    {q.a.map((ans, i) => (
                        <button
                            key={i}
                            disabled={hiddenAnswers.includes(i) || feedback !== null}
                            onClick={() => handleAns(i)}
                            className={`
                                relative p-4 rounded-lg border-2 text-left transition-all duration-200 group overflow-hidden
                                ${hiddenAnswers.includes(i) ? "opacity-0 pointer-events-none" : "opacity-100"}
                                ${feedback && i === q.c ? "bg-green-600 border-green-400 animate-pulse text-white" : "bg-slate-800 border-slate-600 text-slate-200 hover:bg-indigo-900 hover:border-indigo-400 hover:text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-amber-500 font-bold text-xl w-8">{String.fromCharCode(65 + i)}:</span>
                                <span className="text-lg md:text-xl font-medium">{ans}</span>
                            </div>

                            {/* Poll Bar Overlay */}
                            {pollResults && (
                                <div className="absolute top-0 right-0 bottom-0 bg-white/10" style={{ width: `${pollResults[i]}%` }} />
                            )}
                            {pollResults && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60">{pollResults[i]}%</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Assistant / Info Helper */}
                {aiHint && (
                    <div className="mt-8 bg-blue-900/50 text-blue-200 p-4 rounded-xl border border-blue-500/30 w-full max-w-2xl animate-in fade-in slide-in-from-bottom">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <span className="font-mono">{aiHint}</span>
                        </div>
                    </div>
                )}

                {q.prize > 1000 && !feedback && (
                    <div className="absolute bottom-4 text-slate-500 text-xs uppercase tracking-widest animate-pulse">
                        High Stakes Question
                    </div>
                )}
            </div>
        </div>
    )
}

function LifelineButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            disabled={!active}
            className={`
                flex flex-col items-center gap-1 group transition-all duration-300
                ${active ? "opacity-100 hover:scale-110 cursor-pointer" : "opacity-30 grayscale cursor-not-allowed"}
            `}
        >
            <div className={`p-3 rounded-full border-2 ${active ? "bg-indigo-900/50 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:bg-indigo-600 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.8)]" : "bg-slate-800 border-slate-600"}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{label}</span>
        </button>
    )
}
