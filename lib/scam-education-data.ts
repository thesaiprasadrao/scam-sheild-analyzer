import type { UserProfileType } from "@/lib/auth"

export interface ScamScenario {
  id: string
  title: string
  exampleMessage: string
  tip: string
  category: string
}

export const scamEducationData: Record<UserProfileType, ScamScenario[]> = {
  'student': [
    {
      id: 'student-1',
      title: 'Fake Internship Offers',
      exampleMessage: '"Congratulations! You have been selected for our premium internship program. Please pay ₹2,500 as a registration fee to confirm your position. Limited slots available!"',
      tip: 'Legitimate companies never ask for upfront payment for internships or jobs. Always verify through official company channels.',
      category: 'Job/Education Scams'
    },
    {
      id: 'student-2',
      title: 'Scholarship Scams',
      exampleMessage: '"You are eligible for a ₹50,000 education scholarship! Send ₹500 processing fee to claim your scholarship. Deadline: 24 hours."',
      tip: 'Real scholarships never require processing fees. Check with your institution or official scholarship portals.',
      category: 'Education Scams'
    },
    {
      id: 'student-3',
      title: 'Fake Course Certifications',
      exampleMessage: '"Get certified in just 1 week! Pay ₹999 now for internationally recognized certification. No exams required!"',
      tip: 'Be wary of "too good to be true" certification offers. Always verify the credibility of the certifying body.',
      category: 'Education Scams'
    },
    {
      id: 'student-4',
      title: 'Student Loan Frauds',
      exampleMessage: '"Instant education loan approval! No documents needed. Just share your Aadhaar and bank details. Get ₹5 lakhs today!"',
      tip: 'Legitimate financial institutions always require proper documentation and verification. Never share sensitive details via messages.',
      category: 'Financial Scams'
    }
  ],
  'working-professional': [
    {
      id: 'professional-1',
      title: 'CEO Fraud Emails',
      exampleMessage: '"This is urgent. I need you to transfer ₹50,000 immediately for a confidential project. I\'ll reimburse you tomorrow. - Your CEO"',
      tip: 'Always verify unusual requests through official channels, even if they appear to come from senior management.',
      category: 'Workplace Scams'
    },
    {
      id: 'professional-2',
      title: 'Fake IT Support',
      exampleMessage: '"Your computer is infected! Call this number immediately: 1234567890. Microsoft Security Team"',
      tip: 'Microsoft or legitimate IT companies never call unsolicited. Use official support channels only.',
      category: 'Tech Support Scams'
    },
    {
      id: 'professional-3',
      title: 'Investment Opportunities',
      exampleMessage: '"Double your salary in 30 days! Join our exclusive trading group. Minimum investment: ₹10,000. Guaranteed returns!"',
      tip: 'No investment guarantees 100% returns. Always research and consult financial advisors before investing.',
      category: 'Investment Scams'
    },
    {
      id: 'professional-4',
      title: 'Fake Job Offers',
      exampleMessage: '"Congratulations! You\'re selected for a ₹8 LPA remote job. Pay ₹5,000 for laptop and training. Start immediately!"',
      tip: 'Legitimate employers provide equipment and training for free. Never pay for job opportunities.',
      category: 'Job Scams'
    }
  ],
  'homemaker': [
    {
      id: 'homemaker-1',
      title: 'Work-from-Home Scams',
      exampleMessage: '"Earn ₹30,000/month from home! Data entry job. Just pay ₹1,000 registration fee. No experience needed!"',
      tip: 'Legitimate work-from-home opportunities never require upfront payments. Research the company thoroughly.',
      category: 'Job Scams'
    },
    {
      id: 'homemaker-2',
      title: 'Online Shopping Frauds',
      exampleMessage: '"Flash Sale! Designer sarees at 90% off! Limited time: 2 hours. Pay now via this link: bit.ly/fake-sale"',
      tip: 'Be cautious of deals that seem too good to be true. Always shop from verified websites and check reviews.',
      category: 'Shopping Scams'
    },
    {
      id: 'homemaker-3',
      title: 'MLM/Pyramid Schemes',
      exampleMessage: '"Join our network and earn lakhs! Sell beauty products to friends. Initial investment: ₹15,000. Guaranteed success!"',
      tip: 'Be wary of schemes requiring upfront investment and recruiting others. Research the company\'s track record.',
      category: 'Business Scams'
    },
    {
      id: 'homemaker-4',
      title: 'Fake Prize Winnings',
      exampleMessage: '"Congratulations! You\'ve won ₹5 lakhs in our lottery! Pay ₹2,000 tax to claim your prize immediately!"',
      tip: 'You cannot win a lottery you never entered. Legitimate prizes never require upfront tax payments.',
      category: 'Prize Scams'
    }
  ],
  'senior-citizen': [
    {
      id: 'senior-1',
      title: 'Health Insurance Scams',
      exampleMessage: '"Your health insurance is expiring! Pay ₹5,000 immediately to avoid penalty. Call: 1234567890"',
      tip: 'Contact your insurance company directly using official numbers. Never share policy details over phone or messages.',
      category: 'Insurance Scams'
    },
    {
      id: 'senior-2',
      title: 'Bank Account Frauds',
      exampleMessage: '"Your account will be blocked in 24 hours! Update KYC immediately. Click: fake-bank-link.com"',
      tip: 'Banks never ask for personal details via messages or calls. Visit your branch or use official banking apps only.',
      category: 'Banking Scams'
    },
    {
      id: 'senior-3',
      title: 'Medication Scams',
      exampleMessage: '"Miracle cure for diabetes! 100% natural, doctor recommended. Order now: ₹999. Limited stock!"',
      tip: 'Consult your doctor before trying any new medications. Avoid products claiming miraculous cures.',
      category: 'Health Scams'
    },
    {
      id: 'senior-4',
      title: 'Government Benefit Frauds',
      exampleMessage: '"You\'re eligible for ₹25,000 senior citizen allowance! Provide Aadhaar number to claim within 48 hours."',
      tip: 'Government benefits are processed through official channels only. Never share personal documents via messages.',
      category: 'Government Scams'
    }
  ],
  'new-to-internet': [
    {
      id: 'newbie-1',
      title: 'Fake App Downloads',
      exampleMessage: '"Download WhatsApp Gold for exclusive features! Click here: whatsapp-gold-download.com"',
      tip: 'Only download apps from official app stores (Google Play Store, Apple App Store). Fake apps can steal your data.',
      category: 'App Scams'
    },
    {
      id: 'newbie-2',
      title: 'Social Media Impersonation',
      exampleMessage: '"Hello, this is your nephew Raj. I\'m in trouble and need ₹10,000 urgently. Please send money to this account."',
      tip: 'Always verify the identity of people asking for money, even if they claim to be family. Call them directly.',
      category: 'Impersonation Scams'
    },
    {
      id: 'newbie-3',
      title: 'WiFi Password Scams',
      exampleMessage: '"Get free WiFi password for your area! Just share your mobile number and OTP. High-speed internet!"',
      tip: 'Never share OTPs with anyone. Use legitimate internet service providers for WiFi connections.',
      category: 'WiFi Scams'
    },
    {
      id: 'newbie-4',
      title: 'Email Verification Frauds',
      exampleMessage: '"Verify your email to continue using Gmail. Click here and enter your password: gmail-verify.fake.com"',
      tip: 'Gmail and other legitimate services never ask for passwords via email. Always check the sender\'s address carefully.',
      category: 'Email Scams'
    }
  ]
}

export function getScenariosByPersona(persona: UserProfileType): ScamScenario[] {
  return scamEducationData[persona] || scamEducationData['student']
}

export function getRandomScenariosForPersona(persona: UserProfileType, count: number = 2): ScamScenario[] {
  const scenarios = getScenariosByPersona(persona)
  const shuffled = [...scenarios].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
