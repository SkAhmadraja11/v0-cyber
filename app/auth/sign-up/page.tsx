"use client"

import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Shield, Mail, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react"

function SignUpContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/send-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Activation email sent to ${email}. Please check your inbox and click the activation link to continue creating your account.`)
      } else {
        setError(data.error || 'Failed to send activation email')
      }
    } catch (error) {
      console.error('Error sending activation email:', error)
      setError('Failed to send activation email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
              <p className="text-muted-foreground">
                Start your secure journey with PhishGuard AI
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="glassmorphism border-border/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Step 1: Email Verification</CardTitle>
              <CardDescription>
                Enter your email address to receive an activation link
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/60 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || !!success}
                    className="h-11"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isLoading || !!success || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Sending Activation Email...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send Activation Email
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              {success && (
                <div className="text-center space-y-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Next Steps:</strong>
                  </p>
                  <ol className="text-sm text-muted-foreground text-left space-y-1">
                    <li>1. Check your email inbox</li>
                    <li>2. Click the activation link</li>
                    <li>3. Set your password on the activation page</li>
                    <li>4. Complete your account setup</li>
                  </ol>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEmail("")
                      setSuccess(null)
                      setError(null)
                    }}
                    className="w-full"
                  >
                    Send to Different Email
                  </Button>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
