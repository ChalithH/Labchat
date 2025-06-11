import React, { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Button } from '@/components/ui/button'
import ErrorBox from './ErrorBox'
import isValidEmail from '../lib/valid_email.util'
import { DialogClose } from '@/components/ui/dialog'
import hashPassword from '../lib/hash_password.util'

const validatePassword = (password: string): string | null => {
  if (password.length < 8)
    return "Password must be at least 8 characters long"
  if (!/[A-Z]/.test(password))
    return "Password must include at least one uppercase letter"
  if (!/[a-z]/.test(password))
    return "Password must include at least one lowercase letter"
  if (!/[0-9]/.test(password))
    return "Password must include at least one number"
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Password must include at least one special character"
  return null
}

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
  
  const handleSubmit = async () => {
    if (values.email === '') {
      setError('Fill in the form before submitting')
      return
    }

    const passwordError = validatePassword(values.password)
    if (passwordError) {
      setError(passwordError)
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
      {/* <p className='text-white text-sm bg-red-500 rounded-sm p-1 px-2'>Email changes are not implemented</p> */}

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