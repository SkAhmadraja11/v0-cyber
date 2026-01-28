"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, AlertTriangle, ShieldCheck, Skull, Terminal, Play } from "lucide-react"

type StoryNode = {
    id: number
    text: string
    image?: string // Placeholder for future visual novel style images
    choices: { text: string; score: number; nextId: number; feedback: string; type: "good" | "bad" | "neutral" }[]
}

const STORY_DATA: StoryNode[] = [
    {
        id: 0,
        text: "You arrive at your office desk on a chaotic Monday morning. You notice a USB drive labeled 'Executive Salaries 2024' sitting on your keyboard. It wasn't there when you left on Friday.",
        choices: [
            {
                text: "Plug it in to identify the owner",
                score: -100,
                nextId: 1,
                feedback: "CRITICAL ERROR! The drive contained a 'Rubber Ducky' script that immediately installed a backdoor. Never plug in unknown drives.",
                type: "bad"
            },
            {
                text: "Hand it directly to IT Security",
                score: 100,
                nextId: 2,
                feedback: "Excellent. IT Security analyzes it in a sandbox and finds malware. You saved the network.",
                type: "good"
            },
            {
                text: "Ignore it and start working",
                score: 0,
                nextId: 3,
                feedback: "Safe, but passive. The drive remains a risk for someone else to find.",
                type: "neutral"
            }
        ]
    },
    {
        id: 1, // Bad Path (Infected)
        text: "Your screen flashes red. A command prompt opens rapidly executing scripts. Files are starting to encrypt. Ransomware is spreading.",
        choices: [
            {
                text: "Yank the network cable immediately",
                score: 50,
                nextId: 3,
                feedback: "Good reaction! You contained the spread to just your machine.",
                type: "good"
            },
            {
                text: "Restart the computer",
                score: -50,
                nextId: 3,
                feedback: "Rebooting didn't stop the encryption and wasted valuable time.",
                type: "bad"
            }
        ]
    },
    {
        id: 2, // Good Path
        text: "The CISO commends your vigilance. Later that day, you receive an email from 'HR', but the sender address is 'hr-updates@company-internal-mail.com' (not your standard domain). It asks you to verify your direct deposit info.",
        choices: [
            {
                text: "Click the link and login",
                score: -100,
                nextId: 3,
                feedback: "Obvious Phishing! The domain was fake. You just gave away your credentials.",
                type: "bad"
            },
            {
                text: "Report as Phishing to IT",
                score: 100,
                nextId: 3,
                feedback: "Correct. The domain was a lookalike. Good catch.",
                type: "good"
            }
        ]
    },
    {
        id: 3, // Convergence / Next Chapter
        text: "It's 5:00 PM. As you pack up, your phone rings. Caller ID says 'Microsoft Support'. The caller claims your workstation is sending error reports and needs remote access to fix it.",
        choices: [
            {
                text: "Grant access, they sound professional",
                score: -100,
                nextId: 99,
                feedback: "Scam! Microsoft/Apple/Google never call you unsolicited to fix your PC.",
                type: "bad"
            },
            {
                text: "Hang up immediately",
                score: 100,
                nextId: 99,
                feedback: "Correct. This is a classic Tech Support Scam.",
                type: "good"
            },
            {
                text: "Troll them for 20 minutes",
                score: 150,
                nextId: 99,
                feedback: "Legendary. You wasted the scammer's time, saving others from being called.",
                type: "good"
            }
        ]
    },
    {
        id: 99,
        text: "Simulation Complete.",
        choices: []
    }
]

export default function CyberStoryGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [currentId, setCurrentId] = useState(0)
    const [score, setScore] = useState(0)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [feedbackType, setFeedbackType] = useState<"good" | "bad" | "neutral">("neutral")
    const [gameStarted, setGameStarted] = useState(false)

    const currentNode = STORY_DATA.find(n => n.id === currentId) || STORY_DATA[0]

    const handleChoice = (choice: typeof STORY_DATA[0]['choices'][0]) => {
        setScore(s => s + choice.score)
        setFeedback(choice.feedback)
        setFeedbackType(choice.type)

        // Wait for user to read feedback then move on
    }

    const nextStep = (nextId: number) => {
        setFeedback(null)
        if (nextId === 99) {
            onComplete(score)
        } else {
            setCurrentId(nextId)
        }
    }

    if (!gameStarted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in h-[500px] bg-slate-950 text-white rounded-xl border border-slate-800 shadow-2xl">
                <BookOpen className="w-24 h-24 text-blue-500 mb-6" />
                <h1 className="text-4xl font-bold mb-4 tracking-tight">Cyber Chronicles</h1>
                <p className="text-lg text-slate-400 mb-8 max-w-md">Navigate a day in the life of an employee facing real-world cyber threats. Your choices determine the company's fate.</p>
                <Button onClick={() => setGameStarted(true)} size="lg" className="text-xl px-12 py-6 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20">
                    <Play className="w-6 h-6 mr-2 fill-current" /> Begin Strategy
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto h-[600px] flex flex-col relative bg-slate-50 rounded-xl overflow-hidden shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-3">
                    <Terminal className="w-6 h-6 text-green-400" />
                    <span className="font-mono font-bold tracking-widest text-green-400">SIMULATION_ACTIVE</span>
                </div>
                <div className="font-mono text-xl">Score: <span className={score < 0 ? "text-red-400" : "text-blue-400"}>{score}</span></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-8 overflow-y-auto bg-slate-50/50">
                <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto w-full">
                    {!feedback ? (
                        <div className="animate-in fade-in slide-in-from-bottom duration-500 w-full space-y-8">
                            <p className="text-2xl font-medium leading-relaxed text-slate-800 text-center font-serif">
                                &quot;{currentNode.text}&quot;
                            </p>

                            <div className="grid grid-cols-1 gap-4 w-full pt-8">
                                {currentNode.choices.map((choice, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleChoice(choice)}
                                        className="group relative flex items-center p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all text-left w-full hover:-translate-y-1"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors font-bold text-slate-500 group-hover:text-blue-600">
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="text-lg font-medium text-slate-700 group-hover:text-slate-900">{choice.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center animate-in zoom-in duration-300 max-w-xl">
                            {feedbackType === "good" && <ShieldCheck className="w-24 h-24 text-green-500 mx-auto mb-6" />}
                            {feedbackType === "bad" && <Skull className="w-24 h-24 text-red-500 mx-auto mb-6" />}
                            {feedbackType === "neutral" && <AlertTriangle className="w-24 h-24 text-yellow-500 mx-auto mb-6" />}

                            <h3 className={`text-3xl font-bold mb-4 ${feedbackType === "good" ? "text-green-600" :
                                    feedbackType === "bad" ? "text-red-600" : "text-yellow-600"
                                }`}>
                                {feedbackType === "good" ? "WISE CHOICE" : feedbackType === "bad" ? "SECURITY BREACH" : "CAUTION"}
                            </h3>

                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                {feedback}
                            </p>

                            <Button
                                onClick={() => nextStep(currentNode.choices.find(c => c.feedback === feedback)?.nextId || 99)}
                                size="lg"
                                className="px-12 py-6 text-lg w-full bg-slate-900 hover:bg-slate-800 text-white"
                            >
                                Continue Narrative &rarr;
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-2 bg-slate-200 w-full">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(currentId / 3) * 100}%` }} />
            </div>
        </div>
    )
}
