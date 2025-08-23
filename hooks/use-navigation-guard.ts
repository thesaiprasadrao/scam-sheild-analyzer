"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface UseNavigationGuardOptions {
  enabled?: boolean
  message?: string
  onBeforeUnload?: () => void
  onSessionInvalid?: () => void
}

export function useNavigationGuard(options: UseNavigationGuardOptions = {}) {
  const {
    enabled = true,
    message = "Are you sure you want to leave? You will be logged out for security reasons.",
    onBeforeUnload,
    onSessionInvalid,
  } = options

  const { data: session, status } = useSession()
  const router = useRouter()
  const hasShownWarning = useRef(false)

  useEffect(() => {
    if (!enabled || status !== "authenticated") return

    // Handle browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      if (session && !hasShownWarning.current) {
        const shouldLeave = confirm(
          "You are navigating away from a secure area. For security reasons, you will need to sign in again when you return. Continue?"
        )
        
        if (!shouldLeave) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, "", window.location.href)
          return
        }
        
        hasShownWarning.current = true
        onBeforeUnload?.()
      }
    }

    // Handle page visibility changes (tab switching, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden - could indicate user is leaving
        return
      }
      
      // Page is now visible - validate session
      if (session && status === "authenticated") {
        // Re-validate session when page becomes visible
        // This helps catch cases where session expired while page was hidden
        fetch("/api/auth/session")
          .then(res => res.json())
          .then(sessionData => {
            if (!sessionData.user) {
              onSessionInvalid?.()
              router.push("/auth/signin?callbackUrl=" + window.location.pathname)
            }
          })
          .catch(() => {
            // If session check fails, redirect to login
            onSessionInvalid?.()
            router.push("/auth/signin?callbackUrl=" + window.location.pathname)
          })
      }
    }

    // Handle browser refresh/close
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (session && enabled) {
        event.preventDefault()
        event.returnValue = message
        onBeforeUnload?.()
        return message
      }
    }

    // Add event listeners
    window.addEventListener("popstate", handlePopState)
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Initial session validation
    if (session) {
      handleVisibilityChange()
    }

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [enabled, session, status, message, onBeforeUnload, onSessionInvalid, router])

  // Reset warning flag when session changes
  useEffect(() => {
    hasShownWarning.current = false
  }, [session])

  return {
    isProtected: enabled && status === "authenticated",
    session,
    status
  }
}
