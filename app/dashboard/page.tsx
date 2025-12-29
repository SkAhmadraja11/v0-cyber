"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Download,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ScanResult {
  id: string
  url: string
  scan_type: string
  risk_score: number
  classification: string
  confidence: number
  created_at: string
  detection_sources: Array<{ name: string; detected: boolean }>
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d")
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    mlAccuracy: 99.2,
    avgResponseTime: 347,
  })
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, scansRes] = await Promise.all([
          fetch(`/api/analytics?range=${timeRange}`),
          fetch("/api/scans"),
        ])

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          setStats({
            totalScans: analyticsData.totalScans,
            threatsBlocked: analyticsData.threatsBlocked,
            mlAccuracy: analyticsData.mlAccuracy,
            avgResponseTime: analyticsData.avgResponseTime,
          })
        }

        if (scansRes.ok) {
          const scansData = await scansRes.json()
          setRecentScans(scansData.scans.slice(0, 5))
        }
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  const threatTrends = [
    { day: "Mon", threats: 45, scans: 2100, detectionRate: 2.1 },
    { day: "Tue", threats: 52, scans: 2300, detectionRate: 2.3 },
    { day: "Wed", threats: 38, scans: 2050, detectionRate: 1.9 },
    { day: "Thu", threats: 61, scans: 2400, detectionRate: 2.5 },
    { day: "Fri", threats: 48, scans: 2200, detectionRate: 2.2 },
    { day: "Sat", threats: 32, scans: 1800, detectionRate: 1.8 },
    { day: "Sun", threats: 28, scans: 1650, detectionRate: 1.7 },
  ]

  const maxThreats = Math.max(...threatTrends.map((d) => d.threats))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
                <Activity className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-foreground">Analytics Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/scanner">
                <Button variant="outline">New Scan</Button>
              </Link>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Security Analytics</h1>
            <p className="text-muted-foreground">Real-time threat intelligence • Live data from Supabase</p>
          </div>
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setTimeRange("24h")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === "24h"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === "7d"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-500 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  12%
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stats.totalScans.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Scans</div>
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden border-2 hover:border-destructive/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-500 font-medium">
                  <TrendingDown className="w-4 h-4" />
                  8%
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stats.threatsBlocked.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Threats Blocked</div>
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden border-2 hover:border-green-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-500 font-medium">
                  <TrendingUp className="w-4 h-4" />
                  0.3%
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stats.mlAccuracy.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">ML Accuracy</div>
            </div>
          </Card>

          <Card className="p-6 relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-500 font-medium">
                  <TrendingDown className="w-4 h-4" />
                  5%
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{Math.floor(stats.avgResponseTime)}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Threat Trends Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Threat Trends</h3>
                  <p className="text-sm text-muted-foreground">Weekly phishing detection overview</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Threats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/30" />
                    <span className="text-muted-foreground">Scans</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {threatTrends.map((data, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground w-12">{data.day}</span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="w-20 text-right">{data.threats} threats</span>
                        <span className="w-20 text-right">{data.scans} scans</span>
                        <span className="w-16 text-right text-xs">{data.detectionRate}%</span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-8">
                      <div className="flex-1 bg-primary/10 rounded overflow-hidden relative">
                        <div
                          className="h-full bg-primary/30 rounded transition-all"
                          style={{ width: `${(data.scans / 2400) * 100}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-destructive/10 rounded overflow-hidden relative">
                        <div
                          className="h-full bg-destructive rounded transition-all"
                          style={{ width: `${(data.threats / maxThreats) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Scans Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Recent Scans</h3>
                  <p className="text-sm text-muted-foreground">Latest threat detection results</p>
                </div>
                <Link href="/scanner">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          scan.classification === "phishing" ? "bg-destructive/10" : "bg-green-500/10"
                        }`}
                      >
                        {scan.classification === "phishing" ? (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate mb-1">{scan.url}</div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {scan.classification === "phishing" ? "Phishing Detected" : "Safe"} • {scan.confidence}%
                          confidence
                        </div>
                        {scan.detection_sources.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {scan.detection_sources.map((source, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive"
                              >
                                {source.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex-shrink-0 ml-4">{scan.created_at}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Threat Categories */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Threat Categories</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Credential Phishing</span>
                    <span className="text-sm font-medium text-foreground">48%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[48%] bg-destructive rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Malware Distribution</span>
                    <span className="text-sm font-medium text-foreground">28%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[28%] bg-destructive rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Fake Websites</span>
                    <span className="text-sm font-medium text-foreground">16%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[16%] bg-destructive rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">Social Engineering</span>
                    <span className="text-sm font-medium text-foreground">8%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[8%] bg-destructive rounded-full" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Model Performance */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Model Performance</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Precision</div>
                  <div className="text-2xl font-bold text-foreground">96.8%</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Recall</div>
                  <div className="text-2xl font-bold text-foreground">98.4%</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-sm text-muted-foreground mb-1">F1 Score</div>
                  <div className="text-2xl font-bold text-foreground">97.6%</div>
                </div>
              </div>
            </Card>

            {/* System Status */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">ML Model</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-500">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-500">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">API Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-500">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Last Updated</span>
                  <span className="text-sm text-muted-foreground">2 mins ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
