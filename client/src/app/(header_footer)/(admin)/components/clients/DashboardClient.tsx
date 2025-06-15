"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Manager = {
  id: string
  name: string
  role: string
}

type Lab = {
  id: number
  name: string
  location: string
  status: string
  managers: Manager[]
}

type DashboardClientProps = {
  role: string
}

const DashboardClient: React.FC<DashboardClientProps> = ({ role }) => {
  const [labs, setLabs] = useState<Lab[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const labsPerPage = 5

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/admin/get-labs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch labs: ${response.status}`)
        }

        const data = await response.json()
        setLabs(data)
      } catch (err) {
        console.error("Error fetching labs:", err)
        setError(err instanceof Error ? err.message : "Failed to load labs")
      } finally {
        setLoading(false)
      }
    }

    fetchLabs()
  }, [])

  if (loading && labs.length === 0) {
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
          <h3 className="text-red-800 font-medium">Error loading labs</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(labs.length / labsPerPage)
  const startIndex = (currentPage - 1) * labsPerPage
  const currentLabs = labs.slice(startIndex, startIndex + labsPerPage)

  return (
    <div className="max-w-screen-xl mx-auto w-full px-4 py-6">
      <h1 className="flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)] mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Create new lab tile always first */}
        <Link href="/admin/create-lab" className="block">
          <Card className="flex flex-col items-center justify-center text-center hover:shadow-xl transition-shadow h-full cursor-pointer rounded-2xl p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold">
              Create a New Lab
            </CardTitle>
          </Card>
        </Link>

        {/* Paginated lab tiles */}
        {currentLabs.map((lab) => (
          <Link key={lab.id} href={`/admin/manage-lab/${lab.id}`} className="block">
            <Card className="hover:shadow-xl transition-shadow h-full cursor-pointer rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  {lab.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Location: {lab.location}</p>
                <p className="font-medium mt-2">Lab Managers:</p>
                <ul className="list-disc list-inside pl-2">
                  {lab.managers.length > 0 ? (
                    lab.managers.map((manager) => (
                      <li key={manager.id}>
                        {manager.name} <span className="italic text-muted-foreground">({manager.role})</span>
                      </li>
                    ))
                  ) : (
                    <li>No managers assigned</li>
                  )}
                </ul>
                <p className="text-xs mt-2">
                  Status: <span className="capitalize">{lab.status}</span>
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-10">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Inventory Section */}
      <Link
        href="/admin/manage-inventory"
        className="block border-t pt-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
      >
        <div>
          <h2 className="font-play text-3xl font-bold text-black">
            Manage Global Inventory Items
          </h2>
          <p className="mt-1 text-muted-foreground whitespace-nowrap">
            You can add, edit, or delete items from the global inventory database.
          </p>
          <div className="mt-4">
            <Button>Go to Inventory</Button>
          </div>
        </div>
      </Link>

      {/* Instruments Section */}
      <Link
        href="/admin/manage-instruments"
        className="block border-t pt-6 mt-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
      >
        <div>
          <h2 className="font-play text-3xl font-bold text-black">
            Manage Instruments
          </h2>
          <p className="mt-1 text-muted-foreground whitespace-nowrap">
            Create instruments that can be used for booking events in labs.
          </p>
          <div className="mt-4">
            <Button>Go to Instruments</Button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default DashboardClient
