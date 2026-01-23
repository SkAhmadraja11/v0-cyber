"use client"

import { useState } from "react"
import {
    Gamepad2,
    Lock,
    Shield,
    Search,
    Wifi,
    Database,
    Terminal,
    UserCheck,
    Globe,
    Smartphone,
    AlertTriangle,
    FileCode,
    Layers,
    Cpu,
    Eye,
    ArrowLeft,
    Play,
    Key,
    MessageSquare,
    Bug,
    Signal,
    Code,
    Brain,
    Mail,
    Inbox,
    Fingerprint,
    Network,
    Lightbulb,
    FileLock,
    BookOpen,
    Flag
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import FirewallGame from "./components/FirewallGame"
import PhishingGame from "./components/PhishingGame"
import WifiWarriorGame from "./components/WifiGame"
import UrlSafetyGame from "./components/UrlSafetyGame"
import PasswordGame from "./components/PasswordGame"
import MalwareBlasterGame from "./components/MalwareBlaster"
import SpamFilterGame from "./components/SpamFilterGame"
import MobileGuardianGame from "./components/MobileGuardianGame"
import SocialEngineeringGame from "./components/SocialEngineeringGame"
import AuthPuzzleGame from "./components/AuthPuzzleGame"
import HackerDefGame from "./components/HackerDefGame"
import NetworkSimGame from "./components/NetworkSimGame"
import CyberQuizGame from "./components/CyberQuizGame"
import DataBreachGame from "./components/DataBreachGame"
import CyberStoryGame from "./components/CyberStoryGame"
import CtfLiteGame from "./components/CtfLiteGame"

interface Game {
    id: number
    title: string
    description: string
    category: "Defense" | "Offense" | "Analysis" | "Concept"
    difficulty: "Easy" | "Medium" | "Hard"
    icon: any
    learningOutcome: string
}

const GAMES: Game[] = [
    {
        id: 1,
        title: "Phishing Detective",
        description: "Identify phishing emails and fake websites in this timed challenge. Spot subtle traps before time runs out!",
        category: "Defense",
        difficulty: "Easy",
        icon: Mail,
        learningOutcome: "Spotting Phishing Indicators"
    },
    {
        id: 2,
        title: "URL Safety Scanner",
        description: "Scan URLs and decide if they are safe or malicious. Watch out for shortened links and fake domains!",
        category: "Analysis",
        difficulty: "Easy",
        icon: Globe,
        learningOutcome: "URL Analysis & Domain Safety"
    },
    {
        id: 3,
        title: "Password Stronghold",
        description: "Build unbreakable passwords while defending against brute-force attacks. Avoid weak patterns!",
        category: "Defense",
        difficulty: "Medium",
        icon: Key,
        learningOutcome: "Password Complexity & Entropy"
    },
    {
        id: 4,
        title: "Malware Blaster",
        description: "Arcade-style defense! Blast incoming malware threats using antivirus tools and quick reflexes.",
        category: "Defense",
        difficulty: "Medium",
        icon: Bug,
        learningOutcome: "Malware Types & Defense"
    },
    {
        id: 5,
        title: "Firewall Fortress",
        description: "Tower Defense! Configure firewalls to block malicious IPs and allow legitimate traffic.",
        category: "Defense",
        difficulty: "Hard",
        icon: Shield,
        learningOutcome: "Traffic Filtering & Rules"
    },
    {
        id: 6,
        title: "Social Engineer Stopper",
        description: "Face realistic social engineering scenarios. Choose the safest response to calls and messages.",
        category: "Defense",
        difficulty: "Medium",
        icon: MessageSquare,
        learningOutcome: "Social Engineering Awareness"
    },
    {
        id: 7,
        title: "Spam Filter Rush",
        description: "Fast-paced sorting game! Quickly swipe spam, phishing, and safe emails.",
        category: "Analysis",
        difficulty: "Easy",
        icon: Inbox,
        learningOutcome: "Email Filtering Speed"
    },
    {
        id: 8,
        title: "Auth Puzzle Master",
        description: "Solve puzzles involving OTPs, Biometrics, and 2FA to unlock secure systems.",
        category: "Defense",
        difficulty: "Medium",
        icon: Fingerprint,
        learningOutcome: "Multi-Factor Authentication"
    },
    {
        id: 9,
        title: "Hacker vs Defender",
        description: "Defend your system against a hacker! Apply patches and stop intrusions in real-time.",
        category: "Defense",
        difficulty: "Hard",
        icon: Terminal,
        learningOutcome: "Incident Response"
    },
    {
        id: 10,
        title: "Network Shield Sim",
        description: "Protect your network from DDoS and port scans. Manage traffic flow and keep services running.",
        category: "Defense",
        difficulty: "Hard",
        icon: Network,
        learningOutcome: "Network Security Basics"
    },
    {
        id: 11,
        title: "Mobile Guardian",
        description: "Protect your smartphone! Smash malicious apps and block unsafe permissions.",
        category: "Defense",
        difficulty: "Easy",
        icon: Smartphone,
        learningOutcome: "Mobile App Security"
    },
    {
        id: 12,
        title: "Cyber Quiz Adventure",
        description: "An animated quiz adventure! Answer correctly to power up your character and advance.",
        category: "Concept",
        difficulty: "Easy",
        icon: Lightbulb,
        learningOutcome: "General Cyber Hygiene"
    },
    {
        id: 13,
        title: "Data Breach Preventer",
        description: "Secure sensitive files before the breach! Encrypt data and control access rights.",
        category: "Defense",
        difficulty: "Hard",
        icon: FileLock,
        learningOutcome: "Data Protection & Encryption"
    },
    {
        id: 14,
        title: "Cyber Story Mode",
        description: "Interactive narrative. Your choices determine if you stay safe or get hacked.",
        category: "Concept",
        difficulty: "Medium",
        icon: BookOpen,
        learningOutcome: "Consequences of Cyber Actions"
    },
    {
        id: 15,
        title: "CTF Lite",
        description: "Capture The Flag for beginners! Solve simple web and crypto puzzles to find the flags.",
        category: "Offense",
        difficulty: "Hard",
        icon: Flag,
        learningOutcome: "Basic Penetration Testing"
    }
]

// --- Game Logic Types ---
interface Scenario {
    id: number
    question: string
    // If type is 'choice', use options. If 'code', use codeSnippet.
    type: "choice" | "code" | "simulation"
    options?: { id: string; text: string; isCorrect: boolean; feedback: string }[]
    codeSnippet?: string
    backgroundContext?: string
}

// --- Scenario Data Registry ---
const GAME_SCENARIOS: Record<number, Scenario[]> = {
    // 1. Phishing Detective
    1: [
        {
            id: 1,
            type: "choice",
            question: "You receive an email from 'support@paypaI.com' (notice the capital i) asking you to verify your account. What do you do?",
            options: [
                { id: "a", text: "Click the link immediately to save my account", isCorrect: false, feedback: "Incorrect. The domain was spoofed (paypaI.com instead of paypal.com)." },
                { id: "b", text: "Report as phishing and delete", isCorrect: true, feedback: "Correct! The sender address was fake." },
                { id: "c", text: "Reply asking for proof", isCorrect: false, feedback: "Never reply to scammers; it verifies your email is active." }
            ]
        },
        {
            id: 2,
            type: "choice",
            question: "An email says 'URGENT: Your password expires in 2 hours'. This is an example of:",
            options: [
                { id: "a", text: "Standard security protocol", isCorrect: false, feedback: "Real companies rarely use false urgency like this." },
                { id: "b", text: "Social Engineering (Urgency)", isCorrect: true, feedback: "Correct! Creating panic is a key tactic." }
            ]
        }
    ],
    // 2. Password Power-Up
    2: [
        {
            id: 1,
            type: "choice",
            question: "Target has a dog named 'Fluffy' and was born in 1990. Which password is most likely?",
            options: [
                { id: "a", text: "Xk9#mP!2z", isCorrect: false, feedback: "Too complex for a lazy user." },
                { id: "b", text: "Fluffy1990", isCorrect: true, feedback: "Correct! People often combine pet names and birth years." },
                { id: "c", text: "Password123", isCorrect: false, feedback: "Common, but 'Fluffy1990' is specific to the target." }
            ]
        }
    ],
    // 3. Shield Operator (Firewall)
    3: [
        {
            id: 1,
            type: "simulation",
            question: "Incoming Traffic Pattern detected. Source IP: 192.168.1.5 (Internal) -> Dest Port: 443. \nForeign IP: 45.2.1.99 -> Dest Port: 22 (SSH). \nWhich one do you BLOCK?",
            options: [
                { id: "a", text: "Allow Internal Traffic (443)", isCorrect: false, feedback: "That traffic is safe." },
                { id: "b", text: "Block Foreign SSH connection (Port 22)", isCorrect: true, feedback: "Correct! External SSH access is a huge risk." }
            ]
        }
    ],
    // 4. Database Fort (SQLi)
    4: [
        {
            id: 1,
            type: "code",
            question: "A hacker enters \" ' OR 1=1 -- \" into the login box. What happens?",
            options: [
                { id: "a", text: "The system logs them in as Admin", isCorrect: true, feedback: "Correct! This logic statement evaluates to TRUE for every row." },
                { id: "b", text: "The system asks for a password", isCorrect: false, feedback: "The '--' comments out the password check." }
            ]
        }
    ],
    // 5. Social Media Scanner (XSS)
    5: [
        {
            id: 1,
            type: "code",
            question: "Which comment contains a malicious XSS script?",
            options: [
                { id: "a", text: "Great post! Love it!", isCorrect: false, feedback: "That is safe text." },
                { id: "b", text: "<script>alert('Stealing Cookies')</script>", isCorrect: true, feedback: "Correct! Script tags execute code in the victim's browser." },
                { id: "c", text: "<b>Bold text is cool</b>", isCorrect: false, feedback: "HTML formatting is usually safe, script tags are not." }
            ]
        }
    ],
    // 6. Code Breaker (Crypto)
    6: [
        {
            id: 1,
            type: "choice",
            question: "Decrypt this Caesar Cipher (Shift +1): 'IBM'. (Hint: Shift letters back by one)",
            options: [
                { id: "a", text: "HAL", isCorrect: true, feedback: "Correct! H->I, A->B, L->M. (Reference to 2001: A Space Odyssey)" },
                { id: "b", text: "JCN", isCorrect: false, feedback: "That is shifting forward, not backward." }
            ]
        }
    ],
    // 7. Friend or Foe
    7: [
        {
            id: 1,
            type: "choice",
            question: "Boss (on WhatsApp): 'Hey, I'm stuck in a meeting and need you to buy 5 Apple Gift cards for a client ASAP. I'll pay you back.'",
            options: [
                { id: "a", text: "Buy them immediately to impress the boss", isCorrect: false, feedback: "Stop! This is a classic CEO Fraud scam." },
                { id: "b", text: "Call the boss on their official number to verify", isCorrect: true, feedback: "Correct! Always verify unusual financial requests via a second channel." }
            ]
        }
    ],
    // 8. Data Sorter
    8: [
        {
            id: 1,
            type: "choice",
            question: "Where does a 'Patient Medical History PDF' go?",
            options: [
                { id: "a", text: "Public Folder", isCorrect: false, feedback: "Illegal! That is PHI (Protected Health Information)." },
                { id: "b", text: "Confidential / Secure Server", isCorrect: true, feedback: "Correct. Medical records require strict encryption." }
            ]
        }
    ],
    // 9. Network Explorer
    9: [
        {
            id: 1,
            type: "choice",
            question: "You scan the network and see a device named 'RaspberryPi-Listener' with no authorized owner. What is it likely doing?",
            options: [
                { id: "a", text: "Improving WiFi speed", isCorrect: false, feedback: "Unlikely." },
                { id: "b", text: "Running a Packet Sniffer / Man-in-the-Middle attack", isCorrect: true, feedback: "Correct! Rogue devices often spy on traffic." }
            ]
        }
    ],
    // 10. Virus Hunter
    10: [
        {
            id: 1,
            type: "choice",
            question: "File: 'Invoice_2024.pdf.exe'. Icon looks like a PDF.",
            options: [
                { id: "a", text: "Open it, it's an invoice", isCorrect: false, feedback: "Double extension! The real extension is .exe (Application), not .pdf." },
                { id: "b", text: "Delete it immediately", isCorrect: true, feedback: "Correct. It's masking its file type to trick you." }
            ]
        }
    ],
    // 11. Crisis Commander
    11: [
        {
            id: 1,
            type: "choice",
            question: "Ransomware Detected! 50 computers are encrypting data. Step 1?",
            options: [
                { id: "a", text: "Pay the ransom immediately", isCorrect: false, feedback: "Never pay! There is no guarantee you get data back." },
                { id: "b", text: "Disconnect infected systems from the network", isCorrect: true, feedback: "Correct! Isolation prevents the spread." }
            ]
        }
    ],
    // 12. Code Fixer
    12: [
        {
            id: 1,
            type: "code",
            question: "Find the security flaw in this Python code:",
            codeSnippet: "def login(user, pass):\n  if user == 'admin' and pass == 'SuperSecret123':\n    return True",
            options: [
                { id: "a", text: "Wrong variable names", isCorrect: false, feedback: "Code runs fine, but it's insecure." },
                { id: "b", text: "Hardcoded Credentials", isCorrect: true, feedback: "Correct! Never store passwords in plain text code." }
            ]
        }
    ],
    // 13. Two-Factor Trouble
    13: [
        {
            id: 1,
            type: "choice",
            question: "You log in, but the 2FA SMS code arrives from a standard 10-digit mobile number instead of a shortcode. It contains a link.",
            options: [
                { id: "a", text: "Click the link to verify", isCorrect: false, feedback: "Official 2FA codes rarely send links, and usually use Shortcodes." },
                { id: "b", text: "Do not click. It's a Smishing attack", isCorrect: true, feedback: "Correct. Attackers spoof 2FA messages to steal creds." }
            ]
        }
    ],
    // 14. WiFi Warrior
    14: [
        {
            id: 1,
            type: "choice",
            question: "You see two networks: 'Starbucks_Official' (Locked) and 'Starbucks_Free_Guest' (Open). Which is safer?",
            options: [
                { id: "a", text: "The Open one (Convenient)", isCorrect: false, feedback: "Open networks allow anyone to intercept your traffic." },
                { id: "b", text: "Use your Mobile Hotspot / VPN", isCorrect: true, feedback: "Correct. Public open WiFi is inherently unsafe." }
            ]
        }
    ],
    // 15. Botnet Buster
    15: [
        {
            id: 1,
            type: "simulation",
            question: "Traffic Log: SmartFridge is sending 5,000 emails per hour on Port 25. Diagnosis?",
            options: [
                { id: "a", text: "It is ordering food", isCorrect: false, feedback: "Fridges don't use email ports to order food." },
                { id: "b", text: "It is part of a SPAM Botnet", isCorrect: true, feedback: "Correct! IoT devices are often hijacked to send spam." }
            ]
        }
    ]
}

function ActiveGameRunner({ gameId, onClose }: { gameId: number; onClose: () => void }) {
    if (gameId === 1) return <PhishingGame onComplete={() => onClose()} />
    if (gameId === 2) return <UrlSafetyGame onComplete={() => onClose()} />
    if (gameId === 3) return <PasswordGame onComplete={() => onClose()} />
    if (gameId === 4) return <MalwareBlasterGame onComplete={() => onClose()} />
    if (gameId === 5) return <FirewallGame onComplete={() => onClose()} />
    if (gameId === 6) return <SocialEngineeringGame onComplete={() => onClose()} />
    if (gameId === 7) return <SpamFilterGame onComplete={() => onClose()} />
    if (gameId === 8) return <AuthPuzzleGame onComplete={() => onClose()} />
    if (gameId === 9) return <HackerDefGame onComplete={() => onClose()} />
    if (gameId === 10) return <NetworkSimGame onComplete={() => onClose()} />
    if (gameId === 11) return <MobileGuardianGame onComplete={() => onClose()} />
    if (gameId === 12) return <CyberQuizGame onComplete={() => onClose()} />
    if (gameId === 13) return <DataBreachGame onComplete={() => onClose()} />
    if (gameId === 14) return <CyberStoryGame onComplete={() => onClose()} />
    if (gameId === 15) return <CtfLiteGame onComplete={() => onClose()} />

    const scenarios = GAME_SCENARIOS[gameId] || []
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [showFeedback, setShowFeedback] = useState(false)
    const [lastFeedback, setLastFeedback] = useState("")
    const [isCorrectLast, setIsCorrectLast] = useState(false)
    const [isFinished, setIsFinished] = useState(false)

    const currentScenario = scenarios[currentScenarioIndex]

    const handleAnswer = (isCorrect: boolean, feedback: string) => {
        setIsCorrectLast(isCorrect)
        setLastFeedback(feedback)
        setShowFeedback(true)
        if (isCorrect) setScore(s => s + 100)
    }

    const handleNext = () => {
        setShowFeedback(false)
        if (currentScenarioIndex + 1 < scenarios.length) {
            setCurrentScenarioIndex(i => i + 1)
        } else {
            setIsFinished(true)
        }
    }

    if (scenarios.length === 0) {
        return (
            <Card className="p-6 text-center">
                <h3 className="text-xl font-bold mb-4">Under Construction</h3>
                <p className="mb-4">This simulation is being updated.</p>
                <Button onClick={onClose}>Close</Button>
            </Card>
        )
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in zoom-in-50">
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold">Mission Complete!</h2>
                <p className="text-xl">Score: {score}</p>
                <Button onClick={onClose} size="lg">Return to Base</Button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-mono text-muted-foreground">Scenario {currentScenarioIndex + 1}/{scenarios.length}</span>
                <span className="text-sm font-bold text-primary">Score: {score}</span>
            </div>

            <Card className="p-8 mb-6 border-2 border-primary/20">
                <h3 className="text-xl font-semibold mb-6 leading-relaxed">{currentScenario.question}</h3>

                {currentScenario.codeSnippet && (
                    <div className="bg-black/50 p-4 rounded-md font-mono text-sm text-green-400 mb-6 overflow-x-auto border border-green-500/30">
                        <pre>{currentScenario.codeSnippet}</pre>
                    </div>
                )}

                {!showFeedback ? (
                    <div className="space-y-3">
                        {currentScenario.options?.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleAnswer(opt.isCorrect, opt.feedback)}
                                className="w-full text-left p-4 rounded-lg border border-border hover:bg-primary/10 hover:border-primary transition-all duration-200 flex items-center justify-between group"
                            >
                                <span>{opt.text}</span>
                                <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 rotate-180 transition-opacity" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className={`p-6 rounded-lg ${isCorrectLast ? "bg-green-500/10 border border-green-500/50" : "bg-red-500/10 border border-red-500/50"} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className="flex items-center gap-3 mb-2">
                            {isCorrectLast ? <CheckCircle2 className="text-green-500" /> : <AlertTriangle className="text-red-500" />}
                            <span className={`font-bold ${isCorrectLast ? "text-green-500" : "text-red-500"}`}>
                                {isCorrectLast ? "Excellent Work!" : "Access Denied"}
                            </span>
                        </div>
                        <p className="text-foreground/90 mb-4">{lastFeedback}</p>
                        <Button onClick={handleNext} className="w-full">
                            {currentScenarioIndex + 1 < scenarios.length ? "Next Challenge" : "Finish Mission"}
                        </Button>
                    </div>
                )}
            </Card>
            <Button variant="ghost" onClick={onClose} className="mx-auto block text-muted-foreground hover:text-foreground">
                Abort Mission
            </Button>
        </div>
    )
}

import { CheckCircle2, Trophy } from "lucide-react"

export default function GamesPage() {
    const [selectedGame, setSelectedGame] = useState<number | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<"All" | "Defense" | "Offense" | "Analysis" | "Concept">("All")

    return (
        <div className="min-h-screen bg-background relative">
            {/* Header */}
            <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Gamepad2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg text-foreground">Cyber Range</h1>
                                    <p className="text-xs text-muted-foreground">Interactive Security Simulations</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">

                {selectedGame !== null ? (
                    // ACTIVE GAME VIEW
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                                {GAMES.find(g => g.id === selectedGame)?.title}
                            </h2>
                            <p className="text-muted-foreground">{GAMES.find(g => g.id === selectedGame)?.description}</p>
                        </div>
                        <ActiveGameRunner gameId={selectedGame} onClose={() => setSelectedGame(null)} />
                    </div>
                ) : (
                    // GAME SELECTION GRID
                    <>
                        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-4 pb-2">
                                Learn by Doing
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                Test your skills in these 15 interactive cybersecurity scenarios.
                                From offensive tactics to defensive strategies, master the art of cyber warfare.
                            </p>
                        </div>

                        {/* Category Filter */}
                        <div className="flex justify-center gap-2 mb-8 flex-wrap">
                            {(["All", "Defense", "Offense", "Analysis", "Concept"] as const).map(cat => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-full px-6 transition-all ${selectedCategory === cat ? 'bg-primary shadow-lg scale-105' : 'hover:scale-105'}`}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {GAMES.filter(g => selectedCategory === "All" || g.category === selectedCategory).map((game) => (
                                <Card key={game.id} className="group hover:border-primary transition-all duration-300 overflow-hidden relative shadow-sm hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transform hover:-translate-y-1">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                                        <game.icon className="w-24 h-24" />
                                    </div>

                                    <div className="p-6 relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300`}>
                                                <game.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${game.difficulty === 'Easy' ? 'border-green-500/50 text-green-600 bg-green-500/10' :
                                                    game.difficulty === 'Medium' ? 'border-yellow-500/50 text-yellow-600 bg-yellow-500/10' :
                                                        'border-red-500/50 text-red-600 bg-red-500/10'
                                                    }`}>
                                                    {game.difficulty}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-mono">{game.category}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                            {game.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4 h-10 line-clamp-2">
                                            {game.description}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 bg-muted/50 p-2 rounded border border-transparent group-hover:border-primary/20 transition-colors">
                                            <Brain className="w-3 h-3 text-primary" />
                                            <span>{game.learningOutcome}</span>
                                        </div>

                                        <Button
                                            onClick={() => setSelectedGame(game.id)}
                                            className="w-full bg-background hover:bg-primary text-primary hover:text-primary-foreground border-2 border-primary/20 hover:border-primary transition-all duration-300 shadow-sm font-bold active:scale-95"
                                        >
                                            <Play className="w-4 h-4 mr-2 fill-current" />
                                            PLAY SCENARIO
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
