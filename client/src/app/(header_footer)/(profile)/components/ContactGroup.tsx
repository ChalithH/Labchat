'use client'

import api from '@/lib/api'
import { AxiosResponse } from 'axios'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { ContactType } from '../types/profile.types'
import { Mail, Phone, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import EditContact from './EditContact'


type ContactGroupTypes = {
  contact: ContactType
  is_users_profile: boolean
}

type IconType = {
  type: string,
  IconComponent: React.ElementType
}

const ICON_IMAGES: IconType[] = [
  { type: 'email', IconComponent: Mail },
  { type: 'phone', IconComponent: Phone }]

const ContactGroup = ({ contact, is_users_profile }: ContactGroupTypes) => {
  const router = useRouter()
  const [showPopup, setShowPopup] = useState<boolean>(false)

  const found_icon = ICON_IMAGES.find(icon => icon.type === contact.type)
  const Icon = found_icon ? found_icon.IconComponent : null

  const handleDeletePopup = () => {
    setShowPopup(!showPopup)
  }

  const handleDeleteContact = async () => {
    const response: AxiosResponse = await api.delete(`/api/profile/delete/${ contact.id }`)
    router.refresh()
  }

  return (
    <>
      <Card className='py-3'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='mb-1'>{ contact.name }</CardTitle>
              { contact.useCase && <p className='text-sm pb-2'>{ contact.useCase }</p> }
              <CardDescription>{ contact.info }</CardDescription>
            </div>

            <div className='flex justify-center items-center gap-6'>
              <p>{ Icon && <Icon className="w-5 h-5 text-muted-foreground" />} </p>
              { is_users_profile &&
                <>
                  <EditContact contact={ contact } />
                  <Trash onClick={ handleDeletePopup} className='w-5 h-5 text-muted-foreground' />
                </>
              }
            </div>
          </div>

        </CardHeader>
      </Card>

      <Dialog open={ showPopup } onOpenChange={ setShowPopup }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={ handleDeleteContact }>Delete Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ContactGroup
