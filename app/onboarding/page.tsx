"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield, GraduationCap, Briefcase, Home, Users, Globe, ArrowRight, SkipForward } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"

interface ProfileOption {
  value: string
  label: string
  description: string
  icon: React.ReactNode
  benefits: string[]
}

const profileOptions: ProfileOption[] = [
  {
    value: "student",
    label: "Student",
    description: "Currently studying or in education",
    icon: <GraduationCap className="h-6 w-6" />,
    benefits: [
      "Alerts about fake internship scams",
      "Part-time job fraud warnings",
      "Scholarship scam protection",
      "Educational discount fraud alerts"
    ]
  },
  {
    value: "working-professional",
    label: "Working Professional",
    description: "Employed or running a business",
    icon: <Briefcase className="h-6 w-6" />,
    benefits: [
      "Professional phishing protection",
      "Business email scam alerts",
      "Investment fraud warnings",
      "Career-related scam detection"
    ]
  },
  {
    value: "homemaker",
    label: "Homemaker",
    description: "Managing household and family",
    icon: <Home className="h-6 w-6" />,
    benefits: [
      "Fake shopping website alerts",
      "Delivery notification scams",
      "OLX and marketplace fraud warnings",
      "Home service scam protection"
    ]
  },
  {
    value: "senior-citizen",
    label: "Senior Citizen",
    description: "Aged 60 and above",
    icon: <Users className="h-6 w-6" />,
    benefits: [
      "Pension KYC fraud alerts",
      "Electricity bill scam warnings",
      "SIM card blocking threats",
      "Healthcare fraud protection",
      "Larger text and simplified interface"
    ]
  },
  {
    value: "new-to-internet",
    label: "New to Internet",
    description: "Just starting to use digital services",
    icon: <Globe className="h-6 w-6" />,
    benefits: [
      "Basic scam education",
      "Simple interface with guidance",
      "Voice assistance available",
      "Step-by-step protection tips"
    ]
  }
]

export default function OnboardingPage() {
  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Handle redirection in useEffect to avoid render-time navigation
  useEffect(() => {
    if (status === "loading") return // Still loading
    if (!session) {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  // Debug: Log when profile selection changes
  useEffect(() => {
    console.log("Selected profile changed:", selectedProfile)
  }, [selectedProfile])

  const handleComplete = async () => {
    if (!selectedProfile) {
      setError("Please select a profile type")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileType: selectedProfile }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save profile")
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (useEffect will handle redirect)
  if (!session) {
    return null
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
        <div className="w-full max-w-4xl mx-4">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-3xl font-serif">Welcome to ScamShield!</CardTitle>
              <CardDescription className="text-lg">
                To help us protect you better, tell us a bit about yourself
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                This is optional but helps us personalize your experience
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6 px-8 pb-8">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Selection feedback */}
              {selectedProfile && (
                <div className="p-3 /20">
                  <p className="text-sm font-medium text-primary">
                    {/* ✓ Selected: {profileOptions.find(opt => opt.value === selectedProfile)?.label} */}
                  </p>
                </div>
              )}
              
              <RadioGroup value={selectedProfile} onValueChange={setSelectedProfile}>
                <div className="grid gap-4 md:grid-cols-2">
                  {profileOptions.map((option) => (
                    <div key={option.value} className="relative">
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.value}
                        className={`flex flex-col p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 h-full relative ${
                          selectedProfile === option.value
                            ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                            : 'border-muted hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {/* Selection indicator */}
                        {selectedProfile === option.value && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`transition-colors duration-200 ${
                            selectedProfile === option.value ? 'text-primary' : 'text-primary'
                          }`}>
                            {option.icon}
                          </div>
                          <div>
                            <h3 className={`font-semibold text-lg transition-colors duration-200 ${
                              selectedProfile === option.value ? 'text-primary' : ''
                            }`}>
                              {option.label}
                            </h3>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium mb-2">What you'll get:</p>
                          <ul className="text-xs space-y-1">
                            {option.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              
              <div className="flex gap-4 pt-10 mt-6">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                  disabled={loading}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip for now
                </Button>
                <Button
                  onClick={handleComplete}
                  className={`flex-1 ${selectedProfile ? 'bg-primary hover:bg-primary/90 ring-2 ring-primary/20' : ''}`}
                  disabled={loading || !selectedProfile}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue{selectedProfile && ' with ' + profileOptions.find(opt => opt.value === selectedProfile)?.label}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
