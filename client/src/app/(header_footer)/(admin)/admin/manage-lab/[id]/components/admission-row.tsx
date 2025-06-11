"use client"
import type { AdmissionRequest, LabRole } from "@/app/(header_footer)/(admission)/types"
import { formatDate, getInitials, getStatusColor } from "@/app/(header_footer)/(admission)/utils"
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RoleSelect } from "./role-select"
import { PciUserCheckbox } from "./pci-user-checkbox"

interface AdmissionRowProps {
  request: AdmissionRequest
  labRoles: LabRole[]
  onApprove: (requestId: number, roleId: number, pciUser?: boolean) => Promise<void>
  onReject: (requestId: number) => Promise<void>
  onPciUserChange: (requestId: number, pciUser: boolean | null) => void
  isProcessing: boolean
  selectedRole: number | null
  onRoleChange: (roleId: number | null) => void
  selectedPciUser: boolean | null
}

export function MobileRow({
  request,
  labRoles,
  onApprove,
  onReject,
  onPciUserChange,
  isProcessing,
  selectedRole,
  onRoleChange,
  selectedPciUser,
}: AdmissionRowProps) {
  const getPciUserDisplay = (pciUser?: boolean | null) => {
    console.log(request)
    if (pciUser === true) {
      return <span className="text-green-700 font-medium">Yes</span>
    }
    if (pciUser === false) {
      return <span className="text-red-700 font-medium">No</span>
    }
    return <span className="text-gray-500">Not Set</span>
  }

  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(request.user.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{request.user.displayName}</p>
          </div>
        </div>
        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <p>
          <span className="font-medium">Requested Role:</span> {request.role ? request.role.name : "Not specified"}
        </p>
        <p>
          <span className="font-medium">PCI User:</span> {getPciUserDisplay(request.isPCI)}
        </p>
        <p>
          <span className="font-medium">Date Requested:</span> {formatDate(request.createdAt)}
        </p>
      </div>

      {request.status === "PENDING" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approve as Role:</label>
            <RoleSelect
              roles={labRoles}
              value={selectedRole}
              onValueChange={onRoleChange}
              placeholder="Select role to approve..."
              disabled={isProcessing}
              className="w-full"
            />
          </div>

          <div>
            <PciUserCheckbox
              value={selectedPciUser}
              onValueChange={(value) => onPciUserChange(request.id, value)}
              disabled={isProcessing}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={() => selectedRole && onApprove(request.id, selectedRole, selectedPciUser ?? undefined)}
              disabled={!selectedRole || isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Approve"}
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

      {request.status !== "PENDING" && (
        <div className="text-sm text-gray-500">No actions available for {request.status.toLowerCase()} requests</div>
      )}
    </div>
  )
}

export function DesktopRow({
  request,
  labRoles,
  onApprove,
  onReject,
  onPciUserChange,
  isProcessing,
  selectedRole,
  onRoleChange,
  selectedPciUser,
}: AdmissionRowProps) {
  const getPciUserDisplay = (pciUser?: boolean | null) => {
    console.log("getPciUserDisplay called with:", pciUser)
    if (pciUser === true) {
      return <span className="text-green-700 font-medium">✓ Yes</span>
    }
    if (pciUser === false) {
      return <span className="text-red-700 font-medium">✗ No</span>
    }
    return <span className="text-gray-500">— Not Set</span>
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={request.user.profilePic ?? undefined} alt={request.user.displayName} />
            <AvatarFallback>{getInitials(request.user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{request.user.displayName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {request.status === "PENDING" ? (
          <RoleSelect
            roles={labRoles}
            value={selectedRole || request.roleId}
            onValueChange={onRoleChange}
            placeholder="Select role..."
            disabled={isProcessing}
          />
        ) : (
          <span className="text-sm text-gray-900">{request.role ? request.role.name : "Not specified"}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {request.status === "PENDING" ? (
          <PciUserCheckbox
            value={selectedPciUser}
            onValueChange={(value) => onPciUserChange(request.id, value)}
            disabled={isProcessing}
            label=""
          />
        ) : (
          <span className="text-sm">{getPciUserDisplay(request.isPCI)}</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(request.createdAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {request.status === "PENDING" ? (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => selectedRole && onApprove(request.id, selectedRole, selectedPciUser ?? undefined)}
              disabled={!selectedRole || isProcessing}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onReject(request.id)} disabled={isProcessing}>
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
