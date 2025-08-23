import type { UserProfileType } from "../components/user-profile-provider"

export interface ThreatAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  targetProfiles: UserProfileType[]
  isActive: boolean
  createdAt: string
}

// Predefined threat alerts based on user profiles
export const personalizedAlerts: ThreatAlert[] = [
  // Student-specific alerts
  {
    id: "student-1",
    title: "Fake Internship Opportunity Alert",
    description: "Be cautious of internship offers requiring upfront payment or personal banking details. Legitimate companies never ask for money.",
    severity: "high",
    category: "Employment Fraud",
    targetProfiles: ["student"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "student-2",
    title: "Part-time Job Scam Warning",
    description: "Avoid 'work from home' jobs promising easy money for simple tasks. Verify company credentials before sharing personal information.",
    severity: "medium",
    category: "Employment Fraud",
    targetProfiles: ["student"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "student-3",
    title: "Scholarship Scam Alert",
    description: "Legitimate scholarships don't require application fees. Be wary of 'guaranteed' scholarships asking for processing fees.",
    severity: "high",
    category: "Education Fraud",
    targetProfiles: ["student"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Working Professional alerts
  {
    id: "professional-1",
    title: "Business Email Compromise",
    description: "Verify any urgent payment requests via phone. Scammers often impersonate executives requesting immediate wire transfers.",
    severity: "critical",
    category: "Business Fraud",
    targetProfiles: ["working-professional"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "professional-2",
    title: "Investment Fraud Warning",
    description: "Be cautious of 'guaranteed returns' and high-yield investment schemes. Always verify investment opportunities through official channels.",
    severity: "high",
    category: "Financial Fraud",
    targetProfiles: ["working-professional"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Homemaker alerts
  {
    id: "homemaker-1",
    title: "Fake Shopping Website Alert",
    description: "Before shopping online, verify website authenticity. Check for secure payment methods and read reviews from multiple sources.",
    severity: "medium",
    category: "E-commerce Fraud",
    targetProfiles: ["homemaker"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "homemaker-2",
    title: "Delivery Notification Scam",
    description: "Don't click links in unexpected delivery notifications. Always verify through the official courier website or app.",
    severity: "high",
    category: "Phishing",
    targetProfiles: ["homemaker"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "homemaker-3",
    title: "OLX Marketplace Fraud",
    description: "When buying/selling online, meet in safe public places. Never share bank details or make advance payments to strangers.",
    severity: "medium",
    category: "Marketplace Fraud",
    targetProfiles: ["homemaker"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Senior Citizen alerts
  {
    id: "senior-1",
    title: "Pension KYC Fraud Warning",
    description: "Government agencies will never ask for KYC updates via phone or SMS. Always visit official offices for pension-related work.",
    severity: "critical",
    category: "Government Fraud",
    targetProfiles: ["senior-citizen"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "senior-2",
    title: "Electricity Bill Scam Alert",
    description: "Verify any urgent disconnection notices by calling the official customer service number. Scammers create fake urgency.",
    severity: "high",
    category: "Utility Fraud",
    targetProfiles: ["senior-citizen"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "senior-3",
    title: "SIM Card Blocking Threat",
    description: "Telecom companies don't ask for OTP or personal details via call. Your SIM won't be blocked without proper notice.",
    severity: "critical",
    category: "Telecom Fraud",
    targetProfiles: ["senior-citizen"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "senior-4",
    title: "Healthcare Fraud Protection",
    description: "Be cautious of unsolicited health insurance calls or medical schemes requiring immediate payment. Verify through official channels.",
    severity: "high",
    category: "Healthcare Fraud",
    targetProfiles: ["senior-citizen"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // New to Internet alerts
  {
    id: "newbie-1",
    title: "Basic Online Safety Tips",
    description: "Never share passwords, OTPs, or bank details online or over phone. Legitimate companies will never ask for these via calls.",
    severity: "critical",
    category: "Basic Security",
    targetProfiles: ["new-to-internet"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "newbie-2",
    title: "Recognizing Phishing Messages",
    description: "Be cautious of urgent messages asking for immediate action. When in doubt, ask a tech-savvy family member or friend.",
    severity: "high",
    category: "Education",
    targetProfiles: ["new-to-internet"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "newbie-3",
    title: "Safe Online Shopping Guide",
    description: "Only shop on websites that start with 'https://' and have good reviews. Never save card details on unknown websites.",
    severity: "medium",
    category: "E-commerce Safety",
    targetProfiles: ["new-to-internet"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },

  // Universal alerts for all profiles
  {
    id: "universal-1",
    title: "WhatsApp OTP Scam",
    description: "Never share WhatsApp verification codes with anyone. Scammers use these to hijack your account.",
    severity: "critical",
    category: "Social Media Fraud",
    targetProfiles: ["student", "working-professional", "homemaker", "senior-citizen", "new-to-internet"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "universal-2",
    title: "UPI Payment Fraud",
    description: "Only enter UPI PIN for payments you initiate. Never share UPI PIN with anyone claiming to send you money.",
    severity: "critical",
    category: "Payment Fraud",
    targetProfiles: ["student", "working-professional", "homemaker", "senior-citizen", "new-to-internet"],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

export function getPersonalizedAlerts(profileType?: UserProfileType): ThreatAlert[] {
  if (!profileType) {
    return personalizedAlerts.filter(alert => alert.targetProfiles.length === 5) // Universal alerts
  }

  return personalizedAlerts
    .filter(alert => alert.isActive && alert.targetProfiles.includes(profileType))
    .sort((a, b) => {
      // Sort by severity (critical > high > medium > low)
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
}

export function getThreatAlertsByCategory(profileType?: UserProfileType): Record<string, ThreatAlert[]> {
  const alerts = getPersonalizedAlerts(profileType)
  const grouped: Record<string, ThreatAlert[]> = {}
  
  alerts.forEach(alert => {
    if (!grouped[alert.category]) {
      grouped[alert.category] = []
    }
    grouped[alert.category].push(alert)
  })
  
  return grouped
}
