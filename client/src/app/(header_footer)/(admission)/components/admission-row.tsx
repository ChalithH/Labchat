"use client"
import type { AdmissionRequest, LabRole } from "@/app/(header_footer)/(admission)/types"
import { formatDate, getInitials, getStatusColor } from "@/app/(header_footer)/(admission)/utils"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface AdmissionRowProps {
  request: AdmissionRequest
  labRoles: LabRole[]
  onApprove: (requestId: number, roleId: number) => Promise<void>
  onReject: (requestId: number) => Promise<void>
  isProcessing: boolean
  selectedRole: number | null
  onRoleChange: (roleId: number | null) => void
}

export function MobileRow({ 
  request, 
  labRoles, 
  onApprove, 
  onReject, 
  isProcessing, 
  selectedRole, 
  onRoleChange 
}: AdmissionRowProps) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(request.user.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{request.user.displayName}</p>
            <p className="text-sm text-gray-500">{request.user.jobTitle}</p>
          </div>
        </div>
        <Badge className={getStatusColor(request.status)}>
          {request.status}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <p><span className="font-medium">Office:</span> {request.user.office || 'Not specified'}</p>
        <p><span className="font-medium">Requested Role:</span> {request.role ? request.role.name : 'Not specified'}</p>
        <p><span className="font-medium">Date Requested:</span> {formatDate(request.createdAt)}</p>
      </div>

      {request.status === 'PENDING' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approve as Role:
            </label>
            <select 
              className="w-full border rounded px-3 py-2 text-sm"
              value={selectedRole || ''}
              onChange={(e) => onRoleChange(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isProcessing}
            >
              <option value="">Select role to approve...</option>
              {labRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} {role.description && `- ${role.description}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={() => selectedRole && onApprove(request.id, selectedRole)}
              disabled={!selectedRole || isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onReject(request.id)}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {request.status !== 'PENDING' && (
        <div className="text-sm text-gray-500">
          No actions available for {request.status.toLowerCase()} requests
        </div>
      )}
    </div>
  )
}

export function DesktopRow({ 
  request, 
  labRoles, 
  onApprove, 
  onReject, 
  isProcessing, 
  selectedRole, 
  onRoleChange 
}: AdmissionRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(request.user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {request.user.displayName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge className={getStatusColor(request.status)}>
          {request.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
         {request.status === 'PENDING' ? (
          <select 
              className="border rounded px-2 py-1 text-sm min-w-[120px]"
              value={selectedRole || request.roleId || ''}
              onChange={(e) => onRoleChange(e.target.value ? parseInt(e.target.value) : null)}
              disabled={isProcessing}
            >
              {labRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
         ) : (
          <span className="text-gray-500">{request.role ? request.role.name : 'Not specified'}</span>
         )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(request.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {request.status === 'PENDING' ? (
          <div className="flex items-center space-x-2">
            
            <Button
              size="sm"
              onClick={() => selectedRole && onApprove(request.id, selectedRole)}
              disabled={!selectedRole || isProcessing}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(request.id)}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-gray-400">No actions available</span>
        )}
      </td>
    </tr>
  )
}