"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Fingerprint, Smartphone, KeyRound, Timer } from "lucide-react"

export default function AuthPuzzleGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [step, setStep] = useState(0) // 0: Password, 1: 2FA, 2: Bio
    const [timeLeft, setTimeLeft] = useState(15) // Short timer for OTP
    const [otp, setOtp] = useState("000000")
    const [input, setInput] = useState("")
    const [score, setScore] = useState(0)

    // Generate new OTP
    useEffect(() => {
        if (step === 1) {
            setOtp(Math.floor(100000 + Math.random() * 900000).toString())
            setTimeLeft(15)
        }
    }, [step])

    // Timer
    useEffect(() => {
        if (step !== 1) return
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 0) {
                    setOtp(Math.floor(100000 + Math.random() * 900000).toString()) // Rotate OTP
                    return 15
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [step])

    const handlePassword = () => {
        if (input.length > 5) { // Simple check
            setScore(s => s + 100)
            setStep(1)
            setInput("")
        }
    }

    const handleOtp = () => {
        if (input === otp) {
            setScore(s => s + 100)
            setStep(2)
        } else {
            // Shake effect logic would go here
            setInput("")
        }
    }

    const handleBio = () => {
        setScore(s => s + 100)
        setTimeout(() => onComplete(score + 100), 500)
    }

    return (
        <div className="max-w-sm mx-auto p-6 border rounded-xl shadow-2xl bg-white text-center space-y-6">
            <h2 className="text-2xl font-bold mb-4">Secure Login</h2>

            {step === 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8 text-blue-600" />
                    </div>
                    <Input
                        type="password"
                        placeholder="Enter Password"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="text-center text-lg"
                    />
                    <Button onClick={handlePassword} className="w-full">Sign In</Button>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <Smartphone className="w-8 h-8 text-purple-600" />
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                            New SMS
                        </div>
                    </div>

                    <div className="bg-slate-100 p-4 rounded-lg font-mono text-xl tracking-widest border border-slate-300">
                        {otp}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-bold">
                        <Timer className="w-4 h-4" /> Expires in {timeLeft}s
                    </div>

                    <Input
                        placeholder="Enter 6-digit code"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="text-center text-lg tracking-widest"
                        maxLength={6}
                    />
                    <Button onClick={handleOtp} className="w-full bg-purple-600 hover:bg-purple-700">Verify 2FA</Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right py-8">
                    <div className="relative w-24 h-24 mx-auto cursor-pointer group" onClick={handleBio}>
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
                        <div className="relative w-full h-full bg-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500 group-hover:bg-green-500/20 transition-all">
                            <Fingerprint className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <p className="text-muted-foreground animate-pulse">Touch ID Required</p>
                </div>
            )}
        </div>
    )
}
