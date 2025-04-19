import React from 'react'
import { ContactType } from '../types/contact.type'

type ContactGroupTypes = {
  contact: ContactType
}

const ContactGroup = ({ contact }: ContactGroupTypes) => {
  const styles = 
    // contact.primary ? "p-4 barlow-font rounded-3xl bg-blue-50 flex flex-col" :

    "p-4 barlow-font text-black rounded-3xl bg-blue-50 flex flex-col"

  return (
    <div className={ `${ styles } flex flex-row justify-between items-center`}>
      <div>
        <p className='text-sm'>{ contact.name }</p>
        <p className='text-sm'>{ contact.info }</p>
      </div>
      
      <div className='flex gap-2'>
        {/* { contact.primary && <strong>PRIMARY</strong> } */}
        
        <strong>ICON</strong>
      </div>
      
    </div>
  )
}

export default ContactGroup