"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import LiveThreatTicker from "@/components/live-threat-ticker"
import useEmblaCarousel from "embla-carousel-react"
import {
  Shield,
  Zap,
  Gamepad2,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Download,
  Filter,
  RefreshCcw,
  Globe,
  Wallet,
  FileText,
  MessageSquare,
  Lock,
  Quote,
  Layers,
  Cpu,
  BarChart3,
  Search,
  Server,
  Hash,
  Network,
  Code,
  Fingerprint,
  BarChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"
import Footer from "@/components/footer"

export default function Home() {
  const [activeSection, setActiveSection] = useState<"overview" | "how-it-works" | "tech" | "features" | "analytics">("overview")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })

  // Check if onboarding was already seen
  useEffect(() => {
    // Small timeout to ensure hydration is complete and smoother transition
    const timer = setTimeout(() => {
      // Session storage persists only as long as the tab/browser is open
      // This allows seeing onboarding again when "opening web" (new session)
      // but NOT when navigating back within the same session.
      const seen = sessionStorage.getItem("onboarding_session_seen")
      if (!seen) {
        setShowOnboarding(true)
      }
      setIsChecking(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const completeOnboarding = () => {
    sessionStorage.setItem("onboarding_session_seen", "true")
    setShowOnboarding(false)
  }

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext()
  }


  const slides = [
    {
      id: "welcome",
      variant: "hero",
      title: "Next-Gen Verdict",
      subtitle: "Next-Gen Cyber Defense",
      desc: "Secure your digital life against evolving crypto & phishing threats.",
      icon: Shield,
      color: "blue",
      gradient: "from-blue-600/40 via-purple-600/20 to-background",
      indicatorClass: "bg-blue-400",
      textClass: "text-blue-400",
    },
    {
      id: "detection",
      variant: "feature",
      title: "Real-Time Analysis",
      desc: "ML algorithms block threats in <400ms.",
      stats: ["99.8% Accuracy", "0.1% False Positives", "Live Scanning"],
      icon: Activity,
      color: "emerald",
      gradient: "from-emerald-600/40 via-teal-600/20 to-background",
      indicatorClass: "bg-emerald-400",
      textClass: "text-emerald-400",
    },
    {
      id: "games",
      variant: "cta",
      title: "Cyber Range",
      desc: "Level up your skills with 15 interactive security games.",
      icon: Gamepad2,
      color: "violet",
      gradient: "from-violet-600/40 via-fuchsia-600/20 to-background",
      buttonText: "Play Now",
      link: "/games",
      indicatorClass: "bg-violet-400",
      textClass: "text-violet-400",
    },
    {
      id: "quote1",
      variant: "quote",
      text: "Security is not a product, but a process.",
      author: "Bruce Schneier",
      icon: Lock,
      color: "orange",
      gradient: "from-orange-600/40 via-red-600/20 to-background",
      indicatorClass: "bg-orange-400",
      textClass: "text-orange-400",
    },
    {
      id: "quote2",
      variant: "quote",
      text: "The best defense is a good offense.",
      author: "Cyber Wisdom",
      icon: Zap,
      color: "indigo",
      gradient: "from-indigo-600/40 via-blue-600/20 to-background",
      indicatorClass: "bg-indigo-400",
      textClass: "text-indigo-400",
    },
    {
      id: "cta",
      variant: "cta",
      title: "Ready to Scan?",
      desc: "Join thousands protecting their assets today.",
      icon: CheckCircle2,
      color: "primary",
      gradient: "from-primary/50 via-primary/20 to-background",
      indicatorClass: "bg-primary",
      textClass: "text-primary",
    },
  ]



  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center font-sans">
        {/* Animated Background Mesh */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1),_rgba(0,0,0,1))] -z-20" />
        <div className="fixed inset-0 bg-grid-pattern opacity-20 -z-10 animate-pulse" />

        <div className="relative w-full max-w-7xl mx-auto px-4" ref={emblaRef}>
          <div className="flex touch-pan-y py-10 place-items-center">
            {slides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 pl-4 md:pl-8 py-4 relative">
                <div className={`
                    relative overflow-hidden rounded-[2.5rem] border border-white/10 
                    bg-gradient-to-br ${slide.gradient} backdrop-blur-xl shadow-2xl
                    h-[600px] md:h-[700px] flex flex-col items-center justify-center text-center p-8 md:p-14 
                    transition-all duration-500 ease-out 
                  `}>
                  {/* Background Elements */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-[60px] pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

                  {/* Content Container */}
                  <div className={`relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center
                      ${(slide.variant === 'quote' || slide.variant === 'cta') ? 'max-w-2xl' : ''}
                  `}>

                    {/* Variant: HERO */}
                    {slide.variant === 'hero' && (
                      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
                        <div className="relative mb-4 md:mb-6">
                          <div className="absolute inset-0 bg-primary/30 blur-[40px] rounded-full" />
                          <slide.icon className="w-16 h-16 md:w-20 md:h-20 text-white relative z-10 drop-shadow-lg" />
                        </div>
                        <h3 className="text-xs md:text-sm font-bold text-primary mb-2 md:mb-4 tracking-[0.3em] uppercase opacity-90">{slide.subtitle}</h3>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter leading-none font-outfit drop-shadow-xl">
                          {slide.title}
                        </h1>
                        <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed font-medium">{slide.desc}</p>
                      </div>
                    )}

                    {/* Variant: FEATURE */}
                    {slide.variant === 'feature' && (
                      <div>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 ring-1 ring-emerald-500/40 shadow-lg mx-auto">
                          <slide.icon className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-outfit tracking-tight">{slide.title}</h2>
                        <p className="text-lg md:text-xl text-emerald-100/90 mb-8 leading-relaxed max-w-xl mx-auto">{slide.desc}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full px-2">
                          {slide.stats?.map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md shadow-md">
                              <p className="text-emerald-300 font-bold text-sm md:text-base">{stat}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variant: QUOTE */}
                    {slide.variant === 'quote' && (
                      <div className="relative text-center px-2">
                        <Quote className="absolute -top-10 -left-6 w-20 h-20 text-white/5 -z-10" />
                        <blockquote className="relative z-10 space-y-6">
                          <p className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60 leading-tight font-outfit tracking-tight italic">
                            "{slide.text}"
                          </p>
                          <footer className="text-base md:text-lg text-white/60 font-medium tracking-[0.15em] uppercase">
                            — <span className={`${slide.textClass} font-bold`}>{slide.author}</span>
                          </footer>
                        </blockquote>
                      </div>
                    )}

                    {/* Variant: CTA */}
                    {slide.variant === 'cta' && (
                      <div>
                        <div className="mb-6 relative mx-auto w-max">
                          <div className="absolute inset-0 bg-primary/30 blur-[40px]" />
                          <slide.icon className="w-20 h-20 text-white relative z-10 drop-shadow-lg" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-outfit tracking-tight">{slide.title}</h2>
                        <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">{slide.desc}</p>
                        <Button
                          onClick={() => slide.link ? window.location.href = slide.link : completeOnboarding()}
                          size="lg"
                          className="h-14 px-10 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all duration-300 border border-white/10"
                        >
                          {slide.buttonText || "Launch Scanner"}
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    )}

                    {/* Navigation Buttons for All Slides */}
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <div className="flex justify-center gap-2">
                        {slides.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === index ? `w-8 ${slide.indicatorClass}` : "w-1.5 bg-white/10"
                              }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-4 relative z-50">
                        <Button
                          onClick={() => emblaApi && emblaApi.scrollPrev()}
                          variant="ghost"
                          className="text-white/50 hover:text-white hover:bg-white/10 rounded-lg px-4 py-2 text-base transition-all"
                          disabled={index === 0}
                        >
                          <ArrowLeft className="mr-2 w-4 h-4" />
                          Back
                        </Button>
                        <Button
                          onClick={() => {
                            if (index === slides.length - 1) {
                              completeOnboarding()
                            } else {
                              scrollNext()
                            }
                          }}
                          variant="outline"
                          className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30 rounded-xl px-6 py-4 text-lg backdrop-blur-md transition-all hover:scale-105 font-bold shadow-lg cursor-pointer"
                        >
                          {index === slides.length - 1 ? "Get Started" : "Next"}
                          <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
      <LiveThreatTicker />

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-bounce duration-[10s]" />
      </div>

      <div className="fixed inset-0 bg-grid-pattern opacity-[0.15] mix-blend-overlay" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back Arrow Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
              >
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/30">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">PhishGuard AI</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Advanced ML Detection</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/docs">
                <Button variant="ghost" size="sm">
                  Documentation
                </Button>
              </Link>
              <Link href="/games">
                <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Cyber Range
                </Button>
              </Link>
              <Link href="/awareness">
                <Button variant="ghost" size="sm">
                  Security Awareness
                </Button>
              </Link>
              <Link href="/encryption">
                <Button variant="ghost" size="sm">
                  Cryptography
                </Button>
              </Link>

              <Link href="/scanner">
                <Button className="font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
                  Launch Scanner
                  <Zap className="ml-2 w-4 h-4 fill-current" />
                </Button>
              </Link>
              <div className="w-px h-6 bg-border/50 mx-2" />
              <UserNav />
            </nav>
            <div className="md:hidden flex items-center gap-2">
              <UserNav />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 h-[calc(100vh-80px)] md:py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full pb-20 md:pb-6">
          {/* Left Panel - Navigation (Desktop only, or optional drawer) */}
          <div className="hidden lg:block lg:w-64 shrink-0">
            <Card className="p-4 h-full glassmorphism flex flex-col">
              <nav className="space-y-2 flex-1">
                <SidebarItem
                  active={activeSection === "overview"}
                  onClick={() => setActiveSection("overview")}
                  icon={Shield}
                  label="Overview"
                />
                <SidebarItem
                  active={activeSection === "how-it-works"}
                  onClick={() => setActiveSection("how-it-works")}
                  icon={Layers}
                  label="How it Works"
                />
                <SidebarItem
                  active={activeSection === "tech"}
                  onClick={() => setActiveSection("tech")}
                  icon={Cpu}
                  label="Technology"
                />
                <SidebarItem
                  active={activeSection === "features"}
                  onClick={() => setActiveSection("features")}
                  icon={Brain}
                  label="Features"
                />
                <SidebarItem
                  active={activeSection === "analytics"}
                  onClick={() => setActiveSection("analytics")}
                  icon={BarChart3}
                  label="Analytics"
                />
              </nav>

              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-semibold text-primary">System Online</span>
                  </div>
                  <div className="text-xs text-muted-foreground">ver 2.4.0-stable</div>
                </div>

                <Link href="/scanner" className="block">
                  <Button className="w-full justify-start" size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Launch Scanner
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Center Panel - Main Content area */}
          <div className="flex-1 overflow-auto pr-2 scrollbar-hide">

            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-8 glassmorphism relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 opacity-10 bg-primary blur-[100px] rounded-full pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">Live Threat Intelligence</span>
                      </div>

                      <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance leading-[1.1] tracking-tight">
                        Advanced AI-Powered <br />
                        <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-500 animate-gradient">
                          Threat Detection
                        </span>
                      </h2>
                      <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                        Protect your digital assets with our cutting-edge cybersecurity platform that combines real-time threat intelligence
                        and transformer-based machine learning to identify phishing, malware, and crypto scams in milliseconds.
                      </p>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <Link href="/scanner">
                          <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/25 rounded-2xl group">
                            Get Started
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-2xl glassmorphism">
                          Case Studies
                        </Button>
                      </div>
                    </div>

                    {/* Security Score Widget */}
                    <div className="w-full md:w-64 flex flex-col items-center justify-center p-6 rounded-[2rem] bg-background/40 border border-white/10 glassmorphism relative group overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 text-center">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Security Score</div>
                        <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="36.4" className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-foreground">90</span>
                            <span className="text-[10px] text-muted-foreground font-bold">/ 100</span>
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold inline-block">
                          OPTIMIZED
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                  <StatCard
                    value="99.9%"
                    label="Detection Rate"
                    sub="vs industry avg 85%"
                    trend="up"
                  />
                  <StatCard
                    value="< 400ms"
                    label="Analysis Speed"
                    sub="Real-time protection"
                    trend="down"
                  />
                  <StatCard
                    value="15M+"
                    label="Threats Blocked"
                    sub="Last 30 days"
                    trend="up"
                  />
                </div>

                <div className="p-6 rounded-xl border-2 border-destructive/20 bg-destructive/5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">Recent Global Threat Alert</h3>
                    <p className="text-muted-foreground text-xs">
                      New "CryptoDrainer" phishing kit detected targeting DeFi users.
                      Signatures updated 12 mins ago. Our system now proactively blocks these domains.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works Section - NEW */}
            {activeSection === "how-it-works" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-4">How It Works</h2>
                  <p className="text-sm text-muted-foreground">
                    Our 4-stage pipeline transforms raw URLs/Emails into actionable intelligence
                  </p>
                </div>

                <div className="relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[30px] top-4 bottom-4 w-1 bg-border/50 md:left-1/2 md:-translate-x-1/2 md:w-1 md:top-0 md:bottom-0" />

                  <div className="space-y-12 relative">
                    {/* Step 1 */}
                    <PipelineStep
                      number="01"
                      title="Input Ingestion"
                      desc="User submits a URL or Email content. The system parses structure, normalizes data, and identifies relevant metadata."
                      icon={Search}
                      align="left"
                    />
                    {/* Step 2 */}
                    <PipelineStep
                      number="02"
                      title="Global Intel Lookup"
                      desc="Parallel API queries to trusted databases (Google Safe Browsing, PhishTank, VirusTotal) to check for known blacklisted entities."
                      icon={Globe}
                      align="right"
                    />
                    {/* Step 3 */}
                    <PipelineStep
                      number="03"
                      title="Technical & Heuristic Analysis"
                      desc="Deep dive into domain age (WHOIS), SSL certificate validity, DNS records, and suspicious redirect chains."
                      icon={Server}
                      align="left"
                    />
                    {/* Step 4 */}
                    <PipelineStep
                      number="04"
                      title="AI Inference Engine"
                      desc="Our neural network analyzes content semantics, visual similarity to major brands, and linguistic urgency patterns."
                      icon={Brain}
                      align="right"
                    />
                    {/* Step 5 */}
                    <PipelineStep
                      number="05"
                      title="Risk Scoring & Verdict"
                      desc="Aggregated data is weighted to produce a final Risk Score (0-100) and classification (Safe, Suspicious, Malicious)."
                      icon={Shield}
                      align="center"
                      isLast
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Technology Section */}
            {activeSection === "tech" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Under The Hood</h2>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade technology stack ensuring minimal latency and maximum security
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <TechCard
                    icon={Brain}
                    title="Transformer Models"
                    desc="Utilizing BERT-based language models fine-tuned on cybersecurity datasets to understand intent within email logic and social engineering patterns."
                  />
                  <TechCard
                    icon={Hash}
                    title="Vector Hashing"
                    desc="Locality-sensitive hashing (LSH) allows us to detect slight variations of known phishing pages even if attackers change pixels or colors."
                  />
                  <TechCard
                    icon={Network}
                    title="Real-time Graph Analysis"
                    desc="We analyze the relationship between domains, IPs, and registrars to identify infrastructure commonly used by threat actors."
                  />
                  <TechCard
                    icon={Lock}
                    title="Zero-Trust Architecture"
                    desc="Every scan is treated largely in isolation with no data persistence of sensitive user inputs beyond the analysis session."
                  />
                </div>
              </div>
            )}

            {/* Features & Analytics (simplified for brevity of rewrite, keeping structure) */}
            {activeSection === "features" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-foreground mb-6">Key Features</h2>
                <div className="grid gap-4">
                  <FeatureItem icon={Globe} title="Multi-Source Validation" desc="Cross-references 6+ threat intelligence feeds simultaneously." />
                  <FeatureItem icon={Code} title="Malicious Script Detection" desc="Sandboxed analysis of Javascript to detect drive-by downloads." />
                  <FeatureItem icon={Fingerprint} title="Brand Impersonation Detection" desc="Visual analysis to spot fake login pages of major banks." />
                </div>
              </div>
            )}

            {activeSection === "analytics" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-8 flex flex-col items-center justify-center h-[500px] border-dashed border-2">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">Live Analytics Dashboard</h3>
                  <p className="text-muted-foreground text-xs mb-6 text-center max-w-md">
                    Detailed breakdown of threat vectors and system performance is available in your personalized dashboard.
                  </p>
                  <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Sub-components for cleaner code

function SidebarItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active
        ? "bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(var(--primary),0.25)] scale-[1.02]"
        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
    >
      {active && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />}
      <Icon className={`w-5 h-5 transition-all duration-300 ${active ? "text-primary-foreground scale-110" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"}`} />
      <span className="font-bold tracking-tight text-sm">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70 animate-in slide-in-from-left-2" />}
    </button>
  )
}

function StatCard({ value, label, sub, trend }: { value: string, label: string, sub: string, trend: "up" | "down" }) {
  return (
    <Card className="p-6 glassmorphism border-white/5 hover:border-primary/30 transition-all duration-500 hover:translate-y-[-4px] group">
      <div className="flex flex-col">
        <span className="text-3xl md:text-5xl font-black text-foreground mb-1 tracking-tighter group-hover:text-primary transition-colors font-outfit">{value}</span>
        <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">{label}</span>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className={`px-2 py-0.5 rounded-full ${trend === "up" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}>
            {trend === "up" ? "↑" : "↓"} {trend === "up" ? "IMPROVING" : "STABLE"}
          </span>
          <span className="text-muted-foreground/40">{sub}</span>
        </div>
      </div>
    </Card>
  )
}

function PipelineStep({ number, title, desc, icon: Icon, align, isLast }: { number: string, title: string, desc: string, icon: any, align: "left" | "right" | "center", isLast?: boolean }) {
  return (
    <div className={`relative flex items-center md:justify-center ${align === "center" ? "justify-center" : ""}`}>
      {/* Mobile Icon */}
      <div className="absolute left-[8px] md:left-1/2 md:-translate-x-1/2 w-11 h-11 rounded-full bg-background border-4 border-muted flex items-center justify-center z-10 shadow-sm group">
        <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
      </div>

      <div className={`
        w-full md:w-5/12 ml-16 md:ml-0
        ${align === "left" ? "md:mr-auto md:pr-10 md:text-right" : ""}
        ${align === "right" ? "md:ml-auto md:pl-10" : ""}
        ${align === "center" ? "md:w-8/12 text-center pt-8" : ""}
      `}>
        <Card className="p-6 glassmorphism border-white/5 hover:border-primary/40 transition-all duration-500 hover:scale-[1.01] shadow-xl shadow-transparent hover:shadow-primary/5">
          <div className={`flex flex-col ${align === "left" ? "md:items-end" : "items-start"} ${align === "center" ? "items-center" : ""}`}>
            <span className="text-4xl font-black text-primary/5 mb-[-1.5rem] select-none font-outfit">{number}</span>
            <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight font-outfit">{title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed font-medium">{desc}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function TechCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Card className="p-8 glassmorphism border-white/5 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-transparent group-hover:shadow-primary/20">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight font-outfit">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed font-medium relative z-10">{desc}</p>
    </Card>
  )
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
      <div className="mt-1 p-2 rounded-md bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
