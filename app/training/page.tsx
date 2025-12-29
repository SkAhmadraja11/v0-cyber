"use client"

import { useState } from "react"
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Mail,
  LinkIcon,
  Shield,
  Trophy,
  Target,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TrainingModule {
  id: number
  title: string
  description: string
  duration: string
  difficulty: "beginner" | "intermediate" | "advanced"
  completed: boolean
  locked: boolean
  lessons: number
  icon: any
}

interface Quiz {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function TrainingPage() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const modules: TrainingModule[] = [
    {
      id: 1,
      title: "Introduction to Phishing",
      description: "Learn the basics of phishing attacks and how to identify them",
      duration: "15 mins",
      difficulty: "beginner",
      completed: false,
      locked: false,
      lessons: 5,
      icon: GraduationCap,
    },
    {
      id: 2,
      title: "Email Security Best Practices",
      description: "Master email security and learn to spot suspicious messages",
      duration: "20 mins",
      difficulty: "beginner",
      completed: false,
      locked: false,
      lessons: 6,
      icon: Mail,
    },
    {
      id: 3,
      title: "URL Analysis Techniques",
      description: "Advanced techniques for analyzing and verifying URLs",
      duration: "25 mins",
      difficulty: "intermediate",
      completed: false,
      locked: false,
      lessons: 7,
      icon: LinkIcon,
    },
    {
      id: 4,
      title: "Social Engineering Tactics",
      description: "Understand psychological manipulation in cyber attacks",
      duration: "30 mins",
      difficulty: "intermediate",
      completed: false,
      locked: true,
      lessons: 8,
      icon: Target,
    },
    {
      id: 5,
      title: "Advanced Threat Detection",
      description: "Enterprise-level security protocols and incident response",
      duration: "40 mins",
      difficulty: "advanced",
      completed: false,
      locked: true,
      lessons: 10,
      icon: Shield,
    },
  ]

  const quizzes: Quiz[] = [
    {
      question: "Which of the following is a common sign of a phishing email?",
      options: [
        "Professional company logo and branding",
        "Urgent language requesting immediate action",
        "Personalized greeting with your full name",
        "Links to official company domains",
      ],
      correctAnswer: 1,
      explanation:
        "Phishing emails often use urgent or threatening language to pressure victims into acting without thinking carefully.",
    },
    {
      question: "What should you check first when analyzing a suspicious URL?",
      options: [
        "The color scheme of the website",
        "The domain name and SSL certificate",
        "The number of images on the page",
        "The font styles used",
      ],
      correctAnswer: 1,
      explanation:
        "Always verify the domain name matches the legitimate site and check for a valid SSL certificate (HTTPS) as first steps.",
    },
    {
      question:
        "A colleague receives an email from their 'bank' asking them to verify account details. What should they do?",
      options: [
        "Click the link and verify their information",
        "Reply to the email with their details",
        "Contact the bank directly using official contact information",
        "Forward the email to all colleagues",
      ],
      correctAnswer: 2,
      explanation:
        "Never use contact information from a suspicious email. Always contact organizations directly using verified phone numbers or official websites.",
    },
  ]

  const handleAnswerSelect = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowResult(true)
    if (selectedAnswer === quizzes[currentQuiz].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz(currentQuiz + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-500 bg-green-500/10"
      case "intermediate":
        return "text-yellow-500 bg-yellow-500/10"
      case "advanced":
        return "text-destructive bg-destructive/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-foreground">Security Training</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Level 1</span>
              </div>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!selectedModule ? (
          <>
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Phishing Awareness Training</h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                Interactive modules designed to educate users on identifying and preventing phishing attacks
              </p>
            </div>

            {/* Progress Overview */}
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">Your Progress</h3>
                  <p className="text-sm text-muted-foreground">Complete modules to unlock advanced content</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">0%</div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-0 bg-primary rounded-full transition-all" />
              </div>
            </Card>

            {/* Training Modules */}
            <div className="grid md:grid-cols-2 gap-6">
              {modules.map((module) => {
                const Icon = module.icon
                return (
                  <Card
                    key={module.id}
                    className={`p-6 ${
                      module.locked ? "opacity-60" : "hover:shadow-lg transition-shadow cursor-pointer"
                    }`}
                    onClick={() => !module.locked && setSelectedModule(module.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          module.locked ? "bg-muted" : "bg-primary/10"
                        }`}
                      >
                        {module.locked ? (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        ) : (
                          <Icon className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-semibold text-foreground">{module.title}</h4>
                          {module.completed && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{module.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(module.difficulty)}`}
                          >
                            {module.difficulty}
                          </span>
                          <span className="text-muted-foreground">{module.lessons} lessons</span>
                          <span className="text-muted-foreground">{module.duration}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Additional Resources */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-foreground mb-6">Additional Resources</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <AlertTriangle className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">Report Threats</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Learn how to report suspicious emails and URLs to your security team
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Guide
                  </Button>
                </Card>
                <Card className="p-6">
                  <Shield className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">Security Policy</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Review your organization's security policies and best practices
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Read Policy
                  </Button>
                </Card>
                <Card className="p-6">
                  <Trophy className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">Certification</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Complete all modules to earn your security awareness certificate
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Learn More
                  </Button>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Module Content */}
            <div className="max-w-4xl mx-auto">
              <Button variant="ghost" onClick={() => setSelectedModule(null)} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Button>

              <Card className="p-8 mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {modules.find((m) => m.id === selectedModule)?.title}
                    </h2>
                    <p className="text-muted-foreground">{modules.find((m) => m.id === selectedModule)?.description}</p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-semibold text-foreground mb-4">What is Phishing?</h3>
                  <p className="text-foreground leading-relaxed mb-4">
                    Phishing is a type of cyber attack where attackers impersonate legitimate organizations to trick
                    individuals into revealing sensitive information such as passwords, credit card numbers, or personal
                    identification details.
                  </p>

                  <h4 className="text-lg font-semibold text-foreground mb-3">Common Phishing Indicators</h4>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Urgent or threatening language creating a sense of panic</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Suspicious sender addresses that don't match official domains</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Requests for sensitive information via email or text</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Poor grammar, spelling errors, or unusual formatting</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Links that don't match the apparent destination</span>
                    </li>
                  </ul>

                  <Card className="p-4 bg-primary/5 border-primary/20 mb-6">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-foreground mb-1">Real-World Example</h5>
                        <p className="text-sm text-foreground leading-relaxed">
                          An attacker sends an email appearing to be from your bank, stating that your account has been
                          suspended due to suspicious activity. The email includes a link to "verify your identity" -
                          but the link leads to a fake website designed to steal your credentials.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>

              {/* Quiz Section */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold text-foreground">Knowledge Check</h3>
                  <div className="text-sm text-muted-foreground">
                    Question {currentQuiz + 1} of {quizzes.length}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-medium text-foreground mb-4">{quizzes[currentQuiz].question}</h4>
                  <div className="space-y-3">
                    {quizzes[currentQuiz].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedAnswer === index
                            ? showResult
                              ? index === quizzes[currentQuiz].correctAnswer
                                ? "border-green-500 bg-green-500/10"
                                : "border-destructive bg-destructive/10"
                              : "border-primary bg-primary/5"
                            : showResult && index === quizzes[currentQuiz].correctAnswer
                              ? "border-green-500 bg-green-500/10"
                              : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedAnswer === index
                                ? showResult
                                  ? index === quizzes[currentQuiz].correctAnswer
                                    ? "border-green-500 bg-green-500"
                                    : "border-destructive bg-destructive"
                                  : "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {selectedAnswer === index && showResult && (
                              <>
                                {index === quizzes[currentQuiz].correctAnswer ? (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                ) : (
                                  <span className="text-white text-xs font-bold">✕</span>
                                )}
                              </>
                            )}
                          </div>
                          <span className="text-foreground">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {showResult && (
                  <Card className="p-4 mb-6 bg-muted/50 border-border">
                    <div className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedAnswer === quizzes[currentQuiz].correctAnswer
                            ? "bg-green-500/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {selectedAnswer === quizzes[currentQuiz].correctAnswer ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-destructive" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-semibold text-foreground mb-1">
                          {selectedAnswer === quizzes[currentQuiz].correctAnswer ? "Correct!" : "Incorrect"}
                        </h5>
                        <p className="text-sm text-foreground leading-relaxed">{quizzes[currentQuiz].explanation}</p>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="flex gap-3">
                  {!showResult ? (
                    <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} className="flex-1">
                      Submit Answer
                    </Button>
                  ) : (
                    <>
                      {currentQuiz < quizzes.length - 1 ? (
                        <Button onClick={handleNextQuestion} className="flex-1">
                          Next Question
                        </Button>
                      ) : (
                        <div className="flex-1">
                          <Card className="p-6 bg-primary/10 border-primary/20">
                            <div className="text-center">
                              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                              <h4 className="text-xl font-bold text-foreground mb-2">Quiz Complete!</h4>
                              <p className="text-muted-foreground mb-4">
                                You scored {score} out of {quizzes.length}
                              </p>
                              <Button onClick={() => setSelectedModule(null)}>Back to Training Modules</Button>
                            </div>
                          </Card>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
