'use client'

import React, { useState } from 'react'
import MembersTable from '@/app/(header_footer)/(members)/components/members-table'
import SearchFilterBar from '@/components/labchat/SearchFilter'
import { useMembersData } from '../hooks/use-members-data'

// Define the type for the user prop
interface UserSessionData {
  id: number;
  lastViewedLabId?: number; 
  // Add other relevant user fields if needed by this component
}

interface MembersClientProps {
  user: UserSessionData;
}

export default function MembersClient({ user }: MembersClientProps) {
  const {
    members,
    availableStatusOptions,
    loading,
    error,
    getFilteredMembers
  } = useMembersData();

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-3 flex justify-center items-center font-play font-extrabold text-black text-[clamp(1.5rem,4vw,2rem)]">
        Lab Members
      </h1>

      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterOptions={availableStatusOptions}
        filterValue={filterCategory}
        setFilterValue={setFilterCategory}
      />

      <div className="container mx-auto px-4 py-6">
        <MembersTable
          members={members}
          searchQuery={searchQuery}
          statusFilter={filterCategory}
          getFilteredMembers={getFilteredMembers}
        />
      </div>
    </>
  )
}
