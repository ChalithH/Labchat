'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation'

import Link from 'next/link';
import { LoginRegisterFooter } from '@/components/ui/LoginRegisterFooter';
import { LoginRegisterHeader } from '@/components/ui/LoginRegisterHeader';

import api from '@/lib/api';
import getUserFromSession from '@/lib/get_user';

const DEFAULT_REDIRECT_ROUTE = 'home'

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | undefined>('')
  const [message, setMessage] = useState<string | undefined>('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      const response = await api.post("/api/auth/login", { loginEmail: email, loginPassword: password })

      setError(undefined)
      setMessage('Login successful')
      
      const user = await getUserFromSession()

      router.push(`http://localhost:3000/${ user.lastViewed || DEFAULT_REDIRECT_ROUTE }`)
    } catch (err: any) {
      setMessage(undefined)
      setError(err.response.data.error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#739CEA]">
      <div className="w-full max-w-md space-y-6 rounded-xl">
        <LoginRegisterHeader 
          subtitle="Login"
          className="mb-8"
        />

        <form onSubmit={ handleLogin } className="space-y-5 p-8">
          { (error || message) &&
            <div className={ `${error ? 'bg-red-500' : 'bg-green-500'}` + ' text-white m-auto rounded-sm p-3 mb-6' }>
              <p>{ error || message }</p>
            </div>
          }
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email Address*
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm bg-[#739CEA] focus:border-white focus:ring-white bg-opacity-90 placeholder:text-gray-500"
                placeholder='Enter your email address'
                value={ email }
                onChange={ e => setEmail(e.target.value) }
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm bg-[#739CEA] focus:border-white focus:ring-white bg-opacity-90 placeholder:text-gray-500"
                placeholder="Enter your password"
                value={ password }
                onChange={ e => setPassword(e.target.value) }
              />
              <Link href="/forgot-password" className="text-[#C13E70] hover:text-[#A83762]">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#C13E70] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#A83762] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors duration-200"
          >
            Sign In
          </button>
        </form>
        
        <LoginRegisterFooter pageType="login" />

      </div>
    </div>
  );
}