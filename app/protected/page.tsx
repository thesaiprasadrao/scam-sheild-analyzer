"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import ProtectedPageWrapper from "@/components/protected-page-wrapper"

export default function ProtectedPage() {
  const { data } = useSession()
  return (
    <ProtectedPageWrapper
      requireAuth={true}
      redirectTo="/auth/signin"
      onSessionInvalid={() => {
        console.log("Session invalidated from protected page")
      }}
    >
      <div className="min-h-screen flex items-center justify-center p-8 text-center space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Protected</h1>
          <p className="text-muted-foreground">Hello {data?.user?.name || data?.user?.email}</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button onClick={() => signOut({ callbackUrl: "/auth/signin" })}>Sign out</Button>
            <a className="underline self-center" href="/">Go home</a>
          </div>
        </div>
      </div>
    </ProtectedPageWrapper>
  )
}
