"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export type UserProfileType = 'student' | 'working-professional' | 'homemaker' | 'senior-citizen' | 'new-to-internet'

export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large'
  simplifiedUI: boolean
  voiceEnabled: boolean
}

interface UserProfileContextType {
  profileType?: UserProfileType
  profileCompleted: boolean
  preferences: UserPreferences
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>
  isLoading: boolean
}

const defaultPreferences: UserPreferences = {
  fontSize: 'medium',
  simplifiedUI: false,
  voiceEnabled: false,
}

const UserProfileContext = createContext<UserProfileContextType>({
  profileCompleted: false,
  preferences: defaultPreferences,
  updatePreferences: async () => {},
  isLoading: true,
})

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [profileType, setProfileType] = useState<UserProfileType | undefined>()
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      // Get profile data from session if available
      if ((session as any).profileType) {
        setProfileType((session as any).profileType)
        setProfileCompleted((session as any).profileCompleted || false)
        setPreferences((session as any).preferences || defaultPreferences)
        setIsLoading(false)
      } else {
        // Fetch profile data from API
        fetchProfile()
      }
    } else {
      setIsLoading(false)
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileType(data.profileType)
        setProfileCompleted(data.profileCompleted || false)
        setPreferences(data.preferences || defaultPreferences)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences }
    setPreferences(updatedPreferences)

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileType,
          preferences: updatedPreferences,
        }),
      })
    } catch (error) {
      console.error('Failed to update preferences:', error)
      // Revert on error
      setPreferences(preferences)
    }
  }

  return (
    <UserProfileContext.Provider
      value={{
        profileType,
        profileCompleted,
        preferences,
        updatePreferences,
        isLoading,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  return useContext(UserProfileContext)
}
