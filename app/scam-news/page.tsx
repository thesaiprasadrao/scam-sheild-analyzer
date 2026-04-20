"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Newspaper, ExternalLink, Clock, TrendingUp, Loader2, BarChart2 } from "lucide-react"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"
import ProtectedPageWrapper from "@/components/protected-page-wrapper"
import ProfileDropdown from "@/components/profile-dropdown"

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source_id: string;
  category?: string[];
  content?: string;
}

export default function ScamNewsPage() {
  const router = useRouter()
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/news')
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }
        const data = await response.json()
        if (data.results) {
          setNews(data.results)
        } else {
          setError('No news found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    
    if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} days ago`
    }
  }

  // Backup static news data
  const newsItems = [
    {
      id: 1,
      title: "New AI-Generated Voice Cloning Scams Target Elderly",
      description: "Scammers are using advanced AI to clone voices of family members, calling elderly victims pretending to be in emergency situations.",
      category: "Technology",
      severity: "High",
      timeAgo: "2 hours ago",
      source: "Cybersecurity Weekly"
    },
    {
      id: 2,
      title: "Romance Scam Losses Reach Record High in 2025",
      description: "Federal Trade Commission reports $1.3 billion in losses from romance scams this year, with social media platforms being primary hunting grounds.",
      category: "Romance",
      severity: "Medium",
      timeAgo: "5 hours ago",
      source: "FTC Report"
    },
    {
      id: 3,
      title: "Fake Cryptocurrency Investment Apps Removed from App Stores",
      description: "Over 200 fraudulent crypto investment applications have been removed after stealing millions from unsuspecting investors.",
      category: "Investment",
      severity: "High",
      timeAgo: "1 day ago",
      source: "Tech Security News"
    },
    {
      id: 4,
      title: "IRS Warning: Tax Season Phishing Emails on the Rise",
      description: "The Internal Revenue Service warns taxpayers about sophisticated phishing emails mimicking official tax documents and refund notifications.",
      category: "Tax",
      severity: "Medium",
      timeAgo: "2 days ago",
      source: "IRS Official"
    },
    {
      id: 5,
      title: "University Students Targeted by Fake Scholarship Scams",
      description: "Fraudsters are creating convincing fake scholarship websites to collect personal information and application fees from desperate students.",
      category: "Education",
      severity: "Medium",
      timeAgo: "3 days ago",
      source: "Education Today"
    }
  ]

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
            <Link href="/scam-news" className="flex items-center gap-1.5 text-sm text-foreground font-medium">
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

  const inferSeverity = (title: string, description: string): string => {
    const text = (title + " " + description).toLowerCase()
    if (text.match(/urgent|critical|warning|alert|steal|fraud|millions|billion|hack|breach|attack/)) return "High"
    if (text.match(/caution|suspicious|scam|phishing|fake|risk/)) return "Medium"
    return "Low"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

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

        <main className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Newspaper className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
              Live Scam News Feed
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest scam alerts, trends, and security warnings from around the world.
            </p>
          </div>

          {/* Trending Alert */}
          <Card className="mb-8 border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <TrendingUp className="h-5 w-5" />
                Trending Alert
              </CardTitle>
              <CardDescription className="text-orange-700">
                AI voice cloning scams are increasing by 300% this month. Be extra cautious of unexpected calls from "family members" asking for money.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* News Feed */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-serif mb-6">Latest Scam Alerts</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card className="p-4">
                <CardContent className="text-center text-red-500">{error}</CardContent>
              </Card>
            ) : (
              <>
                {news.map((item, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getSeverityColor(inferSeverity(item.title, item.description ?? ""))}>
                              {inferSeverity(item.title, item.description ?? "")}
                            </Badge>
                            {item.category?.map((cat, i) => (
                              <Badge key={i} variant="secondary">{cat}</Badge>
                            ))}
                          </div>
                          <CardTitle className="text-xl hover:text-primary cursor-pointer transition-colors">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              {item.title}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(item.pubDate)}
                            </div>
                            <span>•</span>
                            <span>{item.source_id}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
                {news.length === 0 && !error && (
                  <Card className="p-4">
                    <CardContent className="text-center text-muted-foreground">
                      No news articles found
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Info Card */}
          <Card className="mt-12 bg-blue-50/50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Stay Informed</CardTitle>
              <CardDescription className="text-blue-700">
                This news feed is updated regularly with the latest scam trends and security alerts. 
                Knowledge is your best defense against fraud.
              </CardDescription>
            </CardHeader>
          </Card>
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
