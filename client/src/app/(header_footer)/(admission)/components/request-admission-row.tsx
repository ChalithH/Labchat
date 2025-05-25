"use client"
import type { LabWithStatus, LabRole } from "@/app/(header_footer)/(admission)/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Users } from "lucide-react"
import { useState } from "react"

interface RequestAdmissionRowProps {
  lab: LabWithStatus
  labRoles: LabRole[]
  onSubmitRequest: (labId: number, roleId: number) => void
  isProcessing: boolean
}

const getStatusBadge = (lab: LabWithStatus) => {
  if (lab.userStatus.isMember) {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        <Users className="h-3 w-3 mr-1" />
        Member
      </Badge>
    )
  }
  
  if (lab.userStatus.hasPendingRequest) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }
  
  if (lab.userStatus.requestStatus === 'REJECTED') {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Rejected
      </Badge>
    )
  }
  
  if (lab.userStatus.requestStatus === 'WITHDRAWN') {
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        <XCircle className="h-3 w-3 mr-1" />
        Withdrawn
      </Badge>
    )
  }
  
  return null
}

const canRequestAdmission = (lab: LabWithStatus) => {
  return !lab.userStatus.isMember && 
         !lab.userStatus.hasPendingRequest && 
         !lab.userStatus.hasApprovedRequest
}

export function MobileRow({ lab, labRoles, onSubmitRequest, isProcessing }: RequestAdmissionRowProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  
  const statusBadge = getStatusBadge(lab)
  const canRequest = canRequestAdmission(lab)

  const handleSubmit = () => {
    if (selectedRoleId && canRequest) {
      onSubmitRequest(lab.id, selectedRoleId)
      setSelectedRoleId(null)
    }
  }

  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium text-lg">{lab.name}</h3>
          <p className="text-sm text-gray-500">{lab.location}</p>
        </div>
        {statusBadge}
      </div>
      
      <div className="space-y-3">
        <p className="text-sm">
          <span className="font-medium">Status:</span> {lab.status}
        </p>
        
        {canRequest ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role:
              </label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={selectedRoleId || ''}
                onChange={(e) => setSelectedRoleId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isProcessing}
              >
                <option value="">Choose a role...</option>
                {labRoles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} {role.description && `- ${role.description}`}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!selectedRoleId || isProcessing}
              className="w-full"
              size="sm"
            >
              {isProcessing ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            {lab.userStatus.isMember && "You are already a member of this lab"}
            {lab.userStatus.hasPendingRequest && "You have a pending request for this lab"}
            {lab.userStatus.requestStatus === 'REJECTED' && "Your request was rejected. Contact lab admin for more information."}
            {lab.userStatus.requestStatus === 'WITHDRAWN' && "You withdrew your request. You can submit a new one anytime."}
          </div>
        )}
      </div>
    </div>
  )
}

export function DesktopRow({ lab, labRoles, onSubmitRequest, isProcessing }: RequestAdmissionRowProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  
  const statusBadge = getStatusBadge(lab)
  const canRequest = canRequestAdmission(lab)

  const handleSubmit = () => {
    if (selectedRoleId && canRequest) {
      onSubmitRequest(lab.id, selectedRoleId)
      setSelectedRoleId(null)
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{lab.name}</div>
          <div className="text-sm text-gray-500">{lab.location}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{lab.status}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {statusBadge || (
          <span className="text-sm text-gray-500">Available</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {canRequest ? (
          <div className="flex space-x-2 items-center">
            <select
              className="border rounded px-2 py-1 text-sm min-w-[140px]"
              value={selectedRoleId || ''}
              onChange={(e) => setSelectedRoleId(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isProcessing}
            >
              <option value="">Choose role...</option>
              {labRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!selectedRoleId || isProcessing}
            >
              {isProcessing ? 'Submitting...' : 'Request'}
            </Button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">
            {lab.userStatus.isMember && "Already member"}
            {lab.userStatus.hasPendingRequest && "Request pending"}
            {lab.userStatus.requestStatus === 'REJECTED' && "Request rejected"}
            {lab.userStatus.requestStatus === 'WITHDRAWN' && "Can reapply"}
          </span>
        )}
      </td>
    </tr>
  )
}