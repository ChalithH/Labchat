"use client"
import type { LabMember } from "@/app/(header_footer)/(members)/types"
import { formatDate } from "@/app/(header_footer)/(members)/utils"
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface MemberRowProps {
  member: LabMember
  isExpanded: boolean
  toggleExpand: () => void
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500 text-white"
    case "Work from Home":
      return "bg-blue-500 text-white"
    case "Pending Induction":
      return "bg-yellow-500 text-white"
    case "Outside":
      return "bg-purple-500 text-white"
    case "Inactive":
      return "bg-gray-500 text-white"
    default:
      return "bg-gray-200 text-gray-800"
  }
}

export function MobileRow({ member, isExpanded, toggleExpand }: MemberRowProps) {
  const activeStatus = member.status.find((s) => s.isActive)
  const statusName = activeStatus ? activeStatus.status.statusName : "No Status"

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={toggleExpand}>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.displayName}</p>
            <p className="text-sm text-gray-500">{member.jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(statusName)}`}>{statusName}</span>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50">
          <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Office:</span> {member.office || "Not assigned"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Bio:</span> {member.bio}
                </p>
                <div className="flex items-center">
                  <span className="font-medium text-sm mr-2">Induction Status:</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${member.inductionDone ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}
                  >
                    {member.inductionDone ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-3"></div>

              <div>
                <h4 className="font-medium text-base mb-3">Status Information</h4>

                {activeStatus ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(activeStatus.status.statusName)}`}
                      >
                        {activeStatus.status.statusName}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Contact Name:</span> {activeStatus.contactName || "Not provided"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Contact Type:</span> {activeStatus.contactType || "Not provided"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Contact Info:</span> {activeStatus.contactInfo || "Not provided"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active status information available</p>
                )}
              </div>

              <div className="h-px bg-gray-200 my-3"></div>

              <div className="pt-2">
                <Link href={`/profile/${member.memberID}`}>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                    <ExternalLink className="mr-2 h-4 w-4" /> View Full Profile
                  </Button>
                </Link>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Desktop version of the row (tr-based)
export function DesktopRow({ member, isExpanded, toggleExpand }: MemberRowProps) {
  const activeStatus = member.status.find((s) => s.isActive)
  const statusName = activeStatus ? activeStatus.status.statusName : "No Status"
  const joinedDate = formatDate(member.createdAt)

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={toggleExpand}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <Avatar>
                <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{member.displayName}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{member.jobTitle}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(statusName)}`}
          >
            {statusName}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{joinedDate}</td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-6 py-4">
            <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
              <div className="max-h-80 overflow-y-auto pr-1">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Office:</span> {member.office || "Not assigned"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Bio:</span> {member.bio}
                    </p>
                    <div className="flex items-center">
                      <span className="font-medium text-sm mr-2">Induction Status:</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${member.inductionDone ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}
                      >
                        {member.inductionDone ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-3"></div>

                  <div>
                    <h4 className="font-medium text-base mb-3">Status Information</h4>

                    {activeStatus ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(activeStatus.status.statusName)}`}
                          >
                            {activeStatus.status.statusName}
                          </span>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Contact Name:</span> {activeStatus.contactName || "Not provided"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Contact Type:</span> {activeStatus.contactType || "Not provided"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Contact Info:</span> {activeStatus.contactInfo || "Not provided"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No active status information available</p>
                    )}
                  </div>

                  <div className="h-px bg-gray-200 my-3"></div>

                  <div className="pt-2">
                    <Link href={`/profile/${member.memberID}`}>
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                        <ExternalLink className="mr-2 h-4 w-4" /> View Full Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
