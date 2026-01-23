"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Flag, Lock, Terminal, Hash, ChevronRight } from "lucide-react"

export default function CtfLiteGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [level, setLevel] = useState(1)
    const [flag, setFlag] = useState("")
    const [score, setScore] = useState(0)
    const [logs, setLogs] = useState<string[]>(["> System Initialized..."])
    const scrollRef = useRef<HTMLDivElement>(null)

    const LEVELS = [
        {
            id: 1,
            title: "HTML_INSPECTOR",
            desc: "Target stores secrets in client-side comments.",
            hint: "Check the source code relative to the main element.",
            secret: "CTF{always_check_source}",
            icon: Terminal,
            simulatedCode: `
<!-- Navbar Structure -->
<nav class="secure-nav">...</nav>
<!-- TODO: Remove debug flag: CTF{always_check_source} -->
<main id="app-root">...</main>
            `
        },
        {
            id: 2,
            title: "ROT_CIPHER_DECODER",
            desc: "Intercepted transmission. Looks like a simple substitution.",
            hint: "ROT13: A <-> N",
            secret: "CTF{rotation_is_easy}",
            challengeText: "PGS{ebgngvba_vf_rnfl}",
            icon: Lock,
            info: "Substitution ciphers preserve letter frequency, making them vulnerable to frequency analysis."
        },
        {
            id: 3,
            title: "BASE64_DECODER",
            desc: "Found unexpected trailing '==' in auth token.",
            hint: "Base64 encoding is not encryption.",
            secret: "CTF{base64_is_not_encryption}",
            challengeText: "Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=",
            icon: Hash,
            info: "Base64 is used to encode binary data as text. It provides ZERO confidentiality."
        }
    ]

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const addLog = (msg: string) => setLogs(p => [...p, `> ${msg}`])

    const checkFlag = () => {
        addLog(`Verifying flag: ${flag}...`)
        setTimeout(() => {
            if (flag.trim() === LEVELS[level - 1].secret) {
                addLog(`ACCESS GRANTED. Flag correct.`)
                const nextLevel = level + 1
                setScore(s => s + 500)
                setFlag("")

                if (nextLevel > LEVELS.length) {
                    addLog("ALL LEVELS CLEAR. SYSTEM OWNED.")
                    setTimeout(() => onComplete(score + 500), 1000)
                } else {
                    setLevel(nextLevel)
                    addLog(`Initializing Level ${nextLevel}...`)
                }
            } else {
                addLog(`ACCESS DENIED. Incorrect flag.`)
            }
        }, 600)
    }

    const current = LEVELS[level - 1]

    return (
        <div className="max-w-3xl mx-auto font-mono bg-black text-green-500 rounded-lg overflow-hidden shadow-2xl border border-green-900">
            {/* Terminal Header */}
            <div className="bg-slate-900 p-2 flex items-center justify-between border-b border-green-900 text-xs">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div>user@cyber-range:~</div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel: Challenge */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">
                            <span className="text-green-500">./level_{level}</span>
                            {current.title}
                        </h2>
                        <p className="text-green-300 text-sm mb-4">{current.desc}</p>

                        <div className="bg-slate-900 border border-green-800 p-4 rounded text-sm relative">
                            {current.simulatedCode ? (
                                <pre className="whitespace-pre-wrap text-slate-300">{current.simulatedCode}</pre>
                            ) : (
                                <div className="text-center py-4">
                                    <div className="text-xs text-green-700 mb-1">INTERCEPTED_DATA</div>
                                    <div className="text-xl text-yellow-500 break-all select-all font-bold tracking-widest">
                                        {current.challengeText}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase text-green-700 font-bold">Flag Input</label>
                        <div className="flex bg-slate-900 border border-green-700 rounded p-1">
                            <span className="flex items-center pl-2 pr-1 text-green-500">
                                <ChevronRight className="w-4 h-4" />
                            </span>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-white font-mono placeholder:text-green-900"
                                placeholder="CTF{...}"
                                value={flag}
                                onChange={e => setFlag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && checkFlag()}
                            />
                            <button
                                onClick={checkFlag}
                                className="px-4 py-1 bg-green-900/40 text-green-400 hover:bg-green-700 hover:text-white transition-colors uppercase text-xs font-bold rounded"
                            >
                                Execute
                            </button>
                        </div>
                        <div className="flex justify-between text-xs mt-2">
                            <span className="text-green-800">Hint: {current.hint}</span>
                            <span className="text-green-500">Score: {score}</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Logs */}
                <div className="bg-slate-950 border border-green-900 rounded p-4 h-[300px] flex flex-col">
                    <div className="text-xs text-green-700 mb-2 border-b border-green-900 pb-1">SYSTEM_LOGS</div>
                    <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-green-900" ref={scrollRef}>
                        {logs.map((log, i) => (
                            <div key={i} className="text-xs animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-green-400 opacity-60">[{new Date().toLocaleTimeString()}]</span> {log}
                            </div>
                        ))}
                    </div>
                    {current.info && (
                        <div className="mt-2 text-xs text-blue-400 border-t border-blue-900/50 pt-2">
                            <span className="font-bold">INFO_BOT:</span> {current.info}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
