"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wifi, Shield, Unlock, Car, Trophy, AlertTriangle } from "lucide-react"

interface Network {
    x: number
    y: number
    type: "secure" | "open"
    ssid: string
    range: number
    detected: boolean
}

export default function WifiWarriorGame({ onComplete }: { onComplete: (score: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60)
    const [gameState, setGameState] = useState<"start" | "playing" | "gameover" | "won">("start")
    const [networksFound, setNetworksFound] = useState(0)

    // Game State Refs (for animation loop)
    const carPos = useRef({ x: 400, y: 300, angle: 0, speed: 0 })
    const networks = useRef<Network[]>([])
    const keys = useRef<Record<string, boolean>>({})

    // Initialize Game
    const startGame = () => {
        setGameState("playing")
        setScore(0)
        setTimeLeft(60)
        setNetworksFound(0)
        carPos.current = { x: 400, y: 300, angle: 0, speed: 0 }

        // Generate Random Networks
        const nets: Network[] = []
        for (let i = 0; i < 8; i++) {
            nets.push({
                x: Math.random() * 700 + 50,
                y: Math.random() * 500 + 50,
                type: Math.random() > 0.4 ? "secure" : "open",
                ssid: `NET_${Math.floor(Math.random() * 999)}`,
                range: 100,
                detected: false
            })
        }
        networks.current = nets
    }

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => keys.current[e.code] = true
        const handleKeyUp = (e: KeyboardEvent) => keys.current[e.code] = false

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
        }
    }, [])

    // Timer
    useEffect(() => {
        if (gameState !== "playing") return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState("gameover")
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [gameState])

    // Game Loop
    useEffect(() => {
        if (gameState !== "playing") return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        let animationFrameId: number

        const update = () => {
            // physics
            if (keys.current["ArrowUp"] || keys.current["KeyW"]) carPos.current.speed = Math.min(carPos.current.speed + 0.2, 5)
            else if (keys.current["ArrowDown"] || keys.current["KeyS"]) carPos.current.speed = Math.max(carPos.current.speed - 0.2, -3)
            else carPos.current.speed *= 0.95 // friction

            if (Math.abs(carPos.current.speed) > 0.1) {
                const turnSpeed = 0.05
                if (keys.current["ArrowLeft"] || keys.current["KeyA"]) carPos.current.angle -= turnSpeed
                if (keys.current["ArrowRight"] || keys.current["KeyD"]) carPos.current.angle += turnSpeed
            }

            carPos.current.x += Math.cos(carPos.current.angle) * carPos.current.speed
            carPos.current.y += Math.sin(carPos.current.angle) * carPos.current.speed

            // Boundaries
            if (carPos.current.x < 0) carPos.current.x = 0
            if (carPos.current.x > canvas.width) carPos.current.x = canvas.width
            if (carPos.current.y < 0) carPos.current.y = 0
            if (carPos.current.y > canvas.height) carPos.current.y = canvas.height

            // Net Detection
            networks.current.forEach(net => {
                if (net.detected) return
                const dx = carPos.current.x - net.x
                const dy = carPos.current.y - net.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < net.range) {
                    if (keys.current["Space"]) { // Scan/Connect action
                        net.detected = true
                        if (net.type === "secure") {
                            setScore(s => s + 150)
                            setNetworksFound(n => n + 1)
                        } else {
                            setScore(s => Math.max(0, s - 50)) // Penalty for open nets
                            // Visual feedback handled in draw
                        }
                    }
                }
            })

            // Win condition
            if (networks.current.filter(n => n.type === "secure" && !n.detected).length === 0) {
                setGameState("won")
            }

            draw()
            animationFrameId = requestAnimationFrame(update)
        }

        const draw = () => {
            // Background
            ctx.fillStyle = "#1a1a2e"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Grid
            ctx.strokeStyle = "#ffffff10"
            ctx.lineWidth = 1
            for (let i = 0; i < canvas.width; i += 50) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 50) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
            }

            // Draw Networks
            networks.current.forEach(net => {
                if (net.detected) {
                    ctx.fillStyle = net.type === "secure" ? "#22c55e" : "#ef4444"
                } else {
                    ctx.fillStyle = "#ffffff30"
                }

                // Signal Range Ring
                ctx.beginPath()
                ctx.arc(net.x, net.y, 40 + Math.sin(Date.now() / 200) * 5, 0, Math.PI * 2)
                ctx.strokeStyle = net.detected ? (net.type === "secure" ? "#22c55e" : "#ef4444") : "#3b82f6"
                ctx.lineWidth = 2
                ctx.setLineDash([5, 5])
                ctx.stroke()
                ctx.setLineDash([])

                // Icon placeholder
                ctx.font = "20px Arial"
                ctx.fillText(net.type === "secure" ? "🔒" : "⚠️", net.x - 10, net.y + 5)

                // Label
                ctx.fillStyle = "white"
                ctx.font = "12px monospace"
                ctx.fillText(net.ssid, net.x - 20, net.y + 30)
            })

            // Draw Car
            ctx.save()
            ctx.translate(carPos.current.x, carPos.current.y)
            ctx.rotate(carPos.current.angle)

            // Car Body
            ctx.fillStyle = "#3b82f6"
            ctx.fillRect(-20, -10, 40, 20)

            // Headlights
            ctx.fillStyle = "#fbbf24"
            ctx.shadowBlur = 20
            ctx.shadowColor = "#fbbf24"
            ctx.fillRect(15, -8, 5, 4)
            ctx.fillRect(15, 4, 5, 4)
            ctx.shadowBlur = 0

            // Scanner Beam
            ctx.fillStyle = "#3b82f620"
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, 100, -0.5, 0.5)
            ctx.fill()

            ctx.restore()
        }

        update()
        return () => cancelAnimationFrame(animationFrameId)
    }, [gameState])

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {gameState === "start" && (
                <Card className="p-8 text-center bg-background/95 backdrop-blur absolute inset-0 z-50 flex flex-col items-center justify-center m-auto max-w-lg h-fit border-2 border-primary">
                    <Car className="w-16 h-16 text-primary mb-4" />
                    <h2 className="text-3xl font-bold mb-2">WiFi Warrior</h2>
                    <p className="text-muted-foreground mb-6">
                        Drive your packet-sniffer car! Find all <span className="text-green-500 font-bold">SECURE (Locked)</span> networks.
                        <br />Avoid connecting to <span className="text-red-500 font-bold">OPEN (Unsecured)</span> networks.
                    </p>
                    <div className="flex gap-4 mb-6 text-sm">
                        <div className="bg-muted p-2 rounded">⬆️⬇️ Drive</div>
                        <div className="bg-muted p-2 rounded">⬅️➡️ Turn</div>
                        <div className="bg-muted p-2 rounded">SPACE Scan/Connect</div>
                    </div>
                    <Button onClick={startGame} size="lg" className="w-full text-lg">Start Engine</Button>
                </Card>
            )}

            {gameState === "gameover" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                    <Card className="p-8 text-center space-y-4 animate-in zoom-in">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                        <h2 className="text-3xl font-bold text-red-500">Signal Lost!</h2>
                        <p>Time's up or you connected to too many unsafe networks.</p>
                        <p className="text-xl font-mono">Final Score: {score}</p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={startGame} variant="outline">Try Again</Button>
                            <Button onClick={() => onComplete(score)} variant="destructive">Exit</Button>
                        </div>
                    </Card>
                </div>
            )}

            {gameState === "won" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                    <Card className="p-8 text-center space-y-4 animate-in zoom-in">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
                        <h2 className="text-3xl font-bold text-yellow-400">All Secure!</h2>
                        <p>You mapped all secure points safely.</p>
                        <p className="text-xl font-mono">Final Score: {score + timeLeft * 10}</p>
                        <Button onClick={() => onComplete(score + timeLeft * 10)} size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600">
                            Victory Lap
                        </Button>
                    </Card>
                </div>
            )}

            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        <span className="font-mono text-xl">{score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-blue-500" />
                        <span className="font-mono text-xl">{networksFound}/4</span> {/* Approximate target */}
                    </div>
                </div>
                <div className={`text-2xl font-bold font-mono ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-foreground"}`}>
                    00:{timeLeft.toString().padStart(2, '0')}
                </div>
            </div>

            <Card className="relative overflow-hidden border-2 border-primary/20 shadow-2xl bg-black">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-auto cursor-crosshair block"
                />
            </Card>

            <p className="text-center text-xs text-muted-foreground mt-2">
                Use Arrow Keys to Drive • SPACE to Connect/Scan
            </p>
        </div>
    )
}
