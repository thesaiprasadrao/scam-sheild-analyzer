"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ShieldAlert, BookOpen, BarChart2, Newspaper } from "lucide-react"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"
import ProtectedPageWrapper from "@/components/protected-page-wrapper"
import ProfileDropdown from "@/components/profile-dropdown"
import ScamEducationSection from "@/components/scam-education-section"
import { useUserProfile } from "@/hooks/use-user-profile"

export default function ScamEducationPage() {
  const router = useRouter()
  const { profile } = useUserProfile()

  // Shared Header Component
  const SharedHeader = () => (
    <header className="border-b bg-card">
      <div className="w-full px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo with extra left padding */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/dashboard')}
          >
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-serif text-primary">ScamShield</h1>
          </div>
          
          {/* Right side - Nav links, Profile and Theme Toggle */}
          <div className="flex items-center gap-3">
            <Link href="/analytics" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
            <Link href="/scam-news" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">News</span>
            </Link>
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )

  return (
    <ProtectedPageWrapper 
      requireAuth={true}
      redirectTo="/auth/signin"
      onSessionInvalid={() => {
        console.log("Session invalidated, redirecting to signin")
      }}
    >
      <div className="min-h-screen bg-background">
        <SharedHeader />

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
              How Scammers Might Target You
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn about scams that specifically target your persona and how to stay safe.
            </p>
          </div>

          {/* Scam Education Content */}
          <div className="max-w-3xl mx-auto mb-12">
            <ScamEducationSection userPersona={profile?.profileType || 'student'} />
          </div>

          {/* Additional Educational Content */}
          <div className="mt-16 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                  General Safety Tips
                </CardTitle>
                <CardDescription>
                  Universal guidelines to protect yourself from any type of scam
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 text-lg">•</span>
                    <span>Never give personal information (SSN, passwords, bank details) over phone or email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 text-lg">•</span>
                    <span>Verify requests independently by calling the organization directly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 text-lg">•</span>
                    <span>Be suspicious of urgent demands for immediate action or payment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 text-lg">•</span>
                    <span>Check URLs carefully - scammers often use similar-looking fake websites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 text-lg">•</span>
                    <span>Trust your instincts - if something feels wrong, it probably is</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="border-t bg-card mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">
                  About Us
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </div>
              <p>© {new Date().getFullYear()} ScamShield</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedPageWrapper>
  )
}
