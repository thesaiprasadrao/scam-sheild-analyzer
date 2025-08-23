"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ShieldAlert, Upload, FileText, CheckCircle, ArrowLeft, BookOpen, Newspaper } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle"
import { useSession, signOut } from "next-auth/react"
import ProtectedPageWrapper from "@/components/protected-page-wrapper"
import { SessionMonitor } from "@/components/session-monitor"
import ScamEducationSection from "@/components/scam-education-section"
import { useUserProfile } from "@/hooks/use-user-profile"
import ProfileDropdown from "@/components/profile-dropdown"
import ScrollToTop from "@/components/scroll-to-top"

interface AnalysisResult {
  riskLevel: string
  analyzedText: string
  redFlags: Array<{
    title: string
    description: string
  }>
  recommendedActions: string[]
  gemini_confidence?: number
  analysis_method?: string
}

export default function ScamShieldAnalyzer() {
  const { data: session, status } = useSession()
  const { profile } = useUserProfile()
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState<"input" | "results">("input")
  const [inputText, setInputText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("text")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
          
          {/* Right side - Profile and Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  )

  const handleAnalyze = async () => {
    if (!inputText.trim() && !uploadedFile) return
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      if (inputText.trim()) formData.append("message_text", inputText.trim())
      if (uploadedFile) formData.append("message_screenshot", uploadedFile)
      const currentHost = window.location.hostname
      const backendUrls = [
        "http://localhost:8000/api/analyze",
        `http://${currentHost}:8000/api/analyze`,
        "http://127.0.0.1:8000/api/analyze",
      ]
      let response: Response | null = null
      let lastError: Error | null = null
      for (const backendUrl of backendUrls) {
        try {
          response = await fetch(backendUrl, { method: "POST", body: formData })
          if (response.ok) break
        } catch (error) {
          lastError = error as Error
          response = null
        }
      }
      if (!response) throw lastError || new Error("All backend connection attempts failed")
      if (!response.ok) throw new Error(`HTTP error ${response.status}: ${await response.text()}`)
      const result: AnalysisResult = await response.json()
      setAnalysisResult(result)
      setCurrentScreen("results")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Error connecting to analysis service: ${errorMessage}. Please check if the backend is running on port 8000.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setUploadedFile(file)
  }

  const resetToInput = () => {
    setCurrentScreen("input")
    setInputText("")
    setUploadedFile(null)
    setActiveTab("text")
    setAnalysisResult(null)
    setIsAnalyzing(false)
  }

  if (currentScreen === "results" && analysisResult) {
    const getRiskLevelDisplay = (riskLevel: string) => {
      switch (riskLevel) {
        case "HIGH_RISK":
          return {
            icon: <ShieldAlert className="h-6 w-6" />,
            title: "🔴 HIGH RISK",
            description: "This message has several characteristics of a known scam.",
            className: "border-destructive bg-destructive/5",
            titleClassName: "text-destructive",
            descriptionClassName: "text-destructive/80",
            bgClassName: "bg-destructive text-destructive-foreground",
          }
        case "MEDIUM_RISK":
          return {
            icon: <ShieldAlert className="h-6 w-6" />,
            title: "🟡 MEDIUM RISK",
            description: "This message contains some suspicious elements that warrant caution.",
            className: "border-orange-500 bg-orange-50",
            titleClassName: "text-orange-600",
            descriptionClassName: "text-orange-600/80",
            bgClassName: "bg-orange-500 text-white",
          }
        case "LOOKS_SAFE":
        default:
          return {
            icon: <Shield className="h-6 w-6" />,
            title: "🟢 LOOKS SAFE",
            description: "This message appears to be legitimate with no major red flags detected.",
            className: "border-green-500 bg-green-50",
            titleClassName: "text-green-600",
            descriptionClassName: "text-green-600/80",
            bgClassName: "bg-green-500 text-white",
          }
      }
    }

    const riskDisplay = getRiskLevelDisplay(analysisResult.riskLevel)

    return (
      <ProtectedPageWrapper 
        requireAuth={true}
        redirectTo="/auth/signin"
        onSessionInvalid={() => {
          console.log("Session invalidated, redirecting to signin")
        }}
      >
        <div className="min-h-screen bg-background flex flex-col">
          <SharedHeader />

          <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl overflow-y-auto">
          <Card className={`mb-8 ${riskDisplay.className}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${riskDisplay.bgClassName}`}>
                  {riskDisplay.icon}
                </div>
                <div>
                  <CardTitle className={`${riskDisplay.titleClassName} text-xl`}>{riskDisplay.title}</CardTitle>
                  <CardDescription className={`${riskDisplay.descriptionClassName} text-base`}>
                    {riskDisplay.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {analysisResult.analyzedText && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif text-xl text-black">Analyzed Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{analysisResult.analyzedText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult.redFlags.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif text-xl text-black">Breakdown of Red Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.redFlags.map((flag, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-destructive mb-1">{flag.title}</h3>
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-black">Recommended Actions</CardTitle>
              <CardDescription>What you should do now:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisResult.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={resetToInput} variant="outline" size="lg" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Analyze Another Message
            </Button>
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
              <p>Friday, August 22, 2025</p>
            </div>
          </div>
        </footer>
        </div>
        <ScrollToTop />
      </ProtectedPageWrapper>
    )
  }

  return (
    <ProtectedPageWrapper 
      requireAuth={true}
      redirectTo="/auth/signin"
      onSessionInvalid={() => {
        console.log("Session invalidated, redirecting to signin")
      }}
    >
      <div className="min-h-screen bg-background flex flex-col">
        <SharedHeader />

        <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl overflow-y-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">Think you've received a scam?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paste the message or upload a screenshot. We'll check it for common signs of fraud in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Screenshot
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-6">
                <Textarea
                  placeholder="Paste the suspicious message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Drag and drop your image file or click to browse</p>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                  {uploadedFile && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button 
            onClick={handleAnalyze} 
            disabled={(!inputText.trim() && !uploadedFile) || isAnalyzing} 
            size="lg" 
            className="px-8 py-3 text-lg"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Message"}
          </Button>
        </motion.div>        {/* Explore More Section */}
        <motion.section 
          className="mt-16 mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold font-serif text-foreground mb-4">Explore More</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enhance your security knowledge with these additional resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto md:grid-rows-1">
            {/* Scam Education Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94] // Custom cubic-bezier for smooth easing
              }}
              whileHover={{ 
                scale: 1.03, 
                y: -8,
                transition: { 
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              whileTap={{ 
                scale: 0.97,
                transition: { duration: 0.1 }
              }}
              className="h-full"
            >
              <Link href="/scam-education" className="block group h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-xl cursor-pointer border-2 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-white hover:from-orange-100 hover:to-orange-50 flex flex-col">
                  <CardContent className="p-8 text-center flex-1 flex flex-col justify-between">
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors shadow-lg"
                        whileHover={{ 
                          rotate: 5, 
                          scale: 1.15,
                          transition: { 
                            duration: 0.4,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        }}
                      >
                        <BookOpen className="h-10 w-10 text-orange-600" />
                      </motion.div>
                      <h4 className="text-2xl font-bold mb-3 text-black group-hover:text-orange-600 transition-colors">
                        How Scammers Might Target You
                      </h4>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Learn scams that target your persona and how to stay safe.
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition-colors mt-4">
                      Explore Education →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Scam News Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94] // Custom cubic-bezier for smooth easing
              }}
              whileHover={{ 
                scale: 1.03, 
                y: -8,
                transition: { 
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              whileTap={{ 
                scale: 0.97,
                transition: { duration: 0.1 }
              }}
              className="h-full"
            >
              <Link href="/scam-news" className="block group h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-xl cursor-pointer border-2 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-white hover:from-orange-100 hover:to-orange-50 flex flex-col">
                  <CardContent className="p-8 text-center flex-1 flex flex-col justify-between">
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 group-hover:bg-orange-200 transition-colors shadow-lg"
                        whileHover={{ 
                          rotate: -5, 
                          scale: 1.15,
                          transition: { 
                            duration: 0.4,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        }}
                      >
                        <Newspaper className="h-10 w-10 text-orange-600" />
                      </motion.div>
                      <h4 className="text-2xl font-bold mb-3 text-black group-hover:text-orange-600 transition-colors">
                        Live Scam News Feed
                      </h4>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Stay updated with the latest scam alerts and security warnings.
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
                      View News Feed →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {process.env.NODE_ENV === "development" && (
          <div className="container mx-auto px-4">
          </div>
        )}
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
            <p>Friday, August 23, 2025</p>
          </div>
        </div>
      </footer>
    </div>
    </ProtectedPageWrapper>
  )
}
