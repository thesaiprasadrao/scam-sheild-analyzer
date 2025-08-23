"use client"

import { useState } from "react"
import { useUserProfile } from "./user-profile-provider"
import { getPersonalizedAlerts, getThreatAlertsByCategory, type ThreatAlert } from "@/lib/threat-alerts"
import { AdaptiveCard } from "./adaptive-ui"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, Eye, EyeOff, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThreatAlertsProps {
  className?: string
  showTitle?: boolean
}

export function ThreatAlerts({ className, showTitle = true }: ThreatAlertsProps) {
  const { profileType, preferences } = useUserProfile()
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set())
  const [isReading, setIsReading] = useState(false)
  
  const personalizedAlerts = getPersonalizedAlerts(profileType)
  const alertsByCategory = getThreatAlertsByCategory(profileType)
  
  const toggleExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts)
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId)
    } else {
      newExpanded.add(alertId)
    }
    setExpandedAlerts(newExpanded)
  }

  const readAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel()
        setIsReading(false)
        return
      }
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.onend = () => setIsReading(false)
      utterance.onerror = () => setIsReading(false)
      
      window.speechSynthesis.speak(utterance)
      setIsReading(true)
    }
  }

  const getSeverityColor = (severity: ThreatAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: ThreatAlert['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  if (personalizedAlerts.length === 0) {
    return (
      <AdaptiveCard className={className}>
        <div className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No active threat alerts at the moment.</p>
        </div>
      </AdaptiveCard>
    )
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className={cn(
            "text-2xl font-semibold",
            preferences.simplifiedUI && "text-3xl"
          )}>
            Personalized Security Alerts
          </h2>
          {preferences.voiceEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => readAloud(`You have ${personalizedAlerts.length} personalized security alerts. These alerts are customized based on your profile to help protect you from relevant threats.`)}
              className="ml-auto"
            >
              {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className={cn(
          "grid w-full",
          preferences.simplifiedUI ? "grid-cols-2 h-12" : "grid-cols-4"
        )}>
          <TabsTrigger value="all" className={preferences.simplifiedUI ? "text-base" : ""}>
            All ({personalizedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="critical" className={preferences.simplifiedUI ? "text-base" : ""}>
            Critical ({personalizedAlerts.filter(a => a.severity === 'critical').length})
          </TabsTrigger>
          {!preferences.simplifiedUI && (
            <>
              <TabsTrigger value="high">
                High ({personalizedAlerts.filter(a => a.severity === 'high').length})
              </TabsTrigger>
              <TabsTrigger value="categories">
                By Category
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {personalizedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              isExpanded={expandedAlerts.has(alert.id)}
              onToggleExpanded={() => toggleExpanded(alert.id)}
              onReadAloud={preferences.voiceEnabled ? readAloud : undefined}
              isReading={isReading}
              simplifiedUI={preferences.simplifiedUI}
            />
          ))}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4 mt-6">
          {personalizedAlerts
            .filter(alert => alert.severity === 'critical')
            .map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isExpanded={expandedAlerts.has(alert.id)}
                onToggleExpanded={() => toggleExpanded(alert.id)}
                onReadAloud={preferences.voiceEnabled ? readAloud : undefined}
                isReading={isReading}
                simplifiedUI={preferences.simplifiedUI}
              />
            ))}
        </TabsContent>

        {!preferences.simplifiedUI && (
          <>
            <TabsContent value="high" className="space-y-4 mt-6">
              {personalizedAlerts
                .filter(alert => alert.severity === 'high')
                .map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    isExpanded={expandedAlerts.has(alert.id)}
                    onToggleExpanded={() => toggleExpanded(alert.id)}
                    onReadAloud={preferences.voiceEnabled ? readAloud : undefined}
                    isReading={isReading}
                    simplifiedUI={preferences.simplifiedUI}
                  />
                ))}
            </TabsContent>

            <TabsContent value="categories" className="space-y-6 mt-6">
              {Object.entries(alertsByCategory).map(([category, alerts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3">{category}</h3>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        isExpanded={expandedAlerts.has(alert.id)}
                        onToggleExpanded={() => toggleExpanded(alert.id)}
                        onReadAloud={preferences.voiceEnabled ? readAloud : undefined}
                        isReading={isReading}
                        simplifiedUI={preferences.simplifiedUI}
                        compact
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

interface AlertCardProps {
  alert: ThreatAlert
  isExpanded: boolean
  onToggleExpanded: () => void
  onReadAloud?: (text: string) => void
  isReading: boolean
  simplifiedUI: boolean
  compact?: boolean
}

function AlertCard({ 
  alert, 
  isExpanded, 
  onToggleExpanded, 
  onReadAloud,
  isReading,
  simplifiedUI,
  compact = false 
}: AlertCardProps) {
  const getSeverityColor = (severity: ThreatAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Alert className={cn(
      "relative transition-all duration-200",
      simplifiedUI && "border-2 p-6",
      compact && !simplifiedUI && "p-4"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full p-1.5 text-white mt-1",
          alert.severity === 'critical' && "bg-red-500",
          alert.severity === 'high' && "bg-orange-500", 
          alert.severity === 'medium' && "bg-yellow-500",
          alert.severity === 'low' && "bg-blue-500"
        )}>
          {alert.severity === 'critical' || alert.severity === 'high' ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <Shield className="h-3 w-3" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <AlertTitle className={cn(
              "leading-relaxed",
              simplifiedUI && "text-lg md:text-xl"
            )}>
              {alert.title}
            </AlertTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={getSeverityColor(alert.severity)} className="capitalize">
                {alert.severity}
              </Badge>
              {onReadAloud && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReadAloud(`${alert.title}. ${alert.description}`)}
                  className="h-8 w-8 p-0"
                >
                  {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
          
          <AlertDescription className={cn(
            "leading-relaxed",
            simplifiedUI && "text-base",
            !isExpanded && !compact && "line-clamp-2"
          )}>
            {alert.description}
          </AlertDescription>
          
          {!compact && (
            <div className="flex items-center justify-between mt-3">
              <Badge variant="outline" className="text-xs">
                {alert.category}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                className="h-8 text-xs"
              >
                {isExpanded ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Learn More
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}
