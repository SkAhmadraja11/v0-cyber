"use client"

import { useState, useEffect } from "react"
import { Shield, Globe, Lock, Activity, Wifi, Cpu, CheckCircle2 } from "lucide-react"

export default function LiveThreatTicker() {
    const [ip, setIp] = useState<string>("Scanning...")
    const [latency, setLatency] = useState<number>(0)
    const [systemInfo, setSystemInfo] = useState<string>("")
    const [securityStatus, setSecurityStatus] = useState<"SECURE" | "WARNING">("SECURE")
    const [logs, setLogs] = useState<string[]>([
        "Initializing secure handshake...",
        "Validating SSL certificates...",
        "Connection established via Port 443"
    ])

    useEffect(() => {
        // 1. Get Real IP
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setIp(data.ip))
            .catch(() => setIp("Unknown"))

        // 2. Detect System Info
        const ua = window.navigator.userAgent
        let os = "Unknown OS"
        if (ua.indexOf("Win") !== -1) os = "Windows"
        if (ua.indexOf("Mac") !== -1) os = "MacOS"
        if (ua.indexOf("Linux") !== -1) os = "Linux"
        if (ua.indexOf("Android") !== -1) os = "Android"
        if (ua.indexOf("iOS") !== -1) os = "iOS"
        setSystemInfo(`${os} / ${navigator.language}`)

        // 3. Measure Latency (Ping)
        const measureLatency = async () => {
            const start = performance.now()
            await fetch('/', { method: 'HEAD', cache: 'no-store' })
            const end = performance.now()
            setLatency(Math.round(end - start))
        }

        const eventPool = [
            "Analyzing incoming packets...",
            "Firewall rule check: PASS",
            "Encryption protocol: TLS 1.3",
            "Checking database integrity...",
            "Refreshing threat signatures...",
            "Heuristic engine: IDLE",
            "Sandbox environment: READY",
            "Geo-IP lookup: SUCCESS",
            "Latency check: 12ms optimal"
        ]

        const logInterval = setInterval(() => {
            setLogs(prev => {
                const nextLog = eventPool[Math.floor(Math.random() * eventPool.length)]
                const newLogs = [...prev, nextLog]
                if (newLogs.length > 3) return newLogs.slice(1)
                return newLogs
            })
        }, 3000)

        measureLatency()
        const interval = setInterval(measureLatency, 5000)
        return () => {
            clearInterval(interval)
            clearInterval(logInterval)
        }
    }, [])

    return (
        <div className="bg-slate-950/80 backdrop-blur-md border-b border-primary/20 text-[10px] sm:text-xs font-mono py-1 px-4 flex items-center justify-between h-12 overflow-hidden relative shadow-[0_0_20px_rgba(37,99,235,0.1)] z-50">
            {/* Left: System Status & IP */}
            <div className="flex items-center gap-4 text-muted-foreground shrink-0 z-10 pr-4">
                <div className="flex items-center gap-1.5 text-green-500">
                    <Shield className="w-3 h-3 fill-green-500/20" />
                    <span className="font-bold tracking-wider hidden sm:inline">SYS: {securityStatus}</span>
                    <span className="font-bold tracking-wider sm:hidden">OK</span>
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <div className="flex items-center gap-1.5 text-blue-400">
                    <Globe className="w-3 h-3" />
                    <span className="hidden sm:inline">IP:</span> <span>{ip}</span>
                </div>
            </div>

            {/* Center: Live Rolling Logs */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4">
                <div className="flex flex-col items-center">
                    {logs.map((log, i) => (
                        <div
                            key={`${log}-${i}`}
                            className={`transition-all duration-500 h-4 flex items-center gap-2 whitespace-nowrap
                                ${i === logs.length - 1 ? 'text-primary opacity-100' : 'text-slate-600 opacity-40'}
                            `}
                        >
                            <span className="text-[8px] opacity-30">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Protocol & Latency */}
            <div className="flex items-center gap-4 text-slate-500 shrink-0 z-10 pl-4">
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-purple-500" />
                        <span>{systemInfo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wifi className={`w-3 h-3 ${latency < 100 ? 'text-green-500' : 'text-yellow-500'}`} />
                        <span>{latency}ms</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-green-500/80">
                    <span className="font-bold hidden sm:inline">SSL: ACTIVE</span>
                    <Lock className="w-3 h-3" />
                </div>
            </div>
        </div>
    )
}
