"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
      <div className="min-h-screen bg-background flex flex-col">
        <SharedHeader />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-foreground">Live Scam News</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-13">
              Real-time alerts and security warnings — stay one step ahead.
            </p>
          </div>

          {/* Trending Alert */}
          <div className="flex items-start gap-3 mb-8 p-4 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <TrendingUp className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-0.5">Trending this month</p>
              <p className="text-sm text-orange-700 dark:text-orange-400">AI voice cloning scams up 300% — be cautious of unexpected calls from "family members" asking for money.</p>
            </div>
          </div>

          {/* News Feed */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching latest alerts...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                <span className="text-sm text-destructive">{error}</span>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">No news articles found.</div>
            ) : (
              news.map((item, index) => {
                const severity = inferSeverity(item.title, item.description ?? "")
                const accentColor = severity === "High" ? "bg-red-500" : severity === "Medium" ? "bg-orange-400" : "bg-green-500"
                const badgeClass = getSeverityColor(severity)
                return (
                  <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-0 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden bg-card block"
                  >
                    {/* Left severity accent bar */}
                    <div className={`w-1 flex-shrink-0 ${accentColor}`} />
                    <div className="flex-1 p-4">
                      {/* Top row: badge + source + time */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs px-2 py-0 ${badgeClass}`}>
                          {severity}
                        </Badge>
                        {item.category?.slice(0, 2).map((cat, i) => (
                          <Badge key={i} variant="secondary" className="text-xs px-2 py-0">{cat}</Badge>
                        ))}
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.pubDate)}
                        </span>
                      </div>
                      {/* Title */}
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5 flex items-start gap-1.5">
                        {item.title}
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>
                      {/* Source */}
                      <p className="text-xs text-muted-foreground/70 mt-2">{item.source_id}</p>
                    </div>
                  </a>
                )
              })
            )}
          </div>
        </main>

        <footer className="border-t bg-card mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">About Us</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              </div>
              <p>© {new Date().getFullYear()} ScamShield</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedPageWrapper>
  )
}
