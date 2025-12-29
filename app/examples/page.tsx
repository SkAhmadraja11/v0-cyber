"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, CheckCircle2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ExamplesPage() {
  const phishingExamples = [
    {
      url: "https://paypa1-secure-login.com/verify-account",
      reason: "Typosquatting - Uses 'paypa1' instead of 'paypal'",
      features: ["Brand impersonation", "Suspicious domain", "Verification keyword"],
    },
    {
      url: "https://192.168.1.1/urgent-security-update.php",
      reason: "IP address instead of domain + urgent language",
      features: ["IP address", "Suspicious keywords", "PHP file"],
    },
    {
      url: "https://account-suspended-verify-now.xyz/login",
      reason: "New TLD, multiple suspicious keywords",
      features: ["Suspicious TLD (.xyz)", "Urgent language", "Domain < 30 days"],
    },
    {
      url: "https://microsoft-support-urgent-action.online/verify",
      reason: "Brand + urgency + suspicious TLD",
      features: ["Brand spoofing", "Suspicious TLD", "Multiple hyphens"],
    },
    {
      url: "https://secure-banking-update@malicious-site.com/login",
      reason: "@ symbol in URL (URL manipulation)",
      features: ["@ symbol", "Multiple subdomains", "Login keyword"],
    },
  ]

  const safeExamples = [
    {
      url: "https://github.com/user/repository",
      reason: "Legitimate domain, proper HTTPS",
      features: ["Trusted brand", "Valid SSL", "Established domain"],
    },
    {
      url: "https://www.google.com/search?q=example",
      reason: "Official Google domain",
      features: ["Well-known domain", "HTTPS", "Normal structure"],
    },
    {
      url: "https://stackoverflow.com/questions/12345",
      reason: "Trusted developer community",
      features: ["Established domain", "Valid SSL", "Normal URL length"],
    },
    {
      url: "https://www.amazon.com/products/electronics",
      reason: "Official Amazon domain",
      features: ["Trusted brand", "Proper domain", "Valid certificate"],
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="font-bold text-lg">Test Examples</h1>
            </div>
            <Link href="/scanner">
              <Button>Try Scanner</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">ML Model Test Cases</h2>
            <p className="text-xl text-muted-foreground">
              Real-world examples to test the phishing detection capabilities
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Phishing URLs (Dangerous)</h3>
                <p className="text-sm text-muted-foreground">These URLs should be detected as threats</p>
              </div>
            </div>

            <div className="grid gap-4">
              {phishingExamples.map((example, idx) => (
                <Card
                  key={idx}
                  className="p-6 border-2 border-destructive/20 hover:border-destructive/40 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-destructive/10 px-3 py-1 rounded text-destructive font-mono">
                            {example.url}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(example.url)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground font-medium">{example.reason}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {example.features.map((feature, fIdx) => (
                        <span key={fIdx} className="text-xs px-3 py-1 rounded-full bg-destructive/10 text-destructive">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Safe URLs (Legitimate)</h3>
                <p className="text-sm text-muted-foreground">These URLs should pass the safety check</p>
              </div>
            </div>

            <div className="grid gap-4">
              {safeExamples.map((example, idx) => (
                <Card
                  key={idx}
                  className="p-6 border-2 border-green-500/20 hover:border-green-500/40 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-green-500/10 px-3 py-1 rounded text-green-500 font-mono">
                            {example.url}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(example.url)}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground font-medium">{example.reason}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {example.features.map((feature, fIdx) => (
                        <span key={fIdx} className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-500">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="p-8 bg-primary/5 border-2 border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-4">How to Test</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Copy any URL from the examples above using the copy button</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Navigate to the Scanner page</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Paste the URL and click "Scan for Threats"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>Observe the ML model's analysis and risk assessment</span>
              </li>
            </ol>
            <div className="mt-6">
              <Link href="/scanner">
                <Button size="lg" className="w-full sm:w-auto">
                  Open Scanner
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
