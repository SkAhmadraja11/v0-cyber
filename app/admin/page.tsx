"use client"

import { useState } from "react"
import {
  Settings,
  Users,
  Shield,
  Database,
  Activity,
  ArrowLeft,
  Search,
  MoreVertical,
  UserCheck,
  Download,
  RefreshCw,
  Bell,
  Lock,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "analyst" | "user"
  status: "active" | "inactive"
  lastActive: string
  scansCount: number
}

interface SystemLog {
  id: number
  timestamp: string
  type: "info" | "warning" | "error" | "success"
  action: string
  user: string
  details: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "system" | "settings" | "logs">("users")
  const [searchQuery, setSearchQuery] = useState("")

  const users: User[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      role: "admin",
      status: "active",
      lastActive: "2 mins ago",
      scansCount: 234,
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@company.com",
      role: "analyst",
      status: "active",
      lastActive: "15 mins ago",
      scansCount: 567,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@company.com",
      role: "user",
      status: "active",
      lastActive: "1 hour ago",
      scansCount: 89,
    },
    {
      id: 4,
      name: "David Kim",
      email: "d.kim@company.com",
      role: "analyst",
      status: "inactive",
      lastActive: "3 days ago",
      scansCount: 412,
    },
    {
      id: 5,
      name: "Lisa Wang",
      email: "l.wang@company.com",
      role: "user",
      status: "active",
      lastActive: "30 mins ago",
      scansCount: 156,
    },
  ]

  const systemLogs: SystemLog[] = [
    {
      id: 1,
      timestamp: "2024-01-15 14:23:45",
      type: "success",
      action: "ML Model Updated",
      user: "System",
      details: "Version 2.1.3 deployed successfully",
    },
    {
      id: 2,
      timestamp: "2024-01-15 14:15:22",
      type: "warning",
      action: "High API Usage",
      user: "Monitor",
      details: "API rate limit approaching threshold (85%)",
    },
    {
      id: 3,
      timestamp: "2024-01-15 13:45:10",
      type: "info",
      action: "User Login",
      user: "sarah.j@company.com",
      details: "Successful authentication from IP 192.168.1.100",
    },
    {
      id: 4,
      timestamp: "2024-01-15 13:30:05",
      type: "error",
      action: "Database Connection Failed",
      user: "System",
      details: "Temporary connection loss - auto-recovered",
    },
    {
      id: 5,
      timestamp: "2024-01-15 12:20:18",
      type: "success",
      action: "Bulk Scan Completed",
      user: "m.chen@company.com",
      details: "150 URLs scanned - 12 threats detected",
    },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive"
      case "analyst":
        return "bg-primary/10 text-primary"
      case "user":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-500"
      case "warning":
        return "bg-yellow-500/10 text-yellow-500"
      case "error":
        return "bg-destructive/10 text-destructive"
      case "info":
        return "bg-primary/10 text-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
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
                <Settings className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-foreground">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {users.filter((u) => u.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">99.8%</div>
            <div className="text-sm text-muted-foreground">System Uptime</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">2.4 GB</div>
            <div className="text-sm text-muted-foreground">Database Size</div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "users" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            User Management
            {activeTab === "users" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "system" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            System Status
            {activeTab === "system" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "logs" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Activity Logs
            {activeTab === "logs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === "settings" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings
            {activeTab === "settings" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "users" && (
          <div>
            {/* Search and Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button>Add User</Button>
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-semibold text-foreground">User</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Role</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Last Active</th>
                      <th className="text-left p-4 text-sm font-semibold text-foreground">Scans</th>
                      <th className="text-right p-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                user.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                              }`}
                            />
                            <span className="text-sm text-foreground capitalize">{user.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{user.lastActive}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-medium text-foreground">{user.scansCount}</span>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ML Model Status */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">ML Model Status</h3>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Model Version</span>
                    <span className="text-sm font-medium text-foreground">v2.1.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Accuracy</span>
                    <span className="text-sm font-medium text-green-500">99.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Last Updated</span>
                    <span className="text-sm font-medium text-foreground">2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Training Dataset</span>
                    <span className="text-sm font-medium text-foreground">1.2M samples</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Inference Time</span>
                    <span className="text-sm font-medium text-foreground">347ms avg</span>
                  </div>
                </div>
              </Card>

              {/* Database Status */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Database Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-500">Connected</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Total Records</span>
                    <span className="text-sm font-medium text-foreground">245,891</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Database Size</span>
                    <span className="text-sm font-medium text-foreground">2.4 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Active Connections</span>
                    <span className="text-sm font-medium text-foreground">12 / 100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Last Backup</span>
                    <span className="text-sm font-medium text-foreground">4 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Query Performance</span>
                    <span className="text-sm font-medium text-green-500">Excellent</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* API Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">API Performance Metrics</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Requests/Hour</div>
                  <div className="text-3xl font-bold text-foreground mb-1">2,847</div>
                  <div className="text-xs text-green-500">+12% from avg</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Avg Response Time</div>
                  <div className="text-3xl font-bold text-foreground mb-1">120ms</div>
                  <div className="text-xs text-green-500">-8% improvement</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Error Rate</div>
                  <div className="text-3xl font-bold text-foreground mb-1">0.02%</div>
                  <div className="text-xs text-green-500">Within threshold</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Rate Limit Usage</div>
                  <div className="text-3xl font-bold text-foreground mb-1">68%</div>
                  <div className="text-xs text-muted-foreground">32% available</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "logs" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Activity Logs</h3>
                <p className="text-sm text-muted-foreground">System events and user actions</p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card>
              <div className="divide-y divide-border">
                {systemLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getLogTypeColor(log.type)}`}
                      >
                        {log.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="font-medium text-foreground">{log.action}</div>
                          <div className="text-sm text-muted-foreground flex-shrink-0">{log.timestamp}</div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">{log.details}</div>
                        <div className="text-xs text-muted-foreground">User: {log.user}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Require 2FA for all admin accounts</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">Session Timeout</div>
                      <div className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">Audit Logging</div>
                      <div className="text-sm text-muted-foreground">Track all administrative actions</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Logs
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">Critical Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Notify on system failures and security breaches
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-500">Enabled</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-foreground">User Activity</div>
                      <div className="text-sm text-muted-foreground">
                        Daily summary of user registrations and activity
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-green-500">Enabled</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-destructive/50">
              <h3 className="text-lg font-semibold text-destructive mb-6">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive" />
                    <div>
                      <div className="font-medium text-foreground">Clear All Scan History</div>
                      <div className="text-sm text-muted-foreground">Permanently delete all scan records</div>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    Clear Data
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-destructive" />
                    <div>
                      <div className="font-medium text-foreground">Reset System</div>
                      <div className="text-sm text-muted-foreground">Reset all settings to default values</div>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
