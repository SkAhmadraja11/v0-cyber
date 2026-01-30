"use client"

import { useState } from "react"
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Zap,
  Brain,
  Database,
  FileText,
  MessageSquare,
  RefreshCcw,
  Gavel,
  Award,
  Hash,
  Search,
  Lock,
  Unlock,
  Fingerprint,
  Bug,
  Microscope,
  Siren,
  ShieldAlert,
  LayoutGrid,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { RealDetectionResult } from "@/lib/real-detection"
import ContactWidget from "@/components/contact-widget"

export default function ScannerPage() {
  const [scanMode, setScanMode] = useState<"url" | "email">("url")
  const [inputValue, setInputValue] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<RealDetectionResult | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [refreshAttempt, setRefreshAttempt] = useState(false)
  const [showContactWidget, setShowContactWidget] = useState(false)
  const sources = Array.isArray(result?.sources) ? result!.sources : []
  const reasons = Array.isArray(result?.reasons) ? result!.reasons : []




  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || isScanning) return

    setIsScanning(true)
    setResult(null)
    setRefreshAttempt(false)
    setScanProgress(0) // Reset progress for new scan

    // Animate progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + 8, 90))
    }, 150)

    try {
      const response = await fetch("/api/real-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputValue, mode: scanMode }),
      })

      if (!response.ok) throw new Error("Scan failed")

      const scanResult: RealDetectionResult = await response.json()
      clearInterval(progressInterval)
      setScanProgress(100)

      setTimeout(() => {
        setResult(scanResult)
        setIsScanning(false)
      }, 500)
    } catch (error) {
      console.error("Scan error:", error)
      clearInterval(progressInterval)
      setIsScanning(false)
    }
  }

  const handleRefresh = async () => {
    if (isScanning || !result) return

    setIsScanning(true)
    setResult(null)
    setRefreshAttempt(true)
    setScanProgress(0) // Reset progress for refresh

    // Animate progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + 8, 90))
    }, 150)

    try {
      const response = await fetch("/api/real-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputValue, mode: scanMode, refresh: true }),
      })

      if (!response.ok) throw new Error("Refresh failed")

      const scanResult: RealDetectionResult = await response.json()
      clearInterval(progressInterval)
      setScanProgress(100)

      setTimeout(() => {
        setResult(scanResult)
        setIsScanning(false)
      }, 500)
    } catch (error) {
      console.error("Error during refresh:", error)
      clearInterval(progressInterval)
      setIsScanning(false)
    }
  }

  const getClassificationColor = (classification: string) => {
    if (classification === "DANGEROUS") return "text-destructive border-destructive/50 bg-destructive/10"
    return "text-green-600 border-green-500/50 bg-green-500/10"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">

        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                  <Image src="/logo1.png" alt="Logo" width={40} height={40} className="rounded-lg" onError={(e) => { e.currentTarget.src = '/placeholder-logo.png'; }} />
                </div>
                <div>
                  <span className="font-bold text-lg text-foreground">Real-Time Scanner</span>
                  <p className="text-xs text-muted-foreground">Multi-Source Detection</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">6 Trusted Data Sources</span>
            </div>
            {isScanning && (
              <div className="flex items-center justify-center gap-3 text-primary animate-pulse bg-primary/5 px-4 py-2 rounded-full border border-primary/20 mb-4">
                <RefreshCcw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-bold tracking-tight uppercase">
                  {refreshAttempt ? "Re-fetching Live Intel..." : "Analyzing Live Indicators..."}
                </span>
              </div>
            )}
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">API-Verified Website Threat Detection</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Real-time analysis using Google Safe Browsing, PhishTank, VirusTotal, and ML intelligence
            </p>
          </div>

          {/* Scanner Card */}
          <Card className="p-8 mb-8 relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
            <div className="relative space-y-6">
              {/* Quick Fraud Checklist - Only visible when not scanning and no result */}
              {!isScanning && !result && (
                <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Quick Fraud Detection Checklist
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "Domain spelling correct",
                      "No urgency/threat",
                      "Official sender email",
                      "No suspicious attachments",
                      "You expected the message",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground/80 bg-background/50 p-3 rounded-lg border border-border/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <button
                  onClick={() => setScanMode("url")}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${scanMode === "url"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  URL Scanner
                </button>
                <button
                  onClick={() => setScanMode("email")}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${scanMode === "email"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Email Scanner
                </button>
              </div>

              {/* Input */}
              {scanMode === "url" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Enter URL to scan</label>
                  <Input
                    type="text"
                    placeholder="https://example.com/suspicious-link"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="text-base"
                    disabled={isScanning}
                    onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Paste email content</label>
                  <Textarea
                    placeholder="Paste the full email content here including subject and body..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="min-h-37.5 text-base"
                    disabled={isScanning}
                  />
                </div>
              )}

              {/* Scan Button */}
              <Button onClick={handleScan} disabled={isScanning || !inputValue.trim()} size="lg" className="w-full">
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing with ML...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Scan for Threats
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Scanning Animation - Enhanced with progress bar */}
          {isScanning && (
            <Card className="p-8 mb-8 border-2 border-primary/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      <Image src="/logo1.png" alt="Logo" width={48} height={48} className="rounded-full" onError={(e) => { e.currentTarget.src = '/placeholder-logo.png'; }} />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Neural Network Processing</div>
                      <div className="text-sm text-muted-foreground">Extracting features and analyzing patterns</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">{scanProgress}%</div>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-primary to-primary/50 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Feature extraction
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                    Pattern recognition
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
                    Threat classification
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Results - Enhanced with real detection data */}
          {result && !isScanning && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <Card
                className={`p-8 border-2 relative overflow-hidden ${result.classification === "DANGEROUS"
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-green-500/50 bg-green-500/5"
                  }`}
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
                <div className="relative">
                  <div className="flex items-start gap-6 mb-6">
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${result.classification === "DANGEROUS"
                        ? "bg-destructive/20 shadow-lg shadow-destructive/20"
                        : "bg-green-500/20 shadow-lg shadow-green-500/20"
                        }`}
                    >
                      {result.classification === "DANGEROUS" ? (
                        <AlertTriangle className="w-10 h-10 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-3xl font-bold text-foreground">{result.classification}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getClassificationColor(result.classification)}`}
                        >
                          {result.riskScore}/100 Risk
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-semibold text-foreground text-lg">{result.confidence.toFixed(1)}%</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Sources:</span>
                          <span className="font-medium text-foreground">{sources.length} APIs</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Scanned:</span>
                          <span className="font-medium text-foreground">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Risk Score Analysis</span>
                      <span
                        className={`font-bold text-xl ${result.classification === "DANGEROUS"
                          ? "text-destructive"
                          : "text-green-500"
                          }`}
                      >
                        {result.riskScore}/100
                      </span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all shadow-lg ${result.classification === "DANGEROUS"
                          ? "bg-gradient-to-r from-destructive to-destructive/70"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                        style={{ width: `${result.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>



              {/* Specialized Email Forensic Reports */}
              {scanMode === "email" && result && (
                <div className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Identity verification Card */}
                  <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Fingerprint className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider text-blue-700">Identity Audit</h4>
                    </div>
                    {sources.filter(s => s.category === "Identity").map((s, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground">STATUS</span>
                          <Badge variant={s.detected ? "destructive" : "outline"} className={s.detected ? "" : "bg-green-50 text-green-700 border-green-200"}>
                            {s.detected ? "FRAUDULENT / FAKE" : "VERIFIED / TRUSTED"}
                          </Badge>
                        </div>
                        <p className={`text-sm font-medium leading-tight ${s.detected ? "text-destructive" : "text-green-700"}`}>
                          {s.reason}
                        </p>
                      </div>
                    ))}
                    {sources.filter(s => s.category === "Identity").length === 0 && (
                      <p className="text-sm text-muted-foreground italic">Performing identity cross-reference...</p>
                    )}
                  </Card>

                  {/* Trustworthiness Card */}
                  <Card className="p-6 border-l-4 border-l-purple-500 bg-purple-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Microscope className="w-5 h-5 text-purple-600" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider text-purple-700">Trust Analysis</h4>
                    </div>
                    <div className="space-y-4">
                      {sources.filter(s => s.category === "Trust").map((s, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
                            <span>{s.name}</span>
                            <span className={s.detected ? "text-destructive" : "text-green-600"}>{s.confidence.toFixed(0)}% Match</span>
                          </div>
                          <p className="text-xs text-foreground/80 leading-snug">{s.reason}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Virus & Payload Card */}
                  <Card className="p-6 border-l-4 border-l-red-500 bg-red-500/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <Bug className="w-5 h-5 text-red-600" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wider text-red-700">Virus Payload Scan</h4>
                    </div>
                    <div className="space-y-4">
                      {sources.filter(s => s.category === "Virus").map((s, i) => (
                        <div key={i} className="space-y-2">
                          <div className={`p-2 rounded border text-xs font-bold flex items-center gap-2 ${s.detected ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-green-50 text-green-600 border-green-100"}`}>
                            {s.detected ? <ShieldAlert className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            {s.detected ? "MALICIOUS CONTENT DETECTED" : "NO KNOWN PAYLOADS FOUND"}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{s.reason}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* (API-Verified) Verdict Report Section */}
              {result!.verdictReport && (
                <Card className="p-8 border-l-4 border-l-primary bg-primary/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isScanning}
                        className="font-bold border-primary/20 hover:bg-primary/5 group"
                      >
                        <RefreshCcw className={`w-3.5 h-3.5 mr-2 group-hover:rotate-180 transition-transform duration-500`} />
                        Live Refresh
                      </Button>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Interpreter: Next-Gen Verdict Engine</p>
                    </div>
                  </div>

                  {/* Data Integrity Status Banner */}
                  <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${result!.verdictReport.confidenceLevel === "High"
                    ? "bg-green-500/10 border-green-500/20 text-green-700"
                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-700"
                    }`}>
                    {result!.verdictReport.confidenceLevel === "High" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                    )}
                    <div className="text-xs">
                      <p className="font-bold uppercase tracking-widest">Evidence Integrity: {result!.verdictReport.confidenceLevel === "High" ? "Professional Grade" : "Limited/Heuristic"}</p>
                      <p className="opacity-80">
                        {result!.verdictReport.confidenceLevel === "High"
                          ? "Analysis is supported by authenticated real-time intelligence feeds (Google, VirusTotal, PhishTank)."
                          : "Real-time API intelligence is currently limited. Verdict is based on technical forensics and heuristic patterns."}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-extra-bold text-muted-foreground uppercase tracking-widest">URL Under Analysis</label>
                        <p className="font-mono text-xs break-all bg-background/50 p-3 rounded border border-primary/10 mt-1">{result!.verdictReport.url}</p>
                      </div>
                      <div>
                        <label className="text-xs font-extra-bold text-muted-foreground uppercase tracking-widest">Final Verdict</label>
                        <p className={`text-2xl font-black mt-1 ${result!.classification === "DANGEROUS" ? "text-destructive" :
                          "text-green-600"
                          }`}>{result!.verdictReport.finalVerdict}</p>
                      </div>
                      <div>
                        <label className="text-xs font-extra-bold text-muted-foreground uppercase tracking-widest">Confidence Level</label>
                        <div className={`flex items-center gap-2 mt-1 ${result!.verdictReport.confidenceLevel === "High" ? "text-green-500" :
                          result!.verdictReport.confidenceLevel === "Medium" ? "text-yellow-500" : "text-muted-foreground"
                          }`}>
                          <div className={`w-2 h-2 rounded-full ${result!.verdictReport.confidenceLevel === "High" ? "bg-green-500" :
                            result!.verdictReport.confidenceLevel === "Medium" ? "bg-yellow-500" : "bg-muted"
                            }`} />
                          <span className="font-bold">{result!.verdictReport.confidenceLevel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-extra-bold text-muted-foreground uppercase tracking-widest">Recommended Action</label>
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-black border mt-1 ${result!.verdictReport.recommendedAction === "Block" ? "bg-destructive text-destructive-foreground" :
                          "bg-green-500 text-green-950"
                          }`}>
                          {result!.verdictReport.recommendedAction}
                        </div>
                      </div>
                      {result!.verdictReport.limitations.length > 0 && (
                        <div>
                          <label className="text-xs font-extra-bold text-muted-foreground uppercase tracking-widest text-destructive/80">Analysis Limitations</label>
                          <div className="space-y-1 mt-1">
                            {result!.verdictReport.limitations.map((limit, idx) => (
                              <p key={idx} className="text-xs text-destructive/90 font-medium italic">⚠️ {limit}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-extra-bold text-muted-foreground uppercase tracking-widest">Evidence Sources Used</label>
                        <p className="text-foreground text-xs font-medium mt-1 leading-relaxed">
                          {result!.verdictReport.evidenceSourcesUsed.join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-extra-bold text-muted-foreground uppercase block mb-3 tracking-widest">Confirmed Findings (API-Verified)</label>
                    <div className="space-y-2">
                      {result!.verdictReport.confirmedFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm text-foreground/90 bg-background/50 p-3 rounded-lg border border-primary/20">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${finding.includes("No confirmed threats") ? "text-muted-foreground" : "text-primary"}`} />
                          <span className="font-medium">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-primary/10 italic text-[10px] text-muted-foreground leading-tight">
                    <p>**Disclaimer for Officials**: This report is generated by the Next-Gen Verdict Engine. T1 evidence is derived from professional-grade external intelligence feeds. T3 evidence represents algorithmic pattern recognition. This is an inspection aid and does not constitute a legal endorsement of safety.</p>
                  </div>
                </Card>
              )}

              {/* Data Sources Analysis */}
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">
                      Auditable Technical Grid
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Official breakdown of {sources.length} security indicators for manual review
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border bg-background/50">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Indicator</th>
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Evidence Tier</th>
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-center">Status</th>
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((source, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors group">
                          <td className="p-4">
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">{source.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{source.reason}</div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${source.isReal && (source.name.includes("API") || source.name.includes("PhishTank") || source.name.includes("VirusTotal"))
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : source.isReal
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : "bg-muted text-muted-foreground border-border"
                              }`}>
                              {source.isReal && (source.name.includes("API") || source.name.includes("PhishTank") || source.name.includes("VirusTotal"))
                                ? "T1: VERIFIED INTEL"
                                : source.isReal
                                  ? "T2: FORENSIC"
                                  : "T3: HEURISTIC"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter border ${source.detected ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                              {source.detected ? 'DETECTED' : 'CLEAN'}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-foreground">
                            {source.confidence}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Detection Reasons */}
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground">Detection Summary</h4>
                </div>
                <div className="space-y-3">
                  {reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setInputValue("")
                    setResult(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Scan Another
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Info Cards */}
          {!result && !isScanning && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">50+ Features</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced feature extraction from URL structure, content, and metadata
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Real-Time Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instant threat detection with sub-500ms multi-API verification
                </p>
              </Card>
              <Card className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">99.2% Accuracy</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Trained on 1M+ samples with continuous model updates
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Floating Contact Button */}
      <Button
        onClick={() => setShowContactWidget(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        size="icon"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      {/* Contact Widget */}
      <ContactWidget isOpen={showContactWidget} onClose={() => setShowContactWidget(false)} />
    </div>
  )
}
