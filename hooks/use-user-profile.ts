"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { type UserProfileType } from "@/lib/auth"

interface UserProfile {
  profileType?: UserProfileType
  profileCompleted?: boolean
  preferences?: {
    fontSize?: 'small' | 'medium' | 'large'
    simplifiedUI?: boolean
    voiceEnabled?: boolean
  }
}

export function useUserProfile() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (status === "loading") return
      
      if (!session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/profile")
        
        if (response.status === 401) {
          // Not authenticated yet — expected, not an error
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`)
        }

        const profileData = await response.json()
        setProfile(profileData)
        setError(null)
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch profile")
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, status])

  return {
    profile,
    loading,
    error,
    isAuthenticated: !!session,
    refetch: () => {
      setLoading(true)
      setError(null)
      // Re-run the effect by changing dependency
    }
  }
}
