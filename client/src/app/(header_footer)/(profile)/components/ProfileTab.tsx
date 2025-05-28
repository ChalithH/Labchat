import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import { Upload, Camera } from "lucide-react"

import getUserFromSession from '@/lib/get_user'
import ErrorBox from './ErrorBox'
import ProfilePicture from '@/components/profilePicture/ProfilePicture'

type ProfileTabProps = {
  onSubmit: (fieldsToUpdate: Record<string, string>) => void
}

const ProfileTab = ({ onSubmit }: ProfileTabProps) => {
  const [error, setError] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Manage profilePic state internally
  const [profilePic, setProfilePic] = useState<string>('')
  const [originalProfilePic, setOriginalProfilePic] = useState<string>('')
  
  // User data for ProfilePicture component
  const [userData, setUserData] = useState<{
    id: number
    universityId: string
    firstName: string
    lastName: string
  } | null>(null)
  
  useEffect(() => {
    const getUser = async () => {
      const user = await getUserFromSession()
      const currentProfilePic = user.profilePic || ''
      
      console.log('Initial user data loaded:', {
        currentProfilePic,
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      })
      
      // Set profile pic state internally
      setProfilePic(currentProfilePic)
      setOriginalProfilePic(currentProfilePic)
      
      // Set user data for ProfilePicture component
      setUserData({
        id: user.id,
        universityId: user.universityId,
        firstName: user.firstName,
        lastName: user.lastName
      })
    }
    getUser()
  }, []) // Remove setters dependency

  useEffect(() => {
    const newHasChanges = profilePic !== originalProfilePic
    console.log('Change detection:', {
      currentProfilePic: profilePic,
      originalProfilePic,
      hasChanges: newHasChanges
    })
    setHasChanges(newHasChanges)
  }, [profilePic, originalProfilePic])

  console.log('ProfileTab render state:', {
    profilePic,
    hasChanges,
    isUploading,
    userData: userData ? 'loaded' : 'loading'
  })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('Starting upload for file:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Sending upload request...')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('Upload response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload failed with response:', errorText)
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Upload successful! Data:', data)
      console.log('Setting profile pic to:', data.url)
      
      // Use internal state setter
      setProfilePic(data.url)
      
      // Clear the input so the same file can be selected again if needed
      event.target.value = ''
      
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    console.log('Removing image, setting profilePic to empty string')
    setProfilePic('')
    setError('')
  }

  const handleSubmit = async () => {
    console.log('Submit clicked:', {
      hasChanges,
      currentProfilePic: profilePic,
      originalProfilePic
    })
    
    if (!hasChanges) {
      setError('No changes to save')
      return
    }

    setError('')
    console.log('Calling onSubmit with:', { profilePic })
    onSubmit({
      profilePic
    })
  }

  // Don't render until we have user data
  if (!userData) {
    return (
      <div className="grid py-4 gap-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid py-4 gap-4">
      {error && <ErrorBox error={error} />}
      
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <Label className="text-sm font-medium">Profile Picture</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Upload a new profile picture (max 5MB)
          </p>
        </div>

        {/* Current/Preview Profile Picture */}
        <div className="relative">
          {profilePic ? (
            <div className="relative">
              {/* Test with regular img tag */}
              <img 
                src={profilePic}
                alt="Profile preview"
                className="w-12 h-12 rounded-full object-cover border-2 border-border"
                onError={(e) => {
                  console.error('Image failed to load:', profilePic)
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={() => console.log('Image loaded successfully:', profilePic)}
              />
              {/* Your ProfilePicture component */}
              <div className="mt-2">
                <ProfilePicture 
                  key={`profile-${profilePic}`}
                  user_id={userData.id} 
                  profilePic={profilePic} 
                  universityId={userData.universityId} 
                  firstName={userData.firstName}
                  lastName={userData.lastName}
                  size={12} 
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full p-2 h-8 w-8"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                ×
              </Button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Upload Input */}
        <div className="w-full max-w-sm">
          <Label htmlFor="profile-upload" className="sr-only">
            Upload profile picture
          </Label>
          <div className="relative">
            <Input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => document.getElementById('profile-upload')?.click()}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Debug info */}
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          <div>Profile Pic: {profilePic ? 'Set' : 'Not set'}</div>
          <div>Has Changes: {hasChanges ? 'Yes' : 'No'}</div>
          <div>Is Uploading: {isUploading ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={!hasChanges || isUploading}
      >
        Save Changes
      </Button>
      
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
    </div>
  )
}

export default ProfileTab