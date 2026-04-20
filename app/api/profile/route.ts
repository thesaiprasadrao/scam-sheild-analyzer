import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, updateUserProfile, getUserProfile, type UserProfileType } from "@/lib/auth"
import { z } from "zod"

const UpdateProfileSchema = z.object({
  profileType: z.enum(['student', 'working-professional', 'homemaker', 'senior-citizen', 'new-to-internet']),
  preferences: z.object({
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
    simplifiedUI: z.boolean().optional(),
    voiceEnabled: z.boolean().optional(),
  }).optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = UpdateProfileSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { profileType, preferences } = parsed.data

    // Set default preferences based on profile type
    const defaultPreferences = getDefaultPreferences(profileType)
    const finalPreferences = { ...defaultPreferences, ...preferences }

    const result = await updateUserProfile({
      email: session.user.email,
      profileType,
      preferences: finalPreferences,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userProfile = await getUserProfile(session.user.email)
  
  if (!userProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    profileType: userProfile.profileType,
    profileCompleted: userProfile.profileCompleted,
    preferences: userProfile.preferences,
  })
}

function getDefaultPreferences(profileType: UserProfileType) {
  switch (profileType) {
    case 'senior-citizen':
    case 'new-to-internet':
      return {
        fontSize: 'large' as const,
        simplifiedUI: true,
        voiceEnabled: true,
      }
    case 'student':
    case 'working-professional':
    case 'homemaker':
    default:
      return {
        fontSize: 'medium' as const,
        simplifiedUI: false,
        voiceEnabled: false,
      }
  }
}
