"use client"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Briefcase, Home, Users, Globe } from "lucide-react"

const profileOptions = [
  {
    value: "student",
    label: "Student",
    description: "Currently studying or in education",
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    value: "working-professional",
    label: "Working Professional", 
    description: "Employed or running a business",
    icon: <Briefcase className="h-6 w-6" />,
  },
  {
    value: "homemaker",
    label: "Homemaker",
    description: "Managing household and family",
    icon: <Home className="h-6 w-6" />,
  },
  {
    value: "senior-citizen",
    label: "Senior Citizen",
    description: "Aged 60 and above",
    icon: <Users className="h-6 w-6" />,
  },
  {
    value: "new-to-internet",
    label: "New to Internet",
    description: "Just starting to use digital services", 
    icon: <Globe className="h-6 w-6" />,
  }
]

export default function RadioTestPage() {
  const [selectedProfile, setSelectedProfile] = useState<string>("")

  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Radio Button Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selected: {selectedProfile || "None"}
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedProfile} onValueChange={setSelectedProfile}>
            <div className="grid gap-4 md:grid-cols-2">
              {profileOptions.map((option) => (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={`flex flex-col p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 h-full relative ${
                      selectedProfile === option.value
                        ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                        : 'border-muted hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    {/* Selection indicator */}
                    {selectedProfile === option.value && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`transition-colors duration-200 ${
                        selectedProfile === option.value ? 'text-primary' : 'text-primary'
                      }`}>
                        {option.icon}
                      </div>
                      <div>
                        <h3 className={`font-semibold text-lg transition-colors duration-200 ${
                          selectedProfile === option.value ? 'text-primary' : ''
                        }`}>
                          {option.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <p className="text-sm">Selected Value: "{selectedProfile}"</p>
            <p className="text-sm">Selection Count: {selectedProfile ? 1 : 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
