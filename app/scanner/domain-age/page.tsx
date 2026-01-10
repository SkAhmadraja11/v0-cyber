"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Globe,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink
} from "lucide-react"

interface DomainAnalysis {
  domain: string
  age_days: number
  created_date: string
  registrar: string
  expiry_date: string
  status: 'safe' | 'suspicious' | 'phishing'
  confidence: number
}

export default function DomainAgeAnalyzer() {
  const [domain, setDomain] = useState("")
  const [analysis, setAnalysis] = useState<DomainAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const analyzeDomain = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain name")
      return
    }

    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      // Extract domain from URL if full URL provided
      const domainOnly = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
      
      // Call WHOIS API for accurate domain age
      const response = await fetch('/api/domain-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domainOnly })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze domain')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setAnalysis(data)
      
      // Save analysis to database
      await supabase
        .from('domain_analyses')
        .insert({
          domain: domainOnly,
          age_days: data.age_days,
          created_date: data.created_date,
          registrar: data.registrar,
          expiry_date: data.expiry_date,
          status: data.status,
          confidence: data.confidence,
          analysis_time: new Date().toISOString()
        })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getAgeColor = (ageDays: number) => {
    if (ageDays < 30) return 'text-red-600 bg-red-50'
    if (ageDays < 90) return 'text-orange-600 bg-orange-50'
    if (ageDays < 365) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getAgeLabel = (ageDays: number) => {
    if (ageDays < 1) return 'Less than 1 day'
    if (ageDays < 7) return `${ageDays} days`
    if (ageDays < 30) return `${Math.floor(ageDays / 7)} weeks`
    if (ageDays < 365) return `${Math.floor(ageDays / 30)} months`
    return `${Math.floor(ageDays / 365)} years`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50'
      case 'suspicious': return 'text-yellow-600 bg-yellow-50'
      case 'phishing': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Domain Age Analyzer</h1>
          <p className="text-muted-foreground">Accurate WHOIS-based domain age and registration analysis</p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Analysis</CardTitle>
            <CardDescription>Enter a domain or URL to analyze its age and registration details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="example.com or https://example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => e.key === 'Enter' && analyzeDomain()}
              />
              <Button 
                onClick={analyzeDomain}
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Analyze</span>
                  </div>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domain Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Domain Information</span>
                </CardTitle>
                <CardDescription>Registration and WHOIS details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Domain:</span>
                    <span className="text-sm">{analysis.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Age:</span>
                    <Badge className={getAgeColor(analysis.age_days)}>
                      {getAgeLabel(analysis.age_days)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm">{new Date(analysis.created_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Registrar:</span>
                    <span className="text-sm">{analysis.registrar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Expires:</span>
                    <span className="text-sm">{new Date(analysis.expiry_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Assessment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Assessment</span>
                </CardTitle>
                <CardDescription>Based on domain age and patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Level:</span>
                    <Badge className={getStatusColor(analysis.status)}>
                      {analysis.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Confidence:</span>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">{Math.round(analysis.confidence * 100)}%</div>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${analysis.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Indicators */}
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Risk Indicators:</h4>
                  
                  {analysis.age_days < 30 && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Very new domain (less than 30 days)</span>
                    </div>
                  )}
                  
                  {analysis.age_days >= 30 && analysis.age_days < 90 && (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Recently registered domain</span>
                    </div>
                  )}
                  
                  {analysis.age_days >= 365 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Established domain (over 1 year)</span>
                    </div>
                  )}
                  
                  {analysis.confidence > 0.8 && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Info className="w-4 h-4" />
                      <span className="text-sm">High confidence in analysis</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Domain Age Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Why Domain Age Matters</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• New domains are often used for phishing</li>
                  <li>• Established domains are more trustworthy</li>
                  <li>• Scammers frequently create fresh domains</li>
                  <li>• Age helps assess legitimacy</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Risk Assessment</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="text-red-600">Red:</span> Less than 30 days</li>
                  <li>• <span className="text-orange-600">Orange:</span> Less than 90 days</li>
                  <li>• <span className="text-yellow-600">Yellow:</span> Less than 1 year</li>
                  <li>• <span className="text-green-600">Green:</span> Over 1 year</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
