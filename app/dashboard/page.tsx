"use client"

import { useState, useEffect } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
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
  Download,
  Filter,
  RefreshCcw,
  Shield,
  AlertTriangle,
  Globe,
  Wallet,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// --- Mock Data for Graphs ---

const SCAN_TYPES = [
  { name: "URL Scans", value: 450, color: "#3b82f6" }, // Blue
  { name: "Email Analysis", value: 320, color: "#8b5cf6" }, // Purple
  { name: "File Checks", value: 210, color: "#ec4899" }, // Pink
]

const RISK_SPLIT = [
  { name: "Safe", value: 680, color: "#22c55e" }, // Green
  { name: "Suspicious", value: 240, color: "#eab308" }, // Yellow
  { name: "Phishing", value: 80, color: "#ef4444" }, // Red
]

// Risk Matrix: x=Risk Score, y=Confidence, z=Volume(size)
const RISK_MATRIX_DATA = [
  { x: 20, y: 85, z: 100, name: "Low Risk" },
  { x: 45, y: 60, z: 200, name: "Medium Risk" },
  { x: 80, y: 95, z: 50, name: "High Potential" },
  { x: 90, y: 98, z: 80, name: "Confirmed Fraud" },
  { x: 15, y: 30, z: 150, name: "Noise" },
  { x: 65, y: 75, z: 120, name: "Investigate" },
  { x: 30, y: 90, z: 90, name: "Safe High Conf" },
  { x: 85, y: 40, z: 60, name: "Anomaly" },
]

const ALERTS_DATA = [
  { name: "Malware", value: 120 },
  { name: "Phishing", value: 200 },
  { name: "Spam", value: 150 },
  { name: "Spoofing", value: 80 },
  { name: "Data Leak", value: 40 },
]

const TREND_DATA = [
  { name: "Mon", incoming: 400, blocked: 24 },
  { name: "Tue", incoming: 300, blocked: 18 },
  { name: "Wed", incoming: 550, blocked: 45 },
  { name: "Thu", incoming: 480, blocked: 32 },
  { name: "Fri", incoming: 600, blocked: 58 },
  { name: "Sat", incoming: 350, blocked: 20 },
  { name: "Sun", incoming: 280, blocked: 15 },
]

const GLOBAL_FLOW = [
  { region: "North America", value: 45 },
  { region: "Europe", value: 30 },
  { region: "Asia Pacific", value: 25 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsBlocked: 0,
    mlAccuracy: 99.2,
    avgResponseTime: 347,
    scanTypes: [
      { name: "URL Scans", value: 0, color: "#3b82f6" },
      { name: "Email Analysis", value: 0, color: "#8b5cf6" },
    ],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("24h") // Assuming a time range state for the API call
  const [recentScans, setRecentScans] = useState([]) // Assuming a state for recent scans

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
            scanTypes: analyticsData.scanTypes || [],
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Risk Analytics...</p>
        </div>
      </div>
    )
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
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <span className="font-bold text-lg text-foreground">Cyber Risk Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/scanner">
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  New Scan
                </Button>
              </Link>
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
            {["24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === range
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {range === "24h" ? "24 Hours" : range === "7d" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Scans", value: stats.totalScans.toLocaleString(), change: "+12%", icon: Activity, color: "text-blue-500" },
            { label: "Threats Blocked", value: stats.threatsBlocked.toLocaleString(), change: "+5%", icon: Shield, color: "text-red-500" },
            { label: "ML Accuracy", value: `${stats.mlAccuracy}%`, change: "-2%", icon: AlertTriangle, color: "text-yellow-500" },
            { label: "Avg. Response Time", value: `${stats.avgResponseTime}ms`, change: "+8", icon: Globe, color: "text-green-500" },
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
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <span className="text-green-500 font-medium mr-1">{stat.change}</span>
                from last month
              </div>
            </Card>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* 1. Transaction Type (Scan Type) */}
          <Card className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 w-full text-left">Scan Breakdown</h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.scanTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.scanTypes.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Distribution of scan requests by type</p>
          </Card>

          {/* 2. Transaction Split (Risk Split) */}
          <Card className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4 w-full text-left">Risk Assessment</h3>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RISK_SPLIT}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {RISK_SPLIT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Outcome classification of processed scans</p>
          </Card>

          {/* 3. Risk Matrix */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Risk Matrix</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" dataKey="x" name="Risk Score" unit="%" fontSize={12} />
                  <YAxis type="number" dataKey="y" name="Confidence" unit="%" fontSize={12} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Scans" data={RISK_MATRIX_DATA} fill="#f59e0b" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">X: Risk Score, Y: AI Confidence</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 4. Transaction Alert (Alerts) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Threat Categories</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ALERTS_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 5. Amount Over Time (Scan Volume) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Scan Volume Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <Tooltip />
                  <Area type="monotone" dataKey="incoming" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncoming)" />
                  <Area type="monotone" dataKey="blocked" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 6. Global Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Traffic Origins</h3>
            <div className="space-y-4">
              {GLOBAL_FLOW.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.region}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Logs List (to keep some data view) */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Live Security Logs</h3>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { id: "LOG-001", type: "Phishing", target: "login-secure-update.com", time: "2m ago", status: "Blocked" },
                { id: "LOG-002", type: "Malware", target: "invoice_2024.pdf", time: "5m ago", status: "Quarantined" },
                { id: "LOG-003", type: "Clean", target: "google.com", time: "8m ago", status: "Allowed" },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.status === 'Allowed' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-mono text-muted-foreground">{log.id}</span>
                    <span className="font-medium">{log.type}</span>
                    <span className="text-muted-foreground hidden sm:inline-block">- {log.target}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'Allowed'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-red-500/10 text-red-600'
                      }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
