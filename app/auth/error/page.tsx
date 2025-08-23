"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ThemeToggle from "@/components/theme-toggle"
import { Shield, AlertTriangle } from "lucide-react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support."
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in."
      case "Verification":
        return "The verification token has expired or has already been used."
      case "OAuthSignin":
        return "Error occurred during OAuth sign in process."
      case "OAuthCallback":
        return "Error occurred during OAuth callback."
      case "OAuthCreateAccount":
        return "Could not create OAuth account."
      case "EmailCreateAccount":
        return "Could not create email account."
      case "Callback":
        return "Error occurred during callback."
      case "OAuthAccountNotLinked":
        return "OAuth account is not linked to any existing account."
      case "EmailSignin":
        return "Check your email address."
      case "CredentialsSignin":
        return "Invalid credentials. Please check your email and password."
      case "SessionRequired":
        return "You must be signed in to access this page."
      default:
        return "An unexpected error occurred. Please try again."
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
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-serif">Authentication Error</CardTitle>
              <CardDescription className="text-center">
                {getErrorMessage(error)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <a href="/auth/signin">Try Again</a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/">Back to Home</a>
              </Button>
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-muted/50 border">
                <p className="text-xs text-muted-foreground">
                  Error code: <code className="font-mono">{error}</code>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
