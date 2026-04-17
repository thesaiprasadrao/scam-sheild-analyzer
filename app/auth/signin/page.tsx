"use client"

import { signIn } from "next-auth/react"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ThemeToggle from "@/components/theme-toggle"
import { Shield, Eye, EyeOff } from "lucide-react"

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useSearchParams()

  const callbackUrl = params.get("callbackUrl") || "/dashboard"

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await signIn("credentials", { 
        redirect: false, 
        email, 
        password, 
        callbackUrl 
      })
      
      if (res?.error) {
        setError("Invalid email or password")
      } else if (res?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <a href="/signin"><span className="font-serif font-bold">ScamShield</span></a>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur w-full max-w-md sm:w-[400px] mx-4">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-serif">Welcome back</CardTitle>
            <CardDescription>Sign in to your ScamShield account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com"
                required 
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required 
                  disabled={loading}
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">More options coming soon</span>
            </div>
          </div>

          {/* Temporarily disabled until Google OAuth is configured
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signIn("google", { callbackUrl })}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          */}

          <p className="text-sm text-muted-foreground text-center">
            Don't have an account?{" "}
            <a className="underline hover:text-primary transition-colors" href="/auth/signup">
              Sign up
            </a>
          </p>
          </CardContent>
          </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <SignInContent />
    </Suspense>
  )
}
