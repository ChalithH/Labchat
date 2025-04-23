import React, { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import getUserFromSession from '@/lib/get_user'
import { Button } from '@/components/ui/button'
import ErrorBox from './ErrorBox'
import isValidEmail from '../lib/valid_email.util'
import { DialogClose } from '@/components/ui/dialog'
import hashPassword from '../lib/hash_password.util'

type AccountTabProps = {
  values: {
    email: string
    password: string
    confirmPassword: string
  }
  setters: {
    setEmail: (v: string) => void
    setPassword: (v: string) => void
    setConfirmPassword: (v: string) => void
  }
  onSubmit: (fieldsToUpdate: Record<string, string>) => void
}

const AccountTab = ({ values, setters, onSubmit }: AccountTabProps) => {
  const [error, setError] = useState<string>('')
  
  useEffect( () => {
    const getUser = async () => {
      const user = await getUserFromSession()
      setters.setEmail(user.loginEmail)
      setters.setPassword('')
      setters.setConfirmPassword('')
    }
    getUser()
  }, [])
  
  const handleSubmit = async () => {
    if (values.email === '') {
      setError('Fill in the form before submitting')
      return
    }

    if (values.password !== '' && values.password !== values.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!isValidEmail(values.email)){
      setError('Enter a valid email address')
      return
    }

    setError('')
    onSubmit({
      // loginEmail: values.email,
      loginPassword: await hashPassword(values.password)
    })
  }

  return (
    <div className="grid py-4 gap-4">
      <p className='text-white text-sm bg-red-500 rounded-sm p-1 px-2'>Email changes are not implemented</p>

      { error && <ErrorBox error={ error }/> }
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={ values.email }
          onChange={ (e) => setters.setEmail(e.target.value) }
          className='text-sm mt-1'
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={ values.password }
          onChange={ (e) => setters.setPassword(e.target.value) }
          className='text-sm mt-1'
          placeholder="Enter new password"
        />
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={ values.confirmPassword }
          onChange={ (e) => setters.setConfirmPassword(e.target.value) }
          className='text-sm mt-1'
          placeholder="Repeat your new password"
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

export default AccountTab