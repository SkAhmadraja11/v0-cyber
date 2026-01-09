"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MFAUtils } from "@/lib/mfa-utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import { Shield, Smartphone, Key, Copy, Check, AlertTriangle, ArrowRight } from "lucide-react"

export default function MFAEnrollmentPage() {
  const [secret, setSecret] = useState("")
  const [qrCodeDataURL, setQrCodeDataURL] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    initializeMFASetup()
  }, [])

  const initializeMFASetup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Generate secret and QR code
      const newSecret = MFAUtils.generateSecret()
      setSecret(newSecret)
      
      const qrDataURL = await MFAUtils.generateQRCodeDataURL(
        newSecret,
        user.email || '',
        'PhishGuard AI'
      )
      setQrCodeDataURL(qrDataURL)

      // Generate backup codes
      const newBackupCodes = MFAUtils.generateBackupCodes(10)
      setBackupCodes(newBackupCodes)
    } catch (error) {
      console.error('Error initializing MFA setup:', error)
      setError('Failed to initialize MFA setup')
    }
  }

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } catch (error) {
      console.error('Failed to copy secret:', error)
    }
  }

  const handleCopyAllCodes = async () => {
    try {
      const codesText = backupCodes.join('\n')
      await navigator.clipboard.writeText(codesText)
      setCopiedCodes(backupCodes.map((_, index) => index))
      setTimeout(() => setCopiedCodes([]), 2000)
    } catch (error) {
      console.error('Failed to copy backup codes:', error)
    }
  }

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodes(prev => [...prev, index])
      setTimeout(() => {
        setCopiedCodes(prev => prev.filter(i => i !== index))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleVerifySetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!MFAUtils.verifyToken(secret, verificationCode)) {
        setError('Invalid verification code. Please try again.')
        return
      }

      // Save MFA setup to database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const hashedBackupCodes = await MFAUtils.hashBackupCodes(backupCodes)

      const { error: mfaError } = await supabase
        .from('user_mfa')
        .upsert({
          user_id: user.id,
          secret: secret,
          backup_codes: hashedBackupCodes,
          enabled: true
        })

      if (mfaError) throw mfaError

      setStep('backup')
    } catch (error: any) {
      console.error('Error verifying MFA setup:', error)
      
      // Provide more specific error messages
      if (error?.code === 'PGRST116') {
        setError('MFA table not found. Please run database migration script first.')
      } else if (error?.code === '42501') {
        setError('Permission denied. Please check database RLS policies.')
      } else {
        setError(`Failed to save MFA setup: ${error?.message || 'Unknown error'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteSetup = () => {
    router.push('/dashboard')
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="fixed inset-0 bg-grid-pattern opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        <div className="w-full max-w-lg relative z-10">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Set Up MFA</h1>
                <p className="text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>

            {/* Card */}
            <Card className="glassmorphism border-border/60 shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Enable Multi-Factor Authentication</CardTitle>
                <CardDescription>
                  Scan the QR code with your authenticator app
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* QR Code */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 bg-white p-4 rounded-lg border">
                    {qrCodeDataURL && (
                      <img 
                        src={qrCodeDataURL} 
                        alt="QR Code for MFA Setup" 
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Scan this QR code with Google Authenticator, Authy, or Microsoft Authenticator
                  </p>
                </div>

                {/* Manual Entry */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Can't scan? Enter manually:</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={secret} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopySecret}
                    >
                      {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Continue Button */}
                <Button 
                  onClick={() => setStep('verify')}
                  className="w-full"
                >
                  Continue to Verification
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="fixed inset-0 bg-grid-pattern opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                <Smartphone className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Verify Setup</h1>
                <p className="text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>

            {/* Card */}
            <Card className="glassmorphism border-border/60 shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
                <CardDescription>
                  Confirm that your authenticator app is working correctly
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleVerifySetup} className="space-y-4">
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

                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify and Enable MFA"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'backup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
        <div className="fixed inset-0 bg-grid-pattern opacity-20" />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        <div className="w-full max-w-2xl relative z-10">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">MFA Enabled!</h1>
                <p className="text-muted-foreground">
                  Save these backup codes for account recovery
                </p>
              </div>
            </div>

            {/* Card */}
            <Card className="glassmorphism border-border/60 shadow-xl">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Backup Codes
                </CardTitle>
                <CardDescription>
                  Save these codes in a secure location. Each code can only be used once.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Save these codes now. You won't be able to see them again!
                  </AlertDescription>
                </Alert>

                {/* Backup Codes Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <code className="flex-1 font-mono text-sm">{code}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(code, index)}
                      >
                        {copiedCodes.includes(index) ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCopyAllCodes}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Codes
                  </Button>
                  <Button 
                    onClick={handleCompleteSetup}
                    className="flex-1"
                  >
                    Complete Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return null
}
