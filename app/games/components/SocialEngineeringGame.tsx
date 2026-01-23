"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, User, Send, PhoneOff, ShieldAlert } from "lucide-react"

export default function SocialEngineeringGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [messages, setMessages] = useState<{ sender: "bot" | "user", text: string }[]>([])
    const [options, setOptions] = useState<{ text: string, safe: boolean, reply: string }[]>([])
    const [score, setScore] = useState(0)
    const [stage, setStage] = useState(0)
    const endRef = useRef<HTMLDivElement>(null)

    const SCENARIOS = [
        {
            intro: "Hello! This is IT Support. We noticed suspicious activity on your account. Can you please confirm your password so we can lock it?",
            options: [
                { text: "Sure, it is hunter2.", safe: false, reply: "Got it! (Account Hacked)" },
                { text: "IT Support never asks for passwords.", safe: true, reply: "Correct. We will never ask that." },
                { text: "Who is this?", safe: true, reply: "I am... uh.. support. (Suspicious)" }
            ]
        },
        {
            intro: "Hey, it's the CEO. I'm in a meeting and can't talk. I need you to buy 5x $100 Gift Cards for a client right now. I'll reimburse you.",
            options: [
                { text: "On it, boss!", safe: false, reply: "Great, send me the codes ASAP." },
                { text: "I need to verify this voice-to-voice.", safe: true, reply: "Smart move. Standard protocol." }
            ]
        },
        {
            intro: "Congratulations! You won a free iPhone 15. Click here to claim: http://bit.ly/free-iphone",
            options: [
                { text: "Click Link", safe: false, reply: "Malware Downloaded." },
                { text: "Delete Message", safe: true, reply: "Scam avoided." }
            ]
        }
    ]

    useEffect(() => {
        if (stage < SCENARIOS.length) {
            setMessages(prev => [...prev, { sender: "bot", text: SCENARIOS[stage].intro }])
            setOptions(SCENARIOS[stage].options)
        } else {
            onComplete(score)
        }
    }, [stage])

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleReply = (option: typeof options[0]) => {
        setMessages(prev => [...prev, { sender: "user", text: option.text }])
        setOptions([]) // Hide options

        setTimeout(() => {
            if (option.safe) {
                setScore(s => s + 100)
                setMessages(prev => [...prev, { sender: "bot", text: "✅ " + option.reply }])
            } else {
                setScore(s => Math.max(0, s - 50))
                setMessages(prev => [...prev, { sender: "bot", text: "❌ " + option.reply }])
            }

            setTimeout(() => {
                setStage(s => s + 1)
            }, 1500)
        }, 600)
    }

    return (
        <Card className="h-[500px] flex flex-col max-w-md mx-auto border-2 shadow-2xl overflow-hidden bg-slate-50">
            <div className="bg-slate-900 text-white p-4 flex items-center shadow-md">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <User className="text-white" />
                </div>
                <div>
                    <div className="font-bold">Unknown Number</div>
                    <div className="text-xs text-green-400">Online</div>
                </div>
                <div className="ml-auto font-mono">{score} pts</div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-100">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <div className="p-4 bg-white border-t space-y-2">
                {options.map((opt, i) => (
                    <Button
                        key={i}
                        onClick={() => handleReply(opt)}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 whitespace-normal"
                    >
                        <MessageSquare className="w-4 h-4 mr-2 shrink-0 text-slate-400" />
                        {opt.text}
                    </Button>
                ))}
                {options.length === 0 && stage < SCENARIOS.length && (
                    <div className="text-center text-xs text-slate-400 animate-pulse">
                        typing...
                    </div>
                )}
            </div>
        </Card>
    )
}
