"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle2, Zap, Ghost } from "lucide-react"

export default function FirewallGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [packets, setPackets] = useState<{ id: number; type: 'safe' | 'malicious' | 'trojan'; x: number; y: number; speed: number; visible: boolean }[]>([])
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [timeLeft, setTimeLeft] = useState(45)
    const [powerUpReady, setPowerUpReady] = useState(false)
    const difficultyRef = useRef(1)

    // Difficulty scaling
    useEffect(() => {
        const diffInterval = setInterval(() => {
            difficultyRef.current += 0.1
        }, 5000)
        return () => clearInterval(diffInterval)
    }, [])

    // Powerup charging
    useEffect(() => {
        if (score >= 500 && !powerUpReady) {
            setPowerUpReady(true)
        }
    }, [score, powerUpReady])

    // Game Loop
    useEffect(() => {
        if (gameOver) return

        const interval = setInterval(() => {
            // Spawn new packet
            if (Math.random() > (0.6 / difficultyRef.current)) { // Spawn rate increases with difficulty
                const isMalicious = Math.random() > 0.6
                const isTrojan = isMalicious && Math.random() > 0.8 // 20% stealth chance for malicious

                setPackets(prev => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        type: isTrojan ? 'trojan' : (isMalicious ? 'malicious' : 'safe'),
                        x: Math.random() * 80 + 10,
                        y: -10,
                        speed: (Math.random() * 2 + 1.5) * difficultyRef.current,
                        visible: true
                    }
                ])
            }

            // Move packets
            setPackets(prev =>
                prev.map(p => {
                    // Flash Trojans visibility
                    const visible = p.type === 'trojan' ? (Math.floor(Date.now() / 500) % 2 === 0) : true
                    return { ...p, y: p.y + p.speed, visible }
                })
                    .filter(p => {
                        if (p.y > 100) {
                            // Missed packet penalty
                            if (p.type === 'malicious' || p.type === 'trojan') {
                                setScore(s => Math.max(0, s - 100))
                                // Screen shake effect could go here
                            }
                            return false
                        }
                        return true
                    })
            )
        }, 50)

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameOver(true)
                    return 0
                }
                return t - 1
            })
        }, 1000)

        return () => {
            clearInterval(interval)
            clearInterval(timer)
        }
    }, [gameOver])

    const handlePacketClick = (id: number, type: 'safe' | 'malicious' | 'trojan') => {
        if (gameOver) return

        if (type === 'malicious' || type === 'trojan') {
            setScore(s => s + (type === 'trojan' ? 300 : 100))
            setPackets(prev => prev.filter(p => p.id !== id))
        } else {
            setScore(s => Math.max(0, s - 50))
            // Visual penalty feedback logic could go here
        }
    }

    const activatePurge = () => {
        if (!powerUpReady) return

        // Remove all malicious packets
        setPackets(prev => {
            const clearedCount = prev.filter(p => p.type !== 'safe').length
            setScore(s => s + (clearedCount * 50))
            return prev.filter(p => p.type === 'safe')
        })
        setPowerUpReady(false)
        setScore(s => Math.max(0, s - 500)) // Cost of powerup? Or maybe resetting readiness is enough. Let's reset readiness.
    }

    return (
        <div className="w-full max-w-3xl mx-auto h-[600px] border-4 border-primary/30 rounded-xl relative overflow-hidden bg-slate-950 shadow-2xl">

            {/* Matrix Rain Effect Background (CSS-only approximation) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}
            />

            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-green-400">
                        <Shield className="fill-green-400/20 animate-pulse" />
                        <span className="font-mono text-xl font-bold tracking-widest">FIREWALL_V9</span>
                    </div>
                    <div className="text-xs text-green-600 font-mono">THREAT LEVEL: {Math.floor(difficultyRef.current * 100)}%</div>
                </div>

                <div className="flex items-center gap-6">
                    {/* PowerUp Button */}
                    <button
                        onClick={activatePurge}
                        disabled={!powerUpReady}
                        className={`flex flex-col items-center gap-1 transition-all ${powerUpReady ? "opacity-100 scale-110" : "opacity-30 grayscale"}`}
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(234,179,8,0.6)]">
                            <Zap className="text-black fill-black" />
                        </div>
                        <span className="text-[10px] font-bold text-yellow-500">PURGE</span>
                    </button>

                    <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-white tabular-nums">{score}</div>
                        <div className="text-xs text-muted-foreground uppercase">Score</div>
                    </div>

                    <div className="text-center">
                        <div className={`text-3xl font-mono font-bold tabular-nums ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-blue-400"}`}>
                            {timeLeft}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">Seconds</div>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            {!gameOver ? (
                <div className="relative w-full h-full cursor-crosshair">
                    {/* Safe Zone Indicator */}
                    <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-red-500 via-transparent to-red-500 opacity-50" />

                    {packets.map(packet => (
                        <button
                            key={packet.id}
                            onClick={() => handlePacketClick(packet.id, packet.type)}
                            className={`absolute flex items-center justify-center transition-all active:scale-90
                                ${packet.type === 'safe' ? 'w-10 h-10 hover:scale-110' : 'w-12 h-12 hover:scale-125'}
                                ${!packet.visible ? 'opacity-0' : 'opacity-100'}
                            `}
                            style={{
                                left: `${packet.x}%`,
                                top: `${packet.y}%`,
                                transitionDuration: '50ms' // Smoother movement
                            }}
                        >
                            {packet.type === 'malicious' && (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500 blur-md rounded-full animate-pulse" />
                                    <AlertTriangle className="relative z-10 text-white w-full h-full drop-shadow-md" />
                                </div>
                            )}
                            {packet.type === 'trojan' && (
                                <div className="relative animate-pulse">
                                    <div className="absolute inset-0 bg-purple-500 blur-lg rounded-full opacity-50" />
                                    <Ghost className="relative z-10 text-purple-200 w-full h-full drop-shadow-md" />
                                </div>
                            )}
                            {packet.type === 'safe' && (
                                <div className="relative opacity-80">
                                    <CheckCircle2 className="text-blue-400 w-full h-full" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-950/90 backdrop-blur-sm animate-in zoom-in-95">
                    <h2 className="text-5xl font-bold text-white mb-2 tracking-tighter">SYSTEM SECURED</h2>
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mb-8 opacity-50" />

                    <div className="grid grid-cols-2 gap-8 mb-8 text-center">
                        <div>
                            <div className="text-sm text-green-400 uppercase tracking-widest mb-1">Threats Blocked</div>
                            <div className="text-4xl font-mono font-bold text-white">{Math.floor(score / 100)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-blue-400 uppercase tracking-widest mb-1">Final Score</div>
                            <div className="text-4xl font-mono font-bold text-white">{score}</div>
                        </div>
                    </div>

                    <Button onClick={() => onComplete(score)} size="lg" className="w-64 text-lg h-14 bg-green-600 hover:bg-green-500 shadow-[0_0_30px_rgba(22,163,74,0.4)]">
                        Return to Dashboard
                    </Button>
                </div>
            )}
        </div>
    )
}
