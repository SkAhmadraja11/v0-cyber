"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lightbulb, ArrowRight, Star, ShieldCheck, Lock, AlertTriangle, Zap } from "lucide-react"

export default function CyberQuizGame({ onComplete }: { onComplete: (score: number) => void }) {
    const questions = [
        // Security Awareness
        {
            q: "What is the best way to secure your WiFi?",
            a: ["No Password", "WEP (Old Standard)", "WPA3 (Latest Standard)", "Hidden SSID"],
            c: 2,
            icon: WifiIcon,
            info: "WPA3 (Wi-Fi Protected Access 3) is currently the most secure protocol. WEP is obsolete and easily hacked. Hiding your SSID does not stop hackers from finding your network."
        },
        {
            q: "A lock icon in the browser means...",
            a: ["The site is 100% safe", "Connection is Encrypted", "No Viruses", "Government Approved"],
            c: 1,
            icon: Lock,
            info: "The lock means your connection to the server is encrypted (HTTPS). However, a phishing site can still have a lock icon! It protects privacy, not legitimacy."
        },
        {
            q: "Which is a weak password?",
            a: ["Tr0ub4dour&3", "correct-horse-battery-staple", "P@ssw0rd1", "Xy9#m2!pL"],
            c: 2,
            icon: ShieldCheck,
            info: "'P@ssw0rd1' is extremely common. Attackers use 'dictionary attacks' to guess these instantly. Length is more important than complexity – 'correct-horse-battery-staple' is actually very strong due to length!"
        },
        {
            q: "You find a USB drive in the parking lot. What should you do?",
            a: ["Plug it in to find the owner", "Throw it in the trash", "Give it to IT Security", "Format it and keep it"],
            c: 2,
            icon: AlertTriangle,
            info: "Never plug in unknown drives! They can contain 'BadUSB' malware that acts as a keyboard and hacks your computer in seconds. Hand it to security professionals."
        },
        // Cryptography Focus
        {
            q: "What does 'End-to-End Encryption' (E2EE) mean?",
            a: ["Data is encrypted only on the server", "Only the sender and receiver can read the message", "The government has a backup key", "It protects against screen recording"],
            c: 1,
            icon: Lock,
            info: "E2EE ensures that no one in the middle (including the app company, ISPs, or hackers) can read the message. Only the endpoints (your device and the recipient's) have the keys."
        },
        {
            q: "Which of these is a 'Symmetric' encryption algorithm?",
            a: ["RSA", "AES", "ECC", "Diffie-Hellman"],
            c: 1,
            icon: KeyIcon,
            info: "AES (Advanced Encryption Standard) is Symmetric, meaning the SAME key is used to encrypt and decrypt. RSA is Asymmetric (uses a Public and Private key pair)."
        },
        {
            q: "What is a 'Hash' function (like SHA-256) used for?",
            a: ["To compress files", "To encrypt passwords so they can be decrypted later", "To verify data integrity (fingerprinting)", "To hide IP addresses"],
            c: 2,
            icon: FingerprintIcon,
            info: "Hashes are one-way fingerprints. You cannot 'decrypt' a hash. They are used to verify that a file or password hasn't been altered. If one bit changes, the hash changes completely."
        },
        {
            q: "What is the danger of using the same password everywhere?",
            a: ["It's hard to remember", "Credential Stuffing Attacks", "The internet will run out of passwords", "It slows down login times"],
            c: 1,
            icon: ShieldCheck,
            info: "If one site gets hacked and leaks your password, attackers use botnets to try that same email/password combo on thousands of other sites (Credential Stuffing)."
        }
    ]

    const [idx, setIdx] = useState(0)
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [showInfo, setShowInfo] = useState(false)
    const [lastCorrect, setLastCorrect] = useState(false)

    // Icons
    function WifiIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" /><path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" /></svg> }
    function KeyIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" /></svg> }
    function FingerprintIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M21.1 10.1c.15.5.21 1.02.21 1.54 0 5.4-3.69 10.36-9.1 10.36-4.95 0-8.52-4.13-9.12-9.11A8.99 8.99 0 0 1 6.55 3.06" /><path d="M14.28 7.37c1.37.5 2.5 1.5 3.32 2.72" /><path d="M12.98 5.62c1.78-.65 3.73-.55 5.43.3" /></svg> }

    const handleAns = (i: number) => {
        const isCorrect = i === questions[idx].c
        setLastCorrect(isCorrect)
        if (isCorrect) {
            setStreak(s => s + 1)
            setScore(s => s + 100 + (streak * 20)) // Streak bonus
        } else {
            setStreak(0)
        }
        setShowInfo(true)
    }

    const nextQ = () => {
        setShowInfo(false)
        if (idx + 1 < questions.length) {
            setIdx(n => n + 1)
        } else {
            onComplete(score + (lastCorrect ? 100 : 0))
        }
    }

    const CurrentIcon = questions[idx].icon
    const progress = ((idx + 1) / questions.length) * 100

    return (
        <Card className="max-w-2xl mx-auto p-0 border-4 border-primary/20 bg-background shadow-2xl relative overflow-hidden group">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 transition-colors duration-1000 ${streak > 2 ? 'bg-yellow-500/10' : ''}`} />

            {/* Header / Progress */}
            <div className="bg-muted p-4 border-b flex justify-between items-center relative overflow-hidden">
                <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-lg shadow-sm">
                        <Star className={`w-5 h-5 ${streak > 2 ? 'text-yellow-500 fill-yellow-500 animate-spin-slow' : 'text-slate-400'}`} />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Score</div>
                        <div className="font-bold text-xl leading-none">{score}</div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                        <Zap className={`w-4 h-4 ${streak > 0 ? 'fill-current' : ''}`} />
                        <span>{streak} Streak</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">Q.{idx + 1}/{questions.length}</div>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 rounded-full bg-primary/10 mb-4 animate-in zoom-in ring-4 ring-primary/5 shadow-lg">
                        <CurrentIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 leading-relaxed">{questions[idx].q}</h2>
                </div>

                {!showInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {questions[idx].a.map((ans, i) => (
                            <Button
                                key={i}
                                onClick={() => handleAns(i)}
                                className="h-auto py-6 text-lg bg-card hover:bg-primary hover:text-primary-foreground border-2 border-primary/10 hover:border-primary transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-xl active:scale-95 text-wrap"
                                variant="outline"
                            >
                                {ans}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className={`p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 shadow-inner ${lastCorrect ? "bg-green-500/10 border-2 border-green-500/50" : "bg-red-500/10 border-2 border-red-500/50"}`}>
                        <div className="flex items-center gap-3 mb-4">
                            {lastCorrect ? (
                                <ShieldCheck className="w-8 h-8 text-green-500 drop-shadow-sm" />
                            ) : (
                                <AlertTriangle className="w-8 h-8 text-red-500 drop-shadow-sm" />
                            )}
                            <h3 className={`text-xl font-bold ${lastCorrect ? "text-green-500" : "text-red-500"}`}>
                                {lastCorrect ? "Correct!" : "Incorrect"}
                            </h3>
                        </div>

                        <div className="bg-background/80 backdrop-blur p-4 rounded-lg border mb-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
                                <p className="text-foreground/90 leading-relaxed">
                                    {questions[idx].info}
                                </p>
                            </div>
                        </div>

                        <Button onClick={nextQ} size="lg" className="w-full text-lg font-bold shadow-lg hover:shadow-primary/50 transition-all">
                            Next Question <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    )
}
