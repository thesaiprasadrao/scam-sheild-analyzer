"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Briefcase, GraduationCap, Users, Settings, Lock } from "lucide-react"
import { useUserProfile } from "@/hooks/use-user-profile"
import { type UserProfileType } from "@/lib/auth"

interface ProfileManagerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileManager({ isOpen, onOpenChange }: ProfileManagerProps) {
  const { data: session } = useSession()
  const { profile } = useUserProfile()
  
  // Form states
  const [formData, setFormData] = useState({
    email: "",
    profileType: "student" as UserProfileType,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Load profile data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: session?.user?.email || "",
        profileType: profile?.profileType || "student",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }, [isOpen, profile, session])

  const handleSave = async () => {
    try {
      // Basic validation
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        alert("New passwords don't match!")
        return
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        alert("New password must be at least 6 characters long!")
        return
      }

      // For now, just log the changes and close the dialog
      console.log("Saving profile changes:", {
        email: formData.email,
        profileType: formData.profileType,
        passwordChanged: !!formData.newPassword
      })
      
      // Show success message
      alert("Profile updated successfully!")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  const profileTypeOptions = [
    { value: "student" as UserProfileType, label: "Student", icon: GraduationCap },
    { value: "working-professional" as UserProfileType, label: "Working Professional", icon: Briefcase },
    { value: "homemaker" as UserProfileType, label: "Homemaker", icon: Users },
    { value: "senior-citizen" as UserProfileType, label: "Senior Citizen", icon: User },
    { value: "new-to-internet" as UserProfileType, label: "New to Internet", icon: Settings }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Manage your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Edit Credentials</TabsTrigger>
            <TabsTrigger value="persona">Change Persona</TabsTrigger>
          </TabsList>

          <TabsContent value="credentials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Credentials</CardTitle>
                <CardDescription>
                  Update your email and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center mb-6">

                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative flex items-center">
                      <Mail 
                        className="absolute h-4 w-4 text-muted-foreground pointer-events-none z-10" 
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-10"
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This is your login email address
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative flex items-center">
                      <Lock 
                        className="absolute h-4 w-4 text-muted-foreground pointer-events-none z-10" 
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Enter current password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="h-10"
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative flex items-center">
                      <Lock 
                        className="absolute h-4 w-4 text-muted-foreground pointer-events-none z-10" 
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="h-10"
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative flex items-center">
                      <Lock 
                        className="absolute h-4 w-4 text-muted-foreground pointer-events-none z-10" 
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="h-10"
                        style={{ paddingLeft: '40px' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="persona" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Persona</CardTitle>
                <CardDescription>
                  Choose your persona to get personalized scam education content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.profileType}
                  onValueChange={(value: UserProfileType) => setFormData(prev => ({ ...prev, profileType: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {profileTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Persona:</h4>
                  <div className="flex items-center gap-2">
                    {profileTypeOptions.find(opt => opt.value === formData.profileType) && (
                      <Badge variant="secondary" className="gap-2">
                        {React.createElement(profileTypeOptions.find(opt => opt.value === formData.profileType)!.icon, { className: "h-3 w-3" })}
                        {profileTypeOptions.find(opt => opt.value === formData.profileType)?.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your persona helps us provide targeted scam awareness content relevant to your demographic and risk profile.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}