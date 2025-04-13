import { UserContactType } from '@/types/TestTypes'
import React from 'react'

type ContactGroupTypes = {
  contact: UserContactType
}

const ContactGroup = ({ contact }: ContactGroupTypes) => {
  const styles = contact.primary ?
    "p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col" :
    "shadow-md shadow-[#eff6ff] p-4 barlow-font text-gray-600 rounded-3xl bg-blue-50 flex flex-col"

  return (
    <div className={ `${ styles } flex flex-row justify-between items-center`}>
      <div>
        <p>{ contact.name }</p>
        <p>{ contact.info }</p>
      </div>
      
      <div className='flex gap-2'>
        { contact.primary && <strong>PRIMARY</strong> }
        <strong>ICON</strong>
      </div>
      
    </div>
  )
}

export default ContactGroup