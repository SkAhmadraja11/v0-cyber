import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-6">
      <div className="fixed inset-0 bg-grid-pattern opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

      <div className="w-full max-w-md relative z-10">
        <Card className="glassmorphism border-border/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Confirmation Email Sent</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Please check your inbox and click the confirmation link to activate your account. Don't forget to
                    check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/auth/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
