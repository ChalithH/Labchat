'use client'

import { useState } from 'react';

import { LoginRegisterHeader } from '@/components/ui/LoginRegisterHeader';
import { LoginRegisterFooter } from '@/components/ui/LoginRegisterFooter';

import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { UserType } from '@/types/User.type';


export default function Register() {
  const router = useRouter()

  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')

  const [error, setError] = useState<string | undefined>(undefined)
  const [message, setMessage] = useState<string | undefined>(undefined)

  const new_user: UserType = {
    roleId: 6, /* Vistor */
    universityId: '',
    username: `${ firstName }_${ lastName }`,
    loginEmail: email,
    loginPassword: password,
    firstName: firstName,
    lastName: lastName,
    displayName: `${ firstName } ${ lastName }`,
    jobTitle: '',
    office: '',
    bio: '',
    dateJoined: new Date().toISOString()
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (password !== confirmPassword) {
        setMessage(undefined)
        setError("Passwords do not match")
        return
      }

      await api.post('/api/user/', new_user)
      setError(undefined)
      setMessage('Registration successful')
      
      router.push('/login')
      
    } catch (err: any) {
      setError(err.response.data.error)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#739CEA]">
      <div className="w-full max-w-md space-y-6 rounded-xl">
        <LoginRegisterHeader 
          subtitle="Register"
          className="mb-8"
        />
        <form onSubmit={ handleFormSubmit } className="space-y-5 p-8">
          { (error || message) &&
            <div className={ `${error ? 'bg-red-500' : 'bg-green-500'}` + ' text-white m-auto rounded-sm p-3 mb-6' }>
              <p>{ error || message }</p>
            </div>
          }

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white">
                First name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-500"
                placeholder="First name"
                value={ firstName }
                onChange={ e => setFirstName(e.target.value) }
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white">
                Last name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-500"
                placeholder="Last name"
                value={ lastName }
                onChange={ e => setLastName(e.target.value) }
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-500"
              placeholder="Enter your email"
              value={ email }
              onChange={ e => setEmail(e.target.value) }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-500"
                placeholder="Password"
                value={ password }
                onChange={ e => setPassword(e.target.value) }
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-white focus:ring-white bg-[#739CEA] bg-opacity-90 placeholder:text-gray-500"
                placeholder="Confirm password"
                value={ confirmPassword }
                onChange={ e => setConfirmPassword(e.target.value) }
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#C13E70] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#A83762] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors duration-200 mt-6"
          >
            Register
          </button>
        </form>
        
        <LoginRegisterFooter pageType="register" />
      </div>
    </div>
  );
}