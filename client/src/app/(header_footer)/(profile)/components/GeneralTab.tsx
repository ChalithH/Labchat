'use client'

import { useEffect, useState } from "react"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import getUserFromSession from "@/lib/get_user"
import ErrorBox from "./ErrorBox"
import { DialogClose } from "@/components/ui/dialog"


type GeneralTabProps = {
  values: {
    displayName: string
    jobTitle: string
    office: string
    bio: string
  }
  setters: {
    setDisplayName: (v: string) => void
    setJobTitle: (v: string) => void
    setOffice: (v: string) => void
    setBio: (v: string) => void
  }

  onSubmit: (fields: Record<string, string>) => void
}

const GeneralTab = ({ values, setters, onSubmit }: GeneralTabProps) => {
  const [error, setError] = useState<string>('')
  
  useEffect( () => {
    const getUser = async () => {
      const user = await getUserFromSession()

      setters.setDisplayName(user.displayName)
      setters.setJobTitle(user.jobTitle)
      setters.setOffice(user.office)
      setters.setBio(user.bio)
    }

    getUser()
  }, [])
  

  const handleSubmit = () => {
    if (!values.displayName){
      setError('Fill in the form before submitting')
      return
    }

    setError('')
    onSubmit({
      displayName: values.displayName,
      jobTitle: values.jobTitle === '' ? 'None' : values.jobTitle,
      office: values.office === '' ? 'None' : values.office,
      bio: values.bio ?? ''
    })
  }

  return (
    <div className="grid py-4 gap-4">
      { error && <ErrorBox error={ error }/> }

      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={ values.displayName }
          onChange={ (e) => setters.setDisplayName(e.target.value) }
          className='text-sm mt-1'
          placeholder='Enter a new display name'
        />
      </div>
      
      <div>
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          value={ values.jobTitle }
          onChange={ (e) => setters.setJobTitle(e.target.value) }
          className='text-sm mt-1'
          placeholder="Enter a new job title"
        />
      </div>

      <div>
        <Label htmlFor="office">Preferred Location</Label>
        <Input
          id="office"
          value={ values.office }
          onChange={ (e) => setters.setOffice(e.target.value) }
          placeholder="Enter a new preferred location"
          className='text-sm mt-1'
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={ values.bio }
          onChange={ (e) => setters.setBio(e.target.value) }
          placeholder="Enter a new bio"
          className='text-sm mt-1'
        />
      </div>

      <Button onClick={ handleSubmit }>
        Save Changes
      </Button>
      <DialogClose asChild>
				<Button variant="outline">Cancel</Button>
			</DialogClose>
    </div>
  )
}

export default GeneralTab
