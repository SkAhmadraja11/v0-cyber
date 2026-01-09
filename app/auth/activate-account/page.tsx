"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Shield, Mail, CheckCircle, AlertTriangle, Clock, UserPlus } from "lucide-react"

function ActivateAccountContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isActivated, setIsActivated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClient()

  useEffect(() => {
    if (token) {
      activateAccount(token)
    }
  }, [token])

  const activateAccount = async (activation_token: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get activation record
      const { data: activation, error: activationError } = await supabase
        .from('user_activations')
        .select('*')
        .eq('activation_token', activation_token)
        .single()

      if (activationError || !activation) {
        setError('Invalid or expired activation link')
        setIsLoading(false)
        return
      }

      // Check if expired
      if (new Date(activation.expires_at) < new Date()) {
        setError('Activation link has expired')
        setIsLoading(false)
        return
      }

      // Check if already activated
      if (activation.is_activated) {
        setError('This activation link has already been used')
        setIsLoading(false)
        return
      }

      // Mark as activated
      const { error: updateError } = await supabase
        .from('user_activations')
        .update({ is_activated: true })
        .eq('id', activation.id)

      if (updateError) {
        setError('Failed to activate account')
        setIsLoading(false)
        return
      }

      // Update user profile activation status
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ is_activated: true })
        .eq('id', activation.user_id)

      if (profileUpdateError) {
        setError('Failed to update profile')
        setIsLoading(false)
        return
      }

      // Get user profile for display
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', activation.user_id)
        .single()

      setEmail(profile?.email || '')
      setIsActivated(true)
      setIsLoading(false)

    } catch (error: any) {
      console.error('Error activating account:', error)
      setError('Account activation failed. Please try again.')
      setIsLoading(false)
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
              <CardTitle className="text-2xl">Activating Account</CardTitle>
              <CardDescription>Please wait while we activate your account...</CardDescription>
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

  if (isActivated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="fixed inset-0 bg-grid-pattern opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5" />

        <div className="w-full max-w-md relative z-10">
          <Card className="glassmorphism border-green-500/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-green-600">Account Activated!</CardTitle>
              <CardDescription>Your PhishGuard AI account is now ready</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Congratulations! Your account has been successfully activated.
                </p>
                <p className="text-muted-foreground">
                  You can now set up Multi-Factor Authentication and start using PhishGuard AI.
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
              <h1 className="text-3xl font-bold tracking-tight">Account Activation</h1>
              <p className="text-muted-foreground">
                Activate your PhishGuard AI account
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="glassmorphism border-border/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Activate Account</CardTitle>
              <CardDescription>
                {error ? 'There was a problem' : 'Please activate your account'}
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
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    We're activating your PhishGuard AI account. This will only take a moment.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we set up your secure authentication system.
                  </p>
                </div>
              )}

              {error && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Activation links expire after 24 hours</span>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/auth/sign-up')}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create New Account
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

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ActivateAccountContent />
    </Suspense>
  )
}
