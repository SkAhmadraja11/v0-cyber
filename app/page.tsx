"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Shield,
  Zap,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Hash,
  Fingerprint,
  Database,
  Cpu,
  BarChart3,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserNav } from "@/components/user-nav"

export default function Home() {
  const [activeSection, setActiveSection] = useState<"overview" | "tech" | "features" | "analytics">("overview")

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern opacity-30" />
      <div className="fixed inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary/5" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">PhishGuard AI</h1>
                <p className="text-xs text-muted-foreground">Advanced ML Detection</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  Docs
                </Button>
              </Link>
              <Link href="/scanner">
                <Button>Launch Scanner</Button>
              </Link>
              <UserNav />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Fixed height, no scrolling */}
      <main className="relative h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 h-full flex flex-col lg:flex-row gap-6 py-6">
          {/* Left Panel - Navigation */}
          <div className="lg:w-64 shrink-0">
            <Card className="p-4 h-full glassmorphism">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection("overview")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === "overview"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Overview</span>
                </button>
                <button
                  onClick={() => setActiveSection("tech")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === "tech"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Cpu className="w-5 h-5" />
                  <span className="font-medium">Technology</span>
                </button>
                <button
                  onClick={() => setActiveSection("features")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === "features"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">Features</span>
                </button>
                <button
                  onClick={() => setActiveSection("analytics")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === "analytics"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="space-y-3">
                  <Link href="/scanner">
                    <Button className="w-full justify-start" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Scanner
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                      <Activity className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Center Panel - Main Content */}
          <div className="flex-1 overflow-auto">
            <Card className="p-8 h-full glassmorphism">
              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                      <Activity className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-foreground">Real-Time Intelligence</span>
                    </div>
                    <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
                      High-Confidence Phishing Detection
                    </h2>
                    <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                      Advanced ML algorithms powered by trusted threat intelligence databases analyze URLs and emails in
                      real-time, protecting your organization with 99.2% accuracy.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="text-4xl font-bold text-foreground mb-1">99.2%</div>
                      <div className="text-sm text-muted-foreground">Detection Rate</div>
                    </div>
                    <div className="p-6 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="text-4xl font-bold text-foreground mb-1">15K+</div>
                      <div className="text-sm text-muted-foreground">Threats Blocked</div>
                    </div>
                    <div className="p-6 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="text-4xl font-bold text-foreground mb-1">&lt;400ms</div>
                      <div className="text-sm text-muted-foreground">Response Time</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border-2 border-destructive/30 bg-destructive/5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-7 h-7 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">Live Threat Detection</h3>
                        <p className="text-muted-foreground mb-4">
                          Real-time monitoring with immediate threat classification and risk assessment.
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Threat Level:</span>
                          <span className="font-bold text-destructive text-lg">Critical (98%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Technology Section */}
              {activeSection === "tech" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Advanced Technology Stack</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Multiple layers of security algorithms working together
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Machine Learning</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Neural networks trained on 1M+ phishing samples with continuous learning from new threats.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>50+ Feature Extraction</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Hash className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">MD5 Hashing</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Cryptographic fingerprinting for URL patterns and content verification against known threats.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>128-bit Hash Generation</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Fingerprint className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">SHA-256 Algorithm</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Secure hash algorithm for content integrity verification and malware signature detection.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>256-bit Cryptographic Security</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-all">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Threat Intelligence DB</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        Real-time access to global threat databases with updated phishing patterns and blacklists.
                      </p>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>10M+ Known Threats</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features Section */}
              {activeSection === "features" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Detection Capabilities</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Comprehensive analysis powered by ML and cryptography
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <Lock className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">SSL Certificate Validation</h4>
                        <p className="text-sm text-muted-foreground">
                          Verifies HTTPS encryption and certificate authenticity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <ExternalLink className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">URL Entropy Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          Mathematical randomness detection for obfuscated URLs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <Brain className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Brand Spoofing Detection</h4>
                        <p className="text-sm text-muted-foreground">
                          Identifies fake domains impersonating trusted brands
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <TrendingUp className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Domain Age & Reputation</h4>
                        <p className="text-sm text-muted-foreground">
                          Checks domain registration date and historical trust scores
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <Hash className="w-6 h-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Content Hash Matching</h4>
                        <p className="text-sm text-muted-foreground">
                          MD5 and SHA-256 comparison against threat signature database
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Section */}
              {activeSection === "analytics" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Performance Metrics</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Real-time system analytics and model performance
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-xl bg-linear-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">True Positive Rate</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">99.2%</div>
                    </div>

                    <div className="p-6 rounded-xl bg-linear-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">False Positive Rate</span>
                        <Activity className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">0.3%</div>
                    </div>

                    <div className="p-6 rounded-xl bg-linear-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Processing Speed</span>
                        <Zap className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">385ms</div>
                    </div>

                    <div className="p-6 rounded-xl bg-linear-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Model Accuracy</span>
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">98.9%</div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-muted/50 border border-border">
                    <h4 className="font-semibold text-foreground mb-4">Training Dataset</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Phishing Samples</span>
                        <span className="font-semibold text-foreground">750,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Legitimate Samples</span>
                        <span className="font-semibold text-foreground">450,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Feature Dimensions</span>
                        <span className="font-semibold text-foreground">52</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Panel - Quick Stats */}
          <div className="lg:w-80 shrink-0">
            <div className="space-y-4 h-full">
              <Card className="p-6 glassmorphism">
                <h3 className="text-lg font-semibold text-foreground mb-4">Live Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-muted-foreground">System</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-muted-foreground">ML Model</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-muted-foreground">Database</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">Synced</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 glassmorphism">
                <h3 className="text-lg font-semibold text-foreground mb-4">Today's Activity</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Scans</span>
                      <span className="text-sm font-semibold text-foreground">1,247</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-primary rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Threats</span>
                      <span className="text-sm font-semibold text-foreground">342</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-destructive rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Blocked</span>
                      <span className="text-sm font-semibold text-foreground">342</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 glassmorphism bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Scan?</h3>
                <p className="text-sm text-muted-foreground mb-4">Start detecting threats in seconds</p>
                <Link href="/scanner">
                  <Button className="w-full shadow-lg shadow-primary/30">
                    <Zap className="w-4 h-4 mr-2" />
                    Launch Scanner
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
