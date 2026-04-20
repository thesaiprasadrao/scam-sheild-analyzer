export type ScamType =
  | "Phishing"
  | "Job Scam"
  | "Financial Fraud"
  | "Lottery/Prize"
  | "Impersonation"
  | "Investment Scam"
  | "Romance Scam"
  | "Tech Support Scam"
  | "Safe/Legitimate"
  | "Other"

export interface AnalyticsEntry {
  id: string
  userId: string
  timestamp: string // ISO
  month: string // "YYYY-MM"
  riskLevel: "HIGH_RISK" | "MEDIUM_RISK" | "LOOKS_SAFE"
  scamType: ScamType
  redFlags: string[]
}

const STORAGE_KEY = "scamshield_analytics"

function getEntries(): AnalyticsEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEntries(entries: AnalyticsEntry[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function logAnalysis(
  userId: string,
  riskLevel: "HIGH_RISK" | "MEDIUM_RISK" | "LOOKS_SAFE",
  redFlags: string[]
): void {
  const entries = getEntries()
  const now = new Date()
  const entry: AnalyticsEntry = {
    id: crypto.randomUUID(),
    userId,
    timestamp: now.toISOString(),
    month: now.toISOString().slice(0, 7),
    riskLevel,
    scamType: inferScamType(riskLevel, redFlags),
    redFlags,
  }
  entries.push(entry)
  saveEntries(entries)
}

function inferScamType(
  riskLevel: "HIGH_RISK" | "MEDIUM_RISK" | "LOOKS_SAFE",
  redFlags: string[]
): ScamType {
  if (riskLevel === "LOOKS_SAFE") return "Safe/Legitimate"
  const flags = redFlags.join(" ").toLowerCase()
  if (flags.includes("job") || flags.includes("earn") || flags.includes("income")) return "Job Scam"
  if (flags.includes("lottery") || flags.includes("prize") || flags.includes("won")) return "Lottery/Prize"
  if (flags.includes("financial") || flags.includes("payment") || flags.includes("fee")) return "Financial Fraud"
  if (flags.includes("otp") || flags.includes("password") || flags.includes("information")) return "Phishing"
  if (flags.includes("impersonat") || flags.includes("official")) return "Impersonation"
  if (flags.includes("invest") || flags.includes("crypto") || flags.includes("return")) return "Investment Scam"
  if (flags.includes("romance") || flags.includes("love") || flags.includes("relationship")) return "Romance Scam"
  if (flags.includes("tech") || flags.includes("virus") || flags.includes("computer")) return "Tech Support Scam"
  return "Other"
}

export function getUserEntries(userId: string): AnalyticsEntry[] {
  return getEntries().filter((e) => e.userId === userId)
}

export function getAllEntries(): AnalyticsEntry[] {
  return getEntries()
}

// Seed demo data for Jan 2025 – Apr 20 2026 if none exists
export function seedDemoData(userId: string): void {
  const existing = getEntries()
  if (existing.some((e) => e.userId === userId)) return

  const scamTypes: ScamType[] = [
    "Phishing",
    "Job Scam",
    "Financial Fraud",
    "Lottery/Prize",
    "Impersonation",
    "Investment Scam",
    "Romance Scam",
    "Tech Support Scam",
    "Safe/Legitimate",
    "Other",
  ]
  const riskLevels: Array<"HIGH_RISK" | "MEDIUM_RISK" | "LOOKS_SAFE"> = [
    "HIGH_RISK",
    "MEDIUM_RISK",
    "LOOKS_SAFE",
  ]

  // Monthly data volumes + scam type distribution per month
  const monthlyConfig: Record<string, { count: number; dominant: ScamType[] }> = {
    "2025-01": { count: 8,  dominant: ["Phishing", "Financial Fraud"] },
    "2025-02": { count: 11, dominant: ["Phishing", "Job Scam"] },
    "2025-03": { count: 14, dominant: ["Job Scam", "Financial Fraud"] },
    "2025-04": { count: 9,  dominant: ["Lottery/Prize", "Phishing"] },
    "2025-05": { count: 16, dominant: ["Investment Scam", "Phishing"] },
    "2025-06": { count: 13, dominant: ["Romance Scam", "Phishing"] },
    "2025-07": { count: 18, dominant: ["Job Scam", "Financial Fraud"] },
    "2025-08": { count: 22, dominant: ["Phishing", "Investment Scam"] },
    "2025-09": { count: 19, dominant: ["Tech Support Scam", "Impersonation"] },
    "2025-10": { count: 25, dominant: ["Financial Fraud", "Phishing"] },
    "2025-11": { count: 28, dominant: ["Phishing", "Lottery/Prize"] }, // festive season spike
    "2025-12": { count: 31, dominant: ["Lottery/Prize", "Financial Fraud"] }, // holiday scams
    "2026-01": { count: 20, dominant: ["Job Scam", "Phishing"] },
    "2026-02": { count: 17, dominant: ["Romance Scam", "Financial Fraud"] },
    "2026-03": { count: 23, dominant: ["Investment Scam", "Phishing"] },
    "2026-04": { count: 12, dominant: ["Phishing", "Financial Fraud"] }, // partial month
  }

  const seed: AnalyticsEntry[] = []

  for (const [month, cfg] of Object.entries(monthlyConfig)) {
    const [year, mon] = month.split("-").map(Number)
    const daysInMonth = month === "2026-04" ? 20 : new Date(year, mon, 0).getDate()

    for (let i = 0; i < cfg.count; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1
      const hour = Math.floor(Math.random() * 14) + 8
      const date = new Date(year, mon - 1, day, hour, Math.floor(Math.random() * 60))

      // 60% chance to be a dominant scam type for that month
      const isDominant = Math.random() < 0.6
      const scamType: ScamType = isDominant
        ? cfg.dominant[Math.floor(Math.random() * cfg.dominant.length)]
        : scamTypes[Math.floor(Math.random() * scamTypes.length)]

      const riskLevel =
        scamType === "Safe/Legitimate"
          ? "LOOKS_SAFE"
          : riskLevels[Math.floor(Math.random() * riskLevels.length)]

      seed.push({
        id: crypto.randomUUID(),
        userId,
        timestamp: date.toISOString(),
        month,
        riskLevel,
        scamType,
        redFlags: [],
      })
    }
  }

  const all = [...existing, ...seed]
  saveEntries(all)
}

export interface MonthlyStats {
  month: string       // "YYYY-MM"
  label: string       // "Jan 2025"
  total: number
  highRisk: number
  mediumRisk: number
  safe: number
  byType: Record<ScamType, number>
  topScam: ScamType
}

export function buildMonthlyStats(entries: AnalyticsEntry[]): MonthlyStats[] {
  const byMonth: Record<string, AnalyticsEntry[]> = {}
  for (const e of entries) {
    if (!byMonth[e.month]) byMonth[e.month] = []
    byMonth[e.month].push(e)
  }

  const monthLabels: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
  }

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, mes]) => {
      const [year, mon] = month.split("-")
      const byType = {} as Record<ScamType, number>
      for (const e of mes) {
        byType[e.scamType] = (byType[e.scamType] || 0) + 1
      }
      const topScam = (Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "Other") as ScamType
      return {
        month,
        label: `${monthLabels[mon]} ${year}`,
        total: mes.length,
        highRisk: mes.filter((e) => e.riskLevel === "HIGH_RISK").length,
        mediumRisk: mes.filter((e) => e.riskLevel === "MEDIUM_RISK").length,
        safe: mes.filter((e) => e.riskLevel === "LOOKS_SAFE").length,
        byType,
        topScam,
      }
    })
}
