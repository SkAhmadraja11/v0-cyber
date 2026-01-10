"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Save, Loader2, CheckCircle2, User, Building, Smartphone, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function SettingsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [fullName, setFullName] = useState("")
  const [organization, setOrganization] = useState("")
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setFullName(user.user_metadata?.full_name || "")

      // Get profile data
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profile) {
        setOrganization(profile.organization || "")
      }

      // Check MFA status
      const { data: mfaData } = await supabase
        .from("user_mfa")
        .select("enabled")
        .eq("user_id", user.id)
        .single()

      setMfaEnabled(mfaData?.enabled || false)
    }
    getUser()
  }, [supabase, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setIsSaved(false)

    try {
      if (!user) throw new Error("No user found")

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      })

      if (updateError) throw updateError

      // Update or insert profile
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: fullName,
          organization: organization,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )

      if (profileError) throw profileError

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMFA = async () => {
    if (!user) return
    
    try {
      if (mfaEnabled) {
        // Disable MFA
        const { error } = await supabase
          .from("user_mfa")
          .update({ enabled: false })
          .eq("user_id", user.id)

        if (error) {
          setError("Failed to disable MFA")
        } else {
          setMfaEnabled(false)
          setIsSaved(true)
          setTimeout(() => setIsSaved(false), 3000)
        }
      } else {
        // Redirect to MFA enrollment
        router.push("/auth/mfa-enrollment")
      }
    } catch (error) {
      setError("Failed to update MFA settings")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Profile
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground">Update your personal information</p>
            </div>
          </div>
        </div>

        <Card className="glassmorphism border-border/50">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input id="email" type="email" value={user.email || ""} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization (Optional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="organization"
                    type="text"
                    placeholder="Your Company Name"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Multi-Factor Authentication</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">MFA Status</p>
                      <p className="text-sm text-muted-foreground">
                        {mfaEnabled ? "MFA is enabled" : "MFA is disabled"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={mfaEnabled ? "outline" : "default"}
                    onClick={toggleMFA}
                    disabled={isLoading}
                  >
                    {mfaEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {isSaved && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-500">Profile updated successfully!</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Link href="/profile" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border-2 border-destructive/30 bg-destructive/5">
              <h4 className="font-semibold text-foreground mb-2">Delete Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
