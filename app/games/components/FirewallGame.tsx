"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function FirewallGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [packets, setPackets] = useState<{ id: number; type: 'safe' | 'malicious'; x: number; y: number }[]>([])
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [timeLeft, setTimeLeft] = useState(30)

    // Game Loop
    useEffect(() => {
        if (gameOver) return

        const interval = setInterval(() => {
            // Spawn new packet
            if (Math.random() > 0.5) {
                setPackets(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        type: Math.random() > 0.6 ? 'malicious' : 'safe', // 40% chance of malicious
                        x: Math.random() * 80 + 10, // Random X position (10-90%)
                        y: 0
                    }
                ])
            }

            // Move packets down
            setPackets(prev =>
                prev.map(p => ({ ...p, y: p.y + 2 })) // Speed
                    .filter(p => {
                        if (p.y > 100) {
                            // Packet missed/passed firewall
                            if (p.type === 'malicious') {
                                // Malicious packet got through! Penalty.
                                setScore(s => Math.max(0, s - 50))
                            }
                            return false
                        }
                        return true
                    })
            )
        }, 100)

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

    const handlePacketClick = (id: number, type: 'safe' | 'malicious') => {
        if (gameOver) return

        if (type === 'malicious') {
            setScore(s => s + 100)
            // Remove packet
            setPackets(prev => prev.filter(p => p.id !== id))
        } else {
            // Clicked safe packet! Penalty
            setScore(s => Math.max(0, s - 50))
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto h-[500px] border-4 border-primary/30 rounded-lg relative overflow-hidden bg-black/90">

            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20 bg-black/50 backdrop-blur text-white">
                <div className="flex items-center gap-2">
                    <Shield className="text-green-500" />
                    <span className="font-mono text-xl">Firewall Active</span>
                </div>
                <div className="font-mono text-xl">Score: {score}</div>
                <div className="font-mono text-xl text-red-400">Time: {timeLeft}s</div>
            </div>

            {/* Game Area */}
            {!gameOver ? (
                <div className="relative w-full h-full">
                    {packets.map(packet => (
                        <button
                            key={packet.id}
                            onClick={() => handlePacketClick(packet.id, packet.type)}
                            className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${packet.type === 'malicious' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]'}`}
                            style={{ left: `${packet.x}%`, top: `${packet.y}%` }}
                        >
                            {packet.type === 'malicious' ? <AlertTriangle className="text-white w-6 h-6" /> : <CheckCircle2 className="text-white w-6 h-6" />}
                        </button>
                    ))}

                    {/* Grid Lines for effect */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/80">
                    <h2 className="text-4xl font-bold text-white mb-4">Simulation Complete</h2>
                    <p className="text-2xl text-primary mb-8">Final Score: {score}</p>
                    <Button onClick={() => onComplete(score)} size="lg">Return to Base</Button>
                </div>
            )}
        </div>
    )
}
