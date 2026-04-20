import type { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"
import { connectDB } from "@/lib/db"
import { User as UserModel } from "@/lib/models/User"

export type UserProfileType = 'student' | 'working-professional' | 'homemaker' | 'senior-citizen' | 'new-to-internet'

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

function hash(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return "h" + (h >>> 0).toString(16)
}

export const authOptions: NextAuthOptions = {
  providers: [
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
        await connectDB()
        const user = await UserModel.findOne({ email: email.toLowerCase() })
        if (user && user.passwordHash === hash(password)) {
          const result: User = { id: user._id.toString(), name: user.name || user.email, email: user.email, image: user.image }
          return result
        }
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 4 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name
        token.email = user.email
        ;(token as any).picture = (user as any).image
        token.iat = Math.floor(Date.now() / 1000)
        if (user.email) {
          const profile = await getUserProfile(user.email)
          if (profile) {
            ;(token as any).profileType = profile.profileType
            ;(token as any).profileCompleted = profile.profileCompleted
            ;(token as any).preferences = profile.preferences
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string | undefined
        session.user.email = token.email as string | undefined
        session.user.image = (token as any).picture as string | undefined
        ;(session as any).profileType = (token as any).profileType
        ;(session as any).profileCompleted = (token as any).profileCompleted
        ;(session as any).preferences = (token as any).preferences
      }
      return session
    },
  },
}

export async function registerUser({ email, password, name }: { email: string; password: string; name?: string }) {
  await connectDB()
  const existing = await UserModel.findOne({ email: email.toLowerCase() })
  if (existing) return { ok: false, error: "User already exists" }
  await UserModel.create({
    email: email.toLowerCase(),
    name: name || email,
    passwordHash: hash(password),
    profileCompleted: false,
    createdAt: new Date().toISOString(),
  })
  return { ok: true }
}

export async function updateUserProfile({
  email,
  profileType,
  preferences,
}: {
  email: string
  profileType: UserProfileType
  preferences?: UserData['preferences']
}) {
  await connectDB()
  const user = await UserModel.findOne({ email: email.toLowerCase() })
  if (!user) return { ok: false, error: "User not found" }
  user.profileType = profileType
  user.profileCompleted = true
  user.preferences = { ...user.preferences, ...preferences }
  await user.save()
  return { ok: true }
}

export async function getUserProfile(email: string): Promise<UserData | null> {
  await connectDB()
  const user = await UserModel.findOne({ email: email.toLowerCase() })
  if (!user) return null
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash,
    image: user.image,
    profileType: user.profileType as UserProfileType,
    profileCompleted: user.profileCompleted,
    preferences: user.preferences,
    createdAt: user.createdAt,
  }
}
