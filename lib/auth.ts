import type { NextAuthOptions, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"

// User profile types
export type UserProfileType = 'student' | 'working-professional' | 'homemaker' | 'senior-citizen' | 'new-to-internet'

// User interface with profile data
export interface UserData {
  id: string
  name?: string
  email: string
  passwordHash?: string
  image?: string
  profileType?: UserProfileType
  profileCompleted?: boolean
  preferences?: {
    fontSize?: 'small' | 'medium' | 'large'
    simplifiedUI?: boolean
    voiceEnabled?: boolean
  }
  createdAt?: string
}

// Simple JSON user store for demo/dev only. Replace with a DB in production.
const dataDir = join(process.cwd(), ".data")
const usersFile = join(dataDir, "users.json")

function loadUsers(): Array<UserData> {
  try {
    if (!existsSync(dataDir)) mkdirSync(dataDir)
    if (!existsSync(usersFile)) {
      writeFileSync(usersFile, JSON.stringify([], null, 2))
      return []
    }
    const buf = readFileSync(usersFile, "utf8")
    return JSON.parse(buf)
  } catch {
    return []
  }
}

function saveUsers(users: any[]) {
  if (!existsSync(dataDir)) mkdirSync(dataDir)
  writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

// naive hash for demo; replace with bcrypt/argon2 in real apps
function hash(str: string) {
  // Very weak hash placeholder: DO NOT USE IN PROD
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return "h" + (h >>> 0).toString(16)
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Temporarily disabled until Google OAuth is properly configured
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
        const parsed = schema.safeParse(credentials)
        if (!parsed.success) return null
        const { email, password } = parsed.data
        const users = loadUsers()
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (user && user.passwordHash === hash(password)) {
          const result: User = { id: user.id, name: user.name || user.email, email: user.email, image: user.image }
          return result
        }
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    // Session expires after 30 days of inactivity
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Update session token every 4 hours
    updateAge: 4 * 60 * 60, // 4 hours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile && (profile as any).email) {
        const email = (profile as any).email as string
        const users = loadUsers()
        let existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (!existing) {
          existing = {
            id: crypto.randomUUID(),
            email,
            name: (profile as any).name,
            image: (profile as any).picture,
          }
          users.push(existing)
          saveUsers(users)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      // First time login
      if (user) {
        token.name = user.name
        token.email = user.email
        ;(token as any).picture = (user as any).image
        // Add timestamp for token validation
        token.iat = Math.floor(Date.now() / 1000)
        
        // Add profile information
        if (user.email) {
          const userProfile = getUserProfile(user.email)
          if (userProfile) {
            ;(token as any).profileType = userProfile.profileType
            ;(token as any).profileCompleted = userProfile.profileCompleted
            ;(token as any).preferences = userProfile.preferences
          }
        }
      }
      
      // Check if token is still valid (not older than session maxAge)
      const now = Math.floor(Date.now() / 1000)
      const tokenAge = now - (token.iat as number || now)
      const maxAge = 30 * 24 * 60 * 60 // 30 days (same as session.maxAge)
      
      if (tokenAge > maxAge) {
        // Token has expired - we'll let NextAuth handle this
        // by not modifying the token, letting the session expire naturally
        console.log("Token has expired, will be handled by session expiry")
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string | undefined
        session.user.email = token.email as string | undefined
        session.user.image = (token as any).picture as string | undefined
        
        // Add profile information to session
        ;(session as any).profileType = (token as any).profileType
        ;(session as any).profileCompleted = (token as any).profileCompleted
        ;(session as any).preferences = (token as any).preferences
      }
      return session
    },
  },
}

export function registerUser({ email, password, name }: { email: string; password: string; name?: string }) {
  const users = loadUsers()
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return { ok: false, error: "User already exists" }
  }
  const user: UserData = {
    id: crypto.randomUUID(),
    email,
    name: name || email,
    passwordHash: hash(password),
    profileCompleted: false,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  saveUsers(users)
  return { ok: true }
}

export function updateUserProfile({ 
  email, 
  profileType, 
  preferences 
}: { 
  email: string; 
  profileType: UserProfileType; 
  preferences?: UserData['preferences'] 
}) {
  const users = loadUsers()
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
  if (userIndex === -1) {
    return { ok: false, error: "User not found" }
  }
  
  users[userIndex] = {
    ...users[userIndex],
    profileType,
    profileCompleted: true,
    preferences: {
      ...users[userIndex].preferences,
      ...preferences,
    }
  }
  
  saveUsers(users)
  return { ok: true }
}

export function getUserProfile(email: string): UserData | null {
  const users = loadUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}
