"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Network, ShieldCheck, Activity, Globe } from "lucide-react"

export default function NetworkSimGame({ onComplete }: { onComplete: (score: number) => void }) {
    // Simplified Logic for Speed
    const [score, setScore] = useState(0)
    const [nodes, setNodes] = useState<{ id: number, type: "server" | "firewall" | "pc", status: "online" | "ddos" | "secure" }[]>([
        { id: 1, type: "server", status: "online" },
        { id: 2, type: "firewall", status: "online" },
        { id: 3, type: "pc", status: "online" },
        { id: 4, type: "pc", status: "online" }
    ])
    const [wave, setWave] = useState(1)

    useEffect(() => {
        const attackInterval = setInterval(() => {
            const targetId = Math.floor(Math.random() * 4) + 1
            setNodes(prev => prev.map(n => {
                if (n.id === targetId && n.status !== "secure") {
                    return { ...n, status: "ddos" }
                }
                return n
            }))
        }, 2000 - (wave * 200))
        return () => clearInterval(attackInterval)
    }, [wave])

    const handleMitigate = (id: number) => {
        setNodes(prev => prev.map(n => {
            if (n.id === id) {
                if (n.status === "ddos") {
                    setScore(s => s + 50)
                    return { ...n, status: "secure" }
                }
            }
            return n
        }))

        // Reset secure after time
        setTimeout(() => {
            setNodes(prev => prev.map(n => n.id === id && n.status === "secure" ? { ...n, status: "online" } : n))
        }, 3000)
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-black text-green-500 font-mono rounded-xl border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <div className="flex justify-between mb-8 text-xl">
                <div>NET_DEFENSE_SYS_V1</div>
                <div>SCORE: {score}</div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 relative">
                {/* Visual Lines could be SVG, skipping for speed/simplicity */}

                {nodes.map(node => (
                    <div
                        key={node.id}
                        onClick={() => handleMitigate(node.id)}
                        className={`
                            h-32 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all
                            ${node.status === "ddos" ? "border-red-500 bg-red-900/20 animate-pulse" :
                                node.status === "secure" ? "border-blue-500 bg-blue-900/20" :
                                    "border-green-800 bg-green-900/10"}
                        `}
                    >
                        {node.type === 'server' && <Globe className="w-10 h-10 mb-2" />}
                        {node.type === 'firewall' && <ShieldCheck className="w-10 h-10 mb-2" />}
                        {node.type === 'pc' && <Activity className="w-10 h-10 mb-2" />}

                        <div className="text-xs">{node.type.toUpperCase()}_{node.id}</div>
                        <div className={`text-sm font-bold mt-1 ${node.status === "ddos" ? "text-red-500" :
                                node.status === "secure" ? "text-blue-500" : "text-green-500"
                            }`}>
                            [{node.status.toUpperCase()}]
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center text-sm text-green-800">
                CLICK NODES UNDER ATTACK TO MITIGATE
            </div>

            <Button onClick={() => onComplete(score)} className="w-full mt-6 bg-green-900/50 hover:bg-green-800 text-green-100 border border-green-700">
                TERMINATE SESSION
            </Button>
        </div>
    )
}
