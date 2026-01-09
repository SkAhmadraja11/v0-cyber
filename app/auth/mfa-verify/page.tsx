"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MFAUtils, MFARateLimit } from "@/lib/mfa-utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import { Shield, Smartphone, Key, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"

function MFAVerifyContent() {
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mfaData, setMfaData] = useState<any>(null)
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Send login confirmation notification
  const sendLoginNotification = async (email: string) => {
    try {
      const response = await fetch('/api/auth/login-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          loginTime: new Date().toISOString(),
          ipAddress: 'unknown', // In production, you'd get this from request headers
          userAgent: navigator.userAgent
        })
      })

      if (!response.ok) {
        console.error('Failed to send login notification')
      }
    } catch (error) {
      console.error('Error sending login notification:', error)
    }
  }

  useEffect(() => {
    // Check if user is authenticated and has MFA enabled
    checkMFAStatus()
  }, [])

  const checkMFAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get MFA data for user
      const { data: mfaRecord, error: mfaError } = await supabase
        .from('user_mfa')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (mfaError || !mfaRecord || !mfaRecord.enabled) {
        // User doesn't have MFA enabled, redirect to dashboard
        router.push('/dashboard')
        return
      }

      setMfaData(mfaRecord)
      
      // Check rate limiting
      const rateLimitKey = `mfa_${user.id}`
      if (!MFARateLimit.checkRateLimit(rateLimitKey)) {
        setIsRateLimited(true)
        setError('Too many failed attempts. Please try again later.')
      }
      
      setAttemptsRemaining(MFARateLimit.getRemainingAttempts(rateLimitKey))
    } catch (error) {
      console.error('Error checking MFA status:', error)
      setError('Failed to verify MFA status')
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaData) return

    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const rateLimitKey = `mfa_${user.id}`
      
      if (!MFARateLimit.checkRateLimit(rateLimitKey)) {
        setIsRateLimited(true)
        setError('Too many failed attempts. Please try again later.')
        setIsLoading(false)
        return
      }

      let isValid = false
      let isBackup = false

      if (useBackupCode) {
        // Verify backup code
        const result = await MFAUtils.verifyBackupCode(backupCode, mfaData.backup_codes)
        if (result.isValid && result.codeIndex !== undefined) {
          isValid = true
          isBackup = true
          
          // Remove used backup code
          const updatedBackupCodes = MFAUtils.removeUsedBackupCode(
            mfaData.backup_codes, 
            result.codeIndex
          )
          
          // Update database with remaining backup codes
          const { error: updateError } = await supabase
            .from('user_mfa')
            .update({ backup_codes: updatedBackupCodes })
            .eq('user_id', user.id)
          
          if (updateError) throw updateError
        }
      } else {
        // Verify TOTP code
        isValid = MFAUtils.verifyTokenWithWindow(mfaData.secret, verificationCode)
      }

      if (isValid) {
        // Reset rate limiting on successful verification
        MFARateLimit.resetAttempts(rateLimitKey)
        
        // Complete authentication - redirect to intended destination
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        router.push(redirectTo)
        router.refresh()
        
        // Send login confirmation email (non-blocking)
        try {
          await sendLoginNotification(user.email || '')
        } catch (emailError) {
          console.error('Failed to send login notification email:', emailError)
          // Don't block authentication if email fails
        }
      } else {
        setAttemptsRemaining(MFARateLimit.getRemainingAttempts(rateLimitKey))
        setError(useBackupCode ? 'Invalid backup code' : 'Invalid verification code')
      }
    } catch (error) {
      console.error('Error verifying MFA code:', error)
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    // Clear the session and go back to login
    supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleResendEmail = async () => {
    // This could be implemented to send a temporary bypass code via email
    // For now, just show a message
    setError('Email resend not implemented. Please use backup codes or contact support.')
  }

  if (isRateLimited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="fixed inset-0 bg-grid-pattern opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-destructive/5" />

        <div className="w-full max-w-md relative z-10">
          <Card className="glassmorphism border-destructive/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-destructive">Rate Limited</CardTitle>
              <CardDescription>
                Too many failed attempts
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  You've exceeded the maximum number of verification attempts. Please wait 15 minutes before trying again, or use a backup code.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => setUseBackupCode(true)}
                  className="w-full"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Use Backup Code Instead
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
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
              <h1 className="text-3xl font-bold tracking-tight">Two-Factor Authentication</h1>
              <p className="text-muted-foreground">
                Enter your verification code to continue
              </p>
            </div>
          </div>

          {/* Card */}
          <Card className="glassmorphism border-border/60 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
              <CardDescription>
                {useBackupCode 
                  ? "Enter one of your backup codes" 
                  : "Enter the 6-digit code from your authenticator app"
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Toggle between TOTP and Backup Code */}
              <div className="flex gap-2">
                <Button
                  variant={!useBackupCode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseBackupCode(false)
                    setError(null)
                    setVerificationCode("")
                    setBackupCode("")
                  }}
                  className="flex-1"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  App Code
                </Button>
                <Button
                  variant={useBackupCode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setUseBackupCode(true)
                    setError(null)
                    setVerificationCode("")
                    setBackupCode("")
                  }}
                  className="flex-1"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Backup Code
                </Button>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                {!useBackupCode ? (
                  <div className="space-y-2">
                    <Label htmlFor="code">6-Digit Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest font-mono"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="backupCode">Backup Code</Label>
                    <Input
                      id="backupCode"
                      type="text"
                      placeholder="ABCD1234"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                      className="font-mono"
                      required
                    />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      {error}
                      {!useBackupCode && attemptsRemaining > 0 && (
                        <span className="block mt-1">
                          {attemptsRemaining} attempts remaining
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </form>

              {/* Help Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Can't access your authenticator?</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleResendEmail}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Get Help
                  </Button>
                </div>
              </div>

              {/* Back to Login */}
              <div className="pt-4 border-t">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function MFAVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <MFAVerifyContent />
    </Suspense>
  )
}
