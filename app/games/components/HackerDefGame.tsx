"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Skull, Zap, Laptop, Bug, Ghost, ShieldAlert } from "lucide-react"

type EnemyType = "kiddie" | "botnet" | "apt" | "worm"
type CellState = "empty" | "patched" | EnemyType

export default function HackerDefGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [timeLeft, setTimeLeft] = useState(45)
    const [grid, setGrid] = useState<CellState[]>(Array(9).fill("empty"))
    const [gameState, setGameState] = useState<"playing" | "gameover">("playing")
    const [combo, setCombo] = useState(0)
    const [charge, setCharge] = useState(0) // Ultimate charge

    // Spawning Logic
    useEffect(() => {
        if (gameState !== "playing") return

        const spawnRate = Math.max(400, 1000 - (score / 5)) // Gets faster
        const spawner = setInterval(() => {
            setGrid(prev => {
                const next = [...prev]
                const emptyIndices = next.map((v, i) => v === "empty" ? i : -1).filter(i => i !== -1)

                if (emptyIndices.length > 0) {
                    // Decide enemy type based on score
                    const rand = Math.random()
                    let type: EnemyType = "kiddie"
                    if (score > 500 && rand > 0.7) type = "botnet"
                    if (score > 1000 && rand > 0.85) type = "apt"
                    if (score > 1500 && rand > 0.95) type = "worm"

                    const idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
                    next[idx] = type
                }
                return next
            })
        }, spawnRate)

        // Damage Logic (Enemies attacking)
        const damager = setInterval(() => {
            setGrid(prev => {
                let damageTaken = 0
                const next = prev.map(cell => {
                    if (cell !== "empty" && cell !== "patched") {
                        // 20% chance for an enemy to deal damage per second if left alive
                        if (Math.random() > 0.8) {
                            damageTaken++
                            return "empty" // Despawn after hit? Or stay? Let's despawn to be fair.
                        }
                    }
                    return cell
                })

                if (damageTaken > 0) {
                    setLives(l => {
                        const newL = l - damageTaken
                        if (newL <= 0) setGameState("gameover")
                        setCombo(0)
                        return Math.max(0, newL)
                    })
                }
                return next
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
    }, [gameState, score])

    const handleHit = (index: number) => {
        const type = grid[index]
        if (type === "empty" || type === "patched") {
            setScore(s => Math.max(0, s - 50))
            setCombo(0)
            return
        }

        // Hit logic
        let points = 100
        if (type === "botnet") points = 150
        if (type === "apt") points = 300
        if (type === "worm") points = 500

        setScore(s => s + points + (combo * 10))
        setCombo(c => c + 1)
        setCharge(c => Math.min(c + 15, 100))

        const newGrid = [...grid]
        newGrid[index] = "patched"
        setGrid(newGrid)

        setTimeout(() => {
            setGrid(g => {
                const n = [...g]
                if (n[index] === "patched") n[index] = "empty"
                return n
            })
        }, 300)
    }

    const useUltimate = () => {
        if (charge < 100) return
        setCharge(0)
        setGrid(prev => prev.map(c => (c !== "empty" && c !== "patched") ? "patched" : c))
        setScore(s => s + 500)
        // Bonus time
        setTimeLeft(t => t + 5)
    }

    if (gameState === "gameover") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in zoom-in bg-slate-950 text-white rounded-xl border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0)_49.9%,rgba(255,255,255,0.1)_50%,rgba(0,0,0,0)_50.1%)] pointer-events-none" />
                <Laptop className="w-24 h-24 text-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <h2 className="text-4xl font-bold mb-2">SYSTEM SECURED</h2>
                <p className="text-slate-400 mb-6">Threats Neutralized</p>
                <div className="text-5xl font-mono mb-8 font-bold text-blue-400 drop-shadow-md">{score}</div>
                <Button onClick={() => onComplete(score)} size="lg" className="bg-blue-600 hover:bg-blue-500 text-lg px-8 py-6 rounded-full shadow-lg shadow-blue-500/20">
                    Return to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-slate-950 rounded-[2rem] border-8 border-slate-800 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[length:30px_30px]" />

            {/* HUD */}
            <div className="relative z-10 flex justify-between items-center mb-6">
                <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Integrity</div>
                    <div className="flex text-red-500">
                        {[...Array(3)].map((_, i) => (
                            <Shield key={i} className={`w-5 h-5 ${i < lives ? "fill-red-500 text-red-500" : "text-slate-800"}`} />
                        ))}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-white leading-none">{timeLeft}</div>
                    <div className="text-xs text-slate-500 uppercase">Seconds</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Score</div>
                    <div className="text-xl font-bold text-blue-400">{score}</div>
                </div>
            </div>

            {/* Grid */}
            <div className="relative z-10 grid grid-cols-3 gap-4 flex-1 content-center justify-items-center">
                {grid.map((cell, i) => (
                    <button
                        key={i}
                        onClick={() => handleHit(i)}
                        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                        className={`
                            relative w-24 h-28 flex items-center justify-center transition-all duration-100 active:scale-90
                            ${cell === 'empty' ? 'bg-slate-900/80 border-0 hover:bg-slate-800' :
                                cell === 'patched' ? 'bg-green-500 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.5)]' :
                                    'bg-slate-800 shadow-lg'}
                            ${cell === 'empty' ? 'before:absolute before:inset-1 before:bg-slate-950 before:block before:z-[-1]' : ''}
                            
                            ${cell === 'kiddie' ? 'bg-gradient-to-br from-yellow-900 to-slate-900 border-yellow-500' : ''}
                            ${cell === 'botnet' ? 'bg-gradient-to-br from-orange-900 to-slate-900 border-orange-500' : ''}
                            ${cell === 'apt' ? 'bg-gradient-to-br from-red-900 to-slate-900 border-red-600' : ''}
                        `}
                    >
                        {/* Enemy Icons */}
                        {cell === "kiddie" && <Bug className="w-10 h-10 text-yellow-500 animate-bounce" />}
                        {cell === "botnet" && <Ghost className="w-10 h-10 text-orange-500 animate-pulse" />}
                        {cell === "apt" && <Skull className="w-12 h-12 text-red-600 animate-[spin_1s_linear_infinite]" />}
                        {cell === "worm" && <div className="text-3xl animate-pulse">🐛</div>}

                        {cell === "patched" && <ShieldAlert className="w-12 h-12 text-white animate-in zoom-in spin-in-90 duration-300" />}
                    </button>
                ))}
            </div>

            {/* Ultimate Bar */}
            <div className="relative z-10 mt-6">
                <div className="flex justify-between text-xs text-blue-300 font-bold mb-1 uppercase tracking-wider">
                    <span>Overcharge</span>
                    <span>{charge}%</span>
                </div>
                <div
                    className={`h-12 w-full rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${charge >= 100 ? "bg-blue-600 border-blue-400 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.6)] animate-pulse" : "bg-slate-900 border-slate-800 cursor-not-allowed"}`}
                    onClick={useUltimate}
                >
                    {charge >= 100 ? (
                        <span className="flex items-center gap-2 font-bold text-white tracking-widest text-lg">
                            <Zap className="fill-white" /> DEPLOY COUNTERMEASURES
                        </span>
                    ) : (
                        <div className="absolute left-0 top-0 h-full bg-blue-900/30 rounded-xl transition-all duration-300" style={{ width: `${charge}%` }} />
                    )}
                </div>
            </div>

            <div className="text-center mt-2 h-4 text-xs font-bold text-yellow-500">
                {combo > 1 ? `${combo}x COMBO!` : ""}
            </div>
        </div>
    )
}
