"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useRef, useEffect } from "react"
import { Scan, CheckCircle2, XCircle, Camera, Loader2, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { RegistrationForm } from "./registration-form" // Import the new form

export default function FaceVerifyPage() {
  const [isScanning, setIsScanning] = useState(false)
  // const [isVerified, setIsVerified] = useState(false) // Replaced by showRegistration flow
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "failed">("idle")
  const [progress, setProgress] = useState(0)
  const [cameraActive, setCameraActive] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [faceId, setFaceId] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
        setScanStatus("idle")
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
    setScanStatus("scanning")
    setProgress(0)

    // Simulate AI face detection progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 150)

    // Simulate verification process
    setTimeout(async () => {
      clearInterval(interval)
      setProgress(100)

      // Simulate human verification (always success for demo logic to show the form)
      const isHuman = true

      if (isHuman) {
        setScanStatus("success")
        setIsScanning(false)
        stopCamera()

        // Generate a mock Face ID
        const mockFaceId = `face_${Math.random().toString(36).substring(2, 10)}`
        setFaceId(mockFaceId)

        // Wait a moment to show success tick, then show registration
        setTimeout(() => {
          setShowRegistration(true)
        }, 1500)

      } else {
        setScanStatus("failed")
        setIsScanning(false)
        setProgress(0)
      }
    }, 3500)
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
          {/* Header (Hidden if registration form is active to reduce clutter, or keep it?) */}
          <div className="flex flex-col items-center gap-4 transition-all duration-500">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground">Face Verification</h1>
              <p className="text-muted-foreground">Advanced ML biometric authentication</p>
            </div>
          </div>

          <Card className="glassmorphism border-border/50 transition-all duration-500">
            <CardHeader className={showRegistration ? "hidden" : ""}>
              <CardTitle className="text-2xl">Biometric Scan</CardTitle>
              <CardDescription>Position your face within the frame</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">

              {showRegistration ? (
                <RegistrationForm
                  faceId={faceId}
                  onCancel={() => {
                    setShowRegistration(false)
                    setScanStatus("idle")
                    startCamera() // Restart camera if they cancel
                  }}
                />
              ) : (
                <>
                  {/* Camera Preview */}
                  <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border-2 border-border/50 shadow-inner group">
                    {/* Grid Overlay for "Tech" feel */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {cameraActive ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />

                        {/* Scanning Overlay */}
                        {scanStatus === "scanning" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/* Scanning Line */}
                            <div className="absolute w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-scan-y top-0" />

                            <div className="text-center space-y-4 bg-black/40 p-6 rounded-2xl backdrop-blur-sm border border-primary/20">
                              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                              <div className="w-64">
                                <div className="h-2 bg-muted/20 rounded-full overflow-hidden border border-white/10">
                                  <div
                                    className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="text-sm text-primary-foreground mt-2 font-mono">
                                  Encoding facial vectors... {progress}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {scanStatus === "success" && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-md animate-in fade-in zoom-in duration-300">
                            <div className="text-center space-y-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-green-500 blur-2xl opacity-50 rounded-full" />
                                <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto relative z-10 drop-shadow-lg" />
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-white drop-shadow-md">Verified</p>
                                <p className="text-green-100">Biometric data matched</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {scanStatus === "failed" && (
                          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center backdrop-blur-md">
                            <div className="text-center space-y-4">
                              <XCircle className="w-16 h-16 text-destructive mx-auto" />
                              <div>
                                <p className="text-xl font-bold text-white">Verification Failed</p>
                                <p className="text-sm text-white/80">Please ensure good lighting</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Face Frame Markers */}
                        {!isScanning && scanStatus === "idle" && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-primary/50 rounded-tl-3xl" />
                            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary/50 rounded-tr-3xl" />
                            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary/50 rounded-bl-3xl" />
                            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-primary/50 rounded-br-3xl" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/80 relative">
                        {/* HUD Elements for Idle State */}
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                          <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                          <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                          <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary rounded-br-xl" />
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/20 rounded-full" />
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/10" />
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/10" />
                        </div>

                        <div className="text-center space-y-4 relative z-10">
                          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto border border-primary/20 animate-pulse">
                            <Scan className="w-10 h-10 text-primary/50" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-primary/80">Biometric Sensor Standby</p>
                            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mt-1">Awaiting Initialization</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {!cameraActive ? (
                      <Button onClick={startCamera} className="w-full h-12 text-lg shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all" size="lg">
                        <Camera className="w-5 h-5 mr-3" />
                        Initialize Camera
                      </Button>
                    ) : scanStatus === "idle" || scanStatus === "failed" ? (
                      <Button onClick={handleVerification} className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-500 transition-colors" size="lg">
                        <Scan className="w-5 h-5 mr-3" />
                        Scan Face
                      </Button>
                    ) : null}

                    {scanStatus === "idle" && (
                      <div className="flex gap-3 pt-2">
                        <Link href="/auth/login" className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent border-dashed">
                            Use Password
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Privacy Footer */}
              {!showRegistration && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Secure ML Processing Environment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
