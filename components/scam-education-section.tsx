"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Lightbulb, RotateCw, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { type UserProfileType } from "@/lib/auth"
import { getRandomScenariosForPersona, type ScamScenario } from "@/lib/scam-education-data"

interface ScamEducationSectionProps {
  userPersona?: UserProfileType
}

export default function ScamEducationSection({ userPersona = 'student' }: ScamEducationSectionProps) {
  const [scenarios, setScenarios] = useState<ScamScenario[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [isLoadingNewExamples, setIsLoadingNewExamples] = useState(false)

  useEffect(() => {
    // Load initial scenarios based on persona
    const initialScenarios = getRandomScenariosForPersona(userPersona, 4)
    setScenarios(initialScenarios)
  }, [userPersona])

  const handleGetNewExamples = async () => {
    setIsLoadingNewExamples(true)
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 300))
    const newScenarios = getRandomScenariosForPersona(userPersona, 4)
    setScenarios(newScenarios)
    setIsLoadingNewExamples(false)
  }

  const handleToggleShowAll = () => {
    setShowAll(prev => !prev)
  }

  const visibleScenarios = showAll ? scenarios : scenarios.slice(0, 2)

  const getPersonaDisplayName = (persona: UserProfileType) => {
    switch (persona) {
      case 'student': return 'Students'
      case 'working-professional': return 'Working Professionals'
      case 'homemaker': return 'Homemakers'
      case 'senior-citizen': return 'Senior Citizens'
      case 'new-to-internet': return 'New Internet Users'
      default: return 'Users'
    }
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50/60 to-amber-50/60 dark:border-orange-800 dark:from-orange-950/20 dark:to-amber-950/20 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-serif text-orange-800 dark:text-orange-200">
                How Scammers Might Target You
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-300">
                Common scams targeting {getPersonaDisplayName(userPersona).toLowerCase()}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:text-orange-200 dark:hover:bg-orange-900/30"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show Examples
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-12">
            {visibleScenarios.map((scenario, index) => (
              <div key={scenario.id} className="border rounded-lg p-6 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800 shadow-sm mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500 text-white text-sm font-bold mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-red-700 dark:text-red-400 text-lg">
                        {scenario.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {scenario.category}
                      </Badge>
                    </div>
                    
                    <div className="mb-4 p-4 bg-red-50/80 dark:bg-red-950/40 rounded-md border-l-4 border-red-400 dark:border-red-500">
                      <p className="text-sm italic text-red-700 dark:text-red-300">
                        <AlertTriangle className="h-4 w-4 inline mr-2 text-red-500" />
                        {scenario.exampleMessage}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50/80 dark:bg-green-950/40 rounded-md border-l-4 border-green-500 dark:border-green-400">
                      <p className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span><strong>Tip:</strong> {scenario.tip}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-4 pt-12 mt-12 border-t border-orange-200 dark:border-orange-800">
              {scenarios.length > 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleShowAll}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30 dark:hover:border-orange-600 transition-all duration-200 mb-3 sm:mb-0 mr-0 sm:mr-3"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show {scenarios.length - 2} More Examples
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetNewExamples}
                disabled={isLoadingNewExamples}
                className="border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30 dark:hover:border-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingNewExamples ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Show Different Examples
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
