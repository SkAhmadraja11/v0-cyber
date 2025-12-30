"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "An unexpected error occurred"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-linear-to-br from-destructive/10 via-transparent to-destructive/5" />

      <div className="w-full max-w-md relative z-10">
        <Card className="glassmorphism border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
            </div>
            <CardDescription>There was a problem signing you in</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-mono wrap-break-word">
                {error}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Common Solutions:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>If using Google sign-in, ensure it's enabled in your Supabase dashboard</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Try signing in with email and password instead</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Clear your browser cookies and try again</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Contact your administrator if the issue persists</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/auth/login">
                <Button className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
