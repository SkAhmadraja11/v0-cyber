"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileLock, Unlock, Shield, AlertTriangle, Server, Database, Lock, Globe } from "lucide-react"

export default function DataBreachGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [files, setFiles] = useState<{ id: number, type: "confidential" | "public", status: "open" | "locked" | "breached" }[]>([])
    const [timeLeft, setTimeLeft] = useState(30)
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")
    const [score, setScore] = useState(0)
    const [breachLevel, setBreachLevel] = useState(0)

    useEffect(() => {
        const init = []
        for (let i = 0; i < 16; i++) {
            init.push({
                id: i,
                type: Math.random() > 0.6 ? "confidential" : "public" as "confidential" | "public",
                status: "open" as "open" | "locked" | "breached"
            })
        }
        setFiles(init)
    }, [])

    useEffect(() => {
        if (gameState !== "playing") return
        const t = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState("gameover")
                    return 0
                }
                return prev - 1
            })

            // Randomly breach an open file every second
            if (Math.random() > 0.7) {
                setFiles(prev => {
                    const openConfidential = prev.filter(f => f.type === "confidential" && f.status === "open")
                    if (openConfidential.length > 0) {
                        const target = openConfidential[Math.floor(Math.random() * openConfidential.length)]
                        return prev.map(f => f.id === target.id ? { ...f, status: "breached" } : f)
                    }
                    return prev
                })
                setBreachLevel(b => Math.min(b + 10, 100))
            }

        }, 1000)
        return () => clearInterval(t)
    }, [gameState])

    const toggleLock = (id: number) => {
        if (gameState !== "playing") return

        setFiles(prev => prev.map(f => {
            if (f.id !== id) return f

            if (f.status === "breached") return f // Too late

            if (f.status === "open") {
                // LOCK IT
                if (f.type === "confidential") {
                    setScore(s => s + 50)
                } else {
                    setScore(s => s - 20) // Wasted encryption on public data
                }
                return { ...f, status: "locked" }
            } else {
                // UNLOCK IT (why would they do this? maybe accidental click, no penalty to unlock but risky)
                return { ...f, status: "open" }
            }
        }))
    }

    const finish = () => {
        // Calculate final based on unbreached confidential files
        const secured = files.filter(f => f.type === "confidential" && f.status === "locked").length
        const total = files.filter(f => f.type === "confidential").length

        let finalScore = score + (secured * 100)
        if (breachLevel >= 100) finalScore = 0 // Total failure

        onComplete(Math.max(0, finalScore))
    }

    // Auto-finish if time runs out or breach 100%
    useEffect(() => {
        if (breachLevel >= 100) {
            setGameState("gameover")
        }
    }, [breachLevel])

    if (gameState === "gameover") {
        return (
            <div className={`flex flex-col items-center justify-center h-[500px] p-8 text-center animate-in zoom-in border-4 rounded-xl shadow-2xl ${breachLevel >= 100 ? "bg-red-950 border-red-600 text-red-100" : "bg-slate-900 border-green-500 text-green-100"}`}>
                {breachLevel >= 100 ? (
                    <>
                        <AlertTriangle className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
                        <h2 className="text-4xl font-black mb-4 tracking-widest">DATA LEAKED</h2>
                        <p className="text-xl mb-8">Confidential files were stolen.</p>
                        <div className="text-3xl font-mono mb-8 opacity-50">Score: 0</div>
                    </>
                ) : (
                    <>
                        <Shield className="w-24 h-24 text-green-500 mb-6" />
                        <h2 className="text-4xl font-bold mb-4">SYSTEM SECURED</h2>
                        <p className="text-xl mb-8">Breach prevented successfully.</p>
                        <div className="text-5xl font-mono font-bold text-white mb-8 shadow-green-500/50 drop-shadow-lg">{score}</div>
                    </>
                )}

                <Button onClick={() => onComplete(score)} size="lg" className="text-lg px-8">View Incident Report</Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto h-[600px] bg-slate-950 text-green-500 font-mono p-6 rounded-xl relative border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

            {/* Header / HUD */}
            <div className="relative z-10 flex justify-between items-end mb-6 border-b border-green-900 pb-4">
                <div className="flex flex-col">
                    <div className="text-xs text-green-700 uppercase tracking-widest mb-1">Defensive Protocol</div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Database className="w-6 h-6" /> SERVER_FARM_01
                    </h2>
                </div>

                <div className="flex gap-8">
                    <div className="text-right">
                        <div className="text-xs text-green-700 uppercase tracking-widest mb-1">Breach Status</div>
                        <div className="w-48 h-6 bg-slate-900 border border-green-900 rounded-full overflow-hidden relative">
                            <div
                                className={`h-full transition-all duration-300 ${breachLevel > 50 ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
                                style={{ width: `${breachLevel}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white z-10">{breachLevel}%</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-green-700 uppercase tracking-widest mb-1">Time Remaining</div>
                        <div className={`text-2xl font-bold ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white"}`}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-1 grid grid-cols-4 gap-4 overflow-y-auto pr-2">
                {files.map(f => (
                    <div
                        key={f.id}
                        onClick={() => toggleLock(f.id)}
                        className={`
                            relative rounded-lg p-4 flex flex-col items-center justify-between cursor-pointer border transition-all duration-200 group hover:scale-[1.02]
                            ${f.status === "breached"
                                ? "bg-red-950/50 border-red-500 opacity-50"
                                : f.status === "locked"
                                    ? "bg-slate-900 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                    : "bg-slate-900 border-slate-700 hover:border-white"
                            }
                        `}
                    >
                        {/* Status Icon */}
                        <div className="mb-2 transition-transform duration-300">
                            {f.status === "breached" && <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />}
                            {f.status === "locked" && <Lock className="w-8 h-8 text-green-400" />}
                            {f.status === "open" && (f.type === "confidential" ? <FileLock className="w-8 h-8 text-red-400 animate-pulse" /> : <Globe className="w-8 h-8 text-blue-400" />)}
                        </div>

                        {/* Label */}
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">ID: DAT_{f.id.toString().padStart(3, '0')}</div>
                            <div className={`text-sm font-bold tracking-tight ${f.type === "confidential" ? "text-red-400 group-hover:text-red-300" : "text-blue-400 group-hover:text-blue-300"
                                }`}>
                                {f.type === "confidential" ? "CONFIDENTIAL" : "PUBLIC_ACCESS"}
                            </div>
                        </div>

                        {/* Overlay for open confidential files to show urgency */}
                        {f.status === "open" && f.type === "confidential" && (
                            <div className="absolute inset-0 border-2 border-red-500/20 rounded-lg animate-pulse" />
                        )}

                        {/* Interaction Hint */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px] rounded-lg">
                            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded font-bold">
                                {f.status === "locked" ? "SECURE" : "CLICK TO LOCK"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center text-xs text-green-800 animate-pulse">
                Click on CONFIDENTIAL files to encrypt them before they are breached. Ignore Public files.
            </div>
        </div>
    )
}
