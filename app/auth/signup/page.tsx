"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import ThemeToggle from "@/components/theme-toggle"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please fill in all required fields")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to register")
      }
      
      // Auto sign in after successful registration
      const loginRes = await signIn("credentials", { 
        redirect: false, 
        email, 
        password 
      })
      
      if (loginRes?.error) {
        throw new Error("Registration successful, but failed to sign in. Please try signing in manually.")
      }
      
      router.push("/onboarding")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
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
            <span className="font-serif font-bold">ScamShield</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur w-full max-w-sm mx-4">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-serif">Create your account</CardTitle>
            <CardDescription>Join ScamShield and start protecting yourself online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your full name" 
                disabled={loading}
              />
            </div>
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
                  placeholder="At least 6 characters"
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
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <a className="underline hover:text-primary transition-colors" href="/auth/signin">
              Sign in
            </a>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
