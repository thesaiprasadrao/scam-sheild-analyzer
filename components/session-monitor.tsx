"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export function useSessionMonitor() {
  const { data: session, status } = useSession()
  const [navigationEvents, setNavigationEvents] = useState<string[]>([])
  const [sessionValidations, setSessionValidations] = useState<number>(0)

  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setNavigationEvents(prev => [...prev.slice(-9), `${timestamp}: ${event}`])
  }

  useEffect(() => {
    // Monitor session changes
    if (status === "authenticated") {
      addEvent("Session authenticated")
    } else if (status === "unauthenticated") {
      addEvent("Session unauthenticated")
    } else if (status === "loading") {
      addEvent("Session loading")
    }
  }, [status])

  useEffect(() => {
    // Monitor page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent("Page hidden (tab switch/minimize)")
      } else {
        addEvent("Page visible (tab focus/restore)")
        setSessionValidations(prev => prev + 1)
      }
    }

    // Monitor navigation events
    const handlePopState = () => {
      addEvent("Browser back/forward navigation")
    }

    const handleBeforeUnload = () => {
      addEvent("Page unload/refresh")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("popstate", handlePopState)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return {
    session,
    status,
    navigationEvents,
    sessionValidations,
    addEvent,
  }
}

interface SessionMonitorProps {
  enabled?: boolean
}

export function SessionMonitor({ enabled = true }: SessionMonitorProps) {
  const { session, status, navigationEvents, sessionValidations } = useSessionMonitor()

  if (!enabled || process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-3 max-w-sm text-xs z-50">
      <div className="font-semibold mb-2">Session Monitor</div>
      <div className="space-y-1">
        <div>Status: <span className="font-mono">{status}</span></div>
        <div>User: <span className="font-mono">{session?.user?.email || "none"}</span></div>
        <div>Validations: <span className="font-mono">{sessionValidations}</span></div>
      </div>
      <div className="mt-2">
        <div className="font-semibold">Recent Events:</div>
        <div className="max-h-24 overflow-y-auto space-y-1">
          {navigationEvents.map((event, i) => (
            <div key={i} className="text-xs text-muted-foreground font-mono">
              {event}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
