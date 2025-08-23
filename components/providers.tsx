"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "./theme-provider"
import { UserProfileProvider } from "./user-profile-provider"
import type { PropsWithChildren } from "react"

export default function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange
      >
        <UserProfileProvider>
          {children}
        </UserProfileProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
