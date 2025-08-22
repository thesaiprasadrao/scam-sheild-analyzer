"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ShieldAlert, Upload, FileText, Clock, Phone, HelpCircle, CheckCircle, ArrowLeft } from "lucide-react"

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
  const [currentScreen, setCurrentScreen] = useState<"input" | "results">("input")
  const [inputText, setInputText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("text")
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!inputText.trim() && !uploadedFile) {
      return
    }

    setIsAnalyzing(true)
    
    try {
      const formData = new FormData()
      
      if (inputText.trim()) {
        formData.append('message_text', inputText.trim())
      }
      
      if (uploadedFile) {
        formData.append('message_screenshot', uploadedFile)
      }

      // Try different backend URLs based on current frontend URL
      const currentHost = window.location.hostname
      const backendUrls = [
        'http://localhost:8000/api/analyze',
        `http://${currentHost}:8000/api/analyze`,
        'http://127.0.0.1:8000/api/analyze'
      ]

      let response: Response | null = null
      let lastError: Error | null = null

      // Try each backend URL until one works
      for (const backendUrl of backendUrls) {
        try {
          console.log('Attempting to connect to backend at:', backendUrl)
          response = await fetch(backendUrl, {
            method: 'POST',
            body: formData,
          })
          
          if (response.ok) {
            console.log('Successfully connected to backend at:', backendUrl)
            break
          } else {
            console.warn(`Backend responded with error ${response.status} at ${backendUrl}`)
          }
        } catch (error) {
          console.warn(`Failed to connect to ${backendUrl}:`, error)
          lastError = error as Error
          response = null
        }
      }

      if (!response) {
        throw lastError || new Error('All backend connection attempts failed')
      }

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result: AnalysisResult = await response.json()
      console.log('Analysis result:', result)
      setAnalysisResult(result)
      setCurrentScreen("results")
    } catch (error) {
      console.error('Error analyzing message:', error)
      // More detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Error connecting to analysis service: ${errorMessage}. Please check if the backend is running on port 8000.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
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
        case 'HIGH_RISK':
          return {
            icon: <ShieldAlert className="h-6 w-6" />,
            title: '🔴 HIGH RISK',
            description: 'This message has several characteristics of a known scam.',
            className: 'border-destructive bg-destructive/5',
            titleClassName: 'text-destructive',
            descriptionClassName: 'text-destructive/80',
            bgClassName: 'bg-destructive text-destructive-foreground'
          }
        case 'MEDIUM_RISK':
          return {
            icon: <ShieldAlert className="h-6 w-6" />,
            title: '🟡 MEDIUM RISK',
            description: 'This message contains some suspicious elements that warrant caution.',
            className: 'border-orange-500 bg-orange-50',
            titleClassName: 'text-orange-600',
            descriptionClassName: 'text-orange-600/80',
            bgClassName: 'bg-orange-500 text-white'
          }
        case 'LOOKS_SAFE':
        default:
          return {
            icon: <Shield className="h-6 w-6" />,
            title: '🟢 LOOKS SAFE',
            description: 'This message appears to be legitimate with no major red flags detected.',
            className: 'border-green-500 bg-green-50',
            titleClassName: 'text-green-600',
            descriptionClassName: 'text-green-600/80',
            bgClassName: 'bg-green-500 text-white'
          }
      }
    }

    const riskDisplay = getRiskLevelDisplay(analysisResult.riskLevel)

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-serif text-primary">ScamShield Analyzer</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Results Summary Card */}
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

          {/* Analyzed Text */}
          {analysisResult.analyzedText && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Analyzed Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{analysisResult.analyzedText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis Information */}
          {(analysisResult.gemini_confidence !== undefined || analysisResult.analysis_method) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  🤖 AI Analysis Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.analysis_method && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="font-medium">Analysis Method:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        analysisResult.analysis_method === 'AI_ENHANCED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {analysisResult.analysis_method === 'AI_ENHANCED' ? '🧠 AI Enhanced' : '📝 Pattern Based'}
                      </span>
                    </div>
                  )}
                  {analysisResult.gemini_confidence !== undefined && analysisResult.gemini_confidence > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="font-medium">AI Confidence:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                            style={{ width: `${(analysisResult.gemini_confidence * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-mono">
                          {(analysisResult.gemini_confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Breakdown of Red Flags */}
          {analysisResult.redFlags.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Breakdown of Red Flags</CardTitle>
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

          {/* Recommended Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Recommended Actions</CardTitle>
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

          {/* Final CTA */}
          <div className="text-center">
            <Button onClick={resetToInput} variant="outline" size="lg" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Analyze Another Message
            </Button>
          </div>
        </main>

        {/* Footer */}
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
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-serif text-primary">ScamShield Analyzer</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
            Think you've received a scam?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paste the message or upload a screenshot. We'll check it for common signs of fraud in seconds.
          </p>
        </div>

        {/* Input Component */}
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
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

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={handleAnalyze}
            disabled={(!inputText.trim() && !uploadedFile) || isAnalyzing}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Message"}
          </Button>
        </div>
      </main>

      {/* Footer */}
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
  )
}
