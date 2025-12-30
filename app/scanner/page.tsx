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
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { RealDetectionResult } from "@/lib/real-detection"

export default function ScannerPage() {
  const [scanMode, setScanMode] = useState<"url" | "email">("url")
  const [inputValue, setInputValue] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<RealDetectionResult | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const sources = Array.isArray(result?.sources) ? result!.sources : []
  const reasons = Array.isArray(result?.reasons) ? result!.reasons : []
  



  const handleScan = async () => {
    if (!inputValue.trim()) return

    setIsScanning(true)
    setResult(null)
    setScanProgress(0)

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

  const getClassificationColor = (classification: string) => {
    if (classification === "PHISHING") return "text-destructive border-destructive/50 bg-destructive/10"
    if (classification === "SUSPICIOUS") return "text-yellow-600 border-yellow-500/50 bg-yellow-500/10"
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
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
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">High-Confidence Phishing Detection</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Real-time analysis using Google Safe Browsing, PhishTank, VirusTotal, and ML intelligence
            </p>
          </div>

          {/* Scanner Card */}
          <Card className="p-8 mb-8 relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
            <div className="relative space-y-6">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <button
                  onClick={() => setScanMode("url")}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    scanMode === "url"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  URL Scanner
                </button>
                <button
                  onClick={() => setScanMode("email")}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    scanMode === "email"
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
              <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary animate-pulse" />
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
                    className="h-full bg-linear-to-r from-primary via-primary to-primary/50 rounded-full transition-all duration-300"
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
                className={`p-8 border-2 relative overflow-hidden ${
                  result.classification === "PHISHING"
                    ? "border-destructive/50 bg-destructive/5"
                    : result.classification === "SUSPICIOUS"
                      ? "border-yellow-500/50 bg-yellow-500/5"
                      : "border-green-500/50 bg-green-500/5"
                }`}
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
                <div className="relative">
                  <div className="flex items-start gap-6 mb-6">
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${
                        result.classification === "PHISHING"
                          ? "bg-destructive/20 shadow-lg shadow-destructive/20"
                          : result.classification === "SUSPICIOUS"
                            ? "bg-yellow-500/20 shadow-lg shadow-yellow-500/20"
                            : "bg-green-500/20 shadow-lg shadow-green-500/20"
                      }`}
                    >
                      {result.classification === "PHISHING" ? (
                        <AlertTriangle className="w-10 h-10 text-destructive" />
                      ) : result.classification === "SUSPICIOUS" ? (
                        <AlertTriangle className="w-10 h-10 text-yellow-600" />
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
                        className={`font-bold text-xl ${
                          result.classification === "PHISHING"
                            ? "text-destructive"
                            : result.classification === "SUSPICIOUS"
                              ? "text-yellow-600"
                              : "text-green-500"
                        }`}
                      >
                        {result.riskScore}/100
                      </span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all shadow-lg ${
                          result.classification === "PHISHING"
                            ? "bg-linear-to-r from-destructive to-destructive/70"
                            : result.classification === "SUSPICIOUS"
                              ? "bg-linear-to-r from-yellow-500 to-yellow-600"
                              : "bg-linear-to-r from-green-500 to-green-600"
                        }`}
                        style={{ width: `${result.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
              


              {/* Data Sources Analysis */}
              {/* Data Sources Analysis */}
<Card className="p-8">
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <Database className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h4 className="text-xl font-semibold text-foreground">
        Trusted Data Sources
      </h4>
      <p className="text-sm text-muted-foreground">
        Real-time checks across {sources.length} security databases
      </p>
    </div>
  </div>

  {/* 👇 THIS BLOCK HERE */}
  <div className="space-y-3">

    {/* REPLACE old result.sources.map(...) with this */}
    {sources.map((source, idx) => {
      if (!source) return null

      return (
        <div
          key={idx}
          className={`p-4 rounded-lg border transition-colors ${
            source.detected
              ? "bg-destructive/5 border-destructive/30 hover:border-destructive/50"
              : "bg-green-500/5 border-green-500/30 hover:border-green-500/50"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-foreground">
                  {source.name ?? "Unknown Source"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    source.detected
                      ? "bg-destructive/20 text-destructive"
                      : "bg-green-500/20 text-green-600"
                  }`}
                >
                  {source.detected ? "THREAT DETECTED" : "SAFE"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {source.reason ?? "No details available"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Confidence</div>
              <div className="text-xl font-bold text-foreground">
                {source.confidence ?? 0}%
              </div>
            </div>
          </div>
        </div>
      )
    })}

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
                  Instant threat detection with sub-500ms ML inference time
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
    </div>
  )
}
