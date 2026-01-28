"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, User, Send, PhoneOff, ShieldAlert, MoreVertical, Image as ImageIcon, Camera, Mic, Paperclip, CheckCheck, Lock } from "lucide-react"

type Scenario = {
    contactName: string
    contactAvatar: string
    contactStatus: string
    intro: string
    options: { text: string; safe: boolean; reply: string; trustChange: number }[]
    type: "phishing" | "scam" | "legit"
}

const SCENARIOS: Scenario[] = [
    {
        contactName: "IT Support (Official)",
        contactAvatar: "IT",
        contactStatus: "Online",
        intro: "URGENT: Suspicious login detected on your account from IP 192.168.1.5 (Russia). Please verify your password immediately to prevent lockout.",
        type: "phishing",
        options: [
            { text: "Oh no! It's 'Hunter2'. Please lock it!", safe: false, reply: "Got it. Taking over account now... I mean guarding it. (Account Compromised)", trustChange: -100 },
            { text: "I will log in to the portal myself to check.", safe: true, reply: "Good compliance. Never share passwords via chat.", trustChange: 20 },
            { text: "What is your Employee ID?", safe: true, reply: "I... uh... system error. (Attacker disconnected)", trustChange: 20 }
        ]
    },
    {
        contactName: "CEO - John Smith",
        contactAvatar: "CEO",
        contactStatus: "Busy",
        intro: "Hey, I'm stuck in a meeting. I need a favor. Can you buy 5x $100 Apple Gift Cards? I need them for a client gift ASAP. Will reimburse you + bonus.",
        type: "scam",
        options: [
            { text: "Sure boss! On my way.", safe: false, reply: "Excellent. Send the codes to this private number.", trustChange: -50 },
            { text: "I need to verify this voice-to-voice per protocol.", safe: true, reply: "Just do it! ... Fine. You passed the test.", trustChange: 20 },
            { text: "This sounds like a scam.", safe: true, reply: "Smart. CEO Fraud is common.", trustChange: 20 }
        ]
    },
    {
        contactName: "Emily (Hinge)",
        contactAvatar: "❤️",
        contactStatus: "Online",
        intro: "Omg you are so cute! 😍 My crypto portfolio just went up 500% today. I can teach you how to trade if you want? It's easy money!",
        type: "scam",
        options: [
            { text: "Wow really? Show me how!", safe: false, reply: "Just send $1000 to this wallet address first...", trustChange: -40 },
            { text: "No thanks, not interested in crypto.", safe: true, reply: "Ugh, your loss. (Bot detects resistance)", trustChange: 10 },
            { text: "Reported for Pig Butchering scam.", safe: true, reply: "Account flagged.", trustChange: 30 }
        ]
    }
]

export default function SocialEngineeringGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [messages, setMessages] = useState<{ sender: "bot" | "user", text: string, time: string }[]>([])
    const [currentScenario, setCurrentScenario] = useState(0)
    const [trust, setTrust] = useState(50) // 0 = Pwned, 100 = Secure
    const [score, setScore] = useState(0)
    const [isTyping, setIsTyping] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)

    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    useEffect(() => {
        if (currentScenario >= SCENARIOS.length) {
            onComplete(score)
            return
        }

        // Init Scenario
        setMessages([])
        setTrust(50)
        setIsTyping(true)

        const timer = setTimeout(() => {
            setIsTyping(false)
            setMessages([{ sender: "bot", text: SCENARIOS[currentScenario].intro, time: getCurrentTime() }])
            setShowOptions(true)
        }, 1500)

        return () => clearTimeout(timer)
    }, [currentScenario])

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isTyping])

    const handleOption = (index: number) => {
        const scenario = SCENARIOS[currentScenario]
        const choice = scenario.options[index]

        setShowOptions(false)
        setMessages(prev => [...prev, { sender: "user", text: choice.text, time: getCurrentTime() }])

        setIsTyping(true)

        setTimeout(() => {
            setIsTyping(false)
            const isBad = !choice.safe

            setMessages(prev => [...prev, {
                sender: "bot",
                text: choice.reply,
                time: getCurrentTime()
            }])

            if (choice.safe) {
                setScore(s => s + 100)
                setTrust(Math.min(100, trust + 20))
            } else {
                setScore(s => Math.max(0, s - 50))
                setTrust(Math.max(0, trust - 40))
            }

            setTimeout(() => {
                if (currentScenario < SCENARIOS.length) {
                    setCurrentScenario(p => p + 1)
                }
            }, 2000)

        }, 1500 + Math.random() * 1000)
    }

    const scenario = SCENARIOS[currentScenario] || SCENARIOS[0]

    return (
        <Card className="h-[650px] flex flex-col max-w-sm mx-auto overflow-hidden bg-slate-100 dark:bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] shadow-2xl relative">
            {/* Phone Notch/Status Bar */}
            <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex justify-between items-center text-xs font-medium z-10 rounded-t-[2rem]">
                <div>9:41</div>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-white/20 rounded-sm" />
                    <div className="w-4 h-4 bg-white/20 rounded-sm" />
                    <div className="w-6 h-3 bg-green-500 rounded-sm" />
                </div>
            </div>

            {/* App Header */}
            <div className="bg-slate-100 dark:bg-slate-900 border-b p-3 flex items-center gap-3 z-10 shadow-sm">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                    <span className="text-xl">‹</span>
                </Button>
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {scenario.contactAvatar.length > 2 ? scenario.contactAvatar : scenario.contactAvatar.slice(0, 2)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-sm truncate text-slate-900 dark:text-white">{scenario.contactName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        {isTyping ? "typing..." : scenario.contactStatus}
                        {scenario.type === "scam" || scenario.type === "phishing" ? <span className="text-red-500 ml-1 hidden">(!Suspicious!)</span> : null}
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-blue-500">
                    <PhoneOff className="w-5 h-5" />
                </Button>
            </div>

            {/* Trust Meter (Hidden HUD) */}
            <div className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-1 text-center font-bold border-b border-yellow-200">
                <ShieldAlert className="w-3 h-3 inline mr-1" />
                SUSPICION LEVEL: <span className={trust < 40 ? "text-green-600" : "text-red-600"}>{100 - trust}%</span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5e5f7] dark:bg-slate-950 relative">
                {/* Wallpaper Pattern */}
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] bg-[radial-gradient(#444cf7_0.5px,transparent_0.5px),radial-gradient(#444cf7_0.5px,#e5e5f7_0.5px)] dark:bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px),radial-gradient(#ffffff_0.5px,#0f172a_0.5px)] bg-[length:20px_20px] pointer-events-none" />

                {/* Encryption Notice */}
                <div className="flex justify-center my-4">
                    <div className="bg-yellow-200/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-[10px] px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm max-w-[80%] text-center">
                        <Lock className="w-3 h-3" />
                        Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                    </div>
                </div>

                {messages.map((m, i) => (
                    <div key={i} className={`flex w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        <div className={`
                            max-w-[75%] px-3 py-2 rounded-2xl shadow-sm text-sm relative group
                            ${m.sender === 'user'
                                ? 'bg-[#005c4b] text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'}
                        `}>
                            {m.text}
                            <div className={`text-[10px] text-right mt-1 opacity-70 flex items-center justify-end gap-1`}>
                                {m.time}
                                {m.sender === 'user' && <CheckCheck className="w-3 h-3" />}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in">
                        <div className="bg-white dark:bg-slate-800 dark:text-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="bg-slate-100 dark:bg-slate-900 p-2 flex items-end gap-2 border-t z-10 pb-6">
                {showOptions ? (
                    <div className="flex flex-col gap-2 w-full animate-in slide-in-from-bottom-10">
                        {scenario.options.map((opt, i) => (
                            <Button
                                key={i}
                                onClick={() => handleOption(i)}
                                className="w-full justify-start text-left h-auto py-3 bg-white dark:bg-slate-800 dark:text-white text-slate-800 border hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm rounded-xl"
                                variant="ghost"
                            >
                                <span className="mr-2 text-lg">
                                    {i === 0 ? "A" : i === 1 ? "B" : "C"}
                                </span>
                                <span className="text-sm font-normal">{opt.text}</span>
                            </Button>
                        ))}
                    </div>
                ) : (
                    <>
                        <Button size="icon" variant="ghost"><MoreVertical className="w-5 h-5 text-slate-500" /></Button>
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-full h-10 px-4 flex items-center text-slate-400 text-sm border">
                            Type a message...
                        </div>
                        <Button size="icon" className="bg-[#005c4b] hover:bg-[#004a3c] rounded-full h-10 w-10">
                            <Mic className="w-5 h-5" />
                        </Button>
                    </>
                )}
            </div>
        </Card>
    )
}
