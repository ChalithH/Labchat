'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

import { AxiosResponse } from "axios"
import api from "@/lib/api"

import { ContactType } from "../types/profile.types"
import getUserFromSession from "@/lib/get_user"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ErrorBox from "./ErrorBox"
import { Pencil } from "lucide-react"


const CONTACT_TYPES: {type: string, display: string}[]= [
  { type: 'email', display: 'Email' },
  { type: 'phone', display: 'Phone' }]

const EditContact = ({ contact }:{ contact: ContactType }) => {
  const [type, setType] = useState<string>(contact.type)
  const [name, setName] = useState<string>(contact.name)
  const [useCase, setUseCase] = useState<string>(contact.useCase)
  const [info, setInfo] = useState<string>(contact.info)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [error, setError] = useState<string>('')

  const router = useRouter()

  const handleEditContact = async () => {
    if (type === '' || name === '' || info === ''){
      setError('Fill in the form before submitting')
      return
    }

    const user = await getUserFromSession()
    const new_contact: ContactType = {
      userId: user.id,
      type: type,
      name: name,
      useCase: useCase ?? '',
      info: info
    }
    const response: AxiosResponse = await api.put(`/profile/edit/${ contact.id }`, new_contact)

    setIsEditOpen(false)
    setType('')
    setName('')
    setInfo('')
    setError('')
    router.refresh()
  }

  return (
    <>
      <Dialog open={ isEditOpen } onOpenChange={ setIsEditOpen }>
        <DialogTrigger asChild>
           <Pencil  
              className="w-5 h-5 cursor-pointer text-muted-foreground" /> 
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editing a contact</DialogTitle>
            <DialogDescription>Change the information stored for a specific contact</DialogDescription>
          </DialogHeader>

          <section className="flex flex-col gap-4">
            { error && <ErrorBox error={ error }/> }

            <div>
              <Label htmlFor="type" className='mb-1'>Icon</Label>
              <Select onValueChange={ val => setType(val) }>
                <SelectTrigger className="w-[100%] text-sm" id='type'>
                  <SelectValue placeholder='Select an icon' />
                </SelectTrigger>
                <SelectContent>
                  { CONTACT_TYPES.map( (contact, idx) => 
                    <SelectItem key={ idx } value={ contact.type }>{ contact.display }</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="name" className='mb-1'>Name</Label>
              <Input 
                id='name' 
                type="text" 
                className='text-sm' 
                placeholder="Enter a name for the contact"
                value={ name }
                onChange={ e => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="useCase" className='mb-1'>Use Case</Label>
              <Input 
                id='useCase' 
                type="text" 
                className='text-sm' 
                placeholder="Enter a reason for using this contact"
                value={ useCase }
                onChange={ e => setUseCase(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="info" className='mb-1'>Info</Label>
              <Input 
                id='info' 
                type="text" 
                className='text-sm' 
                placeholder="Enter the contact information"
                value={ info }
                onChange={ e => setInfo(e.target.value)} />
            </div>
          </section>

          <DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button onClick={ handleEditContact }>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditContact
