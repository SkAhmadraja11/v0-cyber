"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileLock, Unlock, Shield, AlertTriangle } from "lucide-react"

export default function DataBreachGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [files, setFiles] = useState<{ id: number, locked: boolean, sensitive: boolean }[]>([])
    const [timeLeft, setTimeLeft] = useState(20)
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")
    const [score, setScore] = useState(0)

    useEffect(() => {
        const init = []
        for (let i = 0; i < 12; i++) {
            init.push({ id: i, locked: false, sensitive: Math.random() > 0.4 })
        }
        setFiles(init)
    }, [])

    useEffect(() => {
        if (gameState !== "playing") return
        const t = setInterval(() => setTimeLeft(prev => {
            if (prev <= 1) {
                setGameState("gameover")
                return 0
            }
            return prev - 1
        }), 1000)
        return () => clearInterval(t)
    }, [gameState])

    const toggleLock = (id: number) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, locked: !f.locked } : f))
    }

    const finish = () => {
        let s = 0
        files.forEach(f => {
            if (f.sensitive && f.locked) s += 100
            else if (f.sensitive && !f.locked) s -= 50
            else if (!f.sensitive && f.locked) s -= 20 // Wasted resources
        })
        onComplete(Math.max(0, s))
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900 text-white rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Breach Started!</h2>
                <p className="mb-4">Did you secure the right files?</p>
                <Button onClick={finish}>Check Report</Button>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto p-4">
            <div className="flex justify-between mb-4">
                <div className="font-bold text-red-600">BREACH IMMINENT: {timeLeft}s</div>
                <div>Lock Sensitive Data (Red)</div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {files.map(f => (
                    <div
                        key={f.id}
                        onClick={() => toggleLock(f.id)}
                        className={`
                            h-24 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 transition-all
                            ${f.locked ? "bg-slate-800 border-green-500" : "bg-slate-100 border-slate-300"}
                        `}
                    >
                        {f.locked ? <FileLock className="text-green-500 mb-2" /> : <Unlock className="text-slate-400 mb-2" />}
                        <div className={`text-xs font-bold ${f.sensitive ? "text-red-500" : "text-slate-500"}`}>
                            {f.sensitive ? "CONFIDENTIAL" : "PUBLIC"}
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={finish} className="w-full mt-6">Lockdown Now</Button>
        </div>
    )
}
