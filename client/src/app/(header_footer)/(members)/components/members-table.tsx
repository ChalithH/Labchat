"use client"
import { useState } from "react"
import type { LabMember } from "@/app/(header_footer)/(members)/types"
import { MobileRow, DesktopRow } from "@/app/(header_footer)/(members)/components/member-row"

type Props = {
  members: LabMember[];
  searchQuery: string;
  statusFilter: string;
  getFilteredMembers: (searchQuery: string, statusFilter: string) => LabMember[];
};

export default function MembersTable({ members, searchQuery, statusFilter, getFilteredMembers }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const filteredMembers = getFilteredMembers(searchQuery, statusFilter);

  return (
    <div className="overflow-hidden border rounded-lg shadow bg-white">
      {/* Mobile view (hidden on md and larger screens) */}
      <div className="md:hidden divide-y">
        {filteredMembers.map((member) => (
          <MobileRow
            key={member.id}
            member={member}
            isExpanded={expandedId === member.id}
            toggleExpand={() => toggleExpand(member.id)}
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
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Job Title
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
                Joined
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Expand</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <DesktopRow
                key={member.id}
                member={member}
                isExpanded={expandedId === member.id}
                toggleExpand={() => toggleExpand(member.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
