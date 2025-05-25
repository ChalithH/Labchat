"use client"
import axios from "axios";
import { useState, useEffect } from "react"
import type { Lab, LabRole, LabWithStatus, UserLabStatus } from "@/app/(header_footer)/(admission)/types"
import { MobileRow, DesktopRow } from "@/app/(header_footer)/(admission)/components/request-admission-row"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Props = {
  userId: number;
  searchQuery: string;
  statusFilter: string;
};

export default function RequestAdmissionTable({ userId, searchQuery, statusFilter }: Props) {
  const [labs, setLabs] = useState<LabWithStatus[]>([])
  const [labRoles, setLabRoles] = useState<LabRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLab, setSelectedLab] = useState<LabWithStatus | null>(null)
  const [selectedRole, setSelectedRole] = useState<LabRole | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all labs
        const labsResponse = await axios.get(`${API_URL}/lab/all`) // You'll need this endpoint
        const allLabs: Lab[] = labsResponse.data

        // Fetch user's lab memberships and admission requests
        const membershipResponse = await axios.get(`${API_URL}/lab/user/${userId}/labs`) // You'll need this endpoint
        const admissionResponse = await axios.get(`${API_URL}/labAdmission/user/${userId}`)
        
        const memberships = membershipResponse.data
        const admissionRequests = admissionResponse.data

        // Combine lab data with user status
        const labsWithStatus: LabWithStatus[] = allLabs.map(lab => {
          const isMember = memberships.some((m: any) => m.labId === lab.id)
          const userRequests = admissionRequests.filter((req: any) => req.labId === lab.id)
          const pendingRequest = userRequests.find((req: any) => req.status === 'PENDING')
          const approvedRequest = userRequests.find((req: any) => req.status === 'APPROVED')
          const latestRequest = userRequests.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0]

          return {
            ...lab,
            userStatus: {
              isMember,
              hasPendingRequest: !!pendingRequest,
              hasApprovedRequest: !!approvedRequest,
              requestStatus: latestRequest?.status
            }
          }
        })

        setLabs(labsWithStatus)
      } catch (err) {
        setError("Failed to load labs. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  // Fetch lab roles
  useEffect(() => {
    const fetchLabRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/lab/roles`)
        setLabRoles(response.data)
      } catch (err) {
        console.error('Failed to fetch lab roles:', err)
      }
    }

    fetchLabRoles()
  }, [])

  const handleSubmitRequest = (labId: number, roleId: number) => {
    const lab = labs.find(l => l.id === labId)
    const role = labRoles.find(r => r.id === roleId)
    
    if (lab && role) {
      setSelectedLab(lab)
      setSelectedRole(role)
      setDialogOpen(true)
    }
  }

  const confirmSubmitRequest = async () => {
    if (!selectedLab || !selectedRole) return

    setIsSubmitting(true)
    try {
      await axios.post(`${API_URL}/labAdmission/request`, {
        labId: selectedLab.id,
        userId: userId,
        roleId: selectedRole.id
      })

      // Update local state
      setLabs(prev => 
        prev.map(lab => 
          lab.id === selectedLab.id 
            ? {
                ...lab,
                userStatus: {
                  ...lab.userStatus,
                  hasPendingRequest: true,
                  requestStatus: 'PENDING' as const
                }
              }
            : lab
        )
      )

      setDialogOpen(false)
      setSelectedLab(null)
      setSelectedRole(null)
    } catch (err) {
      console.error('Failed to submit admission request:', err)
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter labs based on search and status
  const filteredLabs = labs.filter((lab) => {
    const matchesSearch = 
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.location.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter) {
      switch (statusFilter.toLowerCase()) {
        case 'available':
          matchesStatus = !lab.userStatus.isMember && !lab.userStatus.hasPendingRequest && !lab.userStatus.hasApprovedRequest
          break
        case 'member':
          matchesStatus = lab.userStatus.isMember
          break
        case 'pending':
          matchesStatus = lab.userStatus.hasPendingRequest
          break
        case 'rejected':
          matchesStatus = lab.userStatus.requestStatus === 'REJECTED'
          break
      }
    }

    return matchesSearch && matchesStatus
  })

  // Sort labs: available first, then members, then others
  const sortedLabs = filteredLabs.sort((a, b) => {
    if (a.userStatus.isMember && !b.userStatus.isMember) return 1
    if (!a.userStatus.isMember && b.userStatus.isMember) return -1
    if (a.userStatus.hasPendingRequest && !b.userStatus.hasPendingRequest) return 1
    if (!a.userStatus.hasPendingRequest && b.userStatus.hasPendingRequest) return -1
    return a.name.localeCompare(b.name)
  })

  if (loading) {
    return <div className="text-center py-8">Loading labs...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <>
      <div className="overflow-hidden border rounded-lg shadow bg-white">
        {/* Mobile view */}
        <div className="md:hidden divide-y">
          {sortedLabs.map((lab) => (
            <MobileRow
              key={lab.id}
              lab={lab}
              labRoles={labRoles}
              onSubmitRequest={handleSubmitRequest}
              isProcessing={isSubmitting}
            />
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lab Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedLabs.map((lab) => (
                <DesktopRow
                  key={lab.id}
                  lab={lab}
                  labRoles={labRoles}
                  onSubmitRequest={handleSubmitRequest}
                  isProcessing={isSubmitting}
                />
              ))}
            </tbody>
          </table>
        </div>

        {sortedLabs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No labs found matching your search criteria.
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Admission Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit an admission request for the following lab and role?
            </DialogDescription>
          </DialogHeader>
          
          {selectedLab && selectedRole && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <p><span className="font-medium">Lab:</span> {selectedLab.name}</p>
                  <p><span className="font-medium">Location:</span> {selectedLab.location}</p>
                  <p><span className="font-medium">Requested Role:</span> {selectedRole.name}</p>
                  {selectedRole.description && (
                    <p><span className="font-medium">Role Description:</span> {selectedRole.description}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your request will be sent to the lab administrators for review. You will be notified once a decision is made.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSubmitRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}