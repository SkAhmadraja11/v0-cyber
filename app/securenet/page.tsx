"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldX,
    Zap,
    ArrowLeft,
    Search,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    RefreshCcw,
    Activity,
    Lock,
    Globe,
    Code,
    Server,
    FileWarning,
    Wifi,
    X,
    Layers,
    Terminal,
    Cpu,
    Radar,
    Target,
    Eye,
    Mail,
    Key,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "critical" | "high" | "medium" | "low" | "info"

interface Finding {
    id: string
    title: string
    description: string
    severity: Severity
    cvss_score: number
    impact: string
    likelihood: string
    remediation: string
    references: string[]
    detected_at: string
    evidence: string
    category: string
}

interface ScanSummary {
    scanned_url: string
    final_url: string
    scan_date: string
    response_time_ms: number
    http_status: number
    total_findings: number
    severity_counts: {
        critical: number
        high: number
        medium: number
        low: number
        info: number
    }
    max_cvss: number
    overall_risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL"
    uses_https: boolean
}

type ScanPhase =
    | "idle"
    | "network"
    | "headers"
    | "content"
    | "ssl"
    | "paths"
    | "misc"
    | "dns"
    | "tls"
    | "ports"
    | "exploit"
    | "jsrender"
    | "report"
    | "complete"
    | "error"

interface LogEntry {
    ts: number
    type: "progress" | "warning" | "error" | "info" | "found"
    message: string
    phase?: string
}

// ─── Severity Config ──────────────────────────────────────────────────────────

const severityConfig: Record<
    Severity,
    { label: string; color: string; bg: string; border: string; icon: React.ElementType; ring: string }
> = {
    critical: {
        label: "Critical",
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        ring: "ring-red-500/40",
        icon: ShieldX,
    },
    high: {
        label: "High",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        ring: "ring-orange-500/40",
        icon: ShieldAlert,
    },
    medium: {
        label: "Medium",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        ring: "ring-yellow-500/40",
        icon: AlertTriangle,
    },
    low: {
        label: "Low",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        ring: "ring-blue-500/40",
        icon: AlertCircle,
    },
    info: {
        label: "Info",
        color: "text-slate-400",
        bg: "bg-slate-500/10",
        border: "border-slate-500/30",
        ring: "ring-slate-500/40",
        icon: Info,
    },
}

const riskColors: Record<string, { text: string; border: string; bg: string; glow: string }> = {
    CRITICAL: {
        text: "text-red-400",
        border: "border-red-500/50",
        bg: "bg-red-500/10",
        glow: "shadow-[0_0_40px_rgba(239,68,68,0.25)]",
    },
    HIGH: {
        text: "text-orange-400",
        border: "border-orange-500/50",
        bg: "bg-orange-500/10",
        glow: "shadow-[0_0_40px_rgba(249,115,22,0.25)]",
    },
    MEDIUM: {
        text: "text-yellow-400",
        border: "border-yellow-500/50",
        bg: "bg-yellow-500/10",
        glow: "shadow-[0_0_40px_rgba(234,179,8,0.2)]",
    },
    LOW: {
        text: "text-blue-400",
        border: "border-blue-500/50",
        bg: "bg-blue-500/10",
        glow: "shadow-[0_0_40px_rgba(59,130,246,0.2)]",
    },
    MINIMAL: {
        text: "text-emerald-400",
        border: "border-emerald-500/50",
        bg: "bg-emerald-500/10",
        glow: "shadow-[0_0_40px_rgba(16,185,129,0.2)]",
    },
}

const phaseLabels: Record<string, string> = {
    network: "Network Analysis",
    headers: "Header Inspection",
    content: "Content & JS Analysis",
    ssl: "SSL/TLS Inspection",
    paths: "Sensitive Path Probing",
    misc: "Miscellaneous Checks",
    dns: "DNS Security Analysis",
    tls: "TLS Certificate Inspection",
    ports: "Port Scanning",
    exploit: "Exploitation Testing",
    jsrender: "JS Rendering Analysis",
    report: "Generating Report",
}

const categoryIcons: Record<string, React.ElementType> = {
    "Security Headers": Shield,
    "SSL/TLS": Lock,
    "Exposed Sensitive Files": FileWarning,
    "Malicious JavaScript": Code,
    "Information Disclosure": Info,
    "CORS Misconfiguration": Globe,
    Cryptojacking: Cpu,
    "Malware Indicator": ShieldX,
    Clickjacking: Layers,
    "HTTP Misconfiguration": Server,
    "Attack Surface": ShieldAlert,
    "Suspicious Behavior": Activity,
    "Server Configuration": Terminal,
    "Performance & Availability": Wifi,
    "DNS Security": Mail,
    "TLS Certificate": Key,
    "Open Ports": Radar,
    "Injection Vulnerability": Target,
    "Client-Side Security": Eye,
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: Finding }) {
    const [expanded, setExpanded] = useState(false)
    const cfg = severityConfig[finding.severity]
    const SevIcon = cfg.icon
    const CatIcon = categoryIcons[finding.category] || Shield

    const cvssColor =
        finding.cvss_score >= 9
            ? "text-red-400"
            : finding.cvss_score >= 7
                ? "text-orange-400"
                : finding.cvss_score >= 4
                    ? "text-yellow-400"
                    : "text-blue-400"

    return (
        <div
            className={`rounded-xl border ${cfg.border} ${cfg.bg} transition-all duration-300 hover:scale-[1.005] overflow-hidden`}
        >
            {/* Header row */}
            <button
                onClick={() => setExpanded((e) => !e)}
                className="w-full flex items-center gap-3 p-4 text-left group"
                aria-expanded={expanded}
            >
                {/* Severity badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} border ${cfg.border} shrink-0`}>
                    <SevIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                </div>

                {/* CVSS score */}
                <span
                    className={`font-mono text-sm font-bold ${cvssColor} shrink-0 w-8 tabular-nums`}
                    title="CVSS Score"
                >
                    {finding.cvss_score.toFixed(1)}
                </span>

                {/* Title */}
                <span className="flex-1 font-semibold text-sm text-foreground/90 line-clamp-1 group-hover:text-foreground transition-colors">
                    {finding.title}
                </span>

                {/* Category pill */}
                <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 shrink-0">
                    <CatIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">{finding.category}</span>
                </div>

                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Expanded body */}
            {expanded && (
                <div className="px-4 pb-5 space-y-4 border-t border-white/5 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">{finding.description}</p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Impact */}
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-orange-400/80 uppercase tracking-widest flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Impact
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{finding.impact}</p>
                        </div>
                        {/* Likelihood */}
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-yellow-400/80 uppercase tracking-widest flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Likelihood
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{finding.likelihood}</p>
                        </div>
                    </div>

                    {/* Evidence */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-bold text-blue-400/80 uppercase tracking-widest flex items-center gap-1">
                            <Terminal className="w-3 h-3" /> Evidence
                        </div>
                        <pre className="text-xs font-mono bg-black/40 border border-white/10 rounded-lg p-3 text-slate-300 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                            {finding.evidence}
                        </pre>
                    </div>

                    {/* Remediation */}
                    <div className="space-y-1.5">
                        <div className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Remediation
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                            {finding.remediation}
                        </p>
                    </div>

                    {/* References */}
                    {finding.references.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="text-xs font-bold text-purple-400/80 uppercase tracking-widest flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> References
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {finding.references.map((ref, i) => (
                                    <a
                                        key={i}
                                        href={ref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md transition-colors hover:bg-primary/15"
                                    >
                                        <ExternalLink className="w-2.5 h-2.5" />
                                        {new URL(ref).hostname.replace("www.", "")}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/50 pt-1 border-t border-white/5">
                        <span>ID: {finding.id}</span>
                        <span>Detected: {new Date(finding.detected_at).toLocaleTimeString()}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

function ScannerTerminal({ logs }: { logs: LogEntry[] }) {
    const bottomRef = useRef<HTMLDivElement>(null)

    return (
        <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
            {/* Terminal header bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-muted-foreground/60 text-[10px] font-bold tracking-widest uppercase ml-2">
                    SecureNet Engine · Live Output
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400/70 text-[10px]">LIVE</span>
                </div>
            </div>

            {/* Log lines */}
            <div className="p-4 space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
                {logs.length === 0 && (
                    <div className="text-muted-foreground/30 italic">Waiting for scan to start...</div>
                )}
                {logs.map((log, i) => {
                    const colors: Record<string, string> = {
                        progress: "text-blue-400",
                        warning: "text-yellow-400",
                        error: "text-red-400",
                        info: "text-slate-400",
                        found: "text-emerald-400",
                    }
                    const prefixes: Record<string, string> = {
                        progress: "▸",
                        warning: "⚠",
                        error: "✗",
                        info: "ℹ",
                        found: "◆",
                    }
                    return (
                        <div key={i} className="flex gap-2 leading-relaxed group">
                            <span className="text-muted-foreground/30 shrink-0 tabular-nums">
                                {new Date(log.ts).toLocaleTimeString("en-US", { hour12: false })}
                            </span>
                            <span className={`shrink-0 ${colors[log.type] ?? "text-slate-400"}`}>
                                {prefixes[log.type] ?? "·"}
                            </span>
                            <span className={`${colors[log.type] ?? "text-slate-300"} leading-relaxed`}>
                                {log.message}
                            </span>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}

function PhaseTimeline({ activePhase }: { activePhase: ScanPhase }) {
    const phases: Array<{ key: ScanPhase; label: string; icon: React.ElementType }> = [
        { key: "network", label: "Network", icon: Wifi },
        { key: "headers", label: "Headers", icon: Shield },
        { key: "content", label: "Content", icon: Code },
        { key: "ssl", label: "SSL/TLS", icon: Lock },
        { key: "paths", label: "Paths", icon: FileWarning },
        { key: "misc", label: "Checks", icon: Server },
        { key: "dns", label: "DNS", icon: Mail },
        { key: "tls", label: "TLS Cert", icon: Key },
        { key: "ports", label: "Ports", icon: Radar },
        { key: "exploit", label: "Exploit", icon: Target },
        { key: "jsrender", label: "JS/CSR", icon: Eye },
        { key: "report", label: "Report", icon: Activity },
    ]

    const phaseOrder = phases.map((p) => p.key)
    const activeIdx = phaseOrder.indexOf(activePhase)

    return (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {phases.map((phase, i) => {
                const Icon = phase.icon
                const isDone = i < activeIdx
                const isActive = i === activeIdx
                return (
                    <div key={phase.key} className="flex items-center gap-1 shrink-0">
                        <div
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 ${isActive
                                ? "bg-primary/20 border border-primary/40 text-primary shadow-[0_0_12px_rgba(var(--primary),0.3)]"
                                : isDone
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : "bg-white/5 border border-white/5 text-muted-foreground/40"
                                }`}
                        >
                            {isDone ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                                <Icon className={`w-3 h-3 ${isActive ? "text-primary animate-pulse" : ""}`} />
                            )}
                            <span className="hidden sm:inline">{phase.label}</span>
                        </div>
                        {i < phases.length - 1 && (
                            <div
                                className={`w-3 h-px mx-0.5 transition-colors duration-500 ${isDone ? "bg-emerald-500/40" : "bg-white/10"
                                    }`}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function SummaryCard({ summary }: { summary: ScanSummary }) {
    const rc = riskColors[summary.overall_risk] ?? riskColors["MINIMAL"]
    const scorePercent = ((10 - summary.max_cvss) / 10) * 100

    return (
        <div
            className={`rounded-2xl border ${rc.border} ${rc.bg} ${rc.glow} p-6 transition-all duration-700 animate-in fade-in zoom-in-95`}
        >
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Risk gauge */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="relative w-28 h-28">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={
                                    summary.overall_risk === "CRITICAL"
                                        ? "#ef4444"
                                        : summary.overall_risk === "HIGH"
                                            ? "#f97316"
                                            : summary.overall_risk === "MEDIUM"
                                                ? "#eab308"
                                                : summary.overall_risk === "LOW"
                                                    ? "#3b82f6"
                                                    : "#10b981"
                                }
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${251.2}`}
                                strokeDashoffset={`${(scorePercent / 100) * 251.2}`}
                                className="transition-all duration-1000"
                                style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-2xl font-black ${rc.text}`}>{summary.max_cvss.toFixed(1)}</span>
                            <span className="text-[9px] text-muted-foreground font-bold uppercase">CVSS</span>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${rc.bg} border ${rc.border}`}>
                        <span className={`text-[11px] font-black tracking-widest uppercase ${rc.text}`}>
                            {summary.overall_risk} RISK
                        </span>
                    </div>
                </div>

                {/* Findings breakdown */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold text-foreground">Scan Complete</h3>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-bold">Finished</span>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 truncate">
                        <Globe className="w-3 h-3 inline mr-1" />
                        {summary.final_url}
                    </p>

                    {/* Severity grid */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {(
                            [
                                ["critical", "Critical", "bg-red-500/15", "text-red-400", "border-red-500/30"],
                                ["high", "High", "bg-orange-500/15", "text-orange-400", "border-orange-500/30"],
                                ["medium", "Medium", "bg-yellow-500/15", "text-yellow-400", "border-yellow-500/30"],
                                ["low", "Low", "bg-blue-500/15", "text-blue-400", "border-blue-500/30"],
                                ["info", "Info", "bg-slate-500/10", "text-slate-400", "border-slate-500/20"],
                            ] as const
                        ).map(([key, label, bg, text, border]) => (
                            <div
                                key={key}
                                className={`flex flex-col items-center p-2.5 rounded-xl ${bg} border ${border}`}
                            >
                                <span className={`text-xl font-black ${text}`}>
                                    {summary.severity_counts[key as keyof typeof summary.severity_counts]}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {summary.response_time_ms}ms response
                        </span>
                        <span className="flex items-center gap-1">
                            <Server className="w-3 h-3" />
                            HTTP {summary.http_status}
                        </span>
                        <span className={`flex items-center gap-1 ${summary.uses_https ? "text-emerald-400" : "text-red-400"}`}>
                            <Lock className="w-3 h-3" />
                            {summary.uses_https ? "HTTPS" : "HTTP (Insecure)"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {summary.total_findings} findings
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SecureNetPage() {
    const [url, setUrl] = useState("")
    const [phase, setPhase] = useState<ScanPhase>("idle")
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [findings, setFindings] = useState<Finding[]>([])
    const [summary, setSummary] = useState<ScanSummary | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all")
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const abortRef = useRef<AbortController | null>(null)

    const addLog = useCallback((entry: Omit<LogEntry, "ts">) => {
        setLogs((prev) => [...prev, { ...entry, ts: Date.now() }])
    }, [])

    const startScan = useCallback(async () => {
        if (!url.trim()) return
        if (abortRef.current) abortRef.current.abort()

        // Reset state
        setLogs([])
        setFindings([])
        setSummary(null)
        setError(null)
        setPhase("network")
        setFilterSeverity("all")
        setFilterCategory("all")

        const controller = new AbortController()
        abortRef.current = controller

        addLog({ type: "info", message: `Starting SecureNet scan against: ${url.trim()}` })
        addLog({ type: "info", message: "Validating target and checking for SSRF risks..." })

        try {
            const response = await fetch("/api/securenet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim() }),
                signal: controller.signal,
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: "Unknown error" }))
                setError(errData.error || `Request failed: HTTP ${response.status}`)
                setPhase("error")
                return
            }

            const reader = response.body?.getReader()
            if (!reader) throw new Error("No response stream available")

            const decoder = new TextDecoder()
            let buffer = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n\n")
                buffer = lines.pop() ?? ""

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue
                    try {
                        const event = JSON.parse(line.slice(6))

                        switch (event.type) {
                            case "start":
                                addLog({ type: "info", message: event.message })
                                break

                            case "progress":
                                setPhase(event.phase as ScanPhase)
                                addLog({
                                    type: "progress",
                                    phase: event.phase,
                                    message: `[${phaseLabels[event.phase] ?? event.phase}] ${event.message}`,
                                })
                                break

                            case "findings":
                                setFindings((prev) => [...prev, ...event.findings])
                                addLog({
                                    type: "found",
                                    message: `◆ Found ${event.findings.length} issue(s) in phase: ${event.phase}`,
                                })
                                event.findings.forEach((f: Finding) => {
                                    addLog({
                                        type: "found",
                                        message: `  [${f.severity.toUpperCase()}] CVSS:${f.cvss_score.toFixed(1)} — ${f.title}`,
                                    })
                                })
                                break

                            case "warning":
                                addLog({ type: "warning", message: event.message })
                                break

                            case "error":
                                setError(event.message)
                                setPhase("error")
                                addLog({ type: "error", message: event.message })
                                break

                            case "complete":
                                setSummary(event.summary)
                                setPhase("complete")
                                addLog({
                                    type: "info",
                                    message: `✓ Scan complete. Total findings: ${event.summary.total_findings} | Overall Risk: ${event.summary.overall_risk}`,
                                })
                                break
                        }
                    } catch {
                        /* skip malformed SSE frames */
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name === "AbortError") {
                addLog({ type: "warning", message: "Scan cancelled by user" })
                setPhase("idle")
            } else {
                const msg = (err as Error).message || "Unknown error"
                setError(msg)
                setPhase("error")
                addLog({ type: "error", message: `Fatal error: ${msg}` })
            }
        }
    }, [url, addLog])

    const cancelScan = () => {
        abortRef.current?.abort()
        setPhase("idle")
    }

    const isScanning = phase !== "idle" && phase !== "complete" && phase !== "error"

    // Filtered findings
    const filteredFindings = findings.filter((f) => {
        if (filterSeverity !== "all" && f.severity !== filterSeverity) return false
        if (filterCategory !== "all" && f.category !== filterCategory) return false
        return true
    })

    const categories = Array.from(new Set(findings.map((f) => f.category)))

    const severitySortOrder: Severity[] = ["critical", "high", "medium", "low", "info"]
    const sortedFindings = [...filteredFindings].sort(
        (a, b) => severitySortOrder.indexOf(a.severity) - severitySortOrder.indexOf(b.severity)
    )

    return (
        <div className="min-h-screen bg-background selection:bg-primary/30 relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/6 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]" />
            </div>
            <div className="fixed inset-0 bg-grid-pattern opacity-[0.08] pointer-events-none" />

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: logo + title */}
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-2">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    <span className="hidden sm:inline text-sm">Back</span>
                                </Button>
                            </Link>
                            <div className="w-px h-6 bg-border/50" />
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                    <ShieldAlert className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="font-black text-base text-foreground leading-none">
                                        Secure<span className="text-cyan-400">Net</span>
                                    </h1>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                        Vulnerability Engine
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Center: live status */}
                        {isScanning && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                                <span className="text-xs text-blue-400 font-bold">
                                    {phaseLabels[phase] ?? "Scanning"}...
                                </span>
                            </div>
                        )}

                        {/* Right: nav */}
                        <nav className="hidden md:flex items-center gap-2">
                            <Link href="/scanner">
                                <Button variant="ghost" size="sm" className="text-sm">
                                    <Zap className="w-4 h-4 mr-1.5" />
                                    Phishing Scanner
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">Dashboard</Button>
                            </Link>
                            <div className="w-px h-5 bg-border/50 mx-1" />
                            <UserNav />
                        </nav>
                        <div className="md:hidden flex items-center gap-2">
                            <UserNav />
                            <MobileNav />
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main ───────────────────────────────────────────────────────────── */}
            <main className="container mx-auto px-4 py-8 max-w-5xl">

                {/* ── Hero / Intro ──────────────────────────────────────────────────── */}
                {phase === "idle" && findings.length === 0 && (
                    <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                                Real-Time Vulnerability Engine
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight tracking-tight">
                            Enterprise{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                                Web Security
                            </span>{" "}
                            Scanner
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                            Live parallel scanning with CVSS-scored findings. Detects misconfigurations, exposed files,
                            JavaScript threats, SSL issues, and more — in real time.
                        </p>

                        {/* Feature chips */}
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                            {[
                                { icon: Shield, label: "Header Analysis" },
                                { icon: Lock, label: "SSL/TLS Inspection" },
                                { icon: Code, label: "JS Malware Detection" },
                                { icon: FileWarning, label: "Exposed Paths" },
                                { icon: Globe, label: "CORS Audit" },
                                { icon: ShieldX, label: "CVSS Scoring" },
                            ].map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                                >
                                    <Icon className="w-3 h-3" />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Scanner Input Card ────────────────────────────────────────────── */}
                <div className="glassmorphism rounded-2xl border border-white/10 p-6 mb-6 relative overflow-hidden">
                    {/* Decorative corner gradient */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

                    <div className="relative z-10">
                        <label
                            htmlFor="target-url"
                            className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-widest"
                        >
                            Target URL
                        </label>
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    id="target-url"
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !isScanning && startScan()}
                                    placeholder="https://example.com"
                                    disabled={isScanning}
                                    className="w-full h-12 pl-10 pr-4 bg-black/30 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground/40 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all disabled:opacity-50"
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>

                            {isScanning ? (
                                <Button
                                    onClick={cancelScan}
                                    variant="outline"
                                    className="h-12 px-5 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl transition-all shrink-0"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            ) : (
                                <Button
                                    onClick={startScan}
                                    disabled={!url.trim()}
                                    className="h-12 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Scan Now
                                </Button>
                            )}
                        </div>

                        {/* Safety notice */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] text-muted-foreground/60">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                                SSRF Protected
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                                Detection only — no exploitation
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                                Live parallel analysis
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                                CVSS-scored findings
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Error State ────────────────────────────────────────────────────── */}
                {phase === "error" && error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 mb-6 flex items-start gap-4 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                            <ShieldX className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-400 mb-1">Scan Failed</h3>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        <button
                            onClick={() => { setPhase("idle"); setError(null) }}
                            className="ml-auto text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── Scanning active: phase timeline + terminal ──────────────────── */}
                {(isScanning || logs.length > 0) && (
                    <div className="space-y-4 mb-6">
                        {/* Phase indicator */}
                        {isScanning && (
                            <div className="glassmorphism rounded-xl border border-white/10 p-4 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        Scan Progress
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <RefreshCcw className="w-3 h-3 text-primary animate-spin" />
                                        <span className="text-xs text-primary font-bold">
                                            {phaseLabels[phase] ?? phase}
                                        </span>
                                    </div>
                                </div>
                                <PhaseTimeline activePhase={phase} />
                            </div>
                        )}

                        {/* Terminal output */}
                        <ScannerTerminal logs={logs} />

                        {/* Live findings counter */}
                        {findings.length > 0 && isScanning && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span>
                                    <span className="font-bold text-foreground">{findings.length}</span> findings detected so far
                                    {findings.some((f) => f.severity === "critical") && (
                                        <span className="ml-2 text-xs font-bold text-red-400">
                                            including CRITICAL issues
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Results ────────────────────────────────────────────────────────── */}
                {findings.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary card */}
                        {summary && <SummaryCard summary={summary} />}

                        {/* Filters */}
                        <div className="glassmorphism rounded-xl border border-white/10 p-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        Filter by Severity
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(["all", "critical", "high", "medium", "low", "info"] as const).map((s) => {
                                            const count =
                                                s === "all"
                                                    ? findings.length
                                                    : findings.filter((f) => f.severity === s).length
                                            if (count === 0 && s !== "all") return null
                                            const cfg2 = s !== "all" ? severityConfig[s] : null
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => setFilterSeverity(s)}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${filterSeverity === s
                                                        ? s === "all"
                                                            ? "bg-primary/20 border border-primary/40 text-primary"
                                                            : `${cfg2?.bg} border ${cfg2?.border} ${cfg2?.color}`
                                                        : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                                                        }`}
                                                >
                                                    {s} ({count})
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {categories.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">
                                            Category
                                        </span>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className="text-xs bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                                        >
                                            <option value="all">All Categories ({findings.length})</option>
                                            {categories.map((c) => (
                                                <option key={c} value={c}>
                                                    {c} ({findings.filter((f) => f.category === c).length})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Findings list */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                    Vulnerability Findings
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-foreground/80 text-xs font-bold">
                                        {sortedFindings.length}
                                    </span>
                                </h2>
                                {sortedFindings.length < findings.length && (
                                    <span className="text-xs text-muted-foreground">
                                        Showing {sortedFindings.length} of {findings.length}
                                    </span>
                                )}
                            </div>

                            {sortedFindings.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No findings match the selected filters.
                                </div>
                            ) : (
                                sortedFindings.map((f) => <FindingCard key={f.id} finding={f} />)
                            )}
                        </div>

                        {/* No findings positive result */}
                        {phase === "complete" && findings.length === 0 && (
                            <div className="text-center py-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-emerald-400 mb-2">No Issues Found</h3>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                    The scan completed without detecting any vulnerability indicators. This does not guarantee
                                    the site is perfectly secure — manual penetration testing is always recommended.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* No findings positive state (scan done, nothing found) */}
                {phase === "complete" && findings.length === 0 && summary && (
                    <div className="mt-6 text-center py-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 animate-in fade-in duration-500">
                        <ShieldCheck className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-emerald-400 mb-2">Clean Bill of Health</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            No detectable vulnerabilities found in {summary.total_findings === 0 ? "this" : "remaining"} checks. Manual review is still recommended.
                        </p>
                    </div>
                )}

                {/* ── Idle info cards ────────────────────────────────────────────────── */}
                {phase === "idle" && findings.length === 0 && (
                    <div className="grid md:grid-cols-3 gap-4 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {[
                            {
                                icon: ShieldAlert,
                                color: "text-cyan-400",
                                bg: "bg-cyan-500/10",
                                border: "border-cyan-500/20",
                                title: "10+ Active Checks",
                                desc: "Headers, SSL/TLS, JS analysis, exposed files, CORS, clickjacking, HTTP methods, and more.",
                            },
                            {
                                icon: Zap,
                                color: "text-yellow-400",
                                bg: "bg-yellow-500/10",
                                border: "border-yellow-500/20",
                                title: "Parallel Streaming",
                                desc: "All scanning modules run concurrently. Findings stream to your screen in real time as they're detected.",
                            },
                            {
                                icon: Activity,
                                color: "text-purple-400",
                                bg: "bg-purple-500/10",
                                border: "border-purple-500/20",
                                title: "CVSS-Based Scoring",
                                desc: "Every finding is scored using industry-standard CVSS methodology with exploitation context.",
                            },
                        ].map(({ icon: Icon, color, bg, border, title, desc }) => (
                            <div
                                key={title}
                                className={`glassmorphism rounded-xl border ${border} p-5 hover:scale-[1.02] transition-all duration-300`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <h3 className="font-bold text-foreground mb-1.5 text-sm">{title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── New Scan CTA after complete ──────────────────────────────────── */}
                {phase === "complete" && (
                    <div className="mt-6 flex justify-center">
                        <Button
                            onClick={() => {
                                setPhase("idle")
                                setFindings([])
                                setSummary(null)
                                setLogs([])
                                setError(null)
                                setUrl("")
                            }}
                            variant="outline"
                            className="border-white/20 hover:border-primary/40 hover:bg-primary/10 transition-all"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Start New Scan
                        </Button>
                    </div>
                )}
            </main>

            {/* ── Footer strip ──────────────────────────────────────────────────── */}
            <footer className="border-t border-border/30 mt-16 py-6">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/50">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>SecureNet · Powered by PhishGuard AI</span>
                    </div>
                    <span>Ethical use only. Detection only — no exploitation.</span>
                </div>
            </footer>
        </div>
    )
}
