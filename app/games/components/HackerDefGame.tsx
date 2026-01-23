"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Skull, Zap, Laptop } from "lucide-react"

export default function HackerDefGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [grid, setGrid] = useState<("safe" | "hacker" | "patched")[]>(Array(9).fill("safe"))
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")

    useEffect(() => {
        if (gameState !== "playing") return

        // Spawn Hackers
        const spawner = setInterval(() => {
            setGrid(prev => {
                const next = [...prev]
                // Randomly spawn if slot is safe
                const emptyIndices = next.map((v, i) => v === "safe" ? i : -1).filter(i => i !== -1)
                if (emptyIndices.length > 0) {
                    const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
                    next[idx] = "hacker"
                }
                return next
            })
        }, 800)

        // Hacker Timeout (Unpatched hackers damage system)
        const damager = setInterval(() => {
            setGrid(prev => {
                return prev.map(cell => {
                    // If hacker stays too long, maybe reset? (Simplified: Just spawn logic above handles populating)
                    return cell
                })
            })
        }, 1000)

        const timer = setInterval(() => setTimeLeft(t => {
            if (t <= 1) {
                setGameState("gameover")
                return 0
            }
            return t - 1
        }), 1000)

        return () => {
            clearInterval(spawner)
            clearInterval(damager)
            clearInterval(timer)
        }
    }, [gameState])

    const handlePatch = (index: number) => {
        if (grid[index] === "hacker") {
            setScore(s => s + 100)
            const newGrid = [...grid]
            newGrid[index] = "patched"
            setGrid(newGrid)
            setTimeout(() => {
                setGrid(g => {
                    const n = [...g]
                    if (n[index] === "patched") n[index] = "safe"
                    return n
                })
            }, 500)
        } else if (grid[index] === "safe") {
            setScore(s => Math.max(0, s - 20))
        }
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in bg-slate-900 text-white rounded-xl border-2 border-primary">
                <Laptop className="w-20 h-20 text-blue-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">System Secured!</h2>
                <div className="text-2xl font-mono mb-8">Score: {score}</div>
                <Button onClick={() => onComplete(score)} size="lg" className="bg-primary hover:bg-primary/80">Finish</Button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto p-4 bg-slate-900 rounded-xl border-4 border-slate-700 shadow-2xl">
            <div className="flex justify-between text-white font-mono text-xl mb-4 px-2">
                <div>Score: {score}</div>
                <div className={timeLeft < 10 ? "text-red-500 animate-pulse" : ""}>{timeLeft}s</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {grid.map((cell, i) => (
                    <div
                        key={i}
                        onClick={() => handlePatch(i)}
                        className={`h-24 rounded-lg flex items-center justify-center cursor-pointer transition-all active:scale-95 border-b-4
                            ${cell === 'safe' ? 'bg-slate-800 border-slate-950' :
                                cell === 'hacker' ? 'bg-red-900 border-red-950 animate-bounce' :
                                    'bg-green-600 border-green-800'}
                        `}
                    >
                        {cell === "hacker" && <Skull className="w-12 h-12 text-white drop-shadow-lg" />}
                        {cell === "patched" && <Shield className="w-12 h-12 text-white animate-in zoom-in spin-in-12" />}
                        {cell === "safe" && <div className="w-2 h-2 rounded-full bg-slate-700" />}
                    </div>
                ))}
            </div>

            <p className="text-center text-slate-500 mt-4 font-mono text-sm">
                Tap the Hackers (Skulls) to Patch!
            </p>
        </div>
    )
}
