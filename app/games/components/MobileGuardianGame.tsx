"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, Shield, AlertTriangle, Check, X } from "lucide-react"

export default function MobileGuardianGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")
    const [apps, setApps] = useState<{ id: number, name: string, isSafe: boolean, permissions: string[] }[]>([])

    // Content Generator
    const generateApp = () => {
        const types = [
            { name: "Flashlight Pro", isSafe: false, perms: ["Contacts", "Location", "SMS"] },
            { name: "Mega Calculator", isSafe: true, perms: ["None"] },
            { name: "Funny Cam", isSafe: false, perms: ["Microphone", "Full Network", "Files"] },
            { name: "Weather Local", isSafe: true, perms: ["Location"] },
            { name: "Free Gems 999", isSafe: false, perms: ["Admin Access", "SMS"] },
            { name: "Notes Simple", isSafe: true, perms: ["Storage"] }
        ]
        const t = types[Math.floor(Math.random() * types.length)]
        return {
            id: Math.random(),
            name: t.name,
            isSafe: t.isSafe,
            permissions: t.perms
        }
    }

    useEffect(() => {
        // Initial Apps
        setApps([generateApp(), generateApp(), generateApp()])
    }, [])

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

    const handleDecision = (id: number, action: "install" | "block") => {
        const app = apps.find(a => a.id === id)
        if (!app) return

        let correct = false
        if (action === "install") correct = app.isSafe
        if (action === "block") correct = !app.isSafe

        if (correct) {
            setScore(s => s + 100)
        } else {
            setScore(s => Math.max(0, s - 50))
            setTimeLeft(t => Math.max(0, t - 3)) // Penalty
        }

        // Remove and Add new
        setApps(prev => [...prev.filter(a => a.id !== id), generateApp()])
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in">
                <Smartphone className="w-20 h-20 text-blue-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Phone Secure!</h2>
                <div className="text-2xl font-mono mb-8">Score: {score}</div>
                <Button onClick={() => onComplete(score)} size="lg">Finish</Button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto relative border-4 border-slate-800 rounded-[3rem] overflow-hidden bg-slate-900 h-[600px] shadow-2xl">
            {/* Notch */}
            <div className="absolute top-0 w-1/2 left-1/4 h-6 bg-slate-800 rounded-b-xl z-20" />

            <div className="pt-10 pb-4 px-6 h-full flex flex-col bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-slate-900 font-bold">App Store</div>
                    <div className="text-sm font-mono">{timeLeft}s</div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                    {apps.map(app => (
                        <div key={app.id} className="bg-white p-4 rounded-xl shadow-md border animate-in slide-in-from-right">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-lg text-slate-800">{app.name}</div>
                                <div className={`text-xs px-2 py-1 rounded bg-slate-100 text-slate-500`}>
                                    v1.0
                                </div>
                            </div>
                            <div className="text-xs text-red-500 mb-4 font-mono">
                                Req: {app.permissions.join(", ")}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleDecision(app.id, "install")}
                                >
                                    <Check className="w-4 h-4 mr-1" /> Install
                                </Button>
                                <Button
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                                    onClick={() => handleDecision(app.id, "block")}
                                >
                                    <X className="w-4 h-4 mr-1" /> Block
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-2 text-center text-slate-400 text-xs">Score: {score}</div>
            </div>
        </div>
    )
}
