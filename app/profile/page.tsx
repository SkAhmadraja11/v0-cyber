import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, Mail, Calendar, Settings, Activity, UserIcon } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get profile data from profiles table if it exists
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || "U"

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
              <p className="text-muted-foreground">Manage your account information and security</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Info Card */}
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Profile Information</CardTitle>
                  <CardDescription>Your personal details and account info</CardDescription>
                </div>
                <Link href="/profile/settings">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserIcon className="w-4 h-4" />
                        <span>Full Name</span>
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {profile?.full_name || user.user_metadata?.full_name || "Not set"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>Email Address</span>
                      </div>
                      <p className="text-lg font-medium text-foreground">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Member Since</span>
                      </div>
                      <p className="text-lg font-medium text-foreground">{joinDate}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>Role</span>
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {profile?.role || user.user_metadata?.role || "User"}
                      </p>
                    </div>
                  </div>

                  {profile?.organization && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Activity className="w-4 h-4" />
                        <span>Organization</span>
                      </div>
                      <p className="text-lg font-medium text-foreground">{profile.organization}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account security and verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email Verified</p>
                      <p className="text-sm text-muted-foreground">Your email has been confirmed</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Account Active</p>
                      <p className="text-sm text-muted-foreground">Full access to all features</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary-foreground"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Navigate to common features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full bg-transparent h-auto py-4 flex flex-col gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    <span className="font-medium">Dashboard</span>
                  </Button>
                </Link>
                <Link href="/scanner">
                  <Button variant="outline" className="w-full bg-transparent h-auto py-4 flex flex-col gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <span className="font-medium">Scanner</span>
                  </Button>
                </Link>
                <Link href="/profile/settings">
                  <Button variant="outline" className="w-full bg-transparent h-auto py-4 flex flex-col gap-2">
                    <Settings className="w-6 h-6 text-primary" />
                    <span className="font-medium">Settings</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
