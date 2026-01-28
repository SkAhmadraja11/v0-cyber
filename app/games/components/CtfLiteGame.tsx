"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Flag, Lock, Terminal, Hash, ChevronRight, Globe, Database, FileText, Folder } from "lucide-react"

export default function CtfLiteGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [level, setLevel] = useState(1)
    const [flag, setFlag] = useState("")
    const [score, setScore] = useState(0)
    const [logs, setLogs] = useState<string[]>([
        "> Initializing Cyber Range Environment...",
        "> Loading modules: NETWORK, CRYPTO, WEB",
        "> User authentication: GUEST",
        "> Ready."
    ])
    const scrollRef = useRef<HTMLDivElement>(null)

    const LEVELS = [
        {
            id: 1,
            title: "HTML_INSPECTOR",
            desc: "The developer left a secret flag in the comments of the login page.",
            simulatedBrowser: {
                url: "http://secure-bank.local/login",
                content: (
                    <div className="font-sans text-black p-4 bg-white h-full relative">
                        <div className="border border-gray-300 p-4 rounded max-w-sm mx-auto mt-10 shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-blue-600">Secure Login</h2>
                            <input className="block w-full border p-2 mb-2 rounded" placeholder="Username" />
                            <input className="block w-full border p-2 mb-4 rounded" type="password" placeholder="Password" />
                            <button className="bg-blue-600 text-white w-full py-2 rounded mb-2">Login</button>
                            {/* Hint for the user: They can 'view source' in the game by typing 'curl' or inspecting */}
                        </div>
                        <div className="absolute bottom-2 text-xs text-gray-400 w-full text-center">
                            {/* CTF{view_source_is_essential} */}
                            &copy; 2024 Secure Bank Inc.
                        </div>
                    </div>
                ),
                source: `
<html>
<head><title>Secure Login</title></head>
<body>
  <!-- TODO: Remove debug flag: CTF{view_source_is_essential} before prod -->
  <form action="/login" method="POST">
    ...
  </form>
</body>
</html>`
            },
            hint: "Try commands: 'curl http://secure-bank.local/login'",
            secret: "CTF{view_source_is_essential}",
            icon: Globe,
            commands: ["curl", "help"]
        },
        {
            id: 2,
            title: "SQL_INJECTION",
            desc: "Bypass the login screen. The database query looks like: SELECT * FROM users WHERE user = '$user'",
            simulatedBrowser: {
                url: "http://admin-portal.local/admin",
                content: (
                    <div className="flex flex-col items-center justify-center h-full bg-slate-100 text-slate-800">
                        <Database className="w-16 h-16 text-slate-400 mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Admin Portal</h1>
                        <p>Restricted Access</p>
                    </div>
                )
            },
            hint: "Username: admin' OR '1'='1",
            secret: "CTF{sql_injection_master}",
            challengeText: "Login Bypass Required",
            icon: Database,
            commands: ["sqlmap"]
        },
        {
            id: 3,
            title: "DIR_TRAVERSAL",
            desc: "The file server is vulnerable. Try to access /etc/passwd.",
            simulatedBrowser: {
                url: "http://file-server.local/files?path=images/logo.png",
                content: (
                    <div className="p-4 bg-white h-full font-mono text-xs">
                        Index of /files/images/
                        <ul>
                            <li>logo.png</li>
                            <li>banner.jpg</li>
                        </ul>
                    </div>
                )
            },
            hint: "Path: ../../../etc/passwd",
            secret: "CTF{paths_can_be_tricky}",
            icon: Folder,
            commands: ["ls", "cat"]
        },
        {
            id: 4,
            title: "BASE64_DECODE",
            desc: "We intercepted a secret string. Decode it.",
            challengeText: "Q1RGe2VuY29kaW5nX2lzX25vdF9lbmNyeXB0aW9ufQ==",
            hint: "Use the 'decode' command.",
            secret: "CTF{encoding_is_not_encryption}",
            icon: Hash,
            commands: ["decode"]
        }
    ]

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const addLog = (msg: string) => setLogs(p => [...p, `> ${msg}`])

    const handleCommand = (cmd: string) => {
        const parts = cmd.split(" ")
        const command = parts[0].toLowerCase()
        const current = LEVELS[level - 1]

        addLog(`$ ${cmd}`)

        switch (command) {
            case "help":
                addLog("Available commands: help, clear, submit [flag]")
                if (current.commands?.includes("curl")) addLog("curl [url] - Fetch page source")
                if (current.commands?.includes("decode")) addLog("decode [string] - Decode Base64")
                if (current.id === 2) addLog("Hint: Try entering the SQL payload in the Flag Input effectively bypassing the 'logic'. For this game, just submit the flag once you know the vulnerability.")
                break;
            case "clear":
                setLogs([])
                break;
            case "curl":
                if (current.id === 1) {
                    addLog("Fetching source code...")
                    setTimeout(() => {
                        addLog(current.simulatedBrowser?.source || "")
                    }, 500)
                } else {
                    addLog("Command not available for this level.")
                }
                break;
            case "decode":
                if (current.id === 4 && parts[1]) {
                    try {
                        const decoded = atob(parts[1])
                        addLog(`Decoded Output: ${decoded}`)
                    } catch {
                        addLog("Error: Invalid Base64 string")
                    }
                } else {
                    addLog("Usage: decode [base64_string]")
                }
                break;
            case "submit":
                if (parts[1] === current.secret) {
                    addLog("FLAG ACCEPTED. ACCESS GRANTED.")
                    setScore(s => s + 500)
                    setTimeout(() => {
                        if (level < LEVELS.length) {
                            setLevel(l => l + 1)
                            addLog(`Initializing Level ${level + 1}...`)
                        } else {
                            onComplete(score + 500)
                        }
                    }, 1000)
                } else {
                    addLog("FLAG REJECTED. INCORRECT.")
                }
                break;
            default:
                addLog(`Command not found: ${command}`)
        }
        setFlag("")
    }

    const current = LEVELS[level - 1]

    return (
        <div className="max-w-4xl mx-auto font-mono bg-black text-green-500 rounded-xl overflow-hidden shadow-2xl border-2 border-green-900 flex flex-col h-[600px]">
            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] pointer-events-none" />

            {/* Terminal Header */}
            <div className="bg-slate-900 p-3 flex items-center justify-between border-b border-green-900 text-xs z-10">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="opacity-50">root@kali-linux:~</div>
                <div className="font-bold text-green-400">SCORE: {score}</div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
                {/* Left Panel: Challenge Context */}
                <div className="border-r border-green-900 p-6 flex flex-col bg-slate-950/50">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-900/30 rounded">
                                <current.icon className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-wider">LEVEL {level}: {current.title}</h2>
                        </div>
                        <p className="text-green-300/80 text-sm leading-relaxed mb-4 border-l-2 border-green-700 pl-4">
                            {current.desc}
                        </p>
                    </div>

                    <div className="flex-1 bg-black border border-slate-800 rounded-lg overflow-hidden relative group">
                        <div className="absolute top-0 w-full bg-slate-800 text-[10px] text-slate-400 px-2 py-1 flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            {current.simulatedBrowser?.url || "Terminal View"}
                        </div>
                        <div className="mt-6 h-full p-2">
                            {current.simulatedBrowser ? current.simulatedBrowser.content : (
                                <div className="flex items-center justify-center h-full flex-col">
                                    <div className="text-4xl font-bold mb-4 opacity-20 select-none">DATA PACKET</div>
                                    <div className="bg-green-900/20 p-4 rounded text-center border border-green-500/30">
                                        {current.challengeText}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-green-600">
                        Hint: {current.hint}
                    </div>
                </div>

                {/* Right Panel: Interactive Terminal */}
                <div className="bg-black p-4 flex flex-col relative">
                    <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1 mb-4 scrollbar-thin scrollbar-thumb-green-900 pr-2" ref={scrollRef}>
                        {logs.map((log, i) => (
                            <div key={i} className="break-words animate-in fade-in duration-200">
                                {log}
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        <div className="flex items-center gap-2 bg-slate-900/50 border border-green-800 rounded px-2 py-2">
                            <ChevronRight className="w-4 h-4 text-green-500 animate-pulse" />
                            <input
                                className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-900"
                                autoFocus
                                placeholder="Type command (e.g., help, submit CTF{...})"
                                value={flag}
                                onChange={e => setFlag(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleCommand(flag)
                                }}
                            />
                        </div>
                        <div className="text-[10px] text-green-800 mt-2 text-right">
                            Powered by CyberRange v1.0
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
