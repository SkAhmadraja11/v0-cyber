"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function CyberStoryGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [step, setStep] = useState(0)
    const [score, setScore] = useState(0)

    const story = [
        {
            text: "You arrive at the office. You find a USB drive in the parking lot labeled 'Executive Salaries'.",
            choices: [
                { t: "Plug it into your PC to check the owner", s: -100, next: 1, res: "BAD IDEA! It contained malware. IT Security is alerted." },
                { t: "Hand it to IT Security immediately", s: 100, next: 2, res: "Correct! Never trust found media." }
            ]
        },
        { // Path 1 (Bad)
            text: "Your computer is now infected. Ransomware is spreading. What do you do?",
            choices: [
                { t: "Unplug the network cable", s: 50, next: 3, res: "Good damage control." },
                { t: "Restart the computer", s: -50, next: 3, res: "It didn't help. Encryption continued." }
            ]
        },
        { // Path 2 (Good)
            text: "IT thanks you. Later, you receive a call from 'Microsoft Support' asking for remote access.",
            choices: [
                { t: "Grant access, they are experts", s: -100, next: 3, res: "No! Microsoft never calls you." },
                { t: "Hang up", s: 100, next: 3, res: "Correct. It was a scam." }
            ]
        },
        { // End
            text: "Day is over. Time to go home.",
            choices: [
                { t: "Finish", s: 0, next: 99, res: "" }
            ]
        }
    ]

    const current = story[step]

    useEffect(() => {
        if (step === 99) {
            onComplete(score)
        }
    }, [step, score, onComplete])

    if (step === 99) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
                <h2 className="text-2xl font-bold mb-4">Story Complete!</h2>
                <p className="text-xl mb-4">Final Score: {score}</p>
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        )
    }

    return (
        <Card className="max-w-2xl mx-auto p-8 prose">
            <div className="flex items-center gap-4 mb-6">
                <BookOpen className="w-8 h-8 text-primary" />
                <h2 className="m-0">Cyber Story</h2>
            </div>

            <p className="text-xl mb-8">{current.text}</p>

            <div className="space-y-4">
                {current.choices.map((c, i) => (
                    <Button
                        key={i}
                        onClick={() => {
                            setScore(s => s + c.s)
                            if (c.res) alert(c.res)
                            setStep(c.next)
                        }}
                        className="w-full text-left justify-start h-auto py-4 text-lg"
                        variant="outline"
                    >
                        {c.t}
                    </Button>
                ))}
            </div>
        </Card>
    )
}
