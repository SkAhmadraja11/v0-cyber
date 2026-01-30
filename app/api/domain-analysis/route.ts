import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// WHOIS API configuration
const WHOIS_API_KEY = process.env.WHOIS_API_KEY || "at_1h2k3j4x7m8n9p5q6r3s7t2u3v"
const WHOIS_API_URL = "https://www.whoisxmlapi.com/whoisserver/WhoisService"

interface WhoisResponse {
  DomainInfo: {
    domainAge: number
    createdDate: string
    expiresDate: string
    registrarName: string
    domainName: string
  }
  ErrorMessage?: string
}

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Extract domain from URL if full URL provided
    const domainOnly = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()

    // Call WHOIS API for accurate data
    const whoisUrl = `${WHOIS_API_URL}?apiKey=${WHOIS_API_KEY}&domainName=${domainOnly}&outputFormat=JSON`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(whoisUrl, { signal: controller.signal })
    clearTimeout(timeoutId)
    const data: WhoisResponse = await response.json()

    if (data.ErrorMessage) {
      throw new Error(data.ErrorMessage)
    }

    if (!data.DomainInfo) {
      throw new Error("No domain information available")
    }

    const domainInfo = data.DomainInfo

    // Calculate age in days
    const createdDate = new Date(domainInfo.createdDate)
    const now = new Date()
    const ageInMs = now.getTime() - createdDate.getTime()
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24))

    // Determine risk status based on age
    let status: 'safe' | 'suspicious' | 'phishing'
    let confidence: number

    if (ageInDays < 30) {
      status = 'phishing'
      confidence = 0.9
    } else if (ageInDays < 90) {
      status = 'suspicious'
      confidence = 0.7
    } else if (ageInDays < 365) {
      status = 'suspicious'
      confidence = 0.5
    } else {
      status = 'safe'
      confidence = 0.8
    }

    // Additional risk factors
    if (domainInfo.registrarName && (
      domainInfo.registrarName.toLowerCase().includes('cheap') ||
      domainInfo.registrarName.toLowerCase().includes('privacy') ||
      domainInfo.registrarName.toLowerCase().includes('shield')
    )) {
      confidence = Math.min(confidence + 0.2, 1.0)
      if (status === 'safe') {
        status = 'suspicious'
      }
    }

    const analysis = {
      domain: domainInfo.domainName,
      age_days: ageInDays,
      created_date: domainInfo.createdDate,
      registrar: domainInfo.registrarName || 'Unknown',
      expiry_date: domainInfo.expiresDate,
      status,
      confidence,
      analysis_time: new Date().toISOString()
    }

    // Save to database
    const supabase = await createClient()
    await supabase
      .from('domain_analyses')
      .insert({
        domain: domainInfo.domainName,
        age_days: ageInDays,
        created_date: domainInfo.createdDate,
        registrar: domainInfo.registrarName,
        expiry_date: domainInfo.expiresDate,
        status,
        confidence,
        analysis_time: new Date().toISOString()
      })

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Domain analysis error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Domain analysis failed',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// Fallback function for when WHOIS API is unavailable
async function getFallbackAnalysis(domain: string) {
  // Use basic domain patterns as fallback
  const domainOnly = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[0-9]{4,}/, // Numbers in domain
    /-[a-z]{2,}-/, // Multiple hyphens
    /\.(tk|ml|ga|cf)$/i, // Suspicious TLDs
    /(secure|verify|confirm|account|login|signin|update)/i // Suspicious keywords
  ]

  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(domainOnly))

  // Generate fake but realistic data for demo
  const fakeAge = hasSuspiciousPattern ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 365) + 365

  return {
    domain: domainOnly,
    age_days: fakeAge,
    created_date: new Date(Date.now() - fakeAge * 24 * 60 * 60 * 1000).toISOString(),
    registrar: 'Unknown (Demo Mode)',
    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: hasSuspiciousPattern ? 'suspicious' : 'safe',
    confidence: 0.6
  }
}
