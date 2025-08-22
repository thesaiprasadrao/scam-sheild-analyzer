"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, ShieldAlert, Upload, FileText, Clock, Phone, HelpCircle, CheckCircle, ArrowLeft } from "lucide-react"

export default function ScamShieldAnalyzer() {
  const [currentScreen, setCurrentScreen] = useState<"input" | "results">("input")
  const [inputText, setInputText] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("text")

  const handleAnalyze = () => {
    if (inputText.trim() || uploadedFile) {
      setCurrentScreen("results")
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
  }

  if (currentScreen === "results") {
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
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive text-destructive-foreground">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-destructive text-xl">🔴 HIGH RISK</CardTitle>
                  <CardDescription className="text-destructive/80 text-base">
                    This message has several characteristics of a known scam.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Breakdown of Red Flags */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Breakdown of Red Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Urgency & Fear Tactic</h3>
                  <p className="text-muted-foreground">The message creates panic by threatening immediate action.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Phone className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Suspicious Contact Method</h3>
                  <p className="text-muted-foreground">
                    It asks you to call a personal mobile number, not an official helpline.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <HelpCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Vague Details</h3>
                  <p className="text-muted-foreground">
                    Lacks specific information like an account number, which a real company would provide.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Recommended Actions</CardTitle>
              <CardDescription>What you should do now:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Do NOT click any links or call the number.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Do NOT share any personal information.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Block this sender immediately.</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span>Delete this message.</span>
                </div>
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
            disabled={!inputText.trim() && !uploadedFile}
            size="lg"
            className="px-8 py-3 text-lg"
          >
            Analyze Message
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
