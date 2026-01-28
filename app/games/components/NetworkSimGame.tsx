"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Network, ShieldCheck, Activity, Globe, Server, Zap, ArrowUpCircle, AlertOctagon } from "lucide-react"

type NodeType = "firewall" | "ids" | "server" | "db"
type NodeStatus = "active" | "under_attack" | "offline"

interface GameNode {
    id: number
    type: NodeType
    level: number
    hp: number
    maxHp: number
    status: NodeStatus
    cost: number
    name: string
}

export default function NetworkSimGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(100)
    const [money, setMoney] = useState(250)
    const [wave, setWave] = useState(1)
    const [gameActive, setGameActive] = useState(true)

    // Initial Network Topology
    const [nodes, setNodes] = useState<GameNode[]>([
        { id: 1, type: "firewall", level: 1, hp: 100, maxHp: 100, status: "active", cost: 100, name: "FW-01" },
        { id: 2, type: "ids", level: 1, hp: 80, maxHp: 80, status: "active", cost: 150, name: "IDS-Alpha" },
        { id: 3, type: "server", level: 1, hp: 200, maxHp: 200, status: "active", cost: 200, name: "Web-Srv" },
        { id: 4, type: "db", level: 1, hp: 300, maxHp: 300, status: "active", cost: 300, name: "Data-Core" }
    ])

    const [logs, setLogs] = useState<string[]>(["> System Online. Waiting for traffic..."])

    // Attack Logic
    useEffect(() => {
        if (!gameActive) return

        const waveInterval = setInterval(() => {
            // Random attack vector
            const targetIndex = Math.floor(Math.random() * nodes.length)
            const attackDmg = 10 + (wave * 2)

            setNodes(prev => {
                const next = [...prev]
                const node = next[targetIndex]

                if (node.status !== "offline") {
                    // Defense calc
                    const defense = node.level * 5
                    const damage = Math.max(0, attackDmg - defense)

                    node.hp -= damage
                    node.status = "under_attack"

                    if (node.hp <= 0) {
                        node.status = "offline"
                        node.hp = 0
                        setLogs(l => [`CRITICAL: ${node.name} WENT OFFLINE!`, ...l.slice(0, 4)])
                    } else {
                        // Auto-heal chance based on level (simulated IDS response)
                    }

                    setTimeout(() => {
                        setNodes(curr => curr.map(n => n.id === node.id && n.status === "under_attack" ? { ...n, status: "active" } : n))
                    }, 500)
                }
                return next
            })
        }, 3000 / wave) // Faster attacks per wave

        // Passive Income
        const income = setInterval(() => {
            const activeNodes = nodes.filter(n => n.status === "active").length
            if (activeNodes === 0) {
                setGameActive(false) // Game Over
            }
            setMoney(m => m + (activeNodes * 2))
            setScore(s => s + (activeNodes * 1))
        }, 1000)

        // Wave progression
        const waveTimer = setInterval(() => {
            setWave(w => w < 10 ? w + 1 : w)
            setLogs(l => [`> Wave ${wave + 1} Incoming! Threat Level Rising.`, ...l.slice(0, 4)])
        }, 15000)

        return () => {
            clearInterval(waveInterval)
            clearInterval(income)
            clearInterval(waveTimer)
        }
    }, [gameActive, wave, nodes.length]) // Removed 'nodes' from dependency to prevent rapid loops, logic handled inside setters

    const upgradeNode = (id: number) => {
        setNodes(prev => {
            const next = [...prev]
            const node = next.find(n => n.id === id)
            if (node && money >= node.cost && node.level < 5) {
                setMoney(m => m - node.cost)
                node.level += 1
                node.maxHp += 50
                node.hp = node.maxHp // Heal on upgrade
                node.cost = Math.floor(node.cost * 1.5)
                setLogs(l => [`Upgraded ${node.name} to Lv.${node.level}`, ...l.slice(0, 4)])
            }
            return next
        })
    }

    const repairNode = (id: number) => {
        setNodes(prev => {
            const next = [...prev]
            const node = next.find(n => n.id === id)
            const repairCost = 50
            if (node && money >= repairCost && node.hp < node.maxHp) {
                setMoney(m => m - repairCost)
                node.hp = Math.min(node.hp + 50, node.maxHp)
                if (node.hp > 0 && node.status === "offline") node.status = "active"
                setLogs(l => [`Repaired ${node.name}`, ...l.slice(0, 4)])
            }
            return next
        })
    }

    if (!gameActive) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center animate-in zoom-in bg-slate-950 text-white rounded-xl border border-red-900 shadow-2xl">
                <AlertOctagon className="w-24 h-24 text-red-600 mb-6 animate-pulse" />
                <h2 className="text-4xl font-bold mb-2">NETWORK COLLAPSED</h2>
                <p className="text-slate-400 mb-6">Total Failure. All nodes offline.</p>
                <div className="text-5xl font-mono mb-8 font-bold text-red-500">{score}</div>
                <Button onClick={() => onComplete(score)} size="lg" className="bg-red-900 hover:bg-red-800">
                    Submit Incident Report
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-0 bg-slate-950 text-green-500 font-mono rounded-xl border border-green-900/50 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 p-4 flex justify-between items-center border-b border-green-900 z-10">
                <div className="flex items-center gap-4">
                    <Activity className="w-6 h-6 text-green-500 animate-pulse" />
                    <div>
                        <div className="text-xs text-green-800 uppercase font-bold tracking-wider">Network Status</div>
                        <div className="text-xl font-bold text-white tracking-widest">ONLINE</div>
                    </div>
                </div>

                <div className="flex gap-8">
                    <div>
                        <div className="text-xs text-green-800 uppercase font-bold">Threat Wave</div>
                        <div className="text-xl text-red-500 font-bold">{wave}/10</div>
                    </div>
                    <div>
                        <div className="text-xs text-green-800 uppercase font-bold">Budget (BTC)</div>
                        <div className="text-xl text-yellow-500 font-bold">{money}</div>
                    </div>
                    <div>
                        <div className="text-xs text-green-800 uppercase font-bold">Score</div>
                        <div className="text-xl text-blue-500 font-bold">{score}</div>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative p-8 flex items-center justify-center">
                {/* Connection Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0">
                    {/* Simply connecting nodes in a diamond shape for now */}
                    <line x1="25%" y1="50%" x2="50%" y2="25%" stroke="currentColor" strokeWidth="2" className="text-green-500" />
                    <line x1="50%" y1="25%" x2="75%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-green-500" />
                    <line x1="75%" y1="50%" x2="50%" y2="75%" stroke="currentColor" strokeWidth="2" className="text-green-500" />
                    <line x1="50%" y1="75%" x2="25%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-green-500" />
                </svg>

                {/* Nodes */}
                <div className="grid grid-cols-2 gap-x-32 gap-y-16 relative z-10 w-full max-w-2xl">
                    {nodes.map(node => (
                        <div key={node.id} className="relative group">
                            <div className={`
                                 w-full p-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 relative bg-slate-900
                                 ${node.status === "active" ? "border-green-600 shadow-[0_0_20px_rgba(34,197,94,0.2)]" :
                                    node.status === "under_attack" ? "border-red-500 bg-red-900/20 animate-shake" :
                                        "border-slate-700 bg-slate-800 opacity-50 grayscale"}
                             `}>
                                {node.type === "firewall" && <ShieldCheck className="w-10 h-10 text-blue-400" />}
                                {node.type === "ids" && <Activity className="w-10 h-10 text-yellow-400" />}
                                {node.type === "server" && <Server className="w-10 h-10 text-purple-400" />}
                                {node.type === "db" && <Globe className="w-10 h-10 text-cyan-400" />}

                                <div className="text-lg font-bold text-white">{node.name}</div>
                                <div className="text-xs font-mono text-green-400">Lv.{node.level}</div>

                                {/* HP Bar */}
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                                    <div
                                        className={`h-full transition-all duration-300 ${node.hp < node.maxHp * 0.3 ? "bg-red-500" : "bg-green-500"}`}
                                        style={{ width: `${(node.hp / node.maxHp) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Controls on Hover */}
                            <div className="absolute -bottom-14 left-0 w-full flex justify-between opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 h-10 text-[10px] bg-blue-900 hover:bg-blue-800 border border-blue-700 text-blue-100 flex flex-col leading-none py-1"
                                    onClick={() => upgradeNode(node.id)}
                                    disabled={money < node.cost || node.level >= 5}
                                >
                                    <ArrowUpCircle className="w-3 h-3 mb-1" />
                                    <span>UPG ${node.cost}</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 h-10 text-[10px] bg-green-900 hover:bg-green-800 border border-green-700 text-green-100 flex flex-col leading-none py-1"
                                    onClick={() => repairNode(node.id)}
                                    disabled={money < 50 || node.hp >= node.maxHp}
                                >
                                    <Zap className="w-3 h-3 mb-1" />
                                    <span>FIX $50</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logs Console */}
            <div className="h-32 bg-black border-t border-green-900 p-4 font-mono text-sm overflow-hidden flex flex-col-reverse">
                {logs.map((log, i) => (
                    <div key={i} className="text-green-500/80 mb-1">{log}</div>
                ))}
            </div>

            <Button onClick={() => onComplete(score)} className="absolute top-4 right-4 bg-red-900/50 hover:bg-red-800 text-red-100 border border-red-700 text-xs h-8">
                ABORT SIMULATION
            </Button>
        </div>
    )
}
