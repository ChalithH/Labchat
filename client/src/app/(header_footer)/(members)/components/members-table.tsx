"use client"
import axios from "axios";
import { useState, useEffect } from "react"
import type { LabMember } from "@/app/(header_footer)/(members)/types"
import { MobileRow, DesktopRow } from "@/app/(header_footer)/(members)/components/member-row"


const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MembersTable() {
  const [members, setMembers] = useState<LabMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${API_URL}/lab/getMembers/1`

        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch members")
        }

        const data = await response.data;
        setMembers(data)
      } catch (err) {
        setError("Failed to load members. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const sortedMembers = members.sort((a, b) => {
    const aStatusWeight = a.status.find((s) => s.isActive)?.status.statusWeight || 0
    const bStatusWeight = b.status.find((s) => s.isActive)?.status.statusWeight || 0

    if (bStatusWeight !== aStatusWeight) {
      return bStatusWeight - aStatusWeight
    }

    return a.displayName.localeCompare(b.displayName)
  })

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="overflow-hidden border rounded-lg shadow bg-white">
      {/* Mobile view (hidden on md and larger screens) */}
      <div className="md:hidden divide-y">
        {sortedMembers.map((member) => (
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
            {sortedMembers.map((member) => (
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
