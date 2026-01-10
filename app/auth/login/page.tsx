"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertTriangle, CheckCircle, Chrome, Phone } from "lucide-react"
import { V0Logo } from "@/components/v0-logo"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  /* ---------------- Email Login ---------------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    try {
      // Direct login without email confirmation
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password
      })

      if (error) {
        // Provide specific error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before signing in.')
        } else if (error.message.includes('Too many requests')) {
          setError('Too many login attempts. Please try again later.')
        } else {
          setError(error.message)
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Successful login - redirect to dashboard
        setSuccess('Login successful! Redirecting...')
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "http://localhost:3000/auth/callback"

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-8">
          {/* Logo / Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <V0Logo className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground">
                Secure access to <span className="font-medium">PhishGuard AI</span>
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="glassmorphism border-border/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>
                Use your email/phone or continue with Google
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent hover:bg-muted/40 transition"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign in with credentials
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email or Phone Number</Label>
                  <div className="relative">
                    {/^\+?[\d\s-]{10,}$/.test(identifier) ? (
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="you@example.com or +1234567890"
                      className="pl-10"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Success */}
                {success && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Don’t have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="font-medium text-primary hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back */}
          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
