'use client'

import { useState } from 'react';

import { LoginRegisterFooter } from '@/components/ui/LoginRegisterFooter';
import { LoginRegisterHeader } from '@/components/ui/LoginRegisterHeader';

import api from '@/lib/api';


export default function Login() {
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await api.post("/api/auth/login", { loginEmail: email, loginPassword: password })
      console.log('up')
      alert("Login success")
    } catch (err) {
      alert("Login failed")
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
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm bg-[#739CEA] focus:border-white focus:ring-white bg-opacity-90 placeholder:text-gray-400"
                placeholder="Enter your email"
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
                className="mt-2 block w-full rounded-md border border-gray-300 p-3 shadow-sm bg-[#739CEA] focus:border-white focus:ring-white bg-opacity-90 placeholder:text-gray-400"
                placeholder="Enter your password"
                value={ password }
                onChange={ e => setPassword(e.target.value) }
              />
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