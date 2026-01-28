"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, Shield, AlertTriangle, Check, X, Download, Star, Battery, Wifi, Grip } from "lucide-react"

export default function MobileGuardianGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(45)
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")
    const [apps, setApps] = useState<{ id: number, name: string, isSafe: boolean, permissions: string[], rating: number, downloads: string, iconColor: string }[]>([])
    const [scanningId, setScanningId] = useState<number | null>(null)

    // Content Generator
    const generateApp = () => {
        const types = [
            { name: "Super Flashlight 2024", isSafe: false, perms: ["Contacts", "Location", "SMS", "Camera"], rating: 4.8, downloads: "10M+", color: "bg-yellow-500" },
            { name: "Mega Calculator", isSafe: true, perms: ["None"], rating: 4.5, downloads: "5M+", color: "bg-gray-500" },
            { name: "Funny Face Filters", isSafe: false, perms: ["Microphone", "Full Network", "Files", "Contacts"], rating: 4.2, downloads: "1M+", color: "bg-pink-500" },
            { name: "City Weather", isSafe: true, perms: ["Location"], rating: 4.6, downloads: "50M+", color: "bg-blue-400" },
            { name: "Free Gems Generator", isSafe: false, perms: ["Admin Access", "SMS", "Full Network"], rating: 5.0, downloads: "100K+", color: "bg-purple-600" },
            { name: "Quick Notes", isSafe: true, perms: ["Storage"], rating: 4.7, downloads: "5M+", color: "bg-orange-400" },
            { name: "Battery Saver Pro", isSafe: false, perms: ["Admin Access", "Kill Background Processes", "Contacts"], rating: 4.9, downloads: "2M+", color: "bg-green-600" },
            { name: "PDF Reader", isSafe: true, perms: ["Storage"], rating: 4.4, downloads: "10M+", color: "bg-red-500" }
        ]
        const t = types[Math.floor(Math.random() * types.length)]
        return {
            id: Math.random(),
            name: t.name,
            isSafe: t.isSafe,
            permissions: t.perms,
            rating: t.rating,
            downloads: t.downloads,
            iconColor: t.color
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
            setTimeLeft(t => Math.min(t + 2, 45)) // Bonus
        } else {
            setScore(s => Math.max(0, s - 50))
            setTimeLeft(t => Math.max(1, t - 3)) // Penalty
        }

        // Remove and Add new
        setApps(prev => [...prev.filter(a => a.id !== id), generateApp()])
    }

    const scanApp = (id: number) => {
        if (scanningId) return // busy
        setScanningId(id)
        setTimeout(() => {
            setScanningId(null)
        }, 1500)
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in bg-slate-900 text-white rounded-[3rem] border-8 border-slate-800 shadow-2xl">
                <Shield className="w-20 h-20 text-blue-500 mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold mb-2">Security Audit Complete</h2>
                <div className="text-4xl font-mono mb-8 text-blue-400 font-bold">{score}</div>
                <p className="mb-8 text-slate-400">Device status: {score > 500 ? "SECURE" : "VULNERABLE"}</p>
                <Button onClick={() => onComplete(score)} size="lg" className="w-full bg-blue-600 hover:bg-blue-500">Close App Store</Button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto relative border-8 border-slate-800 rounded-[3rem] overflow-hidden bg-slate-50 h-[650px] shadow-2xl ring-4 ring-slate-900/10">
            {/* Notch */}
            <div className="absolute top-0 w-1/2 left-1/4 h-7 bg-slate-800 rounded-b-xl z-20 flex justify-center items-center">
                <div className="w-16 h-2 bg-slate-700 rounded-full opacity-50" />
            </div>

            {/* Status Bar */}
            <div className="pt-3 px-6 pb-2 flex justify-between items-center text-[10px] font-bold text-slate-900 bg-white/50 backdrop-blur z-10 absolute w-full top-0">
                <span>9:41</span>
                <div className="flex gap-1.5 items-center">
                    <Wifi className="w-3 h-3" />
                    <Battery className="w-4 h-4" />
                </div>
            </div>

            <div className="pt-12 pb-4 px-4 h-full flex flex-col bg-slate-50">
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="text-2xl font-bold text-slate-900 tracking-tight">App Store</div>
                    <div className="flex flex-col items-end">
                        <div className="text-xs font-bold text-slate-400 uppercase">Points</div>
                        <div className="text-lg font-mono font-bold text-blue-600 leading-none">{score}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-20">
                    {apps.map(app => (
                        <div key={app.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom duration-500">
                            <div className="flex gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-2xl ${app.iconColor} shadow-lg flex items-center justify-center text-white`}>
                                    <div className="text-2xl font-bold">{app.name[0]}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800 leading-tight mb-1">{app.name}</div>
                                    <div className="text-xs text-slate-500 mb-1">{app.downloads} Downloads</div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-3 h-3 ${s <= Math.round(app.rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Analysis */}
                            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-xs relative overflow-hidden">
                                {scanningId === app.id ? (
                                    <div className="flex items-center justify-center gap-2 h-12 text-blue-600 font-bold animate-pulse">
                                        Analyzing permissions...
                                    </div>
                                ) : (
                                    <>
                                        <div className="font-bold text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Access Requests</div>
                                        <div className="flex flex-wrap gap-1">
                                            {app.permissions.map(p => (
                                                <span key={p} className={`px-2 py-1 rounded border ${["Contacts", "SMS", "Full Network", "Admin Access"].includes(p) ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-200 text-slate-600 border-slate-300"
                                                    }`}>
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-1 right-1 h-6 text-[10px] text-blue-500 hover:text-blue-700"
                                            onClick={() => scanApp(app.id)}
                                        >
                                            SCAN RISK
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 font-bold h-10 rounded-xl"
                                    onClick={() => handleDecision(app.id, "install")}
                                >
                                    GET
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-10 rounded-xl"
                                    onClick={() => handleDecision(app.id, "block")}
                                >
                                    REPORT
                                </Button>
                            </div>
                        </div>
                    ))}

                    <div className="text-center py-4 opacity-50">
                        <Grip className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                        <span className="text-xs text-slate-300 font-bold tracking-widest">END OF LIST</span>
                    </div>
                </div>

                {/* Bottom Nav Simulation */}
                <div className="absolute bottom-0 left-0 w-full h-[80px] bg-white/90 backdrop-blur border-t border-slate-200 flex justify-around items-center pb-4 px-6 z-10 text-slate-300">
                    <div className="flex flex-col items-center gap-1 text-blue-600">
                        <Download className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Games</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Smartphone className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Apps</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Shield className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Updates</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
