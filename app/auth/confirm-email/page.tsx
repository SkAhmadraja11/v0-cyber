"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Shield, Mail, CheckCircle, AlertTriangle, Clock } from "lucide-react"

function EmailConfirmationContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()

  useEffect(() => {
    if (token) {
      confirmEmail(token)
    }
  }, [token])

  const confirmEmail = async (confirmation_token: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get confirmation record
      const { data: confirmation, error: confirmationError } = await supabase
        .from('email_confirmations')
        .select('*')
        .eq('confirmation_token', confirmation_token)
        .single()

      if (confirmationError || !confirmation) {
        setError('Invalid or expired confirmation link')
        setIsLoading(false)
        return
      }

      // Check if expired
      if (new Date(confirmation.expires_at) < new Date()) {
        setError('Confirmation link has expired')
        setIsLoading(false)
        return
      }

      // Check if already confirmed
      if (confirmation.is_confirmed) {
        setError('This confirmation link has already been used')
        setIsLoading(false)
        return
      }

      // Mark as confirmed
      const { error: updateError } = await supabase
        .from('email_confirmations')
        .update({ is_confirmed: true })
        .eq('id', confirmation.id)

      if (updateError) {
        setError('Failed to confirm email')
        setIsLoading(false)
        return
      }

      // Get user profile for display
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', confirmation.user_id)
        .single()

      setEmail(profile?.email || '')
      setIsConfirmed(true)
      setIsLoading(false)

    } catch (error) {
      console.error('Error confirming email:', error)
      setError('Confirmation failed. Please try again.')
      setIsLoading(false)
    }
  }

  const handleRequestNewConfirmation = async () => {
    if (!email) return

    try {
      const response = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setError('New confirmation email sent. Please check your inbox.')
      } else {
        setError('Failed to send new confirmation email.')
      }
    } catch (error) {
      console.error('Error requesting new confirmation:', error)
      setError('Failed to send confirmation email.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="fixed inset-0 bg-grid-pattern opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        <div className="w-full max-w-md relative z-10">
          <Card className="glassmorphism border-border/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Confirming Email</CardTitle>
              <CardDescription>Please wait while we verify your confirmation...</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="fixed inset-0 bg-grid-pattern opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5" />

        <div className="w-full max-w-md relative z-10">
          <Card className="glassmorphism border-green-500/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-green-600">Email Confirmed!</CardTitle>
              <CardDescription>Your login attempt has been verified</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Thank you for confirming your login attempt. You can now securely access your account.
                </p>
                
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full"
                >
                  Continue to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold tracking-tight">Email Confirmation</h1>
              <p className="text-muted-foreground">
                Verify your login attempt
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="glassmorphism border-border/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Confirm Login</CardTitle>
              <CardDescription>
                {error ? 'There was a problem' : 'Please confirm your login attempt'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-center space-y-4">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    We've sent a confirmation email to your registered email address.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please click the confirmation link in the email to proceed with login.
                  </p>
                </div>
              )}

              {error && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Confirmation links expire after 1 hour</span>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={handleRequestNewConfirmation}
                    className="w-full"
                    disabled={!email}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Request New Confirmation
                  </Button>
                </div>
              )}

              <Button 
                variant="ghost" 
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                ← Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <EmailConfirmationContent />
    </Suspense>
  )
}
