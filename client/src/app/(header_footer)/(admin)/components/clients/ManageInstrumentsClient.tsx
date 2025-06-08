"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"

type Instrument = {
  id: number
  name: string
  description: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

const ManageInstrumentsClient: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newInstrument, setNewInstrument] = useState({
    name: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch instruments on component mount
  const fetchInstruments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/admin/get-all-instruments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch instruments: ${response.status}`)
      }

      const data = await response.json()
      setInstruments(data)
    } catch (err) {
      console.error("Error fetching instruments:", err)
      setError(err instanceof Error ? err.message : "Failed to load instruments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstruments()
  }, [])

  const handleAddInstrument = () => {
    setIsAddDialogOpen(true)
    setSubmitError(null)
  }

  const handleCancelAdd = () => {
    setIsAddDialogOpen(false)
    setNewInstrument({
      name: '',
      description: ''
    })
    setSubmitError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewInstrument(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!newInstrument.name.trim()) {
      setSubmitError('Name is required')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`${API_URL}/admin/create-instrument`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newInstrument.name.trim(),
          description: newInstrument.description.trim() || null
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create instrument')
      }

      const createdInstrument = await response.json()
      
      // Update the local state with the new instrument
      setInstruments(prev => [...prev, createdInstrument].sort((a, b) => a.name.localeCompare(b.name)))
      
      setIsAddDialogOpen(false)
      setNewInstrument({
        name: '',
        description: ''
      })
    } catch (error) {
      console.error('Error creating instrument:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create instrument')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter instruments based on search query
  const filteredInstruments = instruments.filter(instrument =>
    instrument.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (instrument.description && instrument.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto w-full px-4 py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading instruments</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <Button variant="outline" className="mt-3" onClick={fetchInstruments}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
      {/* Header with breadcrumb */}
             <div className="relative flex flex-col items-center mb-8 lg:flex-row lg:justify-center">
        <h1 className="font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)] text-center order-1 lg:order-none">
          Manage Instruments
        </h1>
        <div className="lg:absolute lg:left-0 order-2 lg:order-none mb-2 lg:mb-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Admin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Instruments</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search instruments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md mx-auto"
        />
      </div>

      {/* Add Instrument Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleAddInstrument}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add New Instrument
        </Button>
      </div>

      {/* Instruments Table */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstruments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No instruments found matching your search' : 'No instruments created yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstruments.map((instrument) => (
                  <TableRow key={instrument.id}>
                    <TableCell className="font-medium">{instrument.id}</TableCell>
                    <TableCell>{instrument.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {instrument.description || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Instrument Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Instrument</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                name="name"
                value={newInstrument.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newInstrument.description}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>

          {submitError && (
            <div className="text-red-500 text-sm text-center mb-4">
              {submitError}
            </div>
          )}

          <DialogFooter className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleCancelAdd}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Instrument'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageInstrumentsClient 