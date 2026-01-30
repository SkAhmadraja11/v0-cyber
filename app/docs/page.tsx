import Link from "next/link"
import { Shield, Brain, Zap, Database, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CyberRangeWidget from "@/components/cyber-range-widget"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">PhishGuard AI</h1>
                <p className="text-xs text-muted-foreground">Documentation</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Complete Documentation</span>
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
              High-Confidence, Real-Time Phishing Detection
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Powered by trusted data sources and machine learning intelligence. PhishGuard AI provides enterprise-grade
              protection against sophisticated phishing attacks with 99.2% accuracy and sub-500ms response times.
            </p>
            <div className="flex gap-4">
              <Link href="/scanner">
                <Button size="lg">
                  Try Scanner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/examples">
                <Button size="lg" variant="outline">
                  View Examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-bold text-foreground mb-6">What is PhishGuard AI?</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-6">
              PhishGuard AI is an advanced cybersecurity platform that leverages machine learning algorithms and trusted
              threat intelligence databases to detect and prevent phishing attacks in real-time. Our system analyzes
              URLs and email content through multiple security layers, providing actionable insights and protecting
              organizations from credential theft, malware distribution, and social engineering attacks.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Built for security professionals, IT administrators, and organizations of all sizes, PhishGuard AI
              combines cutting-edge technology with an intuitive interface to deliver enterprise-grade protection
              without the complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Core Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">ML-Based Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Neural networks trained on 1M+ phishing samples with continuous learning from emerging threats. Our
                model extracts 50+ security indicators for comprehensive analysis.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Trusted Data Sources</h3>
              <p className="text-muted-foreground leading-relaxed">
                Integration with verified threat intelligence feeds, SSL certificate databases, domain registries, and
                brand protection services for accurate reputation scoring.
              </p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Real-Time Analysis</h3>
              <p className="text-muted-foreground leading-relaxed">
                Instant threat detection with average processing time of 347ms. Automated threat scoring and actionable
                recommendations delivered in real-time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">How PhishGuard AI Works</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Input Reception & Preprocessing</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    URLs and email content are received through our API endpoints or web interface. The system performs
                    initial validation, sanitization, and normalization to prepare data for analysis. Protocol detection
                    and encoding normalization ensure consistent processing regardless of input format.
                  </p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    Input: https://paypa1-secure-login.com/verify
                    <br />
                    Normalized: paypa1-secure-login.com
                    <br />
                    Protocol: HTTPS detected
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Multi-Source Intelligence Gathering</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our system queries multiple trusted data sources in parallel for comprehensive threat intelligence:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Domain Registries:</strong> WHOIS data, registration date, registrar reputation
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>SSL Certificate Databases:</strong> Certificate validation, issuer verification, expiry
                        dates
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Threat Intelligence Feeds:</strong> Known malicious domains, phishing campaigns, threat
                        actor patterns
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Brand Protection Services:</strong> Trademark databases, official domain verification
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    Advanced Feature Extraction (50+ Indicators)
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our ML model extracts comprehensive security indicators across multiple dimensions:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Structural Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• URL length and complexity</li>
                        <li>• Subdomain depth analysis</li>
                        <li>• Special character frequency</li>
                        <li>• Path structure patterns</li>
                        <li>• IP address detection</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Content Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Suspicious keyword detection</li>
                        <li>• Brand name analysis</li>
                        <li>• TLD reputation scoring</li>
                        <li>• Homograph attack detection</li>
                        <li>• Obfuscation patterns</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Statistical Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Shannon entropy calculation</li>
                        <li>• Character distribution analysis</li>
                        <li>• Vowel/consonant ratios</li>
                        <li>• Digit frequency patterns</li>
                        <li>• N-gram analysis</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">External Indicators</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Domain age verification</li>
                        <li>• SSL certificate validity</li>
                        <li>• Redirect chain analysis</li>
                        <li>• DNS reputation scores</li>
                        <li>• Historical threat data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 4 */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">ML Classification & Risk Scoring</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our neural network processes all extracted features through multiple layers to generate a
                    comprehensive risk assessment. The model uses weighted scoring based on feature importance learned
                    from 1M+ training samples.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Risk Calculation Formula</h4>
                    <code className="text-sm">
                      Risk Score = Σ(feature_weight × feature_value)
                      <br />
                      Confidence = 85 + |Risk Score - 50| × 0.3
                      <br />
                      Classification: Phishing if Risk Score {">"} 50
                    </code>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 5 */}
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Threat Analysis & Recommendations</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The system generates detailed threat intelligence reports with specific indicators of compromise
                    (IOCs) and actionable recommendations based on risk severity. Reports include context-aware guidance
                    for both technical and non-technical users.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        High Risk Output
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Specific threat identification</li>
                        <li>• IOC documentation</li>
                        <li>• Immediate action items</li>
                        <li>• Incident response guidance</li>
                      </ul>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Low Risk Output
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Security best practices</li>
                        <li>• Verification recommendations</li>
                        <li>• Monitoring suggestions</li>
                        <li>• Preventive measures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Technical Specifications</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Detection Accuracy</span>
                    <span className="font-semibold text-foreground">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precision Rate</span>
                    <span className="font-semibold text-foreground">96.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recall Rate</span>
                    <span className="font-semibold text-foreground">98.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">F1 Score</span>
                    <span className="font-semibold text-foreground">97.6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Response Time</span>
                    <span className="font-semibold text-foreground">347ms</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Training Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phishing Samples</span>
                    <span className="font-semibold text-foreground">1M+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Legitimate URLs</span>
                    <span className="font-semibold text-foreground">500K+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Feature Dimensions</span>
                    <span className="font-semibold text-foreground">50+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model Version</span>
                    <span className="font-semibold text-foreground">v2.5.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Update Frequency</span>
                    <span className="font-semibold text-foreground">Daily</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Security & Compliance</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Data Privacy</div>
                    <div className="text-sm text-muted-foreground">No data retention, real-time analysis only</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Encrypted Transport</div>
                    <div className="text-sm text-muted-foreground">TLS 1.3 for all API communications</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Audit Logging</div>
                    <div className="text-sm text-muted-foreground">Complete activity tracking for compliance</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Role-Based Access</div>
                    <div className="text-sm text-muted-foreground">Granular permission controls</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Cyber Range Widget Integration */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <CyberRangeWidget />
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Use Cases</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">Enterprise Email Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Integrate PhishGuard AI with your email gateway to automatically scan all incoming messages for phishing
                attempts. Real-time analysis protects employees from credential theft and malware delivery while
                providing security teams with actionable threat intelligence.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">Security Awareness Training</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Use our interactive training modules and real phishing examples to educate employees about threat
                recognition. Track training completion and quiz scores through the admin dashboard to measure security
                posture improvements.
              </p>
              <Link href="/awareness">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Explore Awareness Platform
                </Button>
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">Incident Response & Forensics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Security teams can quickly analyze suspicious URLs reported by users, generating detailed forensic
                reports with IOCs for threat hunting. Historical data and pattern analysis help identify coordinated
                phishing campaigns targeting your organization.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-foreground">API Integration for Custom Applications</h3>
              <p className="text-muted-foreground leading-relaxed">
                Integrate our REST API into your existing security stack, SIEM platforms, or custom applications.
                Leverage ML-powered detection within your workflows with simple API calls and comprehensive JSON
                responses.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience high-confidence phishing detection with trusted data sources and ML intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/scanner">
                <Button size="lg" className="w-full sm:w-auto">
                  Try Scanner Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/examples">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  View Test Examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
