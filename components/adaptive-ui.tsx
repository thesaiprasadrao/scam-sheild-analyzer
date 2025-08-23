"use client"

import { useUserProfile } from "./user-profile-provider"
import { cn } from "@/lib/utils"

interface AdaptiveLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdaptiveLayout({ children, className }: AdaptiveLayoutProps) {
  const { preferences, isLoading } = useUserProfile()

  if (isLoading) {
    return <div className={className}>{children}</div>
  }

  const fontSizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg md:text-xl"
  }[preferences.fontSize]

  const layoutClass = preferences.simplifiedUI
    ? "space-y-6 max-w-2xl mx-auto"
    : "space-y-4"

  return (
    <div 
      className={cn(
        fontSizeClass,
        layoutClass,
        preferences.simplifiedUI && "p-6",
        className
      )}
      style={{
        ...(preferences.fontSize === 'large' && {
          lineHeight: '1.6'
        })
      }}
    >
      {children}
    </div>
  )
}

interface AdaptiveButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function AdaptiveButton({ 
  children, 
  onClick, 
  variant = "default",
  size,
  className,
  disabled,
  type = "button"
}: AdaptiveButtonProps) {
  const { preferences } = useUserProfile()
  
  const adaptiveSize = preferences.simplifiedUI 
    ? "lg" 
    : (size || "default")

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base button styles
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        
        // Variant styles
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        variant === "link" && "text-primary underline-offset-4 hover:underline",
        
        // Size styles with adaptive adjustments
        adaptiveSize === "default" && "h-10 px-4 py-2",
        adaptiveSize === "sm" && "h-9 rounded-md px-3",
        adaptiveSize === "lg" && (preferences.simplifiedUI ? "h-14 px-8 text-lg" : "h-11 rounded-md px-8"),
        adaptiveSize === "icon" && "h-10 w-10",
        
        // Simplified UI adjustments
        preferences.simplifiedUI && "min-h-[3rem] font-semibold shadow-md",
        
        className
      )}
    >
      {children}
    </button>
  )
}

interface AdaptiveCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export function AdaptiveCard({ children, className, title, description }: AdaptiveCardProps) {
  const { preferences } = useUserProfile()

  return (
    <div 
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        preferences.simplifiedUI && "border-2 shadow-lg",
        className
      )}
    >
      {(title || description) && (
        <div className={cn(
          "flex flex-col space-y-1.5 p-6",
          preferences.simplifiedUI && "p-8"
        )}>
          {title && (
            <h3 className={cn(
              "text-2xl font-semibold leading-none tracking-tight",
              preferences.simplifiedUI && "text-3xl"
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              "text-sm text-muted-foreground",
              preferences.simplifiedUI && "text-base"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(
        "p-6",
        preferences.simplifiedUI && "p-8"
      )}>
        {children}
      </div>
    </div>
  )
}
