"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"
import { Scan, CheckCircle2, XCircle, Camera, Loader2, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function FaceVerifyPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error("Camera access denied:", err)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setCameraActive(false)
    }
  }

  const handleVerification = async () => {
    setIsScanning(true)
    setIsFailed(false)
    setProgress(0)

    // Simulate AI face detection progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Simulate verification process
    setTimeout(async () => {
      clearInterval(interval)
      setProgress(100)

      // Simulate human verification (90% success rate for demo)
      const isHuman = Math.random() > 0.1

      if (isHuman) {
        setIsVerified(true)
        setIsScanning(false)
        stopCamera()

        // Auto-login after successful face verification
        setTimeout(() => {
          const supabase = createClient()
          // In a real implementation, this would verify against stored face data
          router.push("/dashboard")
        }, 2000)
      } else {
        setIsFailed(true)
        setIsScanning(false)
        setProgress(0)
      }
    }, 2500)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Face Verification</h1>
              <p className="text-muted-foreground">Advanced human detection and authentication</p>
            </div>
          </div>

          <Card className="glassmorphism border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Biometric Authentication</CardTitle>
              <CardDescription>Verify your identity using facial recognition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Camera Preview */}
              <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-border/50">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {isScanning && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                          <div className="w-64">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-sm text-white mt-2">Analyzing facial features... {progress}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {isVerified && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center space-y-4">
                          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                          <div>
                            <p className="text-xl font-bold text-white">Human Verified!</p>
                            <p className="text-sm text-white/80">Redirecting to dashboard...</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {isFailed && (
                      <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center space-y-4">
                          <XCircle className="w-16 h-16 text-destructive mx-auto" />
                          <div>
                            <p className="text-xl font-bold text-white">Verification Failed</p>
                            <p className="text-sm text-white/80">Please try again</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-foreground">Camera Inactive</p>
                        <p className="text-sm text-muted-foreground">Click below to start verification</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm font-medium">Enable Camera</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Allow camera access for verification</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm font-medium">Position Face</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Center your face in the frame</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm font-medium">Verify Identity</p>
                  </div>
                  <p className="text-xs text-muted-foreground">AI will confirm you're human</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {!cameraActive ? (
                  <Button onClick={startCamera} className="w-full" size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>
                ) : !isVerified ? (
                  <Button onClick={handleVerification} disabled={isScanning} className="w-full" size="lg">
                    {isScanning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Scan className="w-5 h-5 mr-2" />
                        Start Verification
                      </>
                    )}
                  </Button>
                ) : null}

                <div className="flex gap-3">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Use Email Instead
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1">
                    <Button variant="ghost" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Security Notice */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Privacy Notice:</strong> Your facial data is processed locally and
                  never stored on our servers. We use advanced ML algorithms to verify you're a real human, not a bot.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
