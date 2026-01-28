"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wifi, Shield, Unlock, Car, Trophy, AlertTriangle, Radio, Navigation, Zap } from "lucide-react"

interface Network {
    x: number
    y: number
    type: "secure" | "open"
    ssid: string
    range: number
    detected: boolean
    channel: number
}

export default function WifiWarriorGame({ onComplete }: { onComplete: (score: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(90)
    const [gameState, setGameState] = useState<"start" | "playing" | "gameover" | "won">("start")
    const [networksFound, setNetworksFound] = useState(0)
    const [stealthMode, setStealthMode] = useState(false) // Toggle to avoid detection?

    // Game State Refs (for animation loop)
    const carPos = useRef({ x: 400, y: 300, angle: 0, speed: 0 })
    const networks = useRef<Network[]>([])
    const keys = useRef<Record<string, boolean>>({})

    // Initialize Game
    const startGame = () => {
        setGameState("playing")
        setScore(0)
        setTimeLeft(90)
        setNetworksFound(0)
        carPos.current = { x: 400, y: 300, angle: 0, speed: 0 }

        // Generate Random Networks
        const nets: Network[] = []
        for (let i = 0; i < 10; i++) {
            nets.push({
                x: Math.random() * 700 + 50,
                y: Math.random() * 500 + 50,
                type: Math.random() > 0.4 ? "secure" : "open",
                ssid: `NET_${Math.floor(Math.random() * 999)}`,
                range: 120, // Increased range
                detected: false,
                channel: Math.floor(Math.random() * 11) + 1
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
        let pulse = 0

        const update = () => {
            pulse += 0.05

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
                const dx = carPos.current.x - net.x
                const dy = carPos.current.y - net.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < net.range) {
                    // Auto-scan if close enough
                    if (!net.detected && !stealthMode) {
                        if (keys.current["Space"]) {
                            net.detected = true
                            if (net.type === "secure") {
                                setScore(s => s + 150)
                                setNetworksFound(n => n + 1)
                            } else {
                                setScore(s => Math.max(0, s - 50))
                            }
                        }
                    }
                }
            })

            // Win condition
            const remainingSecure = networks.current.filter(n => n.type === "secure" && !n.detected).length
            if (remainingSecure === 0 && networks.current.length > 0) {
                setGameState("won")
            }

            draw(ctx, pulse)
            animationFrameId = requestAnimationFrame(update)
        }

        const draw = (ctx: CanvasRenderingContext2D, pulse: number) => {
            // Background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
            gradient.addColorStop(0, "#0f172a")
            gradient.addColorStop(1, "#1e293b")
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Grid
            ctx.strokeStyle = "#334155"
            ctx.lineWidth = 1
            const gridSize = 50
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Draw Networks
            networks.current.forEach(net => {
                if (net.detected) {
                    ctx.fillStyle = net.type === "secure" ? "#22c55e" : "#ef4444"
                } else {
                    // Hidden networks are invisible unless scanned (or close?)
                    // Let's show faint signals
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.sin(pulse + net.x) * 0.02})`
                }

                if (net.detected || true) { // Always show pulsing range logic for gameplay clarity? No, hide undetectable.
                    // Actually, let's make them visible as 'Unknown Signals' first.
                    const dx = carPos.current.x - net.x
                    const dy = carPos.current.y - net.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const inRange = dist < net.range

                    if (inRange || net.detected) {
                        // Draw Signal Waves
                        ctx.beginPath()
                        ctx.arc(net.x, net.y, 40 + Math.sin(pulse * 2) * 5, 0, Math.PI * 2)
                        ctx.strokeStyle = net.detected ? (net.type === "secure" ? "#22c55e" : "#ef4444") : "#3b82f6"
                        ctx.lineWidth = 2
                        ctx.setLineDash(net.detected ? [] : [5, 5])
                        ctx.stroke()
                        ctx.setLineDash([])

                        // Icon / Text
                        ctx.font = "20px Arial"
                        ctx.textAlign = "center"
                        ctx.fillText(net.detected ? (net.type === "secure" ? "🔒" : "⚠️") : "❓", net.x, net.y + 7)

                        // SSID
                        if (net.detected) {
                            ctx.fillStyle = "white"
                            ctx.font = "10px monospace"
                            ctx.fillText(net.ssid, net.x, net.y + 25)
                            ctx.fillStyle = "#94a3b8"
                            ctx.fillText(`CH:${net.channel}`, net.x, net.y + 35)
                        } else if (inRange) {
                            ctx.fillStyle = "#3b82f6"
                            ctx.font = "10px monospace"
                            ctx.fillText("SIGNAL DETECTED", net.x, net.y + 25)
                            ctx.fillText("[SPACE] TO SCAN", net.x, net.y + 35)
                        }
                    }
                }
            })

            // Draw Car
            ctx.save()
            ctx.translate(carPos.current.x, carPos.current.y)
            ctx.rotate(carPos.current.angle)

            // Car Body
            ctx.fillStyle = "#3b82f6"
            ctx.shadowColor = "#3b82f6"
            ctx.shadowBlur = 10
            ctx.beginPath()
            ctx.roundRect(-15, -10, 30, 20, 5)
            ctx.fill()
            ctx.shadowBlur = 0

            // Roof
            ctx.fillStyle = "#1e40af"
            ctx.beginPath()
            ctx.roundRect(-8, -8, 16, 16, 3)
            ctx.fill()

            // Headlights
            ctx.fillStyle = "#facc15"
            ctx.shadowColor = "#facc15"
            ctx.shadowBlur = 15
            ctx.beginPath()
            ctx.rect(10, -8, 5, 4)
            ctx.rect(10, 4, 5, 4)
            ctx.fill()
            ctx.shadowBlur = 0

            // Scanning Cone (Visual only)
            const coneGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 120)
            coneGrad.addColorStop(0, "rgba(59, 130, 246, 0.2)")
            coneGrad.addColorStop(1, "rgba(59, 130, 246, 0)")
            ctx.fillStyle = coneGrad
            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.arc(0, 0, 120, -0.6, 0.6)
            ctx.fill()

            ctx.restore()
        }

        update()
        return () => cancelAnimationFrame(animationFrameId)
    }, [gameState])

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {gameState === "start" && (
                <Card className="p-8 text-center bg-background/95 backdrop-blur absolute inset-0 z-50 flex flex-col items-center justify-center m-auto max-w-lg h-fit border-2 border-primary shadow-2xl rounded-2xl">
                    <div className="bg-primary/20 p-6 rounded-full mb-6 animate-bounce">
                        <Car className="w-16 h-16 text-primary" />
                    </div>
                    <h2 className="text-4xl font-bold mb-2 tracking-tight">WiFi Warrior</h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                        Drive your War-Driving unit to map the city's networks.
                        <br />Identify <span className="text-green-500 font-bold">SECURE (Locked)</span> points.
                        <br />Ignore <span className="text-red-500 font-bold">OPEN (Unsecured)</span> traps.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-8 text-sm w-full">
                        <div className="bg-muted p-3 rounded-xl flex items-center justify-center gap-2 border">
                            <Navigation className="w-4 h-4" /> Use WASD to Drive
                        </div>
                        <div className="bg-muted p-3 rounded-xl flex items-center justify-center gap-2 border">
                            <Radio className="w-4 h-4" /> SPACE to Scan
                        </div>
                    </div>
                    <Button onClick={startGame} size="lg" className="w-full text-xl font-bold py-8 rounded-xl shadow-lg shadow-primary/20">
                        START ENGINE
                    </Button>
                </Card>
            )}

            {gameState === "gameover" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Card className="p-8 text-center space-y-4 animate-in zoom-in border-red-500 border-2 shadow-red-500/20 shadow-2xl bg-slate-950">
                        <AlertTriangle className="w-20 h-20 text-red-500 mx-auto animate-pulse" />
                        <h2 className="text-4xl font-bold text-red-500">Mission Failed</h2>
                        <p className="text-slate-400">Signal lost or security compromised.</p>
                        <p className="text-2xl font-mono text-white">Score: {score}</p>
                        <div className="flex gap-4 justify-center mt-4">
                            <Button onClick={startGame} variant="outline" size="lg">Retry Mission</Button>
                            <Button onClick={() => onComplete(score)} variant="destructive" size="lg">Abort</Button>
                        </div>
                    </Card>
                </div>
            )}

            {gameState === "won" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Card className="p-8 text-center space-y-4 animate-in zoom-in border-yellow-500 border-2 shadow-yellow-500/20 shadow-2xl bg-slate-950">
                        <Trophy className="w-20 h-20 text-yellow-400 mx-auto animate-[spin_3s_linear_infinite]" />
                        <h2 className="text-4xl font-bold text-yellow-400">All Zones Secured!</h2>
                        <p className="text-slate-400">Perfect mapping of the area completed.</p>
                        <p className="text-3xl font-mono text-white font-bold">Score: {score + timeLeft * 10}</p>
                        <Button onClick={() => onComplete(score + timeLeft * 10)} size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 w-full font-bold text-xl py-6 rounded-xl">
                            Claim Bounty
                        </Button>
                    </Card>
                </div>
            )}

            {/* HUD */}
            <div className="flex justify-between items-center bg-slate-900/90 text-white p-4 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Signal Intel</span>
                        <div className="flex items-center gap-2 text-green-400">
                            <Shield className="w-5 h-5" />
                            <span className="font-mono text-2xl font-bold">{score}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-slate-700" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Targets</span>
                        <div className="flex items-center gap-2 text-blue-400">
                            <Wifi className="w-5 h-5" />
                            <span className="font-mono text-2xl font-bold">{networksFound}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-mono">Scanner: ACTIVE</span>
                    </div>
                    <div className={`text-3xl font-black font-mono tracking-tighter ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white"}`}>
                        00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            <Card className="relative overflow-hidden border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-950 rounded-xl">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-auto cursor-crosshair block"
                />

                {/* Minimap Overlay (Simulated via CSS/HTML mostly for simplicity) */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-black/50 border border-slate-600 rounded-lg p-1 hidden md:block backdrop-blur-sm">
                    <div className="text-[8px] text-slate-400 mb-1 text-center font-mono">RADAR</div>
                    <div className="w-full h-full relative overflow-hidden rounded">
                        <div className="absolute inset-0 bg-green-500/10 animate-[spin_4s_linear_infinite]" style={{ clipPath: 'conic-gradient(transparent 180deg, rgba(34,197,94,0.5) 360deg)' }} />
                    </div>
                </div>
            </Card>

            <p className="text-center text-xs text-slate-500 mt-2 font-mono">
                [SYSTEM]: Use WASD to maneuver. SPACE to initiate handshake with local APs.
            </p>
        </div>
    )
}
