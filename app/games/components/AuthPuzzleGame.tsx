"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Fingerprint, Smartphone, KeyRound, Timer, ShieldCheck, Lock, SmartphoneNfc } from "lucide-react"

export default function AuthPuzzleGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [step, setStep] = useState(0) // 0: Password, 1: 2FA, 2: Bio, 3: Authenticator
    const [timeLeft, setTimeLeft] = useState(20)
    const [otp, setOtp] = useState("000000")
    const [input, setInput] = useState("")
    const [score, setScore] = useState(0)
    const [authCode, setAuthCode] = useState("000")

    // Generate new OTP
    useEffect(() => {
        if (step === 1) {
            setOtp(Math.floor(100000 + Math.random() * 900000).toString())
            setTimeLeft(20)
        }
        if (step === 3) {
            setAuthCode(Math.floor(100 + Math.random() * 899).toString())
            setTimeLeft(10)
        }
    }, [step])

    // Timer
    useEffect(() => {
        if (step !== 1 && step !== 3) return
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 0) {
                    if (step === 1) setOtp(Math.floor(100000 + Math.random() * 900000).toString())
                    if (step === 3) setAuthCode(Math.floor(100 + Math.random() * 899).toString())
                    return step === 3 ? 10 : 20
                }
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [step])

    const handlePassword = () => {
        if (input.length > 8 && /[!@#$%]/.test(input)) {
            setScore(s => s + 100)
            setStep(1)
            setInput("")
        } else {
            // Shake logic could go here
        }
    }

    const handleOtp = () => {
        if (input === otp) {
            setScore(s => s + 150)
            setStep(2)
        } else {
            setInput("")
        }
    }

    const handleBio = () => {
        setScore(s => s + 100)
        setStep(3)
        setInput("")
    }

    const handleAuthenticator = () => {
        if (input === authCode) {
            setScore(s => s + 200)
            setTimeout(() => onComplete(score + 200), 500)
        }
    }

    return (
        <div className="max-w-md mx-auto relative rounded-3xl overflow-hidden shadow-2xl bg-white border-8 border-slate-800">
            {/* Device Frame */}
            <div className="bg-slate-800 h-8 absolute top-0 w-full z-20 flex justify-center">
                <div className="w-1/3 h-5 bg-black rounded-b-xl" />
            </div>

            <div className="pt-12 pb-8 px-8 h-[500px] flex flex-col bg-slate-50 relative">

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-blue-600" : "bg-slate-200"}`} />
                    ))}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {step === 0 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Lock className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Identity Verification</h3>
                                <p className="text-sm text-slate-500">Enter your strong password to continue.</p>
                            </div>

                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="h-12 text-center text-lg bg-white shadow-sm"
                                />
                                <div className="text-[10px] text-slate-400 text-center">
                                    Must be 8+ chars & contain special char (!@#$%)
                                </div>
                            </div>
                            <Button onClick={handlePassword} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30">
                                Verify & Continue
                            </Button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                    <Smartphone className="w-10 h-10 text-purple-600" />
                                    <div className="absolute -top-1 -right-1 flex h-6 w-6">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-[10px] items-center justify-center font-bold">1</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">2-Step Verification</h3>
                                <p className="text-sm text-slate-500">Enter the code sent to your device.</p>
                            </div>

                            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 text-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" style={{ width: `${(timeLeft / 20) * 100}%`, transition: 'width 1s linear' }} />
                                <div className="text-sm text-slate-500 mb-2 uppercase tracking-wide">Security Code</div>
                                <div className="font-mono text-3xl font-bold tracking-[0.5em] text-slate-800">{otp}</div>
                            </div>

                            <Input
                                placeholder="000000"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-white shadow-sm"
                                maxLength={6}
                            />
                            <Button onClick={handleOtp} className="w-full h-12 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30">
                                Confirm Code
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500 py-4 text-center">
                            <h3 className="text-xl font-bold text-slate-800">Biometric Scan</h3>

                            <div className="relative w-32 h-32 mx-auto cursor-pointer group tap-highlight-transparent" onClick={handleBio}>
                                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20 duration-1000" />
                                <div className="absolute inset-0 border-2 border-green-500 rounded-full scale-110 opacity-30 animate-pulse" />
                                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-green-100 group-hover:border-green-500 transition-colors shadow-lg">
                                    <Fingerprint className="w-16 h-16 text-green-500 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 animate-pulse">Touch the sensor to verify identity</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SmartphoneNfc className="w-10 h-10 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Authenticator App</h3>
                                <p className="text-sm text-slate-500">Enter the rolling code from your app.</p>
                            </div>

                            <div className="flex justify-center gap-4 text-3xl font-mono font-bold text-slate-800">
                                {authCode.split('').map((d, i) => (
                                    <div key={i} className="w-12 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="text-center text-xs text-orange-500 font-bold">
                                Code changes in {timeLeft}s
                            </div>

                            <Input
                                placeholder="000"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="h-12 text-center text-2xl tracking-[1em] font-mono bg-white shadow-sm"
                                maxLength={3}
                            />

                            <Button onClick={handleAuthenticator} className="w-full h-12 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/30">
                                Finalize Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
