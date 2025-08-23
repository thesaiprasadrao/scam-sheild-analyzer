"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function NavigationTest() {
  const router = useRouter()
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTestResults(prev => [...prev, `${timestamp}: ${result}`])
  }

  const testNavigateAway = () => {
    addResult("Attempting to navigate to home page...")
    router.push("/")
  }

  const testBrowserBack = () => {
    addResult("Simulating browser back button...")
    window.history.back()
  }

  const testNewTab = () => {
    addResult("Opening dashboard in new tab...")
    window.open("/dashboard", "_blank")
  }

  const testRefresh = () => {
    addResult("Refreshing page...")
    window.location.reload()
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Navigation Security Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={testNavigateAway} variant="outline" size="sm">
              Navigate Away
            </Button>
            <Button onClick={testBrowserBack} variant="outline" size="sm">
              Browser Back
            </Button>
            <Button onClick={testNewTab} variant="outline" size="sm">
              Open New Tab
            </Button>
            <Button onClick={testRefresh} variant="outline" size="sm">
              Refresh Page
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="text-sm font-semibold mb-2">Test Results:</div>
            <div className="bg-muted rounded p-2 max-h-32 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-muted-foreground text-xs">No tests run yet</div>
              ) : (
                testResults.map((result, i) => (
                  <div key={i} className="text-xs font-mono mb-1">{result}</div>
                ))
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <strong>Expected behavior:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Navigate Away: Should show warning dialog</li>
              <li>Browser Back: Should show confirmation dialog</li>
              <li>Page Refresh: Should show browser confirmation</li>
              <li>Tab switching: Should validate session on return</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
