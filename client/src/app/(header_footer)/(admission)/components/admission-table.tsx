"use client"
import axios from "axios"
import { useState, useEffect } from "react"
import type { AdmissionRequest, LabRole } from "@/app/(header_footer)/(admission)/types"
import { MobileRow, DesktopRow } from "./admission-row"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Props = {
  labId: number
  searchQuery: string
  statusFilter: string
}

export default function AdmissionTable({ labId, searchQuery, statusFilter }: Props) {
  const [requests, setRequests] = useState<AdmissionRequest[]>([])
  const [labRoles, setLabRoles] = useState<LabRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<{ [key: number]: number }>({})
  const [selectedPciUsers, setSelectedPciUsers] = useState<{ [key: number]: boolean | null }>({})

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${API_URL}/labAdmission/lab/${labId}`)
        if (response.status !== 200) {
          throw new Error("Failed to fetch admission requests")
        }
        const requestsData = response.data
        setRequests(requestsData)
        const initialSelectedRoles: { [key: number]: number } = {}
        const initialSelectedPciUsers: { [key: number]: boolean | null } = {}

        requestsData.forEach((request: AdmissionRequest) => {
          if (request.roleId) {
            initialSelectedRoles[request.id] = request.roleId
          }
          if (request.user.isPCI !== undefined) {
            initialSelectedPciUsers[request.id] = request.user.isPCI
          }
        })

        setSelectedRoles(initialSelectedRoles)
        setSelectedPciUsers(initialSelectedPciUsers)
      } catch (err) {
        setError("Failed to load admission requests. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [labId])

  useEffect(() => {
    const fetchLabRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/lab/roles`)
        setLabRoles(response.data)
      } catch (err) {
        console.error("Failed to fetch lab roles:", err)
      }
    }

    fetchLabRoles()
  }, [])

  const handleRoleChange = (requestId: number, roleId: number | null) => {
    setSelectedRoles((prev) => {
      const updated = { ...prev }
      if (roleId) {
        updated[requestId] = roleId
      } else {
        delete updated[requestId]
      }
      return updated
    })
  }

  const handlePciUserChange = (requestId: number, pciUser: boolean | null) => {
    setSelectedPciUsers((prev) => ({
      ...prev,
      [requestId]: pciUser,
    }))
  }

  const handleApprove = async (requestId: number, roleId: number, pciUser?: boolean) => {
    setProcessingId(requestId)
    try {

      const payload: any = { 
        roleId: roleId, 
        isPCI: pciUser ?? selectedPciUsers[requestId] 
      }
      await axios.put(`${API_URL}/labAdmission/approve/${requestId}`, payload)

      // Update local state
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: "APPROVED" as const, roleId, pciUser } : req)),
      )

      setSelectedRoles((prev) => {
        const updated = { ...prev }
        delete updated[requestId]
        return updated
      })

      setSelectedPciUsers((prev) => {
        const updated = { ...prev }
        delete updated[requestId]
        return updated
      })
    } catch (err) {
      console.error("Failed to approve request:", err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: number) => {
    setProcessingId(requestId)
    try {
      await axios.put(`${API_URL}/labAdmission/reject/${requestId}`)

      // Update local state
      setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "REJECTED" as const } : req)))
    } catch (err) {
      console.error("Failed to reject request:", err)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.lab.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "" || request.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const sortedRequests = filteredRequests.sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1
    if (a.status !== "PENDING" && b.status === "PENDING") return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (loading) {
    return <div className="text-center py-8">Loading admission requests...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="overflow-hidden border rounded-lg shadow bg-white">
      {/* Mobile view (hidden on md and larger screens) */}
      <div className="md:hidden divide-y">
        {sortedRequests.map((request) => (
          <MobileRow
            key={request.id}
            request={request}
            labRoles={labRoles}
            onApprove={handleApprove}
            onReject={handleReject}
            onPciUserChange={handlePciUserChange}
            isProcessing={processingId === request.id}
            selectedRole={selectedRoles[request.id] || null}
            onRoleChange={(roleId) => handleRoleChange(request.id, roleId)}
            selectedPciUser={selectedPciUsers[request.id] ?? null}
          />
        ))}
      </div>

      {/* Desktop view (hidden on smaller than md screens) */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Applicant
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Approve as Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PCI User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date Requested
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRequests.map((request) => (
              <DesktopRow
                key={request.id}
                request={request}
                labRoles={labRoles}
                onApprove={handleApprove}
                onReject={handleReject}
                onPciUserChange={handlePciUserChange}
                isProcessing={processingId === request.id}
                selectedRole={selectedRoles[request.id] || null}
                onRoleChange={(roleId) => handleRoleChange(request.id, roleId)}
                selectedPciUser={selectedPciUsers[request.id] ?? null}
              />
            ))}
          </tbody>
        </table>
      </div>

      {sortedRequests.length === 0 && (
        <div className="text-center py-8 text-gray-500">No admission requests found.</div>
      )}
    </div>
  )
}
