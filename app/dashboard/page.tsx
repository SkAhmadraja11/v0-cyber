"use client"

import { useState, useEffect, useCallback } from "react"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import {
  Activity,
  ArrowLeft,
  RefreshCcw,
  Shield,
  AlertTriangle,
  Globe,
  Filter,
  Gamepad2,
  MessageSquare,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ContactWidget from "@/components/contact-widget"
import CyberRangeWidget from "@/components/cyber-range-widget"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"

interface AnalyticsData {
  totalScans: number
  threatsBlocked: number
  mlAccuracy: number
  avgResponseTime: number
  scanTypes: { name: string; value: number; color: string }[]
  riskSplit: { name: string; value: number; color: string }[]
  trendData: { name: string; incoming: number; blocked: number }[]
  alertsData: { name: string; value: number }[]
  lastUpdated: string
}

interface RecentScan {
  id: string
  url: string
  scan_type: string
  risk_score: number
  classification: string
  confidence: number
  created_at: string
  reasons: string[]
}

const DEFAULT_ANALYTICS: AnalyticsData = {
  totalScans: 0,
  threatsBlocked: 0,
  mlAccuracy: 99.2,
  avgResponseTime: 347,
  scanTypes: [],
  riskSplit: [
    { name: "Safe", value: 0, color: "#22c55e" },
    { name: "Suspicious", value: 0, color: "#eab308" },
    { name: "Malicious", value: 0, color: "#ef4444" },
  ],
  trendData: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name) => ({
    name,
    incoming: 0,
    blocked: 0,
  })),
  alertsData: [],
  lastUpdated: new Date().toISOString(),
}

function classificationColor(cls: string) {
  if (cls === "MALICIOUS" || cls === "HIGH_RISK") return "text-red-500 bg-red-500/10"
  if (cls === "DANGEROUS" || cls === "SUSPICIOUS") return "text-yellow-500 bg-yellow-500/10"
  return "text-green-500 bg-green-500/10"
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(DEFAULT_ANALYTICS)
  const [recentScans, setRecentScans] = useState<RecentScan[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("7d")
  const [showContactWidget, setShowContactWidget] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  const fetchAnalytics = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true)
      setFetchError(false)
      try {
        const [analyticsRes, scansRes] = await Promise.allSettled([
          fetch(`/api/analytics?range=${timeRange}`),
          fetch("/api/scans"),
        ])

        if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
          const data: AnalyticsData = await analyticsRes.value.json()
          setAnalytics(data)
        } else {
          setFetchError(true)
        }

        if (scansRes.status === "fulfilled" && scansRes.value.ok) {
          const scansData = await scansRes.value.json()
          setRecentScans((scansData?.data || []).slice(0, 6))
        }
      } catch (error) {
        console.error("[Dashboard] Failed to fetch analytics:", error)
        setFetchError(true)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    },
    [timeRange]
  )

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => fetchAnalytics(), 60_000)
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Security Analytics...</p>
        </div>
      </div>
    )
  }

  const safePercent =
    analytics.totalScans > 0
      ? Math.round(((analytics.totalScans - analytics.threatsBlocked) / analytics.totalScans) * 100)
      : 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Back</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-lg text-foreground">Cyber Risk Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/games">
                <Button variant="outline" size="sm">
                  <Gamepad2 className="w-4 h-4 mr-2 text-primary" />
                  Cyber Range
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => fetchAnalytics(true)}
                disabled={isRefreshing}
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => alert("Deep Filter: Feature coming in v3.0")}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/scanner">
                <Button className="hidden md:flex">
                  <Shield className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              </Link>
              <div className="flex md:hidden items-center gap-2">
                <UserNav />
                <MobileNav />
              </div>
              <div className="hidden md:flex">
                <UserNav />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Title + Time Range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Security Analytics</h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-xs md:text-sm text-muted-foreground">
                {fetchError
                  ? "⚠ Analytics unavailable — showing cached data"
                  : isRefreshing
                    ? "Updating..."
                    : `Live data · last updated ${timeAgo(analytics.lastUpdated)}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-full sm:w-auto">
            {["24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Scans",
              value: analytics.totalScans.toLocaleString(),
              sub: `Last ${timeRange}`,
              icon: Activity,
              color: "text-blue-500",
            },
            {
              label: "Threats Blocked",
              value: analytics.threatsBlocked.toLocaleString(),
              sub: `${analytics.totalScans > 0 ? Math.round((analytics.threatsBlocked / analytics.totalScans) * 100) : 0}% of total`,
              icon: Shield,
              color: "text-red-500",
            },
            {
              label: "Protection Rate",
              value: `${safePercent}%`,
              sub: "Scans flagged safe",
              icon: TrendingUp,
              color: "text-green-500",
            },
            {
              label: "ML Accuracy",
              value: `${analytics.mlAccuracy}%`,
              sub: `Avg response ${analytics.avgResponseTime}ms`,
              icon: AlertTriangle,
              color: "text-yellow-500",
            },
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-l-4 border-l-primary/20 hover:border-l-primary transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-bold mt-2 text-foreground">{stat.value}</h3>
                </div>
                <div className={`p-3 bg-secondary/50 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Scan Type Breakdown */}
          <Card className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 w-full text-left">Scan Breakdown</h3>
            {analytics.scanTypes.length > 0 ? (
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.scanTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {analytics.scanTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No scan data yet for this period
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center">Distribution of scan requests by type</p>
          </Card>

          {/* Risk Assessment */}
          <Card className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 w-full text-left">Risk Assessment</h3>
            {analytics.totalScans > 0 ? (
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.riskSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={1500}
                    >
                      {analytics.riskSplit.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Scan some URLs to see risk breakdown
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center italic">Based on real scan results</p>
          </Card>

          {/* Gamification Widget */}
          <CyberRangeWidget />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Threat Categories */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Threat Categories</h3>
            <div className="h-[250px] w-full">
              {analytics.alertsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.alertsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#fff" />
                    <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500}>
                      {analytics.alertsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Malicious"
                              ? "#ef4444"
                              : entry.name === "Suspicious"
                                ? "#eab308"
                                : "#22c55e"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No threat data for this period
                </div>
              )}
            </div>
          </Card>

          {/* Scan Volume Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Scan Volume Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "#fff" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="incoming"
                    name="Total Scans"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorIncoming)"
                    animationDuration={2000}
                  />
                  <Area
                    type="monotone"
                    dataKey="blocked"
                    name="Threats Blocked"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Live Security Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Globe summary */}
          <Card className="p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Scan Summary</h3>
            <div className="space-y-4">
              {[
                { label: "URL Scans", value: analytics.scanTypes.find((t) => t.name === "URL Scans")?.value ?? 0, color: "bg-blue-500" },
                { label: "Email Scans", value: analytics.scanTypes.find((t) => t.name === "Email Analysis")?.value ?? 0, color: "bg-purple-500" },
                { label: "Threats Blocked", value: analytics.threatsBlocked, color: "bg-red-500" },
                { label: "Safe Scans", value: (analytics.riskSplit.find((r) => r.name === "Safe")?.value ?? 0), color: "bg-green-500" },
              ].map((item, i) => {
                const pct = analytics.totalScans > 0 ? Math.round((item.value / analytics.totalScans) * 100) : 0
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recent Scans */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Live Security Logs</h3>
              <Link href="/scanner">
                <Button variant="ghost" size="sm" className="text-xs">
                  + New Scan
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentScans.length > 0 ? (
                recentScans.map((scan, i) => (
                  <div
                    key={scan.id ?? i}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm border border-border/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 flex-shrink-0 rounded-full ${scan.classification === "SAFE" ? "bg-green-500" : "bg-red-500"
                          }`}
                      />
                      <span className="font-mono text-muted-foreground text-xs flex-shrink-0">
                        {scan.scan_type?.toUpperCase()}
                      </span>
                      <span className="font-medium truncate max-w-[180px]" title={scan.url}>
                        {scan.url?.replace(/^https?:\/\//, "").split("?")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{timeAgo(scan.created_at)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${classificationColor(scan.classification)}`}
                      >
                        {scan.classification}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Globe className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No scans yet.</p>
                  <Link href="/scanner">
                    <Button size="sm" className="mt-3">
                      Run your first scan
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Contact */}
      <Button
        onClick={() => setShowContactWidget(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        size="icon"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      <ContactWidget isOpen={showContactWidget} onClose={() => setShowContactWidget(false)} />
    </div>
  )
}
