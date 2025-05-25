"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronRight, Save, X } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CreateLabClient: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "active"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!formData.name.trim()) throw new Error("Lab name is required")
      if (!formData.location.trim()) throw new Error("Location is required")

      const response = await fetch(`${API_URL}/admin/create-lab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create lab")
      }

      const newLab = await response.json()
      router.push(`/labs/${newLab.id}`)
    } catch (err) {
      console.error("Error creating lab:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
      {/* Header with breadcrumb */}
      <div className="relative flex flex-col items-center mb-4 lg:flex-row lg:justify-center">
        <h1 className="font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)] text-center order-1 lg:order-none">
          Create A New Lab
        </h1>
        <div className="lg:absolute lg:left-0 order-2 lg:order-none mb-2 lg:mb-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Admin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Lab</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Instruction paragraph */}
      <div className="max-w-2xl mx-auto mb-8 text-left">
        <p className="text-gray-600 text-sm md:text-base">
        Fill out the form with the lab's name, location, and status. After creation, you'll be redirected to the lab's management page to finish lab setup.
        </p>

      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg border shadow-sm p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Lab Details</h2>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Lab Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter lab name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter lab location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/labs')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Lab"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateLabClient