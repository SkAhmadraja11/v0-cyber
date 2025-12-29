import { type NextRequest, NextResponse } from "next/server"
import { PhishingDetector } from "@/lib/ml-model"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, mode } = body

    if (!input || !mode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (mode === "url" && input.length < 5) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    if (mode === "email" && input.length < 10) {
      return NextResponse.json({ error: "Email content too short to analyze" }, { status: 400 })
    }

    // Initialize ML detector
    const detector = new PhishingDetector()

    const complexity = input.length + (input.match(/[^a-zA-Z0-9]/g) || []).length
    const processingDelay = Math.min(800 + complexity * 2, 3000)
    await new Promise((resolve) => setTimeout(resolve, processingDelay))

    // Perform ML detection
    const result = await detector.detect(input, mode)

    const response = NextResponse.json(result)
    response.headers.set("X-Processing-Time", `${processingDelay}ms`)
    response.headers.set("X-Model-Version", result.modelVersion)

    return response
  } catch (error) {
    console.error("Scan error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
