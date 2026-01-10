"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import {
  Shield,
  Zap,
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
      title: "PhishGuard AI",
      subtitle: "Next-Gen Cyber Defense",
      desc: "Secure your digital life against evolving crypto & phishing threats.",
      icon: Shield,
      color: "blue",
      gradient: "from-blue-600/40 via-purple-600/20 to-background",
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
    },
    {
      id: "quote1",
      variant: "quote",
      text: "Security is not a product, but a process.",
      author: "Bruce Schneier",
      icon: Lock,
      color: "orange",
      gradient: "from-orange-600/40 via-red-600/20 to-background",
    },
    {
      id: "quote2",
      variant: "quote",
      text: "The best defense is a good offense.",
      author: "Cyber Wisdom",
      icon: Zap,
      color: "indigo",
      gradient: "from-indigo-600/40 via-blue-600/20 to-background",
    },
    {
      id: "cta",
      variant: "cta",
      title: "Ready to Scan?",
      desc: "Join thousands protecting their assets today.",
      icon: CheckCircle2,
      color: "primary",
      gradient: "from-primary/50 via-primary/20 to-background",
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

        <div className="relative w-full max-w-5xl mx-auto px-4 perspective-1000" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {slides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 pl-4 py-12">
                <div className={`relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${slide.gradient} backdrop-blur-2xl shadow-2xl h-[600px] flex flex-col items-center justify-center text-center p-8 md:p-12 transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/20 group`}>

                  {/* Dynamic Background Elements */}
                  <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-white/10 transition-colors" />
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-white/10 transition-colors" />

                  {/* Content Container */}
                  <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center">

                    {/* Variant: HERO */}
                    {slide.variant === 'hero' && (
                      <>
                        <div className="relative mb-12">
                          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
                          <slide.icon className="w-24 h-24 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-medium text-blue-300 mb-4 tracking-widest uppercase">{slide.subtitle}</h3>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                          {slide.title}
                        </h1>
                        <p className="text-xl text-blue-100/70 max-w-xl leading-relaxed">{slide.desc}</p>
                      </>
                    )}

                    {/* Variant: FEATURE */}
                    {slide.variant === 'feature' && (
                      <>
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-10 ring-1 ring-emerald-500/40">
                          <slide.icon className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">{slide.title}</h2>
                        <p className="text-2xl text-emerald-100/80 mb-12">{slide.desc}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                          {slide.stats?.map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                              <p className="text-emerald-300 font-semibold">{stat}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Variant: QUOTE */}
                    {slide.variant === 'quote' && (
                      <div className="relative">
                        <Quote className={`w-32 h-32 absolute -top-16 -left-10 text-${slide.color}-500/10 pointer-events-none`} />
                        <blockquote className="relative z-10 space-y-8">
                          <p className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 leading-tight">
                            "{slide.text}"
                          </p>
                          <footer className="text-lg md:text-xl text-white/50 font-medium tracking-wide">
                            — <span className={`text-${slide.color}-400`}>{slide.author}</span>
                          </footer>
                        </blockquote>
                      </div>
                    )}

                    {/* Variant: CTA */}
                    {slide.variant === 'cta' && (
                      <>
                        <div className="mb-12 relative">
                          <div className="absolute inset-0 bg-primary/40 blur-3xl animate-pulse" />
                          <slide.icon className="w-32 h-32 text-primary relative z-10" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">{slide.title}</h2>
                        <p className="text-2xl text-white/60 mb-12">{slide.desc}</p>
                        <Button
                          onClick={completeOnboarding}
                          size="lg"
                          className="h-16 px-12 text-xl rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:shadow-[0_0_50px_rgba(var(--primary),0.7)] hover:scale-105 transition-all duration-300"
                        >
                          Launch Scanner
                          <ArrowRight className="ml-3 w-6 h-6" />
                        </Button>
                      </>
                    )}

                    {/* Navigation Button for Non-CTA Slides */}
                    {slide.variant !== 'cta' && (
                      <div className="mt-16 flex flex-col items-center gap-8">
                        <div className="flex justify-center gap-3">
                          {slides.map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 rounded-full transition-all duration-500 ease-out ${i === index ? `w-12 bg-${slide.color}-400 shadow-[0_0_10px_currentColor]` : "w-2 bg-white/10"
                                }`}
                            />
                          ))}
                        </div>
                        <Button
                          onClick={scrollNext}
                          variant="outline"
                          className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 rounded-full px-8 py-6 text-lg backdrop-blur-sm transition-all hover:scale-105"
                        >
                          Next Step
                          <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    )}
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-grid-pattern opacity-30" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

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
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
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
                <Button className="shadow-lg shadow-primary/20">Launch Scanner</Button>
              </Link>
              <UserNav />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 h-[calc(100vh-80px)] py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Panel - Navigation */}
          <div className="lg:w-64 shrink-0">
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

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-sm font-medium text-primary">Live Threat Intelligence</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance leading-tight">
                      Advanced AI-Powered <br />
                      <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        Phishing Detection
                      </span>
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl">
                      Protect your digital assets with our cutting-edge cybersecurity platform that combines real-time threat intelligence 
                      and cutting-edge machine learning to identify phishing, malware, and crypto scams in milliseconds.
                    </p>

                    <div className="flex gap-4">
                      <Link href="/scanner">
                        <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/25">
                          Start Free Scan
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
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
                      desc="Aggregated data is weighted to produce a final Risk Score (0-100) and classification (Safe, Suspicious, Phishing)."
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${active
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
    >
      <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
      <span className="font-medium">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  )
}

function StatCard({ value, label, sub, trend }: { value: string, label: string, sub: string, trend: "up" | "down" }) {
  return (
    <Card className="p-6 glassmorphism border-primary/10 hover:border-primary/30 transition-colors">
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-foreground mb-1">{value}</span>
        <span className="text-sm font-medium text-muted-foreground mb-3">{label}</span>
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full ${trend === "up" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}>
            {trend === "up" ? "↑" : "↓"} Positive
          </span>
          <span className="text-muted-foreground/60">{sub}</span>
        </div>
      </div>
    </Card>
  )
}

function PipelineStep({ number, title, desc, icon: Icon, align, isLast }: { number: string, title: string, desc: string, icon: any, align: "left" | "right" | "center", isLast?: boolean }) {
  return (
    <div className={`relative flex items-center md:justify-center ${align === "center" ? "justify-center" : ""}`}>
      {/* Mobile Icon (Left aligned usually) */}
      <div className="absolute left-[8px] md:left-1/2 md:-translate-x-1/2 w-11 h-11 rounded-full bg-background border-4 border-muted flex items-center justify-center z-10 shadow-sm">
        <Icon className="w-5 h-5 text-primary" />
      </div>

      <div className={`
        w-full md:w-5/12 ml-16 md:ml-0
        ${align === "left" ? "md:mr-auto md:pr-8 md:text-right" : ""}
        ${align === "right" ? "md:ml-auto md:pl-8" : ""}
        ${align === "center" ? "md:w-8/12 text-center pt-8" : ""}
      `}>
        <Card className="p-6 glassmorphism hover:border-primary/30 transition-all hover:translate-y-[-2px]">
          <div className={`flex flex-col ${align === "left" ? "md:items-end" : "items-start"} ${align === "center" ? "items-center" : ""}`}>
            <span className="text-2xl font-black text-foreground/5 mb-2">{number}</span>
            <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function TechCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <Card className="p-6 glassmorphism border-border/50 hover:border-primary/50 transition-all group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
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
