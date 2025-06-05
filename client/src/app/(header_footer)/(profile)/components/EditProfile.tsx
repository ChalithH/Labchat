'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AxiosResponse } from "axios"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import getUserFromSession from "@/lib/get_user"

import AccountTab from "./AccountTab"
import GeneralTab from "./GeneralTab"
import ProfileTab from "./ProfileTab" // New import

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

const EditProfile = () => {
  const router = useRouter()

  const [displayName, setDisplayName] = useState<string>('')
  const [jobTitle, setJobTitle] = useState<string>('')
  const [office, setOffice] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingFields, setPendingFields] = useState<Record<string, string>>({})

  
  useEffect(() => {
    if (isEditOpen) {
      setPassword('')
      setConfirmPassword('')
    }
  }, [isEditOpen])

  const handleUpdateUser = async (new_fields: Record<string, string>) => {
    setPendingFields(new_fields)
    setIsConfirmOpen(true)
  }
  
  const confirmUpdate = async () => {
    const user = await getUserFromSession()
    const updatedUser = { ...user, ...pendingFields }
  
    await api.put(`/user/update/${user.id}`, updatedUser)
  
    setIsConfirmOpen(false)
    setIsEditOpen(false)
    router.refresh()
  }

  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <strong className="font-semibold">Edit Profile</strong>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit your profile</DialogTitle>
            <DialogDescription>
              Make changes to and save your profile here
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileTab
                onSubmit={handleUpdateUser}
              />
            </TabsContent>

            <TabsContent value="account">
              <AccountTab
                values={{ email, password, confirmPassword }}
                setters={{ setEmail, setPassword, setConfirmPassword }}
                onSubmit={handleUpdateUser}
              />
            </TabsContent>

            <TabsContent value="general">
              <GeneralTab
                values={{ displayName, jobTitle, office, bio }}
                setters={{ setDisplayName, setJobTitle, setOffice, setBio }}
                onSubmit={handleUpdateUser}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes?
              {pendingFields.profilePic && (
                <span className="block mt-2 text-sm">
                  This will update your profile picture.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmUpdate}>Confirm Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditProfile