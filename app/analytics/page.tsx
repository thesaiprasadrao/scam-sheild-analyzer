"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts"
import { Shield, BarChart2, TrendingUp, AlertTriangle, CheckCircle, Newspaper } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ThemeToggle from "@/components/theme-toggle"
import ProfileDropdown from "@/components/profile-dropdown"
import ProtectedPageWrapper from "@/components/protected-page-wrapper"
import ScrollToTop from "@/components/scroll-to-top"
import {
  seedDemoData,
  getUserEntries,
  buildMonthlyStats,
  type MonthlyStats,
  type ScamType,
} from "@/lib/analytics"

const SCAM_COLORS: Record<string, string> = {
  "Phishing": "#ef4444",
  "Job Scam": "#f97316",
  "Financial Fraud": "#eab308",
  "Lottery/Prize": "#84cc16",
  "Impersonation": "#06b6d4",
  "Investment Scam": "#8b5cf6",
  "Romance Scam": "#ec4899",
  "Tech Support Scam": "#14b8a6",
  "Safe/Legitimate": "#22c55e",
  "Other": "#94a3b8",
}

const RISK_COLORS = {
  highRisk: "#ef4444",
  mediumRisk: "#f97316",
  safe: "#22c55e",
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<MonthlyStats[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("all")

  useEffect(() => {
    if (!session?.user?.email) return
    seedDemoData(session.user.email)
    const entries = getUserEntries(session.user.email)
    setStats(buildMonthlyStats(entries))
  }, [session?.user?.email])

  const years = useMemo(() => {
    const ys = new Set(stats.map((s) => s.month.slice(0, 4)))
    return ["all", ...Array.from(ys).sort()]
  }, [stats])

  const filteredStats = useMemo(() => {
    if (selectedYear === "all") return stats
    return stats.filter((s) => s.month.startsWith(selectedYear))
  }, [stats, selectedYear])

  const totalScans = filteredStats.reduce((s, m) => s + m.total, 0)
  const totalHigh = filteredStats.reduce((s, m) => s + m.highRisk, 0)
  const totalSafe = filteredStats.reduce((s, m) => s + m.safe, 0)

  // Aggregate scam type counts across filtered months
  const scamTypeTotals = useMemo(() => {
    const agg: Record<string, number> = {}
    for (const m of filteredStats) {
      for (const [type, count] of Object.entries(m.byType)) {
        agg[type] = (agg[type] || 0) + count
      }
    }
    return Object.entries(agg)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }, [filteredStats])

  const boomingScam = scamTypeTotals[0]?.name ?? "—"

  // Bar chart data: risk breakdown per month
  const barData = filteredStats.map((m) => ({
    name: m.label,
    "High Risk": m.highRisk,
    "Medium Risk": m.mediumRisk,
    "Safe": m.safe,
  }))

  // Line chart data: total scans trend
  const lineData = filteredStats.map((m) => ({
    name: m.label,
    "Total Scans": m.total,
  }))

  return (
    <ProtectedPageWrapper requireAuth={true} redirectTo="/auth/signin">
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="w-full px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => router.push("/dashboard")}
              >
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold font-serif text-primary">ScamShield</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/analytics" className="flex items-center gap-1.5 text-sm text-foreground font-medium">
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

        <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-serif text-foreground mb-1">Monthly Analytics</h2>
            <p className="text-muted-foreground">Your scam analysis history and trends over time</p>
          </div>

          {/* Year filter */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedYear === y
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {y === "all" ? "All Time" : y}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalScans}</p>
                    <p className="text-xs text-muted-foreground">Total Scans</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalHigh}</p>
                    <p className="text-xs text-muted-foreground">High Risk Detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalSafe}</p>
                    <p className="text-xs text-muted-foreground">Marked Safe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">{boomingScam}</p>
                    <p className="text-xs text-muted-foreground">Booming Scam</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="types">Scam Types</TabsTrigger>
              <TabsTrigger value="trend">Trend</TabsTrigger>
            </TabsList>

            {/* Overview tab — risk breakdown bar chart */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Breakdown by Month</CardTitle>
                  <CardDescription>High, medium, and safe analysis results each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="High Risk" fill={RISK_COLORS.highRisk} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Medium Risk" fill={RISK_COLORS.mediumRisk} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Safe" fill={RISK_COLORS.safe} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly top scam table */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Monthly Snapshot</CardTitle>
                  <CardDescription>Total scans and dominant scam type per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left pb-2 pr-4 font-medium">Month</th>
                          <th className="text-center pb-2 px-4 font-medium">Total</th>
                          <th className="text-center pb-2 px-4 font-medium">High Risk</th>
                          <th className="text-center pb-2 px-4 font-medium">Safe</th>
                          <th className="text-left pb-2 pl-4 font-medium">Top Scam</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStats.map((m) => (
                          <tr key={m.month} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-medium">{m.label}</td>
                            <td className="py-2 px-4 text-center">{m.total}</td>
                            <td className="py-2 px-4 text-center text-destructive font-medium">{m.highRisk}</td>
                            <td className="py-2 px-4 text-center text-green-600 font-medium">{m.safe}</td>
                            <td className="py-2 pl-4">
                              <Badge
                                variant="outline"
                                style={{ borderColor: SCAM_COLORS[m.topScam] ?? "#94a3b8", color: SCAM_COLORS[m.topScam] ?? "#94a3b8" }}
                              >
                                {m.topScam}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scam Types tab — pie chart */}
            <TabsContent value="types">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Scam Type Distribution</CardTitle>
                    <CardDescription>Which scam types were most common</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={scamTypeTotals}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {scamTypeTotals.map((entry) => (
                            <Cell key={entry.name} fill={SCAM_COLORS[entry.name] ?? "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v} scans`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scam Type Ranking</CardTitle>
                    <CardDescription>Sorted by frequency</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scamTypeTotals.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-5 text-right">{i + 1}.</span>
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: SCAM_COLORS[item.name] ?? "#94a3b8" }}
                          />
                          <span className="flex-1 text-sm">{item.name}</span>
                          <span className="text-sm font-semibold">{item.value}</span>
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(item.value / (scamTypeTotals[0]?.value || 1)) * 100}%`,
                                background: SCAM_COLORS[item.name] ?? "#94a3b8",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trend tab — line chart */}
            <TabsContent value="trend">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Volume Over Time</CardTitle>
                  <CardDescription>How many messages you analyzed each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={lineData} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Total Scans"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="border-t bg-card mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">About Us</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              </div>
              <p>ScamShield Analytics</p>
            </div>
          </div>
        </footer>
      </div>
      <ScrollToTop />
    </ProtectedPageWrapper>
  )
}
