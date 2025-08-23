"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"
import { useNavigationGuard } from "@/hooks/use-navigation-guard"

interface ProtectedPageWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  onSessionInvalid?: () => void
}

export function ProtectedPageWrapper({
  children,
  requireAuth = true,
  redirectTo = "/auth/signin",
  onSessionInvalid,
}: ProtectedPageWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)

  const handleSessionInvalid = () => {
    signOut({ callbackUrl: redirectTo })
    onSessionInvalid?.()
  }

  const handleBeforeUnload = () => {
    // Could add analytics or cleanup here
    console.log("User is leaving protected area")
  }

  const { isProtected } = useNavigationGuard({
    enabled: requireAuth && status === "authenticated",
    message: "Are you sure you want to leave? You may need to sign in again for security reasons.",
    onBeforeUnload: handleBeforeUnload,
    onSessionInvalid: handleSessionInvalid,
  })

  useEffect(() => {
    if (status === "loading") {
      setIsValidating(true)
      return
    }

    if (requireAuth && status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
      return
    }

    setIsValidating(false)
  }, [status, requireAuth, redirectTo, router])

  // Show loading while validating session
  if (status === "loading" || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (requireAuth && status === "unauthenticated") {
    return null
  }

  return <>{children}</>
}

export default ProtectedPageWrapper
