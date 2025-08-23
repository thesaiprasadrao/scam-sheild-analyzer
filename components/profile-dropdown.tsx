"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import ProfileManager from "@/components/profile-manager"

export default function ProfileDropdown() {
  const { data: session } = useSession()
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  const handleEditProfile = () => {
    setIsProfileDialogOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">
                {session?.user?.name || "User"}
              </span>
              <span className="text-xs text-muted-foreground leading-none mt-1">
                {session?.user?.email}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="flex items-center gap-2 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {session?.user?.name || "User"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer gap-2 focus:bg-accent">
            <Settings className="h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Manager Dialog */}
      <ProfileManager 
        isOpen={isProfileDialogOpen} 
        onOpenChange={setIsProfileDialogOpen} 
      />
    </>
  )
}
