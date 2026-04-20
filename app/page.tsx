"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ThemeToggle from "@/components/theme-toggle"
import { Shield, ShieldAlert, Users, Zap, CheckCircle } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold">ScamShield</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => router.push("/auth/signin")}>
              Sign In
            </Button>
            <Button onClick={() => router.push("/auth/signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Protect Yourself from <span className="text-primary">Online Scams</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Analyze suspicious messages and identify potential scams with our AI-powered detection tool. 
              Stay safe online with intelligent threat analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push("/auth/signup")}>
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/auth/signin")}>
                Sign In
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              How ScamShield Protects You
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-lg w-fit">
                    <ShieldAlert className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Analysis</CardTitle>
                  <CardDescription>
                    Advanced machine learning algorithms analyze text patterns and detect suspicious content
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-lg w-fit">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Real-time Detection</CardTitle>
                  <CardDescription>
                    Get instant results and risk assessments for any suspicious message or content
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-lg w-fit">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Actionable Insights</CardTitle>
                  <CardDescription>
                    Receive detailed reports with specific red flags and recommended safety actions
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-serif font-bold mb-6">
              Ready to Stay Safe Online?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who trust ScamShield to protect them from online threats.
            </p>
            <Button size="lg" onClick={() => router.push("/auth/signup")}>
              Start Protecting Yourself Today
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ScamShield. Protecting you from digital threats.</p>
        </div>
      </footer>
    </div>
  )
}
