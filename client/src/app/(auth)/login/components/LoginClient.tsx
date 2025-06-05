"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Home, Mail } from "lucide-react"
import api from "@/lib/api"
import getUserFromSession from "@/lib/get_user"
import headerImage from "@/../public/headerImage.svg";
import frank from '/public/FrankIcon.svg';

const DEFAULT_REDIRECT_ROUTE = "admission"

const LoginClient = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | undefined>("")
  const [message, setMessage] = useState<string | undefined>("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post("/auth/login", {
        loginEmail: email,
        loginPassword: password,
      })

      setError(undefined)
      setMessage("Login successful")

      try {
        const user = await getUserFromSession()
        const redirectPath = user?.lastViewed || DEFAULT_REDIRECT_ROUTE
        const baseUrl = process.env.NEXT_PUBLIC_CORS_ORIGIN || ""
        router.push(`${baseUrl}/${redirectPath}`)
      } catch (err) {
        // If getting user session fails, redirect to default route
        router.push(`/${DEFAULT_REDIRECT_ROUTE}`)
      }
    } catch (err: any) {
      setMessage(undefined)
      setError(err.response?.data?.error || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Home button - positioned at top */}
        <div className="absolute top-4 left-4 z-10">
            <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/90 hover:bg-white border-gray-300"
            >
                <Home size={16} />
            </Button>
        </div>
      {/* Left side - Hero Section (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center bg-[url(/lightBackground.png)] bg-no-repeat bg-cover dark:bg-[url(/darkBackground.png)]p-8 text-white relative overflow-hidden">
        <Image 
          src={headerImage} 
          alt="header image" 
          priority
          className="w-full max-w-[400px]"
        />
        <div id='hero-blurb' className="flex flex-col items-center w-full pt-8 px-8 lg:px-0">
          <div className="flex flex-col items-center lg:items-start justify-center play-font text-center">
            <h2 className="text-zinc-900 dark:text-zinc-100 font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">Streamlining labs to <br className="hidden lg:block" /> <span className="text-labchat-magenta-500 font-bold">empower research</span></h2>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center min-h-screen p-8 bg-white lg:bg-white ">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <Image src={frank.src} alt="Frank the Flask" height={64} width={64} />
            <h1 className="text-labchat-blue-500 text-4xl font-bold play-font">Labchat</h1>
          </div>
         
          <Card className="border-0 shadow-lg lg:shadow-xl bg-zinc-50">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
              <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(error || message) && (
                <Alert className={error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                  <AlertDescription className={error ? "text-red-800" : "text-green-800"}>
                    {error || message}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-labchat-blue-500 hover:bg-labchat-blue-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <Link href="/forgot-password" className="text-sm text-labchat-blue-600 hover:text-labchat-blue-800 hover:underline">
                  Forgot password?
                </Link>
                <p className="text-sm text-gray-600">
                  {"Don't have an account? "}
                  <Link href="/register" className="text-labchat-blue-600 hover:text-labchat-blue-800 hover:underline font-medium">
                    Sign Up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default LoginClient
